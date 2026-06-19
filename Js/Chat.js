// ==================== CHAT SYSTEM ====================

// AI Users
const AI_USERS = {
    annaya_ai: { id: 'annaya_ai', name: 'Annaya', avatar: '👩‍🦰', verified: true },
    tarun_ai: { id: 'tarun_ai', name: 'Tarun', avatar: '👨‍💻', verified: true },
    chronox_ai: { id: 'chronox_ai', name: 'ChronoX AI', avatar: '🕷️', verified: true }
};

// Render chats page
function renderChats(container) {
    container.innerHTML = `
        <h2 style="color:var(--gold);margin-bottom:15px">💬 Messages</h2>
        <div id="chatListContainer">Loading...</div>
    `;
    loadChatList();
}

// Load chat list
function loadChatList() {
    const container = document.getElementById('chatListContainer');
    if (!container) return;
    
    db.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .orderBy('lastMessageTime', 'desc')
        .onSnapshot(async (snapshot) => {
            let html = '';
            
            // AI Users at top
            for (const [aiId, aiUser] of Object.entries(AI_USERS)) {
                const chatId = `ai_${currentUser.uid}_${aiId}`;
                const chatDoc = await db.collection('chats').doc(chatId).get();
                const chatData = chatDoc.data() || {};
                
                html += `
                    <div class="chat-item" onclick="openChat('${chatId}', '${aiId}', '${aiUser.name}', '${aiUser.avatar}', true)">
                        <div class="chat-avatar-emoji">${aiUser.avatar}</div>
                        <div class="chat-info">
                            <div class="chat-name">
                                ${aiUser.name}
                                <span class="blue-tick">✓</span>
                            </div>
                            <div class="chat-last-msg">${chatData.lastMessage || 'Tap to start chatting...'}</div>
                        </div>
                        <div class="chat-meta">
                            <span class="chat-time">${chatData.lastMessageTime ? formatTime(chatData.lastMessageTime.toDate()) : ''}</span>
                            <span class="online-indicator">● Online</span>
                        </div>
                    </div>
                `;
            }
            
            // Real user chats
            for (const doc of snapshot.docs) {
                const chat = doc.data();
                const otherId = chat.participants.find(id => id !== currentUser.uid);
                
                // Skip AI users
                if (['annaya_ai', 'tarun_ai', 'chronox_ai'].includes(otherId)) continue;
                
                const userDoc = await db.collection('users').doc(otherId).get();
                const userData = userDoc.data();
                if (!userData) continue;
                
                // Skip blocked users
                if (isBlocked(currentUserData, otherId) || isBlockedBy(userData, currentUser.uid)) continue;
                
                const isOnline = userData.onlineStatus === 'online';
                
                html += `
                    <div class="chat-item" onclick="openChat('${doc.id}', '${otherId}', '${userData.name}', '${userData.avatar}', false)">
                        <img src="${userData.avatar || getAvatar(userData.name)}" class="chat-avatar-img" onerror="this.src='${getAvatar(userData.name)}'">
                        <div class="chat-info">
                            <div class="chat-name">${userData.name}</div>
                            <div class="chat-last-msg">${chat.lastMessage || ''}</div>
                        </div>
                        <div class="chat-meta">
                            <span class="chat-time">${chat.lastMessageTime ? formatTime(chat.lastMessageTime.toDate()) : ''}</span>
                            <span class="${isOnline ? 'online-indicator' : 'offline-text'}">${isOnline ? '● Online' : getOnlineStatus(userData)}</span>
                        </div>
                    </div>
                `;
            }
            
            container.innerHTML = html || '<div class="empty-state">No chats yet. Discover people to chat!</div>';
        });
}

// Open chat
function openChat(chatId, userId, userName, userAvatar, isAI = false) {
    activeChatId = chatId;
    activeChatUser = { userId, userName, userAvatar, isAI };
    
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.add('show');
    
    // Set chat header
    document.getElementById('chatName').textContent = userName;
    document.getElementById('chatStatus').textContent = isAI ? '● Active now' : 'Loading...';
    document.getElementById('chatStatus').style.color = '#2ED573';
    
    // Set avatar
    const avatarEl = document.getElementById('chatAvatar');
    if (isAI) {
        avatarEl.style.display = 'none';
        avatarEl.insertAdjacentHTML('afterend', `<span id="aiEmoji" style="font-size:35px">${userAvatar}</span>`);
    } else {
        avatarEl.style.display = '';
        avatarEl.src = userAvatar || getAvatar(userName);
        avatarEl.onerror = function() { this.src = getAvatar(userName); };
        const emoji = document.getElementById('aiEmoji');
        if (emoji) emoji.remove();
    }
    
    // Load messages
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('msgInput').value = '';
    
    if (chatListener) chatListener();
    
    chatListener = db.collection('chats').doc(chatId)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            const msgContainer = document.getElementById('chatMessages');
            msgContainer.innerHTML = '';
            
            snapshot.forEach(doc => {
                const msg = doc.data();
                const isSent = msg.senderId === currentUser.uid;
                
                msgContainer.innerHTML += `
                    <div class="${isSent ? 'msg-sent' : 'msg-received'}">
                        ${msg.text}
                        ${msg.mediaUrl ? `<img src="${msg.mediaUrl}" class="msg-media" onclick="this.classList.toggle('full')">` : ''}
                        <div class="msg-time">${msg.timestamp ? formatTime(msg.timestamp.toDate()) : ''}</div>
                        ${isSent ? `<div class="msg-seen-status">${msg.seen ? '✓✓ Seen' : '✓ Sent'}</div>` : ''}
                    </div>
                `;
            });
            
            msgContainer.scrollTop = msgContainer.scrollHeight;
        });
    
    // Update seen status
    if (!isAI) {
        updateChatWindowStatus(userId);
    }
}

// Update chat window status
async function updateChatWindowStatus(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const statusEl = document.getElementById('chatStatus');
    
    if (userData.onlineStatus === 'online') {
        statusEl.textContent = '● Active now';
        statusEl.style.color = '#2ED573';
    } else {
        statusEl.textContent = getOnlineStatus(userData);
        statusEl.style.color = 'rgba(255,255,255,0.6)';
    }
}

// Close chat
function closeChat() {
    document.getElementById('chatWindow').classList.remove('show');
    if (chatListener) chatListener();
    chatListener = null;
    activeChatId = null;
    activeChatUser = null;
    document.getElementById('msgInput').value = '';
    
    const emoji = document.getElementById('aiEmoji');
    if (emoji) emoji.remove();
    document.getElementById('chatAvatar').style.display = '';
}

// Send message
async function sendMessage() {
    const text = document.getElementById('msgInput').value.trim();
    if (!text || !activeChatId || !activeChatUser) return;
    
    // Save message
    await db.collection('chats').doc(activeChatId).collection('messages').add({
        senderId: currentUser.uid,
        text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        seen: false
    });
    
    // Update chat metadata
    await db.collection('chats').doc(activeChatId).set({
        participants: [currentUser.uid, activeChatUser.userId],
        lastMessage: text,
        lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    // Update message count for achievements
    if (text.split(' ').length >= 5) {
        await db.collection('users').doc(currentUser.uid).update({
            'stats.totalMessages': firebase.firestore.FieldValue.increment(1)
        });
        checkAchievements();
    }
    
    document.getElementById('msgInput').value = '';
    
    // AI auto-reply
    if (activeChatUser.isAI) {
        const typingDelay = 1000 + Math.random() * 2000;
        setTimeout(async () => {
            const aiResponse = getAIReply(activeChatUser.userId, text);
            await db.collection('chats').doc(activeChatId).collection('messages').add({
                senderId: activeChatUser.userId,
                text: aiResponse,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                seen: true
            });
            await db.collection('chats').doc(activeChatId).update({
                lastMessage: aiResponse,
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
            });
        }, typingDelay);
    }
}

// Send media
async function sendMedia() {
    const files = document.getElementById('mediaUpload').files;
    if (!files.length || !activeChatId) return;
    
    for (const file of files) {
        const ref = storage.ref(`chat_media/${activeChatId}/${Date.now()}_${file.name}`);
        await ref.put(file);
        const url = await ref.getDownloadURL();
        
        await db.collection('chats').doc(activeChatId).collection('messages').add({
            senderId: currentUser.uid,
            text: file.type.startsWith('image/') ? '📷 Image' : '🎥 Video',
            mediaUrl: url,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            seen: false
        });
    }
}

// Get AI reply
function getAIReply(aiId, message) {
    if (aiId === 'annaya_ai') return getAnnayaReply(message);
    if (aiId === 'tarun_ai') return getTarunReply(message);
    if (aiId === 'chronox_ai') return getChronoXReply(message);
    return 'Hello!';
}

// Start chat with user
async function startChatWithUser(userId) {
    const snapshot = await db.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .get();
    
    let existingChat = null;
    snapshot.forEach(doc => {
        if (doc.data().participants.includes(userId)) {
            existingChat = { id: doc.id };
        }
    });
    
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (existingChat) {
        openChat(existingChat.id, userId, userData.name, userData.avatar);
    } else {
        const ref = await db.collection('chats').add({
            participants: [currentUser.uid, userId],
            lastMessage: '',
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
        });
        openChat(ref.id, userId, userData.name, userData.avatar);
    }
}

console.log('✅ Chat module loaded');
