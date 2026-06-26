import { db } from './config.js';
import { collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    
    var searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        console.error('❌ Search input not found!');
        return;
    }
    
    searchInput.addEventListener('input', async function(e) {
        var searchTerm = e.target.value.trim().toLowerCase();
        var resultsContainer = document.getElementById('searchResults');
        
        // Clear if less than 2 characters
        if (!searchTerm || searchTerm.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }
        
        try {
            // Query Firestore
            var usersQuery = query(
                collection(db, 'users'),
                where('username', '>=', searchTerm),
                where('username', '<=', searchTerm + '\uf8ff'),
                limit(15)
            );
            
            var snapshot = await getDocs(usersQuery);
            
            // Clear previous results
            resultsContainer.innerHTML = '';
            
            // Get current user ID
            var myUid = null;
            if (window.auth && window.auth.currentUser) {
                myUid = window.auth.currentUser.uid;
            }
            
            // Track seen UIDs to prevent duplicates
            var seenUids = {};
            var hasResults = false;
            
            snapshot.forEach(function(docSnap) {
                var userId = docSnap.id;
                
                // Skip duplicates
                if (seenUids[userId]) return;
                seenUids[userId] = true;
                
                // Skip current user
                if (userId === myUid) return;
                
                hasResults = true;
                var userData = docSnap.data();
                
                // Create card element
                var card = document.createElement('div');
                card.className = 'glass-panel search-result-card';
                card.style.cssText = 'cursor:pointer;display:flex;align-items:center;gap:0.8rem;padding:0.8rem;margin:0.5rem 0;';
                
                // ✅ CRITICAL: Store userId in a closure
                (function(uid) {
                    card.addEventListener('click', function(e) {
                        console.log('🟢 Search card clicked! Opening profile for UID:', uid);
                        if (typeof window.openUserProfile === 'function') {
                            window.openUserProfile(uid);
                        } else {
                            console.error('❌ openUserProfile function not found on window!');
                        }
                    });
                })(userId);
                
                // Avatar
                var avatarUrl = userData.avatar || 'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=40';
                var userName = userData.name || 'User';
                var userUsername = userData.username || 'unknown';
                
                // Build card HTML
                card.innerHTML = `
                    <img src="${avatarUrl}" 
                         style="width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;" 
                         alt="${userName}"
                         onerror="this.src='https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=40'">
                    <div style="flex:1;min-width:0;overflow:hidden;">
                        <strong style="font-size:0.9rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${userName}</strong>
                        <p style="font-size:0.7rem;color:#aaa;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">@${userUsername}</p>
                    </div>
                    <button class="btn-glow" style="padding:0.3rem 0.8rem;font-size:0.7rem;cursor:pointer;flex-shrink:0;z-index:2;position:relative;" 
                        id="chatBtn_${userId}">
                        <i class="fas fa-comment"></i>
                    </button>
                `;
                
                resultsContainer.appendChild(card);
                
                // Chat button event listener
                setTimeout(function() {
                    var chatBtn = document.getElementById('chatBtn_' + userId);
                    if (chatBtn) {
                        chatBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log('💬 Chat button clicked for UID:', userId);
                            if (typeof window.openChat === 'function') {
                                window.openChat(userId);
                            }
                        });
                    }
                }, 100);
                
            });
            
            // Show "no results" if empty
            if (!hasResults) {
                resultsContainer.innerHTML = '<p style="text-align:center;color:#888;padding:2rem;">No users found for "' + searchTerm + '"</p>';
            }
            
        } catch (error) {
            console.error('❌ Search error:', error);
            resultsContainer.innerHTML = '<p style="text-align:center;color:#ff4757;padding:1rem;">Error searching. Please try again.</p>';
        }
    });
    
    console.log('✅ Search module initialized successfully');
});
