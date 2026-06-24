// js/profile.js - COMPLETE INTEGRATED VERSION

function renderProfile(container) {
    const u = currentUserData || { name: 'User', username: '@user', xp: 0, coins: 500, followers: [], following: [] };
    
    // Header & Info Section
    container.innerHTML = `
        <div style="padding:20px; color:#fff; font-family:sans-serif; text-align:center;">
            <div style="margin-bottom:20px;">
                <img src="${u.avatar || 'https://via.placeholder.com/100'}" style="width:100px; height:100px; border-radius:50%; border:3px solid #D4AF37; box-shadow:0 0 15px rgba(212,175,55,0.3);">
                <h2 style="margin:10px 0 0;">${u.name}</h2>
                <p style="color:#D4AF37; margin:0;">${u.username}</p>
            </div>

            <div style="display:flex; justify-content:space-between; background:rgba(255,255,255,0.05); padding:15px; border-radius:15px; margin-bottom:20px; border:1px solid rgba(255,255,255,0.1);">
                <div style="flex:1;">
                    <b style="font-size:18px;">${u.xp || 0}</b><br>
                    <small style="color:rgba(255,255,255,0.5)">XP</small>
                </div>
                <div style="flex:1; border-left:1px solid #333; border-right:1px solid #333;">
                    <b style="font-size:18px;">${u.coins || 0}</b><br>
                    <small style="color:rgba(255,255,255,0.5)">Coins</small>
                </div>
                <div style="flex:1;">
                    <b style="font-size:18px;">${(u.followers||[]).length}</b><br>
                    <small style="color:rgba(255,255,255,0.5)">Fans</small>
                </div>
            </div>

            <div style="display:grid; gap:10px;">
                <button onclick="editProfile()" style="padding:12px; background:rgba(255,255,255,0.1); border:1px solid #fff; border-radius:10px; color:#fff; cursor:pointer;">Edit Profile</button>
                <button onclick="logout()" style="padding:12px; background:#FF4757; border:none; border-radius:10px; color:#fff; cursor:pointer; font-weight:bold;">LOGOUT</button>
            </div>
        </div>
    `;
}

// Helper for Edit Profile (agar zarurat pade)
function editProfile() {
    if (typeof showToast === 'function') showToast("Editing mode coming soon!", "info");
}

// Helper for Logout (Already in app.js, but keeping here for safety)
function logoutUser() {
    if (typeof logout === 'function') logout();
}
