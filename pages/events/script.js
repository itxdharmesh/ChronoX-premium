document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    loadActiveEvents();
    loadUpcomingEvents();
    loadPastEvents();
});

function loadActiveEvents() {
    const container = document.getElementById('activeEvents');
    if (!container) return;
    
    const events = [
        { id: 'e1', name: 'Game Marathon', desc: 'Play 10 games this week', icon: '🎮', prize: '500 coins', time: '3 days left' },
        { id: 'e2', name: 'Post Challenge', desc: 'Create 5 posts this week', icon: '📝', prize: '300 coins', time: '5 days left' }
    ];
    
    container.innerHTML = events.map(e => `
        <div class="event-card active">
            <div class="event-timer">⏰ ${e.time}</div>
            <div class="event-banner">${e.icon}</div>
            <div class="event-name">${e.name}</div>
            <div class="event-desc">${e.desc}</div>
            <div class="event-meta">
                <span class="event-prize">🏆 ${e.prize}</span>
                <span class="event-time">Active</span>
            </div>
        </div>`).join('');
}

function loadUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;
    
    const events = [
        { name: 'Weekend Tournament', desc: 'Compete in games this weekend', icon: '🏆', date: 'Starts in 2 days' },
        { name: 'Community Day', desc: 'Special community event', icon: '🎉', date: 'Next Monday' }
    ];
    
    container.innerHTML = events.map(e => `
        <div class="event-list-item">
            <div class="event-list-icon">${e.icon}</div>
            <div class="event-list-info">
                <div class="event-list-name">${e.name}</div>
                <div class="event-list-desc">${e.desc}</div>
            </div>
            <span class="text-sm text-muted">${e.date}</span>
        </div>`).join('');
}

function loadPastEvents() {
    const container = document.getElementById('pastEvents');
    if (!container) return;
    
    const events = [
        { name: 'New Year Event', desc: 'Special rewards event', icon: '🎊', date: 'Jan 1, 2025' },
        { name: 'Launch Celebration', desc: 'Platform launch event', icon: '🚀', date: 'Dec 15, 2024' }
    ];
    
    container.innerHTML = events.map(e => `
        <div class="event-list-item">
            <div class="event-list-icon">${e.icon}</div>
            <div class="event-list-info">
                <div class="event-list-name">${e.name}</div>
                <div class="event-list-desc">${e.desc}</div>
            </div>
            <span class="badge badge-xp">Completed</span>
        </div>`).join('');
}
