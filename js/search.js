import { db } from './config.js';
import { collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', async function(e) {
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
        const myUid = window.auth?.currentUser?.uid;
        
        snapshot.forEach(function(docSnap) {
            const userId = docSnap.id;
            
            if (seenUids.has(userId)) return;
            seenUids.add(userId);
            
            if (userId === myUid) return;
            
            const userData = docSnap.data();
            
            const card = document.createElement('div');
            card.className = 'glass-panel search-result-card';
            card.style.cssText = 'cursor:pointer;display:flex;align-items:center;gap:0.8rem;padding:0.8rem;margin:0.5rem 0;';
            
            // PROFILE CLICK - Direct string onclick
            card.setAttribute('onclick', `window.openUserProfile('${userId}')`);
            
            card.innerHTML = `
                <img src="${userData.avatar || 'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=40'}" 
                     class="search-avatar" 
                     alt="${userData.name}"
                     style="width:40px;height:40px;border-radius:50%;object-fit:cover;"
                     onerror="this.src='https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=40'">
                <div style="flex:1;min-width:0;">
                    <strong style="font-size:0.9rem;">${userData.name || 'User'}</strong>
                    <p style="font-size:0.7rem;color:#aaa;">@${userData.username || 'unknown'}</p>
                </div>
                <button class="btn-glow" style="padding:0.3rem 0.8rem;font-size:0.7rem;cursor:pointer;z-index:2;" 
                    onclick="event.stopPropagation();window.openChat('${userId}')">
                    <i class="fas fa-comment"></i>
                </button>
            `;
            
            resultsContainer.appendChild(card);
        });
        
        if (resultsContainer.children.length === 0) {
            resultsContainer.innerHTML = '<p style="text-align:center;color:#888;padding:1rem;">No users found</p>';
        }
    });
});
