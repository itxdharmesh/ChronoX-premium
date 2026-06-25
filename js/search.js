import { db } from './config.js';
import { collection, query, where, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { defaultAvatar } from './utils.js';

document.getElementById('searchInput')?.addEventListener('input', async (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    if (!searchTerm) { resultsContainer.innerHTML = ''; return; }
    const usersQuery = query(collection(db, 'users'), where('username', '>=', searchTerm), where('username', '<=', searchTerm + '\uf8ff'), limit(10));
    const snapshot = await getDocs(usersQuery);
    resultsContainer.innerHTML = '';
    snapshot.forEach(doc => {
        const userData = doc.data();
        resultsContainer.innerHTML += `
            <div class="glass-panel search-result-card" onclick="window.openUserProfile('${doc.id}')">
                <img src="${userData.avatar || defaultAvatar(userData.name)}" class="search-avatar" alt="${userData.name}">
                <div><strong>${userData.name}</strong><p style="font-size:0.8rem;color:#aaa;">@${userData.username}</p></div>
            </div>`;
    });
});
