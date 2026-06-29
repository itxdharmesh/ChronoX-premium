let activeChat = null;
document.addEventListener('DOMContentLoaded', () => {
    if (!auth.isLoggedIn()) { router.navigate('/login'); return; }
    loadConversations();
    document.getElementById('sendMsgBtn')?.addEventListener('click', sendMessage);
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
    const params = router.params;
    if (params.userId) openChat(params.userId);
});

async function loadConversations() {
    const container = document.getElementById('conversationsList');
    if (!container) return;
    const convs = [
        { id: 'conv1', name: 'GameMaster', lastMsg: 'Nice game!', avatar: 'assets/avatars/default.png' },
        { id: 'conv2', name: 'ArtLover', lastMsg: 'Check this out!', avatar: 'assets/avatars/default.png' }
    ];
    container.innerHTML = convs.map(c => `
        <div class="conversation-item" onclick="openChat('${c.id}')">
            <img src="${c.avatar}" class="avatar avatar-sm">
            <div><div class="conversation-name">${c.name}</div><div class="conversation-last">${c.lastMsg}</div></div>
        </div>`).join('');
}

function openChat(id) {
    activeChat = id;
    document.getElementById('chatPanel').querySelector('.chat-placeholder').style.display = 'none';
    document.getElementById('chatActive').style.display = 'flex';
    document.getElementById('chatName').textContent = 'User';
    loadMessages();
}

async function loadMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const msgs = [{ text: 'Hey! How are you?', sent: false }, { text: 'I\'m good, thanks!', sent: true }];
    container.innerHTML = msgs.map(m => `<div class="msg-bubble ${m.sent ? 'msg-sent' : 'msg-received'}">${m.text}</div>`).join('');
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input?.value.trim();
    if (!text) return;
    const container = document.getElementById('chatMessages');
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble msg-sent';
    bubble.textContent = text;
    container?.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    input.value = '';
}
