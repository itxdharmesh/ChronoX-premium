/**
 * ChronoX - Notifications Page Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    loadNotifications();
    document.getElementById('markAllReadBtn')?.addEventListener('click', markAllRead);
});

async function loadNotifications() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    try {
        const notifications = await db.query('notifications', 'userId', auth.getCurrentUser().id);
        const sorted = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (sorted.length === 0) {
            container.innerHTML = '<div class="text-center py-8"><p class="text-muted">No notifications</p></div>';
            return;
        }
        container.innerHTML = sorted.map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" onclick="handleNotifClick('${n.id}')">
                <div class="notification-icon">${getNotifIcon(n.type)}</div>
                <div class="notification-content">
                    <div class="notification-text"><strong>${n.title}</strong> ${n.message}</div>
                    <div class="notification-time">${timeAgo(n.createdAt)}</div>
                </div>
                ${!n.read ? '<div class="notification-dot"></div>' : ''}
            </div>`).join('');
    } catch(e) { container.innerHTML = '<p class="text-muted">Failed to load notifications</p>'; }
}

function getNotifIcon(type) {
    const icons = { like: '❤️', comment: '💬', follow: '👤', achievement: '🏆', reward: '🎁', system: '📢' };
    return icons[type] || '🔔';
}

async function handleNotifClick(id) {
    const notif = await db.get('notifications', id);
    if (notif && !notif.read) {
        notif.read = true;
        await db.update('notifications', notif);
        loadNotifications();
    }
}

async function markAllRead() {
    const notifications = await db.query('notifications', 'userId', auth.getCurrentUser().id);
    for (const n of notifications) { n.read = true; await db.update('notifications', n); }
    loadNotifications();
    toast.success('All notifications marked as read');
}
