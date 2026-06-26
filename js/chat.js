import { db } from './config.js';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, updateDoc, doc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { formatTime, showToast } from './utils.js';

// Open chat with user
async function openChat(peerUid) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    
    // Check mutual follow
    const currentUserData = window.currentUserData || (await getDoc(doc(db, 'users', currentUser.uid))).data();
    const peerData = (await getDoc(doc(db, 'users', peerUid))).data();
    
    const isFollowing = (currentUserData.following || []).includes(peerUid);
    const isFollowedBy = (peerData.followers || []).includes(currentUser.uid);
    const mutualFollow = isFollowing && isFollowedBy;
    
    if (!mutualFollow && !isFollowing) {
        // Send chat request
        await sendChatRequest(peerUid);
        return;
    }
    
    // Open chat window
    openChatWindow(peerUid);
}

async function sendChatRequest(peerUid) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    
    try {
        const requestRef = doc(db, 'chatRequests', `${currentUser.uid}_${peerUid}`);
        await setDoc(requestRef, {
            from: currentUser.uid,
            to: peerUid,
            status: 'pending',
            timestamp: serverTimestamp()
        });
        showToast('Chat request sent! 📩', 'success');
    } catch(e) { showToast('Error sending request', 'error'); }
}

function openChatWindow(peerUid) {
    const chatId = [window.auth.currentUser.uid, peerUid].sort().join('_');
    document.getElementById('chatTitle').textContent = 'Chat';
    document.getElementById('chatModal').style.display = 'flex';
    
    const messagesContainer = document.getElementById('chatMessages');
    const messagesQuery = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    
    onSnapshot(messagesQuery, (snapshot) => {
        messagesContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const message = doc.data();
            const isMine = message.sender === window.auth.currentUser.uid;
            messagesContainer.innerHTML += `
                <div style="text-align:${isMine ? 'right' : 'left'};margin:0.5rem 0;">
                    <div class="glass-panel" style="display:inline-block;padding:0.5rem 1rem;max-width:80%;">
                        <p>${message.text}</p>
                        <small style="color:#aaa;font-size:0.65rem;">${formatTime(message.timestamp)} ${message.seen ? '✓✓' : '✓'}</small>
                    </div>
                </div>`;
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
    
    document.getElementById('sendChatBtn').onclick = async () => {
        const input = document.getElementById('chatMessageInput');
        const text = input.value.trim();
        if (!text) return;
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
            text, sender: window.auth.currentUser.uid, timestamp: serverTimestamp(), seen: false
        });
        input.value = '';
    };
}

document.getElementById('closeChatModal').addEventListener('click', () => {
    document.getElementById('chatModal').style.display = 'none';
});

// Load chat list with Instagram-style UI
async function loadChatList() {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    
    const container = document.getElementById('chatListContainer');
    container.innerHTML = '<div style="text-align:center;padding:1rem;color:#888;">Loading chats...</div>';
    
    const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid));
    const snapshot = await getDocs(chatsQuery);
    
    if (snapshot.empty) {
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#888;">No chats yet. Search users to start chatting!</div>';
        return;
    }
    
    container.innerHTML = '';
    snapshot.forEach(async (chatDoc) => {
        const chatData = chatDoc.data();
        const peerUid = chatData.participants.find(p => p !== currentUser.uid);
        const peerData = (await getDoc(doc(db, 'users', peerUid))).data();
        
        // Get last message
        const lastMsgQuery = query(collection(db, 'chats', chatDoc.id, 'messages'), orderBy('timestamp', 'desc'), limit(1));
        const lastMsgSnap = await getDocs(lastMsgQuery);
        let lastMsg = '';
        let lastTime = '';
        
        if (!lastMsgSnap.empty) {
            const msg = lastMsgSnap.docs[0].data();
            lastMsg = msg.text.substring(0, 30);
            lastTime = formatTime(msg.timestamp);
        }
        
        container.innerHTML += `
            <div class="glass-panel chat-list-item" onclick="window.openChat('${peerUid}')" style="display:flex;align-items:center;gap:0.8rem;padding:0.8rem;cursor:pointer;">
                <div style="position:relative;">
                    <img src="${peerData?.avatar || 'https://ui-avatars.com/api/?name=User&background=00D4FF&color=fff&size=50'}" width="55" height="55" style="border-radius:50%;">
                    <span style="position:absolute;bottom:0;right:0;width:12px;height:12px;background:${peerData?.status==='online'?'#2ED573':'#666'};border-radius:50%;border:2px solid #000;"></span>
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;">
                        <strong>${peerData?.name || 'User'}</strong>
                        <small style="color:#888;">${lastTime}</small>
                    </div>
                    <p style="color:#aaa;font-size:0.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${lastMsg || 'Start chatting...'}</p>
                </div>
            </div>
        `;
    });
}

// Search users inside chat
async function searchChatUsers(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) return [];
    const q = query(collection(db, 'users'), where('username', '>=', searchTerm.toLowerCase()), where('username', '<=', searchTerm.toLowerCase()+'\uf8ff'), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

// Group chat creation
async function createGroupChat(name, memberUids) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    
    const allMembers = [currentUser.uid, ...memberUids];
    const chatRef = await addDoc(collection(db, 'chats'), {
        name,
        participants: allMembers,
        admin: currentUser.uid,
        isGroup: true,
        createdAt: serverTimestamp()
    });
    
    showToast('Group created! 🎉', 'success');
    return chatRef.id;
}

window.openChat = openChat;
window.loadChatList = loadChatList;
window.createGroupChat = createGroupChat;
export { openChat, loadChatList, searchChatUsers, createGroupChat };
