/**
 * Utility functions for ChronoX
 */

// Default avatar generator
function defaultAvatar(name = 'User') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00D4FF&color=fff&size=128`;
}

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    // Add icon based on type
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        xp: '⭐',
        coin: '🪙'
    };
    
    toast.textContent = `${icons[type] || ''} ${message}`;
    document.body.appendChild(toast);
    
    // Remove after animation
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Format timestamp to readable time
function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 24 hours
    if (diff < 86400000) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Less than 7 days
    if (diff < 604800000) {
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
    
    // Older
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Modal controls
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.style.animation = 'fadeIn 0.3s ease';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// XP and Coins management
async function addXP(uid, amount) {
    if (!uid || !amount) return;
    
    const { doc, getDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    const userRef = doc(window.db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
        const userData = userDoc.data();
        const newXP = (userData.xp || 0) + amount;
        const newLevel = Math.floor(newXP / 100) + 1;
        
        await updateDoc(userRef, {
            xp: newXP,
            level: newLevel
        });
        
        showToast(`+${amount} XP`, 'xp');
        checkAchievements(uid);
    }
}

async function addCoins(uid, amount) {
    if (!uid || !amount) return;
    
    const { doc, getDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
    const userRef = doc(window.db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
        const userData = userDoc.data();
        const newCoins = (userData.coins || 0) + amount;
        
        await updateDoc(userRef, {
            coins: newCoins
        });
        
        showToast(`+${amount} Coins`, 'coin');
    }
}

// Achievement checker
async function checkAchievements(uid) {
    try {
        const { doc, getDoc, updateDoc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
        const userRef = doc(window.db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) return;
        
        const userData = userDoc.data();
        const currentBadges = userData.badges || [];
        const newBadges = [];
        
        // Check various achievements
        if (userData.xp >= 100 && !currentBadges.includes('100_xp')) {
            newBadges.push('100_xp');
            showToast('Achievement Unlocked: 100 XP! 🏆', 'success');
        }
        
        if (userData.xp >= 1000 && !currentBadges.includes('1k_xp')) {
            newBadges.push('1k_xp');
            showToast('Achievement Unlocked: 1K XP! 🏆', 'success');
        }
        
        if ((userData.followers?.length || 0) >= 10 && !currentBadges.includes('10_followers')) {
            newBadges.push('10_followers');
            showToast('Achievement Unlocked: 10 Followers! 🏆', 'success');
        }
        
        if ((userData.coins || 0) >= 100 && !currentBadges.includes('100_coins')) {
            newBadges.push('100_coins');
            showToast('Achievement Unlocked: 100 Coins! 🏆', 'success');
        }
        
        if ((userData.streak || 0) >= 7 && !currentBadges.includes('7_day_streak')) {
            newBadges.push('7_day_streak');
            showToast('Achievement Unlocked: 7 Day Streak! 🏆', 'success');
        }
        
        if (newBadges.length > 0) {
            await updateDoc(userRef, {
                badges: arrayUnion(...newBadges)
            });
        }
    } catch (error) {
        console.error('Error checking achievements:', error);
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for ES modules
export {
    defaultAvatar,
    showToast,
    formatTime,
    openModal,
    closeModal,
    addXP,
    addCoins,
    checkAchievements,
    debounce
};

// Make available globally
window.defaultAvatar = defaultAvatar;
window.showToast = showToast;
window.formatTime = formatTime;
window.openModal = openModal;
window.closeModal = closeModal;
window.addXP = addXP;
window.addCoins = addCoins;
