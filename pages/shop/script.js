let shopTab = 'items';
const shopItems = {
    items: [
        { id: 'hat1', name: 'Cool Hat', icon: '🎩', price: 100 },
        { id: 'glass1', name: 'Sunglasses', icon: '🕶️', price: 80 },
        { id: 'crown1', name: 'Crown', icon: '👑', price: 500 },
        { id: 'mask1', name: 'Ninja Mask', icon: '🥷', price: 150 },
        { id: 'pet1', name: 'Pet Dragon', icon: '🐉', price: 1000 },
        { id: 'wings1', name: 'Angel Wings', icon: '👼', price: 750 },
        { id: 'sword1', name: 'Golden Sword', icon: '⚔️', price: 300 },
        { id: 'shield1', name: 'Shield', icon: '🛡️', price: 200 }
    ],
    themes: [
        { id: 'theme1', name: 'Ocean Blue', icon: '🌊', price: 200 },
        { id: 'theme2', name: 'Sunset Orange', icon: '🌅', price: 200 },
        { id: 'theme3', name: 'Forest Green', icon: '🌲', price: 200 },
        { id: 'theme4', name: 'Royal Purple', icon: '💜', price: 300 }
    ],
    badges: [
        { id: 'badge1', name: 'Star Badge', icon: '⭐', price: 50 },
        { id: 'badge2', name: 'Fire Badge', icon: '🔥', price: 100 },
        { id: 'badge3', name: 'Diamond Badge', icon: '💎', price: 500 }
    ],
    backgrounds: [
        { id: 'bg1', name: 'Galaxy', icon: '🌌', price: 150 },
        { id: 'bg2', name: 'Neon City', icon: '🌃', price: 200 },
        { id: 'bg3', name: 'Beach', icon: '🏖️', price: 150 },
        { id: 'bg4', name: 'Mountains', icon: '⛰️', price: 150 }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    updateCoinsDisplay();
    loadShopItems();
    document.querySelectorAll('.shop-tab').forEach(t => t.addEventListener('click', (e) => {
        shopTab = e.target.dataset.tab;
        document.querySelectorAll('.shop-tab').forEach(x => x.classList.remove('active'));
        e.target.classList.add('active');
        loadShopItems();
    }));
});

function updateCoinsDisplay() {
    const user = auth.getCurrentUser();
    document.getElementById('shopCoinsCount').textContent = formatNumber(user?.coins || 0);
}

function loadShopItems() {
    const grid = document.getElementById('shopGrid');
    if (!grid) return;
    const items = shopItems[shopTab] || [];
    const ownedItems = storage.get('ownedItems', []);
    
    grid.innerHTML = items.map(item => `
        <div class="shop-item ${ownedItems.includes(item.id) ? 'owned' : ''}" onclick="buyItem('${item.id}', ${item.price})">
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-price">💰 ${item.price}</div>
        </div>`).join('');
}

async function buyItem(itemId, price) {
    const user = auth.getCurrentUser();
    const ownedItems = storage.get('ownedItems', []);
    
    if (ownedItems.includes(itemId)) {
        toast.info('You already own this item!');
        return;
    }
    
    if (user.coins < price) {
        toast.error('Not enough coins!');
        return;
    }
    
    modal.confirm({
        title: 'Confirm Purchase',
        message: `Buy this item for ${price} coins?`,
        confirmText: 'Buy Now',
        onConfirm: async () => {
            ownedItems.push(itemId);
            storage.set('ownedItems', ownedItems);
            await auth.addCoins(-price);
            updateCoinsDisplay();
            loadShopItems();
            toast.success('Item purchased successfully!');
        }
    });
}
