import { db } from './config.js';
import { 
    doc, 
    getDoc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove, 
    writeBatch 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { defaultAvatar, showToast } from './utils.js';

// Global state
let currentProfileUid = null;

// Open user profile
async function openUserProfile(uid) {
    if (!uid) {
        showToast('Invalid user', 'error');
        return;
    }
    
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            showToast('User not found', 'error');
            return;
        }
        
        const userData = userDoc.data();
        const container = document.getElementById('profileContainer');
        
        if (container) {
            renderProfile(container, userData, uid);
            window.navigate('profile');
            currentProfileUid = uid;
        }
    } catch (error) {
        console.error('Error opening profile:', error);
        showToast('Error loading profile', 'error');
    }
}

// Render profile UI
function renderProfile(container, userData, uid) {
    const currentUser = window.auth?.currentUser;
    const isOwnProfile = currentUser && currentUser.uid === uid;
    
    // Format badges
    const badges = (userData.badges || []).map(badge => {
        const badgeName = badge.replace(/_/g, ' ');
        return `<span class="badge-pill" title="${badgeName}">🏅 ${badgeName}</span>`;
    }).join('');
    
    // Calculate mutual friends
    let mutualCount = 0;
    if (!isOwnProfile && window.currentUserData) {
        const userFollowing = new Set(userData.following || []);
        const myFollowing = new Set(window.currentUserData.following || []);
        mutualCount = [...userFollowing].filter(f => myFollowing.has(f)).length;
    }
    
    container.innerHTML = `
        <div class="glass-panel" style="padding: 2rem; text-align: center;">
            <img src="${userData.avatar || defaultAvatar(userData.name)}" 
                 class="profile-avatar" 
                 onclick="window.openUserProfile('${uid}')"
                 alt="${userData.name}'s avatar"
                 onerror="this.src='${defaultAvatar('User')}'">
            
            <h2 class="neon-text" style="margin-top: 1rem; font-size: 1.5rem;">
                ${userData.name || 'Unknown User'}
            </h2>
            
            <p style="color: var(--gold); font-size: 1rem;">
                @${userData.username || 'unknown'}
            </p>
            
            <p style="margin: 0.5rem 0; color: #ccc;">
                ${userData.bio || 'No bio yet ✨'}
            </p>
            
            <div style="display: flex; justify-content: center; gap: 1.5rem; margin: 1.5rem 0; flex-wrap: wrap;">
                <div class="stat-item">
                    <div class="stat-value">⭐ ${userData.level || 1}</div>
                    <div class="stat-label">Level</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">✨ ${userData.xp || 0}</div>
                    <div class="stat-label">XP</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">🪙 ${userData.coins || 0}</div>
                    <div class="stat-label">Coins</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">🔥 ${userData.streak || 0}</div>
                    <div class="stat-label">Streak</div>
                </div>
            </div>
            
            <div style="margin: 1rem 0; display: flex; justify-content: center; gap: 1rem;">
                <span onclick="window.showFollowList('followers', '${uid}')" style="cursor: pointer;">
                    👥 ${(userData.followers || []).length} Followers
                </span>
                <span onclick="window.showFollowList('following', '${uid}')" style="cursor: pointer;">
                    🫂 ${(userData.following || []).length} Following
                </span>
            </div>
            
            ${mutualCount > 0 ? `
                <p style="color: var(--neon-blue); margin: 0.5rem 0;">
                    🤝 ${mutualCount} mutual friends
                </p>
            ` : ''}
            
            <div style="margin: 1rem 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem;">
                ${badges || '<span style="color: #666;">No badges yet</span>'}
            </div>
            
            <div style="margin: 1rem 0; font-size: 0.8rem; color: #888;">
                ${userData.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                ${userData.createdAt ? ` • Joined ${new Date(userData.createdAt.toDate()).toLocaleDateString()}` : ''}
            </div>
            
            ${isOwnProfile ? `
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                    <button class="btn-glow" onclick="window.editProfile()">
                        <i class="fas fa-edit"></i> Edit Profile
                    </button>
                    <button class="btn-gold" onclick="window.logout()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            ` : `
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap;">
                    <button class="btn-glow" id="followBtn">
                        ${(window.currentUserData?.following || []).includes(uid) ? 
                            '<i class="fas fa-user-minus"></i> Unfollow' : 
                            '<i class="fas fa-user-plus"></i> Follow'}
                    </button>
                    <button class="btn-gold" onclick="window.openChat('${uid}')">
                        <i class="fas fa-comment"></i> Message
                    </button>
                    <button class="btn-icon" onclick="window.blockUser('${uid}')" title="Block User">
                        <i class="fas fa-ban"></i>
                    </button>
                    <button class="btn-icon" onclick="window.reportUser('${uid}')" title="Report User">
                        <i class="fas fa-flag"></i>
                    </button>
                </div>
            `}
        </div>
    `;
    
    // Add follow button listener
    if (!isOwnProfile) {
        setTimeout(() => {
            document.getElementById('followBtn')?.addEventListener('click', () => {
                toggleFollow(uid);
            });
        }, 100);
    }
    
    // Add CSS for stat items
    if (!document.getElementById('profile-stats-style')) {
        const style = document.createElement('style');
        style.id = 'profile-stats-style';
        style.textContent = `
            .stat-item {
                text-align: center;
                min-width: 60px;
            }
            .stat-value {
                font-size: 1.1rem;
                font-weight: bold;
                color: var(--neon-blue);
            }
            .stat-label {
                font-size: 0.7rem;
                color: #888;
                margin-top: 0.2rem;
            }
        `;
        document.head.appendChild(style);
    }
}

// Render own profile
async function renderOwnProfile() {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) {
        showToast('Please login first', 'error');
        return;
    }
    
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
            const container = document.getElementById('profileContainer');
            if (container) {
                renderProfile(container, userDoc.data(), currentUser.uid);
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error loading profile', 'error');
    }
}

// Toggle follow/unfollow
async function toggleFollow(targetUid) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) {
        showToast('Please login first', 'error');
        return;
    }
    
    if (currentUser.uid === targetUid) {
        showToast('You cannot follow yourself', 'error');
        return;
    }
    
    try {
        const myRef = doc(db, 'users', currentUser.uid);
        const targetRef = doc(db, 'users', targetUid);
        const batch = writeBatch(db);
        
        const currentUserData = window.currentUserData || 
            (await getDoc(myRef)).data();
        
        if ((currentUserData.following || []).includes(targetUid)) {
            // Unfollow
            batch.update(myRef, { following: arrayRemove(targetUid) });
            batch.update(targetRef, { followers: arrayRemove(currentUser.uid) });
            showToast('Unfollowed', 'info');
        } else {
            // Follow
            batch.update(myRef, { following: arrayUnion(targetUid) });
            batch.update(targetRef, { followers: arrayUnion(currentUser.uid) });
            showToast('Following! 🎉', 'success');
        }
        
        await batch.commit();
        
        // Refresh profile
        setTimeout(() => openUserProfile(targetUid), 300);
    } catch (error) {
        console.error('Error toggling follow:', error);
        showToast('Error updating follow status', 'error');
    }
}

// Edit profile
function editProfile() {
    showToast('Edit profile feature coming soon! 🚧', 'info');
}

// Show follow list
async function showFollowList(type, uid) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) return;
        
        const userData = userDoc.data();
        const list = type === 'followers' ? (userData.followers || []) : (userData.following || []);
        
        if (list.length === 0) {
            showToast(`No ${type} yet`, 'info');
            return;
        }
        
        // Create modal to show list
        const modal = document.createElement('div');
        modal.className = 'glass-panel';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            padding: 1.5rem;
            max-width: 300px;
            width: 90%;
            max-height: 400px;
            overflow-y: auto;
        `;
        
        modal.innerHTML = `
            <h3 class="neon-text" style="margin-bottom: 1rem;">
                ${type === 'followers' ? 'Followers' : 'Following'} (${list.length})
            </h3>
            <div id="followListContent"></div>
            <button class="btn-glow" style="margin-top: 1rem; width: 100%;" onclick="this.parentElement.remove()">
                Close
            </button>
        `;
        
        document.body.appendChild(modal);
        
        // Load users in list
        const contentDiv = modal.querySelector('#followListContent');
        for (const userId of list.slice(0, 20)) {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const u = userDoc.data();
                contentDiv.innerHTML += `
                    <div class="search-result-card" onclick="window.openUserProfile('${userId}'); document.querySelector('.glass-panel[style*=\"fixed\"]')?.remove();" 
                         style="cursor: pointer; padding: 0.5rem;">
                        <img src="${u.avatar || defaultAvatar(u.name)}" width="30" height="30" style="border-radius: 50%;">
                        <span>@${u.username}</span>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error showing follow list:', error);
    }
}

// Block user
async function blockUser(uid) {
    if (!confirm('Block this user?')) return;
    
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    
    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            blockedUsers: arrayUnion(uid)
        });
        showToast('User blocked', 'info');
    } catch (error) {
        showToast('Error blocking user', 'error');
    }
}

// Report user
async function reportUser(uid) {
    const reason = prompt('Reason for reporting:');
    if (!reason) return;
    
    try {
        const { addDoc, collection } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        await addDoc(collection(db, 'reports'), {
            reportedUser: uid,
            reportedBy: window.auth.currentUser.uid,
            reason: reason,
            timestamp: new Date()
        });
        showToast('Report submitted', 'success');
    } catch (error) {
        showToast('Error submitting report', 'error');
    }
}

// Exports
export { openUserProfile, renderOwnProfile, toggleFollow, editProfile };

// Make globally available
window.openUserProfile = openUserProfile;
window.renderOwnProfile = renderOwnProfile;
window.editProfile = editProfile;
window.showFollowList = showFollowList;
window.blockUser = blockUser;
window.reportUser = reportUser;
