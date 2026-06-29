/**
 * ChronoX - Home Page Logic
 * Manages post feed, create post, and interactions
 * @version 1.0.0
 */

let currentTab = 'trending';
let currentPage = 1;
let selectedImage = null;

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    initHomePage();
});

/**
 * Initialize home page
 */
function initHomePage() {
    // Check auth
    if (!auth.isLoggedIn()) {
        router.navigate('/login');
        return;
    }

    // Update user info
    updateUserInfo();

    // Load posts
    loadPosts();

    // Setup event listeners
    setupEventListeners();

    // Check daily reward
    checkDailyReward();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Create post
    document.getElementById('openCreatePost')?.addEventListener('click', openCreatePostModal);
    document.getElementById('postImageBtn')?.addEventListener('click', openCreatePostModal);
    
    // Feed tabs
    document.querySelectorAll('.feed-tab').forEach(tab => {
        tab.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    // Load more
    document.getElementById('loadMoreBtn')?.addEventListener('click', loadMorePosts);

    // Daily reward
    document.getElementById('claimDailyBtn')?.addEventListener('click', claimDailyReward);

    // Post actions (delegation)
    document.getElementById('postsContainer')?.addEventListener('click', handlePostAction);
}

/**
 * Update user info in sidebar and header
 */
function updateUserInfo() {
    const user = auth.getCurrentUser();
    if (!user) return;

    // Update avatars
    document.querySelectorAll('#homeAvatar, #sidebarAvatar, #modalAvatar').forEach(img => {
        if (img) img.src = user.avatar || 'assets/avatars/default.png';
    });

    // Update names
    const usernameEls = document.querySelectorAll('#sidebarUsername, #modalUsername');
    usernameEls.forEach(el => {
        if (el) el.textContent = user.displayName || user.username;
    });

    // Update stats
    const statXP = document.getElementById('statXP');
    const statCoins = document.getElementById('statCoins');
    const statFriends = document.getElementById('statFriends');
    const sidebarLevel = document.getElementById('sidebarLevel');

    if (statXP) statXP.textContent = formatNumber(user.xp || 0);
    if (statCoins) statCoins.textContent = formatNumber(user.coins || 0);
    if (statFriends) statFriends.textContent = formatNumber(user.friends?.length || 0);
    if (sidebarLevel) sidebarLevel.textContent = `Level ${user.level || 1}`;
}

/**
 * Load posts from database
 */
async function loadPosts() {
    const container = document.getElementById('postsContainer');
    if (!container) return;

    // Show skeleton
    loader.createSkeletonCards(container, 3);

    try {
        const posts = await db.getAll('posts');
        
        // Sort posts
        const sortedPosts = sortPosts(posts, currentTab);
        
        // Clear and render
        container.innerHTML = '';
        
        if (sortedPosts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-muted">No posts yet. Be the first to post!</p>
                </div>
            `;
            return;
        }

        // Render first 5 posts
        const pagePosts = sortedPosts.slice(0, 5);
        for (const post of pagePosts) {
            const postElement = await createPostElement(post);
            container.appendChild(postElement);
        }

        // Show/hide load more
        const loadMore = document.getElementById('loadMoreContainer');
        if (loadMore) {
            loadMore.style.display = sortedPosts.length > 5 ? 'block' : 'none';
        }

    } catch (error) {
        console.error('Failed to load posts:', error);
        container.innerHTML = `
            <div class="text-center py-8">
                <p class="text-muted">Failed to load posts. Please try again.</p>
            </div>
        `;
    }
}

/**
 * Create post DOM element
 * @param {Object} post
 * @returns {Element}
 */
async function createPostElement(post) {
    const postCard = document.createElement('div');
    postCard.className = 'post-card animate-fade-in-up';
    postCard.dataset.postId = post.id;

    // Get user info
    let user = { username: 'Unknown', avatar: 'assets/avatars/default.png' };
    try {
        const users = await db.query('users', 'id', post.userId);
        if (users.length > 0) user = users[0];
    } catch (e) {}

    postCard.innerHTML = `
        <div class="post-header">
            <img src="${user.avatar}" alt="${user.username}" class="avatar">
            <div class="post-user-info">
                <div class="post-username">${user.displayName || user.username}</div>
                <div class="post-time">${timeAgo(post.createdAt)}</div>
            </div>
            <button class="post-menu-btn" data-action="menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
            </button>
        </div>
        <div class="post-content">${escapeHtml(post.content)}</div>
        ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image" data-action="viewImage">` : ''}
        <div class="post-actions">
            <button class="post-action ${post.likes?.includes(auth.getCurrentUser()?.id) ? 'liked' : ''}" data-action="like">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${post.likes?.includes(auth.getCurrentUser()?.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>${post.likes?.length || 0}</span>
            </button>
            <button class="post-action" data-action="comment">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>${post.comments?.length || 0}</span>
            </button>
            <button class="post-action" data-action="share">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                <span>${post.shares || 0}</span>
            </button>
            <button class="post-action" data-action="save">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="19 21 12 16 5 21 5 3 19 3 19 21"/>
                </svg>
            </button>
        </div>
    `;

    return postCard;
}

/**
 * Handle post actions (like, comment, share, save)
 * @param {Event} e
 */
async function handlePostAction(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const postCard = btn.closest('.post-card');
    const postId = postCard?.dataset.postId;

    if (!postId) return;

    switch (action) {
        case 'like':
            await handleLike(postId, btn);
            break;
        case 'comment':
            router.navigate(`/posts?id=${postId}`);
            break;
        case 'share':
            handleShare(postId);
            break;
        case 'save':
            handleSave(postId, btn);
            break;
        case 'viewImage':
            const img = postCard.querySelector('.post-image');
            if (img) modal.previewImage(img.src);
            break;
        case 'menu':
            handlePostMenu(postId, e);
            break;
    }
}

/**
 * Handle like action
 */
async function handleLike(postId, btn) {
    const post = await db.get('posts', postId);
    if (!post) return;

    const userId = auth.getCurrentUser().id;
    const likes = post.likes || [];

    if (likes.includes(userId)) {
        post.likes = likes.filter(id => id !== userId);
        btn.classList.remove('liked');
    } else {
        post.likes = [...likes, userId];
        btn.classList.add('liked');
        animator.bounce(btn);
    }

    await db.update('posts', post);
    const countSpan = btn.querySelector('span');
    if (countSpan) countSpan.textContent = post.likes.length;
}

/**
 * Handle share action
 */
function handleShare(postId) {
    const url = `${window.location.origin}/#/posts?id=${postId}`;
    copyToClipboard(url).then(() => {
        toast.success('Link copied to clipboard!');
    });
}

/**
 * Handle save action
 */
function handleSave(postId, btn) {
    const savedPosts = storage.get('savedPosts', []);
    
    if (savedPosts.includes(postId)) {
        storage.set('savedPosts', savedPosts.filter(id => id !== postId));
        toast.info('Post removed from saved');
    } else {
        savedPosts.push(postId);
        storage.set('savedPosts', savedPosts);
        toast.success('Post saved!');
    }
}

/**
 * Open create post modal
 */
function openCreatePostModal() {
    const template = document.getElementById('createPostModal');
    if (!template) return;

    const clone = template.content.cloneNode(true);
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(clone);

    modal.custom({
        title: 'Create Post',
        content: tempDiv.innerHTML,
        size: 'md',
        showFooter: false,
        onConfirm: () => setupCreatePostListeners()
    });

    // Setup listeners after modal opens
    setTimeout(() => setupCreatePostListeners(), 100);
}

/**
 * Setup create post modal listeners
 */
function setupCreatePostListeners() {
    const textarea = document.getElementById('postContent');
    const charCount = document.getElementById('charCount');
    const submitBtn = document.getElementById('submitPostBtn');
    const addImageBtn = document.getElementById('addImageBtn');
    const imageInput = document.getElementById('imageFileInput');
    const removeImageBtn = document.getElementById('removeImageBtn');

    // Character count
    textarea?.addEventListener('input', () => {
        if (charCount) charCount.textContent = textarea.value.length;
    });

    // Submit post
    submitBtn?.addEventListener('click', submitPost);

    // Add image
    addImageBtn?.addEventListener('click', () => imageInput?.click());
    imageInput?.addEventListener('change', handleImageSelect);

    // Remove image
    removeImageBtn?.addEventListener('click', removeSelectedImage);

    // Update avatar
    const modalAvatar = document.getElementById('modalAvatar');
    if (modalAvatar) {
        modalAvatar.src = auth.getCurrentUser()?.avatar || 'assets/avatars/default.png';
    }
}

/**
 * Submit new post
 */
async function submitPost() {
    const textarea = document.getElementById('postContent');
    const content = textarea?.value.trim();

    if (!content && !selectedImage) {
        toast.warning('Post cannot be empty');
        return;
    }

    const user = auth.getCurrentUser();
    
    const post = {
        id: generateUniqueId(),
        userId: user.id,
        content: content,
        image: selectedImage || '',
        likes: [],
        comments: [],
        shares: 0,
        saves: 0,
        hashtags: extractHashtags(content),
        createdAt: new Date().toISOString()
    };

    try {
        await db.add('posts', post);
        
        // Add XP for posting
        await auth.addXP(10);
        
        toast.success('Post created successfully!');
        modal.close();
        
        // Reload posts
        loadPosts();
        updateUserInfo();
    } catch (error) {
        toast.error('Failed to create post');
    }
}

/**
 * Handle image selection
 * @param {Event} e
 */
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        selectedImage = event.target.result;
        
        const preview = document.getElementById('postImagePreview');
        const img = document.getElementById('postPreviewImg');
        
        if (preview && img) {
            img.src = selectedImage;
            preview.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Remove selected image
 */
function removeSelectedImage() {
    selectedImage = null;
    const preview = document.getElementById('postImagePreview');
    const imageInput = document.getElementById('imageFileInput');
    
    if (preview) preview.style.display = 'none';
    if (imageInput) imageInput.value = '';
}

/**
 * Extract hashtags from text
 * @param {string} text
 * @returns {string[]}
 */
function extractHashtags(text) {
    if (!text) return [];
    const matches = text.match(/#\w+/g);
    return matches ? matches.map(tag => tag.slice(1)) : [];
}

/**
 * Switch feed tab
 * @param {string} tab
 */
function switchTab(tab) {
    currentTab = tab;
    currentPage = 1;

    // Update active tab
    document.querySelectorAll('.feed-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');

    // Reload posts
    loadPosts();
}

/**
 * Load more posts
 */
function loadMorePosts() {
    currentPage++;
    // Implement pagination logic here
    toast.info('Loading more posts...');
}

/**
 * Sort posts based on tab
 * @param {Array} posts
 * @param {string} tab
 * @returns {Array}
 */
function sortPosts(posts, tab) {
    switch (tab) {
        case 'trending':
            return [...posts].sort((a, b) => 
                (b.likes?.length || 0) - (a.likes?.length || 0)
            );
        case 'latest':
            return [...posts].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt
