let currentPostId = null;

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    currentPostId = router.params.id;
    if (currentPostId) loadPost();
    document.getElementById('submitComment')?.addEventListener('click', addComment);
    document.getElementById('commentInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') addComment(); });
});

async function loadPost() {
    const container = document.getElementById('postDetail');
    if (!container) return;
    try {
        const post = await db.get('posts', currentPostId);
        if (!post) { container.innerHTML = '<p class="text-muted">Post not found</p>'; return; }
        const users = await db.query('users', 'id', post.userId);
        const user = users[0] || { username: 'Unknown', avatar: 'assets/avatars/default.png' };
        
        container.innerHTML = `
            <div class="post-detail-header">
                <img src="${user.avatar}" class="avatar" onclick="router.navigate('/profile/${user.id}')">
                <div><div class="font-semibold text-sm">${user.displayName || user.username}</div><div class="text-xs text-muted">${timeAgo(post.createdAt)}</div></div>
            </div>
            <div class="post-detail-content">${escapeHtml(post.content || '')}</div>
            ${post.image ? `<img src="${post.image}" class="post-detail-image">` : ''}
            <div class="post-actions"><span>❤️ ${post.likes?.length || 0} Likes</span><span>💬 ${post.comments?.length || 0} Comments</span></div>`;
        
        loadComments(post.comments || []);
    } catch(e) { container.innerHTML = '<p class="text-muted">Failed to load post</p>'; }
}

function loadComments(comments) {
    document.getElementById('commentsList').innerHTML = comments.length === 0 ? 
        '<p class="text-muted text-sm">No comments yet</p>' :
        comments.map(c => `<div class="comment-item"><div class="comment-user">User</div><div class="comment-text">${c}</div></div>`).join('');
}

async function addComment() {
    const input = document.getElementById('commentInput');
    const text = input?.value.trim();
    if (!text || !currentPostId) return;
    
    const post = await db.get('posts', currentPostId);
    post.comments = [...(post.comments || []), text];
    await db.update('posts', post);
    
    input.value = '';
    loadComments(post.comments);
    toast.success('Comment added!');
}
