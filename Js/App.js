// ==================== APP ====================
let currentUser = null;
let currentUserData = null;
let chatId = null;
let chatUser = null;
let chatListener = null;

// Splash
setTimeout(() => {
    document.getElementById('splashScreen').classList.add('hidden');
    
    // Pehle login dikhao
    showLogin();
    
    // Fir check karo user logged in hai ya nahi
    auth.onAuthStateChanged(async user => {
        if (user) {
            currentUser = user;
            try {
                const doc = await db.collection('users').doc(user.uid).get();
                currentUserData = doc.data() || {};
                await updateStreak();
            } catch(e) {
                currentUserData = {};
            }
            showApp();
        }
    });
}, 2500);
// ==================== AUTH ====================
function showLogin() {
    document.getElementById('mainApp').classList.remove('show');
    const c = document.getElementById('authContainer');
    c.style.display = 'flex';
    c.innerHTML = `
        <div class="auth-box">
            <div class="auth-logo">🕷️</div>
            <div class="auth-title">ChronoX</div>
            <div class="auth-subtitle">Premium Social Network</div>
            <input class="inp" id="lemail" placeholder="Email" type="email">
            <input class="inp" id="lpass" placeholder="Password" type="password">
            <button class="btn" onclick="login()">Sign In</button>
            <span class="link" onclick="showSignup()">Create New Account</span>
        </div>
    `;
}

function showSignup() {
    const c = document.getElementById('authContainer');
    c.innerHTML = `
        <div class="auth-box">
            <div class="auth-logo">🕷️</div>
            <div class="auth-title">Join ChronoX</div>
            <input class="inp" id="sname" placeholder="Full Name">
            <input class="inp" id="suser" placeholder="Username">
            <input class="inp" id="sage" placeholder="Age (12+)" type="number">
            <input class="inp" id="semail" placeholder="Email" type="email">
            <input class="inp" id="spass" placeholder="Password (6+ chars)" type="password">
            <button class="btn" onclick="signup()">Create Account</button>
            <span class="link" onclick="showLogin()">Already have account?</span>
        </div>
    `;
}

async function login() {
    const e = document.getElementById('lemail').value;
    const p = document.getElementById('lpass').value;
    if (!e || !p) return toast('Fill all fields', 'error');
    try { await auth.signInWithEmailAndPassword(e, p); }
    catch (x) { toast(x.message, 'error'); }
}

async function signup() {
    const n = document.getElementById('sname').value;
    const u = document.getElementById('suser').value;
    const a = parseInt(document.getElementById('sage').value);
    const e = document.getElementById('semail').value;
    const p = document.getElementById('spass').value;
    
    if (!n || !u || !a || !e || !p) return toast('Fill all fields', 'error');
    if (a < 12) return toast('Must be 12+', 'error');
    if (p.length < 6) return toast('Password: 6+ chars', 'error');
    if (!/^[a-zA-Z0-9._]{3,20}$/.test(u)) return toast('Invalid username', 'error');
    
    const snap = await db.collection('users').where('username', '==', '@' + u).get();
    if (!snap.empty) return toast('Username taken!', 'error');
    
    try {
        const cred = await auth.createUserWithEmailAndPassword(e, p);
        await db.collection('users').doc(cred.user.uid).set({
            uid: cred.user.uid, name: n, username: '@' + u, age: a, email: e,
            bio: '', avatar: '', posts: 0, followers: [], following: [],
            blockedUsers: [], achievements: [], streak: 0, bestStreak: 0,
            level: { current: 1, title: 'Explorer', progress: 0 },
            stats: { achievements: 0, totalMessages: 0, gamesPlayed: 0 },
            gameStats: { wins: 0, losses: 0, draws: 0 },
            onlineStatus: 'online', recentSearches: [], quizScores: [],
            lastUsernameChange: null, usernameChangeCount: 0
        });
        toast('Account created! 🎉');
    } catch (x) { toast(x.message, 'error'); }
}

// ==================== APP ====================
function showApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainApp').classList.add('show');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() { navigate(this.dataset.page); });
    });
    navigate('home');
    db.collection('users').doc(currentUser.uid).update({ onlineStatus: 'online' });
    window.addEventListener('beforeunload', () => {
        db.collection('users').doc(currentUser.uid).update({ onlineStatus: 'offline', lastSeen: new Date() });
    });
}

function navigate(page) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    const c = document.getElementById('contentArea');
    if (page === 'home') renderHome(c);
    if (page === 'chats') renderChats(c);
    if (page === 'search') renderSearch(c);
    if (page === 'games') openGames();
    if (page === 'profile') renderProfile(c);
}

async function updateStreak() {
    const ref = db.collection('users').doc(currentUser.uid);
    const doc = await ref.get();
    const d = doc.data();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const last = d.lastActive ? d.lastActive.toDate() : null;
    let s = d.streak || 0;
    if (last) { last.setHours(0, 0, 0, 0); const diff = (today - last) / 86400000; if (diff === 1) s++; else if (diff > 1) s = 1; }
    else s = 1;
    await ref.update({ streak: s, lastActive: new Date(), bestStreak: Math.max(s, d.bestStreak || 0) });
    currentUserData.streak = s;
}

// ==================== HOME ====================
async function renderHome(c) {
    const u = currentUserData;
    let lb = '';
    try {
        const snap = await db.collection('users').orderBy('stats.achievements', 'desc').limit(10).get();
        let i = 0;
        snap.forEach(doc => {
            if (doc.id !== currentUser.uid) {
                const d = doc.data(); i++;
                lb += `<div style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid rgba(255,255,255,0.04)">
                    <span style="font-weight:800;width:30px;color:${i<=3?'var(--gold)':'#fff'}">#${i}</span>
                    <img src="${d.avatar||av(d.name)}" style="width:38px;height:38px;border-radius:50%;border:2px solid var(--gold)" onerror="this.src=av('${d.name}')">
                    <div style="flex:1"><b>${d.name}</b><br><span style="font-size:11px;color:var(--gold-light)">${d.username}</span></div>
                    <span style="color:var(--gold);font-weight:700">🏆${d.stats?.achievements||0}</span>
                </div>`;
            }
        });
    } catch (e) {}
    c.innerHTML = `
        <div class="card" style="text-align:center">
            <div style="font-size:60px">🕷️</div>
            <h1 style="color:var(--gold);font-size:26px;font-weight:900;letter-spacing:3px">ChronoX</h1>
            <p style="color:rgba(255,255,255,0.6)">${u.name}</p>
        </div>
        <div class="card" style="display:flex;align-items:center;gap:15px">
            <span style="font-size:45px">🔥</span>
            <div><h1 style="color:var(--gold)">${u.streak||0} Days</h1><small style="color:rgba(255,255,255,0.6)">Streak • Best: ${u.bestStreak||0}</small></div>
        </div>
        <div class="card">
            <h3 style="color:var(--gold);margin-bottom:12px">🏆 Leaderboard</h3>
            ${lb || '<p style="text-align:center;color:rgba(255,255,255,0.6)">No data</p>'}
        </div>`;
}

// ==================== CHATS ====================
function renderChats(c) {
    c.innerHTML = '<h2 style="color:var(--gold);margin-bottom:15px">💬 Messages</h2><div id="chatList">Loading...</div>';
    loadChats();
}

function loadChats() {
    db.collection('chats').where('participants', 'array-contains', currentUser.uid)
        .orderBy('lastMessageTime', 'desc').onSnapshot(async snap => {
        let h = '';
        const ai = [
            { id: 'annaya_ai', n: 'Annaya', a: '👩‍🦰' },
            { id: 'tarun_ai', n: 'Tarun', a: '👨‍💻' },
            { id: 'chronox_ai', n: 'ChronoX AI', a: '🕷️' }
        ];
        for (const x of ai) {
            const d = await db.collection('chats').doc(`ai_${currentUser.uid}_${x.id}`).get();
            const dd = d.data() || {};
            h += `<div class="chat-item" onclick="openChat('ai_${currentUser.uid}_${x.id}','${x.id}','${x.n}','${x.a}',true)">
                <div style="width:52px;height:52px;border-radius:50%;border:2px solid var(--gold);display:flex;align-items:center;justify-content:center;font-size:28px;background:#1a1f4e">${x.a}</div>
                <div style="flex:1"><b>${x.n} <span style="display:inline-block;width:16px;height:16px;background:#1E90FF;border-radius:50%;text-align:center;line-height:16px;font-size:10px;color:#fff">✓</span></b><br><small style="color:rgba(255,255,255,0.6)">${dd.lastMessage||'Tap to chat'}</small></div>
                <small style="color:#2ED573">● Online</small>
            </div>`;
        }
        for (const doc of snap.docs) {
            const chat = doc.data();
            const oid = chat.participants.find(id => id !== currentUser.uid);
            if (['annaya_ai', 'tarun_ai', 'chronox_ai'].includes(oid)) continue;
            const ud = await db.collection('users').doc(oid).get();
            const u = ud.data();
            if (!u || (currentUserData.blockedUsers || []).includes(oid)) continue;
            h += `<div class="chat-item" onclick="openChat('${doc.id}','${oid}','${u.name}','${u.avatar||''}')">
                <img class="chat-avatar" src="${u.avatar||av(u.name)}" onerror="this.src=av('${u.name}')">
                <div style="flex:1"><b>${u.name}</b><br><small style="color:rgba(255,255,255,0.6)">${chat.lastMessage||''}</small></div>
                <small style="color:var(--gold-light)">${chat.lastMessageTime?tf(chat.lastMessageTime.toDate()):''}</small>
            </div>`;
        }
        document.getElementById('chatList').innerHTML = h || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:40px">No chats</p>';
    });
}

function openChat(cid, uid, name, avt, ai = false) {
    chatId = cid; chatUser = { uid, name, avt, ai };
    document.getElementById('chatWindow').classList.add('show');
    document.getElementById('chatName').textContent = name;
    document.getElementById('chatStatus').textContent = ai ? '● Active now' : 'Loading...';
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('msgInput').value = '';
    if (chatListener) chatListener();
    chatListener = db.collection('chats').doc(cid).collection('messages').orderBy('timestamp', 'asc').onSnapshot(snap => {
        const mc = document.getElementById('chatMessages'); mc.innerHTML = '';
        snap.forEach(doc => {
            const m = doc.data();
            mc.innerHTML += `<div class="${m.senderId===currentUser.uid?'msg-sent':'msg-rec'}">${m.text}<br><small style="opacity:0.7">${m.timestamp?tf(m.timestamp.toDate()):''}</small></div>`;
        });
        mc.scrollTop = mc.scrollHeight;
    });
}

function closeChat() {
    document.getElementById('chatWindow').classList.remove('show');
    if (chatListener) chatListener(); chatListener = null; chatId = null; chatUser = null;
}

async function sendMsg() {
    const t = document.getElementById('msgInput').value.trim();
    if (!t || !chatId || !chatUser) return;
    await db.collection('chats').doc(chatId).collection('messages').add({ senderId: currentUser.uid, text: t, timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: false });
    await db.collection('chats').doc(chatId).set({ participants: [currentUser.uid, chatUser.uid], lastMessage: t, lastMessageTime: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    document.getElementById('msgInput').value = '';
    if (chatUser.ai) {
        setTimeout(async () => {
            let reply;
            if (typeof GEMINI_KEY !== 'undefined' && GEMINI_KEY) {
                try {
                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: `You are ${chatUser.name} on a social app called ChronoX. Reply naturally like a human in 1-2 sentences to: "${t}"` }] }]
                        })
                    });
                    const data = await res.json();
                    reply = data.candidates[0].content.parts[0].text;
                } catch(e) {
                    reply = "Hey! That's interesting! 😊";
                }
            } else {
                const replies = {
                    annaya_ai: ["Hey! How are you? 😊", "That's interesting! 💫", "Just painting 🎨"],
                    tarun_ai: ["Yo! 👋", "Coding all day 💻", "Cool bro!"],
                    chronox_ai: ["How can I help? 🕷️", "ChronoX has features!", "Ask me anything!"]
                };
                const r = replies[chatUser.uid] || replies.chronox_ai;
                reply = r[Math.floor(Math.random() * r.length)];
            }
            await db.collection('chats').doc(chatId).collection('messages').add({ senderId: chatUser.uid, text: reply, timestamp: firebase.firestore.FieldValue.serverTimestamp(), seen: true });
            await db.collection('chats').doc(chatId).update({ lastMessage: reply, lastMessageTime: firebase.firestore.FieldValue.serverTimestamp() });
        }, 1000 + Math.random() * 2000);
    }
}

// ==================== SEARCH ====================
function renderSearch(c) {
    c.innerHTML = `<h2 style="color:var(--gold);margin-bottom:15px">🔍 Discover</h2><input class="inp" id="sinput" placeholder="Search..." onkeyup="search(this.value)" style="margin-bottom:12px"><div id="sresults"></div>`;
}

async function search(q) {
    const c = document.getElementById('sresults'); if (!c || !q) return;
    const snap = await db.collection('users').where('username', '>=', '@' + q).where('username', '<=', '@' + q + '\uf8ff').limit(20).get();
    let u = []; snap.forEach(doc => { if (doc.id !== currentUser.uid) u.push({ id: doc.id, ...doc.data() }); });
    c.innerHTML = u.map(u => `
        <div class="chat-item">
            <img class="chat-avatar" src="${u.avatar||av(u.name)}" style="width:48px;height:48px" onerror="this.src=av('${u.name}')">
            <div style="flex:1"><b>${u.name}</b><br><small style="color:var(--gold-light)">${u.username}</small></div>
            ${(u.followers||[]).includes(currentUser.uid) ?
                `<button class="btn-out" style="width:auto;padding:8px 16px" onclick="startChat('${u.id}')">Chat</button>` :
                `<button class="btn" style="width:auto;padding:8px 16px" onclick="follow('${u.id}',this)">Follow</button>`
            }
        </div>`).join('') || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No users</p>';
}

async function follow(uid, btn) {
    await db.collection('users').doc(currentUser.uid).update({ following: firebase.firestore.FieldValue.arrayUnion(uid) });
    await db.collection('users').doc(uid).update({ followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
    btn.textContent = 'Chat'; btn.className = 'btn-out'; btn.style.width = 'auto'; btn.style.padding = '8px 16px';
    btn.onclick = () => startChat(uid);
    const doc = await db.collection('users').doc(currentUser.uid).get();
    currentUserData = doc.data();
    toast('Followed!');
}

async function startChat(uid) {
    const snap = await db.collection('chats').where('participants', 'array-contains', currentUser.uid).get();
    let ec = null; snap.forEach(doc => { if (doc.data().participants.includes(uid)) ec = doc.id; });
    const u = (await db.collection('users').doc(uid).get()).data();
    if (ec) openChat(ec, uid, u.name, u.avatar);
    else { const ref = await db.collection('chats').add({ participants: [currentUser.uid, uid], lastMessage: '', lastMessageTime: firebase.firestore.FieldValue.serverTimestamp() }); openChat(ref.id, uid, u.name, u.avatar); }
}

// ==================== PROFILE ====================
function renderProfile(c) {
    const u = currentUserData;
    c.innerHTML = `
        <div class="profile-header">
            <img class="avatar" src="${u.avatar||av(u.name)}" id="pAv" onerror="this.src=av('${u.name}')">
            <div class="stats">
                <div class="stat"><span class="stat-num">${u.posts||0}</span><span class="stat-label">Posts</span></div>
                <div class="stat"><span class="stat-num">${(u.followers||[]).length}</span><span class="stat-label">Followers</span></div>
                <div class="stat"><span class="stat-num">${(u.following||[]).length}</span><span class="stat-label">Following</span></div>
            </div>
        </div>
        <h3>${u.name}</h3><p style="color:var(--gold-light)">${u.username}</p><p style="color:rgba(255,255,255,0.6);font-size:13px">${u.bio||'No bio'}</p>
        <div class="actions">
            <div class="act-btn" onclick="editProfile()">✏️ Edit</div>
            <div class="act-btn" onclick="shareProfile()">📤 Share</div>
            <div class="act-btn" onclick="logout()">🚪 Logout</div>
        </div>`;
}

function editProfile() {
    openModal('genericModal');
    document.getElementById('genericContent').innerHTML = `
        <div class="modal-header"><h2>Edit Profile</h2><button onclick="closeModal('genericModal')" style="background:none;border:none;color:#fff;font-size:20px;cursor:pointer">✕</button></div>
        <input class="inp" id="eName" value="${currentUserData.name||''}">
        <input class="inp" id="eBio" value="${currentUserData.bio||''}" placeholder="Bio">
        <button class="btn" onclick="saveProfile()">Save</button>`;
}

async function saveProfile() {
    const n = document.getElementById('eName').value;
    const b = document.getElementById('eBio').value;
    if (!n) return toast('Name required', 'error');
    await db.collection('users').doc(currentUser.uid).update({ name: n, bio: b });
    const doc = await db.collection('users').doc(currentUser.uid).get();
    currentUserData = doc.data();
    closeModal('genericModal'); navigate('profile'); toast('Saved!');
}

function shareProfile() {
    navigator.clipboard.writeText(currentUserData.username).then(() => toast('Copied! 📋'));
}

async function logout() {
    await db.collection('users').doc(currentUser.uid).update({ onlineStatus: 'offline', lastSeen: new Date() });
    auth.signOut(); currentUser = null; currentUserData = null;
    document.getElementById('mainApp').classList.remove('show'); showLogin();
}

// ==================== GAMES ====================
function openGames() {
    openModal('gamesModal');
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header"><h2>🎮 Games</h2><button onclick="closeModal('gamesModal')" style="background:none;border:none;color:#fff;font-size:20px;cursor:pointer">✕</button></div>
        <button class="btn-out" onclick="startTTT()">❌⭕ Tic Tac Toe</button>
        <button class="btn-out" onclick="startMemory()">🧠 Memory Match</button>
        <button class="btn-out" onclick="startQuiz()">❓ Quiz</button>`;
}

// Tic Tac Toe
let ttt = []; let tttActive = false;
function startTTT() {
    ttt = ['', '', '', '', '', '', '', '', '']; tttActive = true;
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header"><button onclick="openGames()">←</button><h2>Tic Tac Toe</h2><div></div></div>
        <div id="tttGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:280px;margin:20px auto">
            ${[0,1,2,3,4,5,6,7,8].map(i => `<div style="aspect-ratio:1;background:var(--card);border:2px solid rgba(212,175,55,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:40px;cursor:pointer" onclick="tttMove(${i})" id="ttt${i}"></div>`).join('')}
        </div>
        <p id="tttStatus" style="text-align:center;color:var(--gold)">Your turn (X)</p>`;
}

function tttMove(i) {
    if (!tttActive || ttt[i] !== '') return;
    ttt[i] = 'X'; document.getElementById(`ttt${i}`).textContent = 'X'; document.getElementById(`ttt${i}`).style.color = 'var(--gold)';
    if (checkWin('X')) { tttActive = false; document.getElementById('tttStatus').textContent = '🎉 You Win!'; return; }
    if (ttt.every(c => c !== '')) { tttActive = false; document.getElementById('tttStatus').textContent = '🤝 Draw!'; return; }
    setTimeout(() => {
        const empty = ttt.map((c, i) => c === '' ? i : null).filter(i => i !== null);
        const ai = empty[Math.floor(Math.random() * empty.length)];
        ttt[ai] = 'O'; document.getElementById(`ttt${ai}`).textContent = 'O'; document.getElementById(`ttt${ai}`).style.color = '#FF4757';
        if (checkWin('O')) { tttActive = false; document.getElementById('tttStatus').textContent = '😞 AI Wins!'; }
        else if (ttt.every(c => c !== '')) { tttActive = false; document.getElementById('tttStatus').textContent = '🤝 Draw!'; }
        else document.getElementById('tttStatus').textContent = 'Your turn (X)';
    }, 500);
}
function checkWin(p) {
    const w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return w.some(w => w.every(i => ttt[i] === p));
}

// Memory
let mem = []; let flipped = []; let matched = []; let moves = 0; let locked = false;
function startMemory() {
    const emojis = ['🎮', '🎯', '🎨', '🎵', '🎭', '🎪', '🎲', '🎸'];
    mem = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    flipped = []; matched = []; moves = 0; locked = false;
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header"><button onclick="openGames()">←</button><h2>Memory</h2><div></div></div>
        <p style="text-align:center;color:var(--gold)">Moves: <span id="memMoves">0</span></p>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:320px;margin:15px auto">
            ${mem.map((e, i) => `<div style="aspect-ratio:1;background:var(--card);border:2px solid rgba(212,175,55,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer" onclick="flipMem(${i})" id="mem${i}">❓</div>`).join('')}
        </div>`;
}
function flipMem(i) {
    if (locked || flipped.includes(i) || matched.includes(i)) return;
    flipped.push(i); document.getElementById(`mem${i}`).textContent = mem[i];
    if (flipped.length === 2) {
        moves++; document.getElementById('memMoves').textContent = moves; locked = true;
        const [a, b] = flipped;
        if (mem[a] === mem[b]) { matched.push(a, b); flipped = []; locked = false; if (matched.length === 16) toast('🎉 Done!'); }
        else { setTimeout(() => { document.getElementById(`mem${a}`).textContent = '❓'; document.getElementById(`mem${b}`).textContent = '❓'; flipped = []; locked = false; }, 800); }
    }
}

// Quiz
let qq = []; let qi = 0; let qs = 0;
const QUIZ = [
    { q: "Capital of France?", o: ["London", "Paris", "Berlin", "Madrid"], a: 1 },
    { q: "Red Planet?", o: ["Venus", "Jupiter", "Mars", "Saturn"], a: 2 },
    { q: "2+2×2?", o: ["6", "8", "4", "10"], a: 0 },
    { q: "Mona Lisa painter?", o: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], a: 2 },
    { q: "Largest ocean?", o: ["Atlantic", "Indian", "Arctic", "Pacific"], a: 3 },
    { q: "King of Jungle?", o: ["Tiger", "Lion", "Elephant", "Bear"], a: 1 },
    { q: "H2O is?", o: ["Oxygen", "Hydrogen", "Water", "Air"], a: 2 },
    { q: "Continents?", o: ["5", "6", "7", "8"], a: 2 },
    { q: "Fastest animal?", o: ["Lion", "Cheetah", "Horse", "Dog"], a: 1 },
    { q: "India independence?", o: ["1945", "1947", "1950", "1942"], a: 1 }
];
function startQuiz() {
    qq = QUIZ.sort(() => Math.random() - 0.5).slice(0, 10); qi = 0; qs = 0; showQuizQ();
}
function showQuizQ() {
    if (qi >= qq.length) return showQuizR();
    const q = qq[qi];
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header"><h2>Quiz ${qi+1}/10</h2><div></div></div>
        <h3 style="margin:15px 0">${q.q}</h3>
        ${q.o.map((o, i) => `<button class="btn-out" onclick="answerQuiz(${i})" style="text-align:left;margin:5px 0">${o}</button>`).join('')}`;
}
function answerQuiz(i) {
    if (qq[qi].a === i) qs++;
    qi++; showQuizQ();
}
function showQuizR() {
    let emoji, msg;
    if (qs <= 3) { emoji = '😢'; msg = 'Need Hardwork! Keep learning! 💪'; }
    else if (qs <= 6) { emoji = '🌟'; msg = 'Good job! Keep going! 📚'; }
    else if (qs <= 8) { emoji = '😍'; msg = 'Amazing! You rock! 🚀'; }
    else { emoji = '😱'; msg = 'Excellent! Genius! 👑'; }
    document.getElementById('gamesContent').innerHTML = `
        <div style="text-align:center;padding:20px">
            <div style="font-size:60px">${emoji}</div>
            <h2 style="color:var(--gold)">${qs}/10</h2>
            <p>${msg}</p>
            <button class="btn" onclick="startQuiz()">Try Again</button>
            <button class="btn-out" onclick="openGames()">Back</button>
        </div>`;
}

// ==================== UTILS ====================
function av(n) { const i = (n || 'U')[0].toUpperCase(); return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%231a1f4e" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="%23D4AF37" font-size="40">${i}</text></svg>`; }
function tf(d) { if (!d) return ''; const df = Date.now() - d; if (df < 60000) return 'Now'; if (df < 3600000) return Math.floor(df / 60000) + 'm'; if (df < 86400000) return Math.floor(df / 3600000) + 'h'; return d.toLocaleDateString(); }
function toast(m, t) { const e = document.querySelector('.toast'); if (e) e.remove(); const n = document.createElement('div'); n.className = 'toast' + (t === 'error' ? ' error' : ''); n.textContent = m; document.body.appendChild(n); setTimeout(() => n.remove(), 3000); }
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
document.addEventListener('click', e => { if (e.target.classList.contains('modal')) e.target.classList.remove('show'); });
document.addEventListener('keypress', e => { if (e.key === 'Enter' && document.getElementById('chatWindow').classList.contains('show')) sendMsg(); });        <button class="btn-out" onclick="startMemory()">🧠 Memory Match</button>
        <button class="btn-out" onclick="startQuiz()">❓ Quiz</button>`;
}

// Tic Tac Toe
let ttt = []; let tttActive = false;
function startTTT() {
    ttt = ['', '', '', '', '', '', '', '', '']; tttActive = true;
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header"><button onclick="openGames()">←</button><h2>Tic Tac Toe</h2><div></div></div>
        <div id="tttGrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:280px;margin:20px auto">
            ${[0,1,2,3,4,5,6,7,8].map(i => `<div style="aspect-ratio:1;background:var(--card);border:2px solid rgba(212,175,55,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:40px;cursor:pointer" onclick="tttMove(${i})" id="ttt${i}"></div>`).join('')}
        </div>
        <p id="tttStatus" style="text-align:center;color:var(--gold)">Your turn (X)</p>`;
}

function tttMove(i) {
    if (!tttActive || ttt[i] !== '') return;
    ttt[i] = 'X'; document.getElementById(`ttt${i}`).textContent = 'X'; document.getElementById(`ttt${i}`).style.color = 'var(--gold)';
    if (checkWin('X')) { tttActive = false; document.getElementById('tttStatus').textContent = '🎉 You Win!'; return; }
    if (ttt.every(c => c !== '')) { tttActive = false; document.getElementById('tttStatus').textContent = '🤝 Draw!'; return; }
    setTimeout(() => {
        const empty = ttt.map((c, i) => c === '' ? i : null).filter(i => i !== null);
        const ai = empty[Math.floor(Math.random() * empty.length)];
        ttt[ai] = 'O'; document.getElementById(`ttt${ai}`).textContent = 'O'; document.getElementById(`ttt${ai}`).style.color = '#FF4757';
        if (checkWin('O')) { tttActive = false; document.getElementById('tttStatus').textContent = '😞 AI Wins!'; }
        else if (ttt.every(c => c !== '')) { tttActive = false; document.getElementById('tttStatus').textContent = '🤝 Draw!'; }
        else document.getElementById('tttStatus').textContent = 'Your turn (X)';
    }, 500);
}
function checkWin(p) {
    const w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return w.some(w => w.every(i => ttt[i] === p));
}

// Memory
let mem = []; let flipped = []; let matched = []; let moves = 0; let locked = false;
function startMemory() {
    const emojis = ['🎮', '🎯', '🎨', '🎵', '🎭', '🎪', '🎲', '🎸'];
    mem = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    flipped = []; matched = []; moves = 0; locked = false;
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header"><button onclick="openGames()">←</button><h2>Memory</h2><div></div></div>
        <p style="text-align:center;color:var(--gold)">Moves: <span id="memMoves">0</span></p>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:320px;margin:15px auto">
            ${mem.map((e, i) => `<div style="aspect-ratio:1;background:var(--card);border:2px solid rgba(212,175,55,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:30px;cursor:pointer" onclick="flipMem(${i})" id="mem${i}">❓</div>`).join('')}
        </div>`;
}
function flipMem(i) {
    if (locked || flipped.includes(i) || matched.includes(i)) return;
    flipped.push(i); document.getElementById(`mem${i}`).textContent = mem[i];
    if (flipped.length === 2) {
        moves++; document.getElementById('memMoves').textContent = moves; locked = true;
        const [a, b] = flipped;
        if (mem[a] === mem[b]) { matched.push(a, b); flipped = []; locked = false; if (matched.length === 16) toast('🎉 Done!'); }
        else { setTimeout(() => { document.getElementById(`mem${a}`).textContent = '❓'; document.getElementById(`mem${b}`).textContent = '❓'; flipped = []; locked = false; }, 800); }
    }
}

// Quiz
let qq = []; let qi = 0; let qs = 0;
const QUIZ = [
    { q: "Capital of France?", o: ["London", "Paris", "Berlin", "Madrid"], a: 1 },
    { q: "Red Planet?", o: ["Venus", "Jupiter", "Mars", "Saturn"], a: 2 },
    { q: "2+2×2?", o: ["6", "8", "4", "10"], a: 0 },
    { q: "Mona Lisa painter?", o: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], a: 2 },
    { q: "Largest ocean?", o: ["Atlantic", "Indian", "Arctic", "Pacific"], a: 3 },
    { q: "King of Jungle?", o: ["Tiger", "Lion", "Elephant", "Bear"], a: 1 },
    { q: "H2O is?", o: ["Oxygen", "Hydrogen", "Water", "Air"], a: 2 },
    { q: "Continents?", o: ["5", "6", "7", "8"], a: 2 },
    { q: "Fastest animal?", o: ["Lion", "Cheetah", "Horse", "Dog"], a: 1 },
    { q: "India independence?", o: ["1945", "1947", "1950", "1942"], a: 1 }
];
function startQuiz() {
    qq = QUIZ.sort(() => Math.random() - 0.5).slice(0, 10); qi = 0; qs = 0; showQuizQ();
}
function showQuizQ() {
    if (qi >= qq.length) return showQuizR();
    const q = qq[qi];
    document.getElementById('gamesContent').innerHTML = `
        <div class="modal-header"><h2>Quiz ${qi+1}/10</h2><div></div></div>
        <h3 style="margin:15px 0">${q.q}</h3>
        ${q.o.map((o, i) => `<button class="btn-out" onclick="answerQuiz(${i})" style="text-align:left;margin:5px 0">${o}</button>`).join('')}`;
}
function answerQuiz(i) {
    if (qq[qi].a === i) qs++;
    qi++; showQuizQ();
}
function showQuizR() {
    let emoji, msg;
    if (qs <= 3) { emoji = '😢'; msg = 'Need Hardwork! Keep learning! 💪'; }
    else if (qs <= 6) { emoji = '🌟'; msg = 'Good job! Keep going! 📚'; }
    else if (qs <= 8) { emoji = '😍'; msg = 'Amazing! You rock! 🚀'; }
    else { emoji = '😱'; msg = 'Excellent! Genius! 👑'; }
    document.getElementById('gamesContent').innerHTML = `
        <div style="text-align:center;padding:20px">
            <div style="font-size:60px">${emoji}</div>
            <h2 style="color:var(--gold)">${qs}/10</h2>
            <p>${msg}</p>
            <button class="btn" onclick="startQuiz()">Try Again</button>
            <button class="btn-out" onclick="openGames()">Back</button>
        </div>`;
}

// ==================== UTILS ====================
function av(n) { const i = (n || 'U')[0].toUpperCase(); return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%231a1f4e" width="100" height="100"/><text x="50" y="60" text-anchor="middle" fill="%23D4AF37" font-size="40">${i}</text></svg>`; }
function tf(d) { if (!d) return ''; const df = Date.now() - d; if (df < 60000) return 'Now'; if (df < 3600000) return Math.floor(df / 60000) + 'm'; if (df < 86400000) return Math.floor(df / 3600000) + 'h'; return d.toLocaleDateString(); }
function toast(m, t) { const e = document.querySelector('.toast'); if (e) e.remove(); const n = document.createElement('div'); n.className = 'toast' + (t === 'error' ? ' error' : ''); n.textContent = m; document.body.appendChild(n); setTimeout(() => n.remove(), 3000); }
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
document.addEventListener('click', e => { if (e.target.classList.contains('modal')) e.target.classList.remove('show'); });
document.addEventListener('keypress', e => { if (e.key === 'Enter' && document.getElementById('chatWindow').classList.contains('show')) sendMsg(); });    
    // Get leaderboard
    let leaderboardHTML = '<div style="text-align:center;padding:20px;color:var(--text2)">Loading...</div>';
    
    try {
        const snapshot = await db.collection('users')
            .orderBy('stats.achievements', 'desc')
            .limit(10)
            .get();
        
        const leaders = [];
        snapshot.forEach(doc => {
            if (doc.id !== currentUser?.uid) {
                leaders.push({ id: doc.id, ...doc.data() });
            }
        });
        
        leaderboardHTML = leaders.map((l, i) => `
            <div class="leader-item" onclick="viewUserProfile('${l.id}')">
                <span class="leader-rank ${i < 3 ? 'top' : ''}">#${i + 1}</span>
                <img src="${l.avatar || getAvatar(l.name)}" class="leader-avatar" onerror="this.src='${getAvatar(l.name)}'">
                <div class="leader-info">
                    <div class="leader-name">${l.name}</div>
                    <div class="leader-username">${l.username}</div>
                </div>
                <div class="leader-score">🏆 ${l.stats?.achievements || 0}</div>
            </div>
        `).join('');
    } catch (e) {
        leaderboardHTML = '<div style="text-align:center;padding:20px;color:var(--text2)">No data yet</div>';
    }
    
    container.innerHTML = `
        <!-- Header -->
        <div class="card" style="text-align:center">
            <div style="font-size:60px">🕷️</div>
            <h1 style="color:var(--gold);font-size:28px;font-weight:900;letter-spacing:3px">ChronoX</h1>
            <p style="color:var(--text2)">${u.name || 'Welcome'}</p>
        </div>
        
        <!-- Streak -->
        <div class="card streak-card">
            <div style="display:flex;align-items:center;gap:15px">
                <div style="font-size:45px">🔥</div>
                <div>
                    <div style="font-size:32px;font-weight:900;color:var(--gold)">${u.streak || 0}</div>
                    <div style="color:var(--text2);font-size:12px">Day Streak • Best: ${u.bestStreak || 0}</div>
                </div>
            </div>
        </div>
        
        <!-- Quick Links -->
        <div class="card">
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
                <button class="quick-link-btn" onclick="openQuiz()">
                    <span style="font-size:30px">❓</span>
                    <span style="font-size:11px;color:var(--text2)">Quiz</span>
                </button>
                <button class="quick-link-btn" onclick="navigateTo('discover')">
                    <span style="font-size:30px">🔍</span>
                    <span style="font-size:11px;color:var(--text2)">Discover</span>
                </button>
                <button class="quick-link-btn" onclick="openGames()">
                    <span style="font-size:30px">🎮</span>
                    <span style="font-size:11px;color:var(--text2)">Games</span>
                </button>
            </div>
        </div>
        
        <!-- Leaderboard -->
        <div class="card">
            <h3 style="color:var(--gold);margin-bottom:15px">🏆 Top Players</h3>
            ${leaderboardHTML}
        </div>
    `;
}

console.log('✅ App module loaded');
