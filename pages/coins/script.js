document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    updateCoinsDisplay();
});

function updateCoinsDisplay() {
    const user = auth.getCurrentUser();
    document.getElementById('coinsBalance').textContent = formatNumber(user?.coins || 0);
}
