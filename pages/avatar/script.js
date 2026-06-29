let avatarTab = 'base';
let currentAvatar = { base: '😊', hat: '', glasses: '', mask: '', color: '#6c5ce7' };

const avatarOptions = {
    base: ['😊', '😎', '🤓', '😇', '🤩', '🥳', '😈', '👻', '🤖', '👽'],
    hats: ['', '🎩', '👑', '⛑️', '🎓', '🧢', '👒', '🎪'],
    glasses: ['', '🕶️', '👓', '🥽', '🤿'],
    masks: ['', '😷', '🥷', '🤡', '🎭'],
    colors: ['#6c5ce7', '#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4', '#ff8787', '#a55eea', '#339af0']
};

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    loadSavedAvatar();
    loadAvatarItems();
    
    document.querySelectorAll('.avatar-tab').forEach(t => t.addEventListener('click', (e) => {
        avatarTab = e.target.dataset.tab;
        document.querySelectorAll('.avatar-tab').forEach(x => x.classList.remove('active'));
        e.target.classList.add('active');
        loadAvatarItems();
    }));
    
    document.getElementById('saveAvatarBtn')?.addEventListener('click', saveAvatar);
});

function loadSavedAvatar() {
    const saved = storage.get('customAvatar');
    if (saved) { currentAvatar = { ...currentAvatar, ...saved }; }
    updateAvatarPreview();
}

function updateAvatarPreview() {
    document.getElementById('avatarBase').textContent = currentAvatar.base;
    document.getElementById('avatarHat').textContent = currentAvatar.hat;
    document.getElementById('avatarGlasses').textContent = currentAvatar.glasses;
    document.getElementById('avatarMask').textContent = currentAvatar.mask;
    document.getElementById('avatarCanvas').style.background = currentAvatar.color + '22';
}

function loadAvatarItems() {
    const grid = document.getElementById('avatarItemsGrid');
    if (!grid) return;
    const items = avatarOptions[avatarTab] || [];
    const ownedItems = storage.get('ownedItems', []);
    
    grid.innerHTML = items.map(item => {
        const isSelected = currentAvatar[avatarTab] === item || (avatarTab === 'colors' && currentAvatar.color === item);
        const isLocked = item && !ownedItems.includes(item) && avatarTab !== 'base' && avatarTab !== 'colors';
        return `
            <div class="avatar-item ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}" 
                 onclick="${isLocked ? '' : `selectAvatarItem('${item}')`}">
                ${avatarTab === 'colors' ? `<div style="width:40px;height:40px;background:${item};border-radius:50%;margin:0 auto;"></div>` : item || '❌'}
                <div class="avatar-item-label">${item || 'None'}</div>
            </div>`;
    }).join('');
}

function selectAvatarItem(item) {
    if (avatarTab === 'colors') { currentAvatar.color = item; }
    else if (avatarTab === 'base') { currentAvatar.base = item; }
    else if (avatarTab === 'hats') { currentAvatar.hat = item; }
    else if (avatarTab === 'glasses') { currentAvatar.glasses = item; }
    else if (avatarTab === 'masks') { currentAvatar.mask = item; }
    
    updateAvatarPreview();
    loadAvatarItems();
}

function saveAvatar() {
    storage.set('customAvatar', currentAvatar);
    toast.success('Avatar saved!');
}
