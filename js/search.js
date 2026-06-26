import { db } from './config.js';
import { collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.getElementById('searchInput')?.addEventListener('input', async (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchTerm || searchTerm.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    const usersQuery = query(
        collection(db, 'users'),
        where('username', '>=', searchTerm),
        where('username', '<=', searchTerm + '\uf8ff'),
        limit(15)
    );
    
    const snapshot = await getDocs(usersQuery);
    resultsContainer.innerHTML = '';
    
    const seenUids = new Set();
    const currentUserUid = window.auth?.currentUser?.uid;
    
    snapshot.forEach(doc => {
        // Get the ACTUAL selected user's UID from Firestore document
        const selectedUid = doc.id;
        
        // Skip duplicates
        if (seenUids.has(selectedUid)) return;
        seenUids.add(selectedUid);
        
        // Skip current logged in user
        if (selectedUid === currentUserUid) return;
        
        const userData = doc.data();
        
        const card = document.createElement('div');
        card.className = 'glass-panel search-result-card';
        card.style.cursor = 'pointer';
        
        // CRITICAL FIX: Use selectedUid (doc.id) NOT currentUser.uid
        card.onclick = function() {
            window.openUserProfile(selectedUid);
        };
        
        card.innerHTML = `
            <img src="${userData.avatar || 'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=40'}" 
                 class="search-avatar" 
                 alt="${userData.name}"
                 onerror="this.src='https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=40'">
            <div style="flex:1;min-width:0;">
                <strong>${userData.name || 'User'}</strong>
                <p style="font-size:0.75rem;color:#aaa;">@${userData.username || 'unknown'}</p>
            </div>
            <button class="btn-glow" style="padding:0.3rem 0.8rem;font-size:0.7rem;" 
                onclick="event.stopPropagation();window.openChat('${selectedUid}')">
                <i class="fas fa-comment"></i>
            </button>
        `;
        
        resultsContainer.appendChild(card);
    });
    
    if (resultsContainer.children.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align:center;color:#888;padding:1rem;">No users found</p>';
    }
});
