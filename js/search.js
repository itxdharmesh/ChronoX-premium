import { db } from './config.js';
import { collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

var searchInput = document.getElementById('searchInput');

if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        var searchTerm = e.target.value.trim().toLowerCase();
        var resultsContainer = document.getElementById('searchResults');
        
        if (!searchTerm || searchTerm.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        var usersQuery = query(
            collection(db, 'users'),
            where('username', '>=', searchTerm),
            where('username', '<=', searchTerm + '\uf8ff'),
            limit(15)
        );
        
        getDocs(usersQuery).then(function(snapshot) {
            resultsContainer.innerHTML = '';
            var seenUids = {};
            var myUid = null;
            
            if (window.auth && window.auth.currentUser) {
                myUid = window.auth.currentUser.uid;
            }
            
            snapshot.forEach(function(docSnap) {
                var userId = docSnap.id;
                
                if (seenUids[userId]) return;
                seenUids[userId] = true;
                
                if (userId === myUid) return;
                
                var userData = docSnap.data();
                var avatarUrl = userData.avatar || 'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=40';
                
                var card = document.createElement('div');
                card.className = 'glass-panel';
                card.style.cssText = 'cursor:pointer;display:flex;align-items:center;gap:0.8rem;padding:0.8rem;margin:0.5rem 0;';
                card.setAttribute('data-uid', userId);
                
                card.onclick = function() {
                    var clickedUid = this.getAttribute('data-uid');
                    if (clickedUid && window.openUserProfile) {
                        window.openUserProfile(clickedUid);
                    }
                };
                
                card.innerHTML = `
                    <img src="${avatarUrl}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;" 
                         onerror="this.src='https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=40'">
                    <div style="flex:1;min-width:0;overflow:hidden;">
                        <strong style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${userData.name || 'User'}</strong>
                        <p style="font-size:0.7rem;color:#aaa;margin:0;">@${userData.username || 'unknown'}</p>
                    </div>
                `;
                
                resultsContainer.appendChild(card);
            });
            
            if (resultsContainer.children.length === 0) {
                resultsContainer.innerHTML = '<p style="text-align:center;color:#888;padding:2rem;">No users found</p>';
            }
        }).catch(function(error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = '<p style="text-align:center;color:#ff4757;padding:1rem;">Search error. Try again.</p>';
        });
    });
}
