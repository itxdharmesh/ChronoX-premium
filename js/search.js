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
        limit(10)
    );
    
    const snapshot = await getDocs(usersQuery);
    resultsContainer.innerHTML = '';
    
    // Track unique users to prevent duplicates
    const seenUids = new Set();
    
    snapshot.forEach(doc => {
        // Skip duplicates
        if (seenUids.has(doc.id)) return;
        seenUids.add(doc.id);
        
        const userData = doc.data();
        const currentUserUid = window.auth?.currentUser?.uid;
        
        // Skip current user from results
        if (doc.id === currentUserUid) return;
        
        resultsContainer.innerHTML += `
            <div class="glass-panel search-result-card" onclick="window.openUserProfile('${doc.id}')">
                <img src="${userData.avatar || 'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=40'}" class="search-avatar" alt="${userData.name}">
                <div style="flex:1;">
                    <strong>${userData.name}</strong>
                    <p style="font-size:0.8rem;color:#aaa;">@${userData.username}</p>
                </div>
                <button class="btn-glow" style="padding:0.3rem 0.8rem;font-size:0.75rem;" onclick="event.stopPropagation();window.openChat('${doc.id}')">
                    <i class="fas fa-comment"></i>
                </button>
            </div>
        `;
    });
});
