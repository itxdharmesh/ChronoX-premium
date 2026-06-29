/**
 * ChronoX - Search Page Logic
 */
let searchTab = 'all';

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    const input = document.getElementById('searchMainInput');
    input?.addEventListener('input', debounce(performSearch, 300));
    document.querySelectorAll('.search-tab').forEach(t => t.addEventListener('click', (e) => {
        searchTab = e.target.dataset.tab;
        document.querySelectorAll('.search-tab').forEach(x => x.classList.remove('active'));
        e.target.classList.add('active');
        performSearch();
    }));
    const params = router.params;
    if (params.q) { input.value = params.q; performSearch(); }
    input?.focus();
});

async function performSearch() {
    const query = document.getElementById('searchMainInput')?.value.trim().toLowerCase();
    const container = document.getElementById('searchResults');
    if (!container) return;
    if (!query) { container.innerHTML = '<p class="text-center text-muted py-8">Start typing to search...</p>'; return; }
    
    let results = [];
    try {
        if (searchTab === 'all' || searchTab === 'users') {
            const users = await db.getAll('users');
            results.push(...users.filter(u => u.username?.toLowerCase().includes(query) || u.displayName?.toLowerCase().includes(query)).map(u => ({ type: 'user', ...u })));
        }
        if (searchTab === 'all' || searchTab === 'posts') {
            const posts = await db.getAll('posts');
            results.push(...posts.filter(p => p.content?.toLowerCase().includes(query)).map(p => ({ type: 'post', ...p })));
        }
        renderResults(results, container);
    } catch(e) { container.innerHTML = '<p class="text-muted">Search failed</p>'; }
}

function renderResults(results, container) {
    if (results.length === 0) { container.innerHTML = '<p class="text-center text-muted py-8">No results found</p>'; return; }
    container.innerHTML = results.slice(0, 20).map(r => {
        if (r.type === 'user') return `<div class="search-result-item" onclick="router.navigate('/profile/${r.id}')"><img src="${r.avatar || 'assets/avatars/default.png'}" class="avatar"><div><div class="font-semibold">${r.displayName || r.username}</div><div class="text-sm text-muted">@${r.username} · Lv.${r.level || 1}</div></div></div>`;
        return `<div class="search-result-item" onclick="router.navigate('/posts?id=${r.id}')"><div><div class="font-semibold">Post</div><div class="text-sm text-muted">${truncate(r.content, 80)}</div></div></div>`;
    }).join('');
                                         }
