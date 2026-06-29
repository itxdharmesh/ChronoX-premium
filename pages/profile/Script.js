/**
 * ChronoX - Profile Page Logic
 * Displays user profile with posts, achievements, and game stats
 * @version 1.0.0
 */

let profileUserId = null;
let isOwnProfile = false;

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    initProfilePage();
});

/**
 * Initialize profile page
 */
async function initProfilePage() {
    if (!auth.isLoggedIn()) {
        router.navigate('/login');
        return;
    }

    // Get user ID from route params
    const route = router.getCurrentRoute();
    profileUserId = route?.route?.params?.id || auth.getCurrentUser()?.id;
    isOwnProfile = profileUserId === auth.getCurrentUser()?.id;

    // Load profile
    await loadProfile();
    
    // Setup event listeners
    setupEventListeners();
}

/**
 * Load profile data
 */
async function loadProfile() {
    try {
        const users = await db.query('users', 'id', profileUserId);
        if (users.length === 0) {
            toast.error('User not found');
            router.navigate('/');
            return;
        }

        const user = users[0];
        renderProfile(user);
        loadUserPosts(user);
        
    } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile');
    }
}

/**
 * Render profile UI
 * @param {Object} user
 */
function renderProfile(user) {
    // Banner
    const bannerImage = document.getElementById('bannerImage');
    if (bannerImage) {
        bannerImage.src = user.banner || 'assets/backgrounds/default-banner.png';
    }

    // Avatar
    const avatar = document.getElementById('profileAvatar');
    if (avatar) {
        avatar.src = user.avatar || 'assets/avatars/default.png';
        avatar.alt = user.displayName || user.username;
    }

    // Names
    const displayName = document.getElementById('profileDisplayName');
    if (displayName) displayName.textContent = user.displayName || user.username;

    const username = document.getElementById('profileUsername');
    if (username) username.textContent = '@' + user.username;

    // Bio
    const bio = document.getElementById('profileBio');
    if (bio) bio.textContent = user.bio || 'No bio yet';

    // Verified badge
    const verifiedBadge = document.getElementById('verifiedBadge');
    if (verifiedBadge) {
        verifiedBadge.style.display = user.isVerified ? 'inline-flex' : 'none';
    }

    // Level and coins badges
    const badgesContainer = document.getElementById('profileBadges');
    if (badgesContainer) {
        badgesContainer.innerHTML = `
            <span class="badge badge-xp">🌟 Level ${user.level || 1}</span>
            <span class="badge badge-coins">💰 ${formatNumber(user.coins || 0)} Coins</span>
            ${user.badges?.map(badge => `<span class="badge">${badge}</span>`).join('') || ''}
        `;
    }

    // Stats
    const profilePosts = document.getElementById('profilePosts');
    const profileFollowers = document.getElementById('profileFollowers');
    const profileFollowing = document.getElementById('profileFollowing');
    const profileFriends = document.getElementById('profileFriends');

    if (profilePosts) profilePosts.textContent = formatNumber(user.postCount || 0);
    if (profileFollowers) profileFollowers.textContent = formatNumber(user.followers?.length || 0);
    if (profileFollowing) profileFollowing.textContent = formatNumber(user.following?.length || 0);
    if (profileFriends) profileFriends.textContent = formatNumber(user.friends?.length || 0);

    // Action buttons
    updateActionButtons();

    // Show/hide banner/avatar change buttons
    const changeBannerBtn = document.getElementById('changeBannerBtn');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    
    if (changeBannerBtn) changeBannerBtn.style.display = isOwnProfile ? 'flex' : 'none';
    if (changeAvatarBtn) changeAvatarBtn.style.display = isOwnProfile ? 'flex' : 'none';
}

/**
 * Update action buttons based on profile ownership
 */
function updateActionButtons() {
    const editBtn = document.getElementById('editProfileBtn');
    const followBtn = document.getElementById('followBtn');
    const messageBtn = document.getElementById('messageBtn');

    if (isOwnProfile) {
        if (editBtn) editBtn.style.display = 'inline-flex';
        if (followBtn) followBtn.style.display = 'none';
        if (messageBtn) messageBtn.style.display = 'none';
    } else {
        if (editBtn) editBtn.style.display = 'none';
        if (followBtn) followBtn.style.display = 'inline-flex';
        if (messageBtn) messageBtn.style.display = 'inline-flex';
        
        // Check if already following
        const currentUser = auth.getCurrentUser();
        if (currentUser?.following?.includes(profileUserId)) {
            if (followBtn) {
                followBtn.textContent = 'Following';
                followBtn.classList.add('following');
            }
        }
    }
}

/**
 * Load user posts
 * @param {Object} user
 */
async function loadUserPosts(user) {
    const postsGrid = document.getElementById('profilePostsGrid');
    if (!postsGrid) return;

    try {
        const posts = await db.query('posts', 'userId', user.id);
        const sortedPosts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (sortedPosts.length === 0) {
            postsGrid.innerHTML = `
                <div class="text-center py-8" style="grid-column: 1/-1;">
                    <p class="text-muted">No posts yet</p>
                </div>
            `;
            return;
        }

        postsGrid.innerHTML = sortedPosts.map(post => `
            <div class="profile-post-item" data-post-id="${post.id}" onclick="viewPost('${post.id}')">
                ${post.image ? 
                    `<img src="${post.image}" alt="Post">` : 
                    `<div class="p-4 text-sm">${truncate(post.content, 100)}</div>`
                }
                <div class="profile-post-overlay">
                    <div>❤️ ${post.likes?.length || 0} 💬 ${post.comments?.length || 0}</div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Failed to load posts:', error);
        postsGrid.innerHTML = '<p class="text-muted text-center">Failed to load posts</p>';
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => switchProfileTab(tab.dataset.tab));
    });

    // Edit profile
    document.getElementById('editProfileBtn')?.addEventListener('click', () => {
        router.navigate('/edit-profile');
    });

    // Follow/Unfollow
    document.getElementById('followBtn')?.addEventListener('click', handleFollow);

    // Message
    document.getElementById('messageBtn')?.addEventListener('click', () => {
        router.navigate('/messages', { userId: profileUserId });
    });

    // Change banner
    document.getElementById('changeBannerBtn')?.addEventListener('click', changeBanner);

    // Change avatar
    document.getElementById('changeAvatarBtn')?.addEventListener('click', changeAvatar);
}

/**
 * Switch profile tab
 * @param {string} tab
 */
function switchProfileTab(tab) {
    // Update active tab
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');

    // Show/hide content
    const postsGrid = document.getElementById('profilePostsGrid');
    const achievementsGrid = document.getElementById('profileAchievementsGrid');
    const gamesStats = document.getElementById('profileGamesStats');

    if (postsGrid) postsGrid.style.display = tab === 'posts' ? 'grid' : 'none';
    if (achievementsGrid) achievementsGrid.style.display = tab === 'achievements' ? 'grid' : 'none';
    if (gamesStats) gamesStats.style.display = tab === 'games' ? 'grid' : 'none';

    // Load tab content
    if (tab === 'achievements') loadAchievements();
    if (tab === 'games') loadGameStats();
}

/**
 * Load achievements tab
 */
async function loadAchievements() {
    const grid = document.getElementById('profileAchievementsGrid');
    if (!grid) return;

    try {
        const achievements = await db.query('achievements', 'userId', profileUserId);
        
        const allAchievements = [
            { id: 'welcome', name: 'Welcome!', desc: 'Join ChronoX', icon: '🎉', xp: 100 },
            { id: 'first_post', name: 'First Post', desc: 'Create your first post', icon: '📝', xp: 50 },
            { id: 'social_butterfly', name: 'Social Butterfly', desc: 'Make 10 friends', icon: '🦋', xp: 200 },
            { id: 'gamer', name: 'Gamer', desc: 'Play 5 games', icon: '🎮', xp: 150 },
            { id: 'collector', name: 'Collector', desc: 'Earn 1000 coins', icon: '💎', xp: 300 },
            { id: 'streak_7', name: '7 Day Streak', desc: 'Login 7 days in a row', icon: '🔥', xp: 250 },
            { id: 'popular', name: 'Popular', desc: 'Get 50 likes on a post', icon: '⭐', xp: 400 },
            { id: 'explorer', name: 'Explorer', desc: 'Join 3 communities', icon: '🗺️', xp: 175 }
        ];

        const unlockedIds = achievements.map(a => a.id);

        grid.innerHTML = allAchievements.map(ach => `
            <div class="achievement-card ${unlockedIds.includes(ach.id) ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.desc}</div>
                ${unlockedIds.includes(ach.id) ? '<span class="badge badge-xp">Unlocked</span>' : '<span class="badge">Locked</span>'}
            </div>
        `).join('');

    } catch (error) {
        console.error('Failed to load achievements:', error);
    }
}

/**
 * Load game stats tab
 */
async function loadGameStats() {
    const container = document.getElementById('profileGamesStats');
    if (!container) return;

    const games = [
        { id: 'snake', name: 'Snake', icon: '🐍', bestScore: 0, timesPlayed: 0 },
        { id: '2048', name: '2048', icon: '🔢', bestScore: 0, timesPlayed: 0 },
        { id: 'flappy', name: 'Flappy Bird', icon: '🐦', bestScore: 0, timesPlayed: 0 },
        { id: 'tictactoe', name: 'Tic Tac Toe', icon: '⭕', bestScore: 0, timesPlayed: 0 },
        { id: 'memory', name: 'Memory Match', icon: '🧠', bestScore: 0, timesPlayed: 0 },
        { id: 'typing', name: 'Typing Race', icon: '⌨️', bestScore: 0, timesPlayed: 0 }
    ];

    container.innerHTML = games.map(game => `
        <div class="game-stat-card">
            <div class="game-stat-icon">${game.icon}</div>
            <div class="game-stat-name">${game.name}</div>
            <div class="game-stat-value">${game.bestScore}</div>
            <div class="game-stat-best">Best Score</div>
        </div>
    `).join('');
}

/**
 * Handle follow/unfollow
 */
async function handleFollow() {
    const currentUser = auth.getCurrentUser();
    const followBtn = document.getElementById('followBtn');
    
    if (!currentUser || !followBtn) return;

    const following = currentUser.following || [];
    const isFollowing = following.includes(profileUserId);

    try {
        if (isFollowing) {
            currentUser.following = following.filter(id => id !== profileUserId);
            followBtn.textContent = 'Follow';
            followBtn.classList.remove('following');
            toast.info('Unfollowed');
        } else {
            currentUser.following = [...following, profileUserId];
            followBtn.textContent = 'Following';
            followBtn.classList.add('following');
            toast.success('Following!');
        }

        await db.update('users', currentUser);
        auth.currentUser = currentUser;
        auth.saveSession();

        // Update follower count on viewed profile
        const viewedUser = await db.get('users', profileUserId);
        if (viewedUser) {
            const followers = viewedUser.followers || [];
            if (isFollowing) {
                viewedUser.followers = followers.filter(id => id !== currentUser.id);
            } else {
                viewedUser.followers = [...followers, currentUser.id];
            }
            await db.update('users', viewedUser);
            
            const followersCount = document.getElementById('profileFollowers');
            if (followersCount) {
                followersCount.textContent = formatNumber(viewedUser.followers?.length || 0);
            }
        }

    } catch (error) {
        toast.error('Failed to update follow status');
    }
}

/**
 * Change banner image
 */
function changeBanner() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const bannerUrl = event.target.result;
            
            // Update UI
            const bannerImage = document.getElementById('bannerImage');
            if (bannerImage) bannerImage.src = bannerUrl;

            // Save to user profile
            try {
                await auth.updateProfile({ banner: bannerUrl });
                toast.success('Banner updated!');
            } catch (error) {
                toast.error('Failed to update banner');
            }
        };
        reader.readAsDataURL(file);
    };
    
    input.click();
}

/**
 * Change avatar image
 */
function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const avatarUrl = event.target.result;
            
            // Update UI
            const avatars = document.querySelectorAll('#profileAvatar, #sidebarAvatar, #navbarAvatar');
            avatars.forEach(img => { if (img) img.src = avatarUrl; });

            // Save to user profile
            try {
                await auth.updateProfile({ avatar: avatarUrl });
                toast.success('Avatar updated!');
            } catch (error) {
                toast.error('Failed to update avatar');
            }
        };
        reader.readAsDataURL(file);
    };
    
    input.click();
}

/**
 * View a single post
 * @param {string} postId
 */
function viewPost(postId) {
    router.navigate(`/posts?id=${postId}`);
}

/**
 * Refresh profile after edit
 */
window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#/profile')) {
        initProfilePage();
    }
});
