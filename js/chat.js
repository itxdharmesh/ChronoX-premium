import { db } from './config.js';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { defaultAvatar, formatTime } from './utils.js';

async function openChat(peerUid) {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    const chatId = [currentUser.uid, peerUid].sort().join('_');
    document.getElementById('chatTitle').textContent = 'Chat';
    document.getElementById('chatModal').style.display = 'flex';
    const messagesContainer = document.getElementById('chatMessages');
    const messagesQuery = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    onSnapshot(messagesQuery, (snapshot) => {
        messagesContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const message = doc.data();
            const isMine = message.sender === currentUser.uid;
            messagesContainer.innerHTML += `
                <div style="text-align:${isMine ? 'right' : 'left'};margin:0.5rem 0;">
                    <div class="glass-panel" style="display:inline-block;padding:0.5rem 1rem;max-width:80%;">
                        <p>${message.text}</p><small style="color:#aaa;">${formatTime(message.timestamp)}</small>
                    </div>
                </div>`;
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
    document.getElementById('sendChatBtn').onclick = async () => {
        const input = document.getElementById('chatMessageInput');
        const text = input.value.trim();
        if (!text) return;
        await addDoc(collection(db, 'chats', chatId, 'messages'), { text, sender: currentUser.uid, timestamp: serverTimestamp() });
        input.value = '';
    };
}

document.getElementById('closeChatModal').addEventListener('click', () => {
    document.getElementById('chatModal').style.display = 'none';
});

async function loadChatList() {
    const currentUser = window.auth?.currentUser;
    if (!currentUser) return;
    const container = document.getElementById('chatListContainer');
    const chatsQuery = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid));
    const snapshot = await getDocs(chatsQuery);
    container.innerHTML = '';
    snapshot.forEach(doc => {
        const chatData = doc.data();
        const peerUid = chatData.participants.find(p => p !== currentUser.uid);
        container.innerHTML += `
            <div class="glass-panel chat-list-item" onclick="window.openChat('${peerUid}')">
                <div style="display:flex;align-items:center;gap:0.8rem;">
                    <img src="${defaultAvatar()}" width="50" height="50" style="border-radius:50%;">
                    <div><strong>User ${peerUid.substring(0,6)}</strong><p style="font-size:0.8rem;color:#aaa;">Tap to chat</p></div>
                </div>
            </div>`;
    });
}

window.openChat = openChat;
window.loadChatList = loadChatList;
export { openChat, loadChatList };
