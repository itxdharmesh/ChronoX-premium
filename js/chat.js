var chatId = null;
var chatUser = null;
var chatListener = null;
var activeTab = 'chats';

function renderChats(c) {
    c.innerHTML = 
        '<h2 style="color:#D4AF37;margin-bottom:10px">💬 Messages</h2>' +
        '<div style="display:flex;gap:5px;margin-bottom:12px">' +
            '<button id="tabChats" class="btn-out" style="flex:1;background:rgba(212,175,55,0.2)" onclick="switchTab(\'chats\')">💬 Chats</button>' +
            '<button id="tabRequests" class="btn-out" style="flex:1" onclick="switchTab(\'requests\')">📩 Requests</button>' +
        '</div>' +
        '<div id="chatListContainer" style="display:flex;flex-direction:column;gap:6px"></div>';
    loadChatList();
}

function switchTab(tab) {
    activeTab = tab;
    document.getElementById('tabChats').style.background = tab==='chats'?'rgba(212,175,55,0.2)':'';
    document.getElementById('tabRequests').style.background = tab==='requests'?'rgba(212,175,55,0.2)':'';
    loadChatList();
}

function loadChatList() {
    var container = document.getElementById('chatListContainer');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:20px">Loading...</p>';
    
    if (activeTab === 'requests') {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No pending requests</p>';
        return;
    }
    
    // AI Users - ALWAYS SHOW
    var aiUsers = [
        { id: 'annaya_ai', name: 'Annaya', avatar: '👩‍🦰' },
        { id: 'tarun_ai', name: 'Tarun', avatar: '👨‍💻' },
        { id: 'chronox_ai', name: 'ChronoX AI', avatar: '🕷️' }
    ];
    
    var allItems = [];
    
    aiUsers.forEach(function(ai) {
        allItems.push({
            chatId: 'ai_' + currentUser.uid + '_' + ai.id,
            userId: ai.id,
            name: ai.name,
            avatar: ai.avatar,
            isAI: true,
            lastMsg: 'Tap to chat',
            time: '',
            isOnline: true
        });
    });
    
    // Get real chats
    db.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .get()
        .then(function(snap) {
            var promises = [];
            
            snap.forEach(function(doc) {
                var chat = doc.data();
                var otherId = chat.participants.find(function(id) { return id !== currentUser.uid; });
                if (!otherId || ['annaya_ai','tarun_ai','chronox_ai'].includes(otherId)) return;
                
                promises.push(
                    db.collection('users').doc(otherId).get().then(function(ud) {
                        var u = ud.data();
                        if (!u) return;
                        if ((currentUserData.blockedUsers||[]).indexOf(otherId) !== -1) return;
                        if ((u.blockedUsers||[]).indexOf(currentUser.uid) !== -1) return;
                        
                        allItems.push({
                            chatId: doc.id,
                            userId: otherId,
                            name: u.name,
                            avatar: u.avatar || '',
                            isAI: false,
                            lastMsg: chat.lastMessage || '',
                            time: chat.lastMessageTime ? formatTime(chat.lastMessageTime.toDate()) : '',
                            isOnline: u.onlineStatus === 'online',
                            lastSeen: u.lastSeen ? u.lastSeen.toDate() : null
                        });
                    })
                );
            });
            
            Promise.all(promises).then(function() {
                renderChatItems(container, allItems);
            });
        })
        .catch(function() {
            renderChatItems(container, allItems);
        });
}

function renderChatItems(container, items) {
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No chats yet. Search and message someone!</p>';
        return;
    }
    
    var html = '';
    
    items.forEach(function(item) {
        var dp = item.isAI ? '' : (item.avatar || defaultAvatar(item.name));
        var statusColor = item.isOnline ? '#2ED573' : '#888';
        var statusText = item.isOnline ? '● Online' : (item.lastSeen ? getLastSeenText(item.lastSeen) : 'Offline');
        var isAIClass = item.isAI ? 'true' : 'false';
        
        html += '<div class="chat-item" onclick="openChatWindow(\'' + item.chatId + '\',\'' + item.userId + '\',\'' + item.name + '\',\'' + (item.avatar||'') + '\',' + isAIClass + ')" style="display:flex;align-items:center;padding:14px;background:rgba(19,24,66,0.7);border:1px solid rgba(212,175,55,0.15);border-radius:14px;cursor:pointer;gap:12px;margin-bottom:6px">';
        
        // Avatar
        if (item.isAI) {
            html += '<div style="width:52px;height:52px;border-radius:50%;border:2px solid #D4AF37;display:flex;align-items:center;justify-content:center;font-size:26px;background:#1a1f4e;flex-shrink:0">' + item.avatar + '</div>';
        } else {
            html += '<div style="position:relative;flex-shrink:0">';
            html += '<img src="' + (dp || defaultAvatar(item.name)) + '" style="width:52px;height:52px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover" onerror="this.src=\'' + defaultAvatar(item.name) + '\'">';
            html += '<span style="position:absolute;bottom:2px;right:2px;width:12px;height:12px;background:' + statusColor + ';border-radius:50%;border:2px solid #0A0E27"></span>';
            html += '</div>';
        }
        
        // Info
        html += '<div style="flex:1;min-width:0">';
        html += '<b>' + item.name + (item.isAI ? ' <span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;background:#1E90FF;border-radius:50%;font-size:10px;color:#fff;margin-left:4px">✓</span>' : '') + '</b><br>';
        html += '<small style="color:rgba(255,255,255,0.5);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (item.lastMsg || 'Tap to chat') + '</small>';
        html += '</div>';
        
        // Meta
        html += '<div style="text-align:right;flex-shrink:0">';
        html += '<small style="color:' + statusColor + ';font-size:11px">' + statusText + '</small><br>';
        html += '<small style="color:#D4AF37;font-size:10px">' + item.time + '</small>';
        html += '</div>';
        
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// Baaki functions same rahenge...
function openChatWindow(cid, uid, name, avt, ai) {
    chatId = cid; chatUser = { uid: uid, name: name, avt: avt, ai: ai };
    document.getElementById('chatWindow').classList.add('show');
    document.getElementById('chatName').textContent = name;
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('msgInput').value = '';
    document.getElementById('typingIndicator').textContent = '';
    setTimeout(function() { document.getElementById('msgInput').focus(); }, 300);
    
    var ai2 = document.getElementById('chatAvatar'), ae = document.getElementById('chatAvatarEmoji');
    if (ai) { ai2.style.display='none'; ae.style.display='inline'; ae.textContent=avt; document.getElementById('chatStatus').textContent='● Active now'; document.getElementById('chatStatus').style.color='#2ED573'; }
    else { ae.style.display='none'; ai2.style.display='inline'; ai2.src=avt||defaultAvatar(name); document.getElementById('chatStatus').textContent='Loading...'; }
    if (chatListener) chatListener();
    
    chatListener = db.collection('chats').doc(cid).collection('messages').orderBy('timestamp','asc').onSnapshot(function(snap) {
        var mc = document.getElementById('chatMessages'); if (!mc) return; mc.innerHTML = '';
        snap.forEach(function(doc) {
            var m = doc.data(), sent = m.senderId === currentUser.uid;
            mc.innerHTML += '<div class="' + (sent?'msg-sent':'msg-rec') + '">' + m.text + '<div style="margin-top:3px"><small style="opacity:0.7;font-size:10px">'+(m.timestamp?formatTime(m.timestamp.toDate()):'')+'</small>'+(sent?'<small style="font-size:10px;color:rgba(255,255,255,0.4);margin-left:8px">'+(m.seen?'✓✓ Seen':'✓ Sent')+'</small>':'')+'</div></div>';
        });
        mc.scrollTop = mc.scrollHeight;
    });
}

function closeChat() { document.getElementById('chatWindow').classList.remove('show'); if(chatListener)chatListener(); chatListener=null; chatId=null; chatUser=null; }

function sendMessage() {
    var input = document.getElementById('msgInput'); if (!input) return;
    var t = input.value.trim(); if (!t || !chatId || !chatUser) return;
    db.collection('chats').doc(chatId).collection('messages').add({senderId:currentUser.uid,text:t,timestamp:firebase.firestore.FieldValue.serverTimestamp(),seen:false});
    db.collection('chats').doc(chatId).set({participants:[currentUser.uid,chatUser.uid],lastMessage:t,lastMessageTime:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    input.value=''; input.focus();
    if (chatUser.ai) {
        document.getElementById('typingIndicator').textContent = chatUser.name + ' is typing...';
        setTimeout(function() {
            document.getElementById('typingIndicator').textContent = '';
            var replies = {annaya_ai:["Hey! 😊","That's cool! 💫","Just painting 🎨"],tarun_ai:["Yo! 👋","Nice bro! 💻","What games? 🎮"],chronox_ai:["How can I help? 🕷️","Ask me anything!"]};
            var reply = (replies[chatUser.uid]||replies.chronox_ai)[Math.floor(Math.random()*3)];
            db.collection('chats').doc(chatId).collection('messages').add({senderId:chatUser.uid,text:reply,timestamp:firebase.firestore.FieldValue.serverTimestamp(),seen:true});
            db.collection('chats').doc(chatId).update({lastMessage:reply,lastMessageTime:firebase.firestore.FieldValue.serverTimestamp()});
        }, 1000);
    }
}

function getLastSeenText(ls) { if(!ls)return'Offline';var d=Date.now()-ls,m=Math.floor(d/60000),h=Math.floor(d/3600000);if(m<1)return'Just now';if(m<60)return m+'m ago';if(h<24)return h+'h ago';return ls.toLocaleDateString('en-IN',{day:'numeric',month:'short'}); }
function attachMedia() { var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=function(){var f=inp.files[0];if(!f||!chatId)return;var r=new FileReader();r.onload=function(e){db.collection('chats').doc(chatId).collection('messages').add({senderId:currentUser.uid,text:'📷 Photo',mediaUrl:e.target.result,timestamp:firebase.firestore.FieldValue.serverTimestamp(),seen:false});};r.readAsDataURL(f);};inp.click(); }
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){var w=document.getElementById('chatWindow');if(w&&w.classList.contains('show')){e.preventDefault();sendMessage();}}});
document.addEventListener('click',function(e){if(e.target.classList.contains('modal'))e.target.classList.remove('show');});
console.log('✅ Chat loaded - Force Render');
