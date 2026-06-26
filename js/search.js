import { db } from './config.js';
import { collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

var searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        var term = e.target.value.trim().toLowerCase();
        var box = document.getElementById('searchResults');
        if (!term || term.length < 2) { box.innerHTML = ''; return; }
        
        getDocs(query(collection(db, 'users'), where('username', '>=', term), where('username', '<=', term + '\uf8ff'), limit(15)))
        .then(function(snap) {
            box.innerHTML = '';
            var seen = {};
            var myId = window.auth?.currentUser?.uid;
            
            snap.forEach(function(doc) {
                var uid = doc.id;
                if (seen[uid] || uid === myId) return;
                seen[uid] = true;
                
                var u = doc.data();
                var div = document.createElement('div');
                div.className = 'glass-panel';
                div.style.cssText = 'cursor:pointer;display:flex;align-items:center;gap:0.8rem;padding:0.8rem;margin:0.5rem 0;';
                div.onclick = function() { window.openUserProfile(uid); };
                div.innerHTML = '<img src="' + (u.avatar||'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=40') + '" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" onerror="this.src=\'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=40\'"><div style="flex:1;"><strong>' + (u.name||'User') + '</strong><p style="font-size:0.7rem;color:#aaa;">@' + (u.username||'unknown') + '</p></div>';
                box.appendChild(div);
            });
            
            if (!box.children.length) box.innerHTML = '<p style="text-align:center;color:#888;padding:1rem;">No users found</p>';
        });
    });
                    }
