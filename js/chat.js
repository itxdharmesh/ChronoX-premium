import { db } from './config.js';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp, getDocs, setDoc, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from './utils.js';

function formatTime(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
    if (diff < 86400000) return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString();
}

// OPEN CHAT
async function openChat(peerUid) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) { showToast('Login required', 'error'); return; }
    
    const myData = (await getDoc(doc(db, 'users', currentUser.uid))).data();
    const peerData = (await getDoc(doc(db, 'users', peerUid))).data();
    if (!peerData) { showToast('User not found', 'error'); return; }
    
    const iFollow = (myData.following || []).includes(peerUid);
    const theyFollow = (peerData.followers || []).includes(currentUser.uid);
    const mutual = iFollow && theyFollow;
    
    if (mutual) {
        openChatWindow(peerUid);
    } else {
        sendChatRequest(peerUid);
    }
}

async function sendChatRequest(peerUid) {
    try {
        await setDoc(doc(db, 'chatRequests', `${window.auth.currentUser.uid}_${peerUid}`), {
            from: window.auth.currentUser.uid, to: peerUid, status: 'pending', timestamp: serverTimestamp()
        });
        showToast('Chat request sent! 📩', 'success');
    } catch(e) { showToast('Error', 'error'); }
}

function openChatWindow(peerUid) {
    const chatId = [window.auth.currentUser.uid, peerUid].sort().join('_');
    
    setDoc(doc(db, 'chats', chatId), {
        participants: [window.auth.currentUser.uid, peerUid], updatedAt: serverTimestamp()
    }, { merge: true });
    
    document.getElementById('chatTitle').textContent = 'Chat';
    document.getElementById('chatModal').style.display = 'flex';
    
    const msgContainer = document.getElementById('chatMessages');
    const msgQuery = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    
    onSnapshot(msgQuery, (snap) => {
        msgContainer.innerHTML = '';
        snap.forEach(d => {
            const m = d.data();
            const isMine = m.sender === window.auth.currentUser.uid;
            msgContainer.innerHTML += `
                <div style="text-align:${isMine?'right':'left'};margin:0.3rem 0;">
                    <div class="glass-panel" style="display:inline-block;padding:0.5rem 1rem;max-width:80%;background:${isMine?'rgba(0,212,255,0.2)':'rgba(255,255,255,0.05)'};">
                        <p style="font-size:0.9rem;">${m.text}</p>
                        <small style="color:#888;font-size:0.6rem;">${formatTime(m.timestamp)} ${m.seen?'✓✓':'✓'}</small>
                    </div>
                </div>`;
        });
        msgContainer.scrollTop = msgContainer.scrollHeight;
    });
    
    document.getElementById('sendChatBtn').onclick = async () => {
        const input = document.getElementById('chatMessageInput');
        const text = input.value.trim();
        if (!text) return;
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
            text, sender: window.auth.currentUser.uid, timestamp: serverTimestamp(), seen: false
        });
        await updateDoc(doc(db, 'chats', chatId), { updatedAt: serverTimestamp() });
        input.value = '';
    };
}

document.getElementById('closeChatModal').addEventListener('click', () => {
    document.getElementById('chatModal').style.display = 'none';
});

// LOAD CHAT LIST
async function loadChatList() {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    
    const container = document.getElementById('chatListContainer');
    container.innerHTML = `
        <!-- Search Bar -->
        <div class="input-group" style="margin-bottom:0.8rem;">
            <i class="fas fa-search input-icon"></i>
            <input type="text" id="chatSearchInput" placeholder="🔍 Search users to chat..." class="auth-input">
        </div>
        <div id="chatSearchResults"></div>
        
        <!-- Tabs -->
        <div style="display:flex;gap:0;margin-bottom:0.8rem;">
            <button class="chat-tab active" onclick="switchChatTab('messages')" id="tabMessages">💬 Messages</button>
            <button class="chat-tab" onclick="switchChatTab('requests')" id="tabRequests">📩 Requests</button>
        </div>
        
        <div id="messagesList"></div>
        <div id="requestsList" style="display:none;"></div>
    `;
    
    // Chat search
    document.getElementById('chatSearchInput').addEventListener('input', async (e) => {
        const term = e.target.value.trim().toLowerCase();
        const resultsDiv = document.getElementById('chatSearchResults');
        if (term.length < 2) { resultsDiv.innerHTML = ''; return; }
        
        const q = query(collection(db, 'users'), where('username', '>=', term), where('username', '<=', term+'\uf8ff'), limit(10));
        const snap = await getDocs(q);
        resultsDiv.innerHTML = '';
        
        snap.forEach(d => {
            if (d.id === currentUser.uid) return;
            const u = d.data();
            resultsDiv.innerHTML += `
                <div class="glass-panel" style="padding:0.6rem;margin:0.3rem 0;cursor:pointer;display:flex;align-items:center;gap:0.6rem;" onclick="window.openChat('${d.id}')">
                    <div style="position:relative;">
                        <img src="${u.avatar||'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=40'}" width="40" height="40" style="border-radius:50%;">
                        <span style="position:absolute;bottom:0;right:0;width:10px;height:10px;background:${u.status==='online'?'#2ED573':'#666'};border-radius:50%;border:2px solid #000;"></span>
                    </div>
                    <div style="flex:1;"><strong>${u.name}</strong><p style="font-size:0.7rem;color:#aaa;">@${u.username}</p></div>
                </div>`;
        });
    });
    
    // Load messages
    loadMessagesList();
    loadRequestsList();
}

async function loadMessagesList() {
    const currentUser = window.auth?.currentUser;
    const container = document.getElementById('messagesList');
    
    const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid), orderBy('updatedAt', 'desc'), limit(20));
    const chatSnap = await getDocs(chatsQuery);
    container.innerHTML = '';
    
    if (chatSnap.empty) {
        container.innerHTML = '<p style="text-align:center;color:#888;padding:2rem;">No messages yet. Search users above!</p>';
        return;
    }
    
    for (const chatDoc of chatSnap.docs) {
        const data = chatDoc.data();
        const peerUid = data.participants.find(p => p !== currentUser.uid);
        if (!peerUid) continue;
        
        const peerSnap = await getDoc(doc(db, 'users', peerUid));
        if (!peerSnap.exists()) continue;
        const peer = peerSnap.data();
        
        const lastMsgQuery = query(collection(db, 'chats', chatDoc.id, 'messages'), orderBy('timestamp', 'desc'), limit(1));
        const lastSnap = await getDocs(lastMsgQuery);
        let lastMsg = 'No messages yet';
        let lastTime = '';
        let unread = 0;
        
        if (!lastSnap.empty) {
            const m = lastSnap.docs[0].data();
            lastMsg = m.text.substring(0, 30);
            lastTime = formatTime(m.timestamp);
            if (!m.seen && m.sender !== currentUser.uid) unread = 1;
        }
        
        container.innerHTML += `
            <div class="glass-panel chat-list-item" onclick="window.openChat('${peerUid}')" style="display:flex;align-items:center;gap:0.8rem;padding:0.8rem;cursor:pointer;margin:0.3rem 0;">
                <div style="position:relative;">
                    <img src="${peer.avatar||'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=50'}" width="50" height="50" style="border-radius:50%;">
                    <span style="position:absolute;bottom:0;right:0;width:12px;height:12px;background:${peer.status==='online'?'#2ED573':'#666'};border-radius:50%;border:2px solid #000;"></span>
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;">
                        <strong style="font-size:0.9rem;">${peer.name}</strong>
                        <small style="color:#888;">${lastTime}</small>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.3rem;">
                        <p style="color:#aaa;font-size:0.75rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">${lastMsg}</p>
                        ${unread ? '<span style="background:#ff4757;color:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:0.6rem;">1</span>' : ''}
                    </div>
                </div>
            </div>`;
    }
}

async function loadRequestsList() {
    const currentUser = window.auth?.currentUser;
    const container = document.getElementById('requestsList');
    
    const reqQuery = query(collection(db, 'chatRequests'), where('to', '==', currentUser.uid), where('status', '==', 'pending'));
    const reqSnap = await getDocs(reqQuery);
    container.innerHTML = '';
    
    if (reqSnap.empty) {
        container.innerHTML = '<p style="text-align:center;color:#888;padding:2rem;">No pending requests</p>';
        return;
    }
    
    for (const reqDoc of reqSnap.docs) {
        const req = reqDoc.data();
        const fromSnap = await getDoc(doc(db, 'users', req.from));
        if (!fromSnap.exists()) continue;
        const from = fromSnap.data();
        
        container.innerHTML += `
            <div class="glass-panel" style="padding:0.8rem;margin:0.3rem 0;display:flex;align-items:center;gap:0.6rem;">
                <img src="${from.avatar||'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=45'}" width="45" height="45" style="border-radius:50%;">
                <div style="flex:1;">
                    <strong>${from.name}</strong>
                    <p style="font-size:0.7rem;color:#aaa;">Wants to chat with you</p>
                </div>
                <button class="btn-glow" style="padding:0.3rem 0.8rem;font-size:0.7rem;" onclick="window.acceptRequest('${reqDoc.id}','${req.from}')">Accept</button>
                <button class="btn-icon" style="color:#ff4757;font-size:0.8rem;" onclick="window.rejectRequest('${reqDoc.id}')">✕</button>
            </div>`;
    }
}

async function acceptRequest(reqId, fromUid) {
    await setDoc(doc(db, 'chatRequests', reqId), { status: 'accepted' }, { merge: true });
    showToast('Request accepted!', 'success');
    openChatWindow(fromUid);
    loadChatList();
}

async function rejectRequest(reqId) {
    await setDoc(doc(db, 'chatRequests', reqId), { status: 'rejected' }, { merge: true });
    showToast('Request rejected', 'info');
    loadChatList();
}

function switchChatTab(tab) {
    document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab'+tab.charAt(0).toUpperCase()+tab.slice(1)).classList.add('active');
    document.getElementById('messagesList').style.display = tab==='messages'?'block':'none';
    document.getElementById('requestsList').style.display = tab==='requests'?'block':'none';
}

window.openChat = openChat;
window.loadChatList = loadChatList;
window.acceptRequest = acceptRequest;
window.rejectRequest = rejectRequest;
window.switchChatTab = switchChatTab;

export { openChat, loadChatList };
