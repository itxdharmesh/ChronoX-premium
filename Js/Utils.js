// ==================== UTILITY FUNCTIONS ====================

// Generate avatar from name initials
function getAvatar(name) {
    const initial = (name || 'U')[0].toUpperCase();
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%231a1f4e" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="%23D4AF37" font-size="40" font-family="Arial">${initial}</text></svg>`;
}

// Format timestamp
function formatTime(date) {
    if (!date) return '';
    const diff = Date.now() - date;
    if (diff < 60000) return 'Now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Show toast notification
function showToast(message, type = '') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position:fixed;top:20px;left:50%;transform:translateX(-50%);
        background:${type==='error'?'#FF4757':'var(--gold)'};
        color:${type==='error'?'#fff':'var(--dark)'};
        padding:12px 24px;border-radius:25px;z-index:9999;
        font-weight:600;font-size:13px;animation:slideDown 0.3s;
        box-shadow:0 8px 30px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Close modal
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('show');
}

// Open modal
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('show');
}

// Random number generator
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle array
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Truncate text
function truncate(text, length = 50) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// Check if user is blocked
function isBlocked(userData, targetUid) {
    return (userData?.blockedUsers || []).includes(targetUid);
}

// Check if blocked by user
function isBlockedBy(targetUserData, uid) {
    return (targetUserData?.blockedUsers || []).includes(uid);
}

// Get online status text
function getOnlineStatus(userData) {
    if (!userData) return 'Unknown';
    if (userData.onlineStatus === 'online') return '● Active now';
    const lastSeen = userData.lastSeen?.toDate?.() || userData.lastSeen;
    if (!lastSeen) return 'Offline';
    const hours = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 3600000);
    if (hours < 1) return 'Offline • just now';
    if (hours < 12) return `Offline • ${hours}h ago`;
    return 'Offline';
}

// Validate username
function isValidUsername(username) {
    return /^[a-zA-Z0-9._]{3,20}$/.test(username);
}

// Validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

console.log('✅ Utils loaded');
