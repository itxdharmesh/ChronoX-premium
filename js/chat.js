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
        loadRequests(container);
        return;
    }
    
    // AI BOTS + REAL USERS
    var allChats = [];
    
    // AI BOTS - Always show
    var aiBots = [
        { id: 'annaya_ai', name: 'Annaya', avatar: '👩‍🦰', isAI: true },
        { id: 'tarun_ai', name: 'Tarun', avatar: '👨‍💻', isAI: true },
        { id: 'chronox_ai', name: 'ChronoX AI', avatar: '🕷️', isAI: true }
    ];
    
    aiBots.forEach(function(bot) {
        var cid = 'ai_' + currentUser.uid + '_' + bot.id;
        db.collection('chats').doc(cid).get().then(function(d) {
            var data = d.data() || {};
            allChats.push({
                chatId: cid, userId: bot.id, name: bot.name, avatar: bot.avatar,
                isAI: true, lastMsg: data.lastMessage || 'Tap to chat',
                time: data.lastMessageTime ? formatTime(data.lastMessageTime.toDate()) : '',
                isOnline: true, sortTime: data.lastMessageTime ? data.lastMessageTime.toDate().getTime() : 0
            });
            renderAllChats(container, allChats);
        });
    });
    
    // Get mutual friends (both follow each other)
    var mutualIds = (currentUserData.following || []).filter(function(id) {
        return (currentUserData.followers || []).indexOf(id) !== -1;
    });
    
    // Get all chats
    db.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .get()
        .then(function(snap) {
            var processedIds = {};
            
            snap.forEach(function(doc) {
                var chat = doc.data();
                var otherId = chat.participants.find(function(id) { return id !== currentUser.uid; });
                if (!otherId || ['annaya_ai','tarun_ai','chronox_ai'].includes(otherId)) return;
                
                processedIds[otherId] = {
                    chatId: doc.id,
                    lastMsg: chat.lastMessage || '',
                    time: chat.lastMessageTime
                };
            });
            
            // Add mutual friends who don't have chat yet
            mutualIds.forEach(function(id) {
                if (!processedIds[id]) {
                    processedIds[id] = { chatId: null, lastMsg: '', time: null };
                }
            });
            
            var userIds = Object.keys(processedIds);
            if (userIds.length === 0) { renderAllChats(container, allChats); return; }
            
            var promises = userIds.map(function(uid) {
                return db.collection('users').doc(uid).get().then(function(ud) {
                    var u = ud.data();
                    if (!u) return null;
                    if ((currentUserData.blockedUsers||[]).indexOf(uid) !== -1) return null;
                    if ((u.blockedUsers||[]).indexOf(currentUser.uid) !== -1) return null;
                    
                    var info = processedIds[uid];
                    return {
                        chatId: info.chatId || ('new_' + [currentUser.uid, uid].sort().join('_')),
                        userId: uid, name: u.name, avatar: u.avatar || '',
                        isAI: false, lastMsg: info.lastMsg || 'Tap to chat',
                        time: info.time ? formatTime(info.time.toDate()) : '',
                        isOnline: u.onlineStatus === 'online',
                        lastSeen: u.lastSeen ? u.lastSeen.toDate() : null,
                        sortTime: info.time ? info.time.toDate().getTime() : 0
                    };
                });
            });
            
            Promise.all(promises).then(function(results) {
                var realUsers = results.filter(function(r) { return r !== null; });
                allChats = allChats.concat(realUsers);
                renderAllChats(container, allChats);
            });
        })
        .catch(function() {
            renderAllChats(container, allChats);
        });
}

function renderAllChats(container, chats) {
    // Remove duplicates
    var seen = {};
    chats = chats.filter(function(c) {
        if (seen[c.userId]) return false;
        seen[c.userId] = true;
        return true;
    });
    
    // Sort: AI first, then online, then by time
    chats.sort(function(a, b) {
        if (a.isAI && !b.isAI) return -1;
        if (!a.isAI && b.isAI) return 1;
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return (b.sortTime || 0) - (a.sortTime || 0);
    });
    
    if (chats.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No chats yet. Search and message someone!</p>';
        return;
    }
    
    var html = '';
    chats.forEach(function(u) {
        var statusText = u.isAI ? '● Online' : (u.isOnline ? '● Online' : getLastSeenText(u.lastSeen));
        var statusColor = (u.isAI || u.isOnline) ? '#2ED573' : '#888';
        
        html += '<div class="chat-item" onclick="openChatWindow(\'' + u.chatId + '\',\'' + u.userId + '\',\'' + u.name + '\',\'' + u.avatar + '\',' + u.isAI + ')" style="display:flex;align-items:center;padding:14px;background:rgba(19,24,66,0.7);border:1px solid rgba(212,175,55,0.15);border-radius:14px;cursor:pointer;gap:12px;margin-bottom:6px">';
        
        // Avatar
        html += '<div style="position:relative;flex-shrink:0">';
        if (u.isAI) {
            html += '<div style="width:52px;height:52px;border-radius:50%;border:2px solid #D4AF37;display:flex;align-items:center;justify-content:center;font-size:26px;background:#1a1f4e">' + u.avatar + '</div>';
        } else {
            html += '<img src="' + (u.avatar || defaultAvatar(u.name)) + '" style="width:52px;height:52px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover" onerror="this.src=\'' + defaultAvatar(u.name) + '\'">';
            html += '<span style="position:absolute;bottom:2px;right:2px;width:12px;height:12px;background:' + statusColor + ';border-radius:50%;border:2px solid #0A0E27"></span>';
        }
        html += '</div>';
        
        // Info
        html += '<div style="flex:1;min-width:0">';
        html += '<b>' + u.name + (u.isAI ? ' <span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;background:#1E90FF;border-radius:50%;font-size:10px;color:#fff;margin-left:4px">✓</span>' : '') + '</b><br>';
        html += '<small style="color:rgba(255,255,255,0.5);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + u.lastMsg + '</small>';
        html += '</div>';
        
        // Meta
        html += '<div style="text-align:right;flex-shrink:0">';
        html += '<small style="color:' + statusColor + ';font-size:11px">' + statusText + '</small><br>';
        html += '<small style="color:#D4AF37;font-size:10px">' + u.time + '</small>';
        html += '</div>';
        
        html += '</div>';
    });
    
    container.innerHTML = html;
}

// Requests
function loadRequests(container) {
    db.collection('chat_requests').where('to','==',currentUser.uid).where('status','==','pending').get().then(function(snap) {
        if (snap.empty) { container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No pending requests</p>'; return; }
        var html = '', promises = [];
        snap.forEach(function(doc) {
            var req = doc.data();
            promises.push(db.collection('users').doc(req.from).get().then(function(ud) {
                var u = ud.data(); if (!u) return '';
                return '<div class="card" style="padding:15px;margin-bottom:10px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><img src="'+(u.avatar||defaultAvatar(u.name))+'" style="width:44px;height:44px;border-radius:50%;border:2px solid #D4AF37;object-fit:cover" onerror="this.src=\''+defaultAvatar(u.name)+'\'"><div><b>'+u.name+'</b><br><small style="color:#D4AF37">'+u.username+'</small></div></div><p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:12px">💬 '+(req.message||'No message')+'</p><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px"><button class="btn" style="font-size:11px;padding:8px" onclick="acceptReq(\''+doc.id+'\',\''+req.from+'\',\''+req.chatId+'\')">✅ Accept</button><button class="btn-out" style="font-size:11px;padding:8px;color:#FF4757;border-color:#FF4757" onclick="rejectReq(\''+doc.id+'\')">❌ Reject</button><button class="btn-out" style="font-size:11px;padding:8px" onclick="alert(\''+(req.message||'No message')+'\')">👁️ View</button><button class="btn-out" style="font-size:11px;padding:8px" onclick="blockReq(\''+req.from+'\',\''+doc.id+'\')">🚫 Block</button></div></div>';
            }));
        });
        Promise.all(promises).then(function(results) { container.innerHTML = results.join('') || '<p style="text-align:center;color:rgba(255,255,255,0.5);padding:30px">No requests</p>'; });
    });
}

function acceptReq(rid, from, cid) { db.collection('chat_requests').doc(rid).update({status:'accepted'}); db.collection('chats').doc(cid).update({approved:true}); showToast('Accepted! ✅'); activeTab='chats'; loadChatList(); }
function rejectReq(rid) { db.collection('chat_requests').doc(rid).update({status:'rejected'}); showToast('Rejected ❌'); loadChatList(); }
function blockReq(uid, rid) { if(!confirm('Block?'))return; db.collection('users').doc(currentUser.uid).update({blockedUsers:firebase.firestore.FieldValue.arrayUnion(uid)}); db.collection('chat_requests').doc(rid).update({status:'blocked'}); showToast('Blocked 🚫'); loadChatList(); }

// Chat Window
function openChatWindow(cid, uid, name, avt, ai) {
    chatId = cid; chatUser = { uid: uid, name: name, avt: avt, ai: ai || false };
    document.getElementById('chatWindow').classList.add('show');
    document.getElementById('chatName').textContent = name;
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('msgInput').value = '';
    document.getElementById('typingIndicator').textContent = '';
    setTimeout(function() { document.getElementById('msgInput').focus(); }, 300);
    
    var ai2 = document.getElementById('chatAvatar'), ae = document.getElementById('chatAvatarEmoji');
    if (ai) { ai2.style.display='none'; ae.style.display='inline'; ae.textContent=avt; document.getElementById('chatStatus').textContent='● Active now'; document.getElementById('chatStatus').style.color='#2ED573'; }
    else { ae.style.display='none'; ai2.style.display='inline'; ai2.src=avt||defaultAvatar(name); updateChatStatus(uid); }
    if (chatListener) chatListener();
    
    chatListener = db.collection('chats').doc(cid).collection('messages').orderBy('timestamp','asc').onSnapshot(function(snap) {
        var mc = document.getElementById('chatMessages'); if (!mc) return; mc.innerHTML = '';
        snap.forEach(function(doc) {
            var m = doc.data(), sent = m.senderId === currentUser.uid;
            mc.innerHTML += '<div class="'+(sent?'msg-sent':'msg-rec')+'">'+m.text+'<div style="margin-top:3px"><small style="opacity:0.7;font-size:10px">'+(m.timestamp?formatTime(m.timestamp.toDate()):'')+'</small>'+(sent?'<small style="font-size:10px;color:rgba(255,255,255,0.4);margin-left:8px">'+(m.seen?'✓✓ Seen':'✓ Sent')+'</small>':'')+'</div></div>';
        });
        mc.scrollTop = mc.scrollHeight;
    });
}

function updateChatStatus(uid) {
    db.collection('users').doc(uid).onSnapshot(function(doc) {
        var u = doc.data(), el = document.getElementById('chatStatus');
        if (!el) return;
        if (u && u.onlineStatus==='online') { el.textContent='● Active now'; el.style.color='#2ED573'; }
        else { el.textContent = getLastSeenText(u&&u.lastSeen?u.lastSeen.toDate():null); el.style.color='#888'; }
    });
}

function closeChat() { document.getElementById('chatWindow').classList.remove('show'); if(chatListener)chatListener(); chatListener=null; chatId=null; chatUser=null; }

function sendMessage() {
    var input = document.getElementById('msgInput'); if (!input) return;
    var t = input.value.trim(); if (!t || !chatId || !chatUser) return;
    
    if (chatId.startsWith('new_')) {
        var ref = db.collection('chats').doc();
        ref.set({participants:[currentUser.uid,chatUser.uid],lastMessage:t,lastMessageTime:firebase.firestore.FieldValue.serverTimestamp()}).then(function() {
            chatId = ref.id;
            ref.collection('messages').add({senderId:currentUser.uid,text:t,timestamp:firebase.firestore.FieldValue.serverTimestamp(),seen:false});
            input.value=''; input.focus();
            loadChatList();
        });
        return;
    }
    
    db.collection('chats').doc(chatId).collection('messages').add({senderId:currentUser.uid,text:t,timestamp:firebase.firestore.FieldValue.serverTimestamp(),seen:false});
    db.collection('chats').doc(chatId).set({participants:[currentUser.uid,chatUser.uid],lastMessage:t,lastMessageTime:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    input.value=''; input.focus();
    
    if (chatUser.ai) {
        document.getElementById('typingIndicator').textContent = chatUser.name + ' is typing...';
        setTimeout(function() {
            document.getElementById('typingIndicator').textContent = '';
            var replies = {annaya_ai:["Hey! 😊","That's cool! 💫","Just painting 🎨","Life's good!"],tarun_ai:["Yo! 👋","Nice bro! 💻","What games? 🎮","Cool!"],chronox_ai:["How can I help? 🕷️","Ask me anything!","ChronoX rocks!"]};
            var reply = (replies[chatUser.uid]||replies.chronox_ai)[Math.floor(Math.random()*4)];
            db.collection('chats').doc(chatId).collection('messages').add({senderId:chatUser.uid,text:reply,timestamp:firebase.firestore.FieldValue.serverTimestamp(),seen:true});
            db.collection('chats').doc(chatId).update({lastMessage:reply,lastMessageTime:firebase.firestore.FieldValue.serverTimestamp()});
        }, 1000+Math.random()*2000);
    }
}

function getLastSeenText(ls) { if(!ls)return'Offline';var d=Date.now()-ls,m=Math.floor(d/60000),h=Math.floor(d/3600000);if(m<1)return'Just now';if(m<60)return m+'m ago';if(h<24)return h+'h ago';return ls.toLocaleDateString('en-IN',{day:'numeric',month:'short'}); }
function attachMedia() { var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=function(){var f=inp.files[0];if(!f||!chatId)return;var r=new FileReader();r.onload=function(e){db.collection('chats').doc(chatId).collection('messages').add({senderId:currentUser.uid,text:'📷 Photo',mediaUrl:e.target.result,timestamp:firebase.firestore.FieldValue.serverTimestamp(),seen:false});};r.readAsDataURL(f);};inp.click(); }
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){var w=document.getElementById('chatWindow');if(w&&w.classList.contains('show')){e.preventDefault();sendMessage();}}});
document.addEventListener('click',function(e){if(e.target.classList.contains('modal'))e.target.classList.remove('show');});
console.log('✅ Chat complete - AI + Mutual Friends + Requests');
