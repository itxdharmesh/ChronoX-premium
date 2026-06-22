var chatId = null;
var chatUser = null;
var chatListener = null;
var activeTab = 'chats';

function renderChats(c) {
    c.innerHTML = 
        '<h2 style="color:var(--gold);margin-bottom:10px">💬 Messages</h2>' +
        '<div style="display:flex;gap:5px;margin-bottom:12px">' +
            '<button class="btn-out" style="flex:1;' + (activeTab==='chats'?'background:rgba(212,175,55,0.2)':'') + '" onclick="activeTab=\'chats\';loadChatList()">💬 Chats</button>' +
            '<button class="btn-out" style="flex:1;' + (activeTab==='requests'?'background:rgba(212,175,55,0.2)':'') + '" onclick="activeTab=\'requests\';loadChatList()">📩 Requests</button>' +
        '</div>' +
        '<div id="chatListContainer">Loading...</div>';
    loadChatList();
}

function loadChatList() {
    var container = document.getElementById('chatListContainer');
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:20px">Loading...</p>';
    if (activeTab === 'requests') { loadRequests(container); } else { loadChatsTab(container); }
}

function loadChatsTab(container) {
    var html = '';
    var ai = [
        { id: 'annaya_ai', n: 'Annaya', a: '👩‍🦰' },
        { id: 'tarun_ai', n: 'Tarun', a: '👨‍💻' },
        { id: 'chronox_ai', n: 'ChronoX AI', a: '🕷️' }
    ];
    
    ai.forEach(function(x) {
        var cid = 'ai_' + currentUser.uid + '_' + x.id;
        db.collection('chats').doc(cid).get().then(function(d) {
            var dd = d.data() || {};
            html += '<div class="chat-item" onclick="openChatWindow(\'' + cid + '\',\'' + x.id + '\',\'' + x.n + '\',\'' + x.a + '\',true)">' +
                '<div class="av">' + x.a + '</div>' +
                '<div style="flex:1;min-width:0"><b>' + x.n + ' <span class="blue-tick">✓</span></b><br>' +
                '<small style="color:rgba(255,255,255,0.5)">' + (dd.lastMessage || 'Tap to chat') + '</small></div>' +
                '<div style="text-align:right;flex-shrink:0"><small style="color:#2ED573">● Online</small><br><small style="color:var(--gold-light);font-size:10px">' + (dd.lastMessageTime ? formatTime(dd.lastMessageTime.toDate()) : '') + '</small></div>' +
                '</div>';
            container.innerHTML = html || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No chats yet</p>';
        });
    });
    
    db.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .orderBy('lastMessageTime', 'desc')
        .onSnapshot(function(snap) {
            var promises = [];
            snap.forEach(function(doc) {
                var chat = doc.data();
                var oid = chat.participants.find(function(id) { return id !== currentUser.uid; });
                if (!oid || ['annaya_ai','tarun_ai','chronox_ai'].includes(oid)) return;
                
                promises.push(
                    db.collection('users').doc(oid).get().then(function(ud) {
                        var u = ud.data();
                        if (!u) return '';
                        if ((currentUserData.blockedUsers||[]).indexOf(oid) !== -1) return '';
                        if ((u.blockedUsers||[]).indexOf(currentUser.uid) !== -1) return '';
                        
                        var isOnline = u.onlineStatus === 'online';
                        var lastMsg = chat.lastMessage || '';
                        var time = chat.lastMessageTime ? formatTime(chat.lastMessageTime.toDate()) : '';
                        var statusText = isOnline ? '● Online' : getLastSeenText(u.lastSeen ? u.lastSeen.toDate() : null);
                        var statusColor = isOnline ? '#2ED573' : 'rgba(255,255,255,0.5)';
                        
                        return '<div class="chat-item" onclick="openChatWindow(\'' + doc.id + '\',\'' + oid + '\',\'' + u.name + '\',\'' + (u.avatar||'') + '\',false)">' +
                            '<div style="position:relative;flex-shrink:0">' +
                                '<img src="' + (u.avatar || defaultAvatar(u.name)) + '" class="chat-avatar-img" onerror="this.src=\'' + defaultAvatar(u.name) + '\'">' +
                                '<span style="position:absolute;bottom:2px;right:2px;width:12px;height:12px;background:' + (isOnline?'#2ED573':'#888') + ';border-radius:50%;border:2px solid #0A0E27"></span>' +
                            '</div>' +
                            '<div style="flex:1;min-width:0"><b>' + u.name + '</b><br>' +
                            '<small style="color:rgba(255,255,255,0.5);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (lastMsg || 'Tap to chat') + '</small></div>' +
                            '<div style="text-align:right;flex-shrink:0"><small style="color:' + statusColor + ';font-size:11px">' + statusText + '</small><br><small style="color:var(--gold-light);font-size:10px">' + time + '</small></div>' +
                            '</div>';
                    })
                );
            });
            
            Promise.all(promises).then(function(results) {
                var realChats = results.filter(function(r) { return r; }).join('');
                container.innerHTML = html + realChats || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No chats yet</p>';
            });
        });
}

function loadRequests(container) {
    db.collection('chat_requests').where('to','==',currentUser.uid).where('status','==','pending').get().then(function(snap) {
        if (snap.empty) { container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No pending requests</p>'; return; }
        var html = '', promises = [];
        snap.forEach(function(doc) {
            var req = doc.data();
            promises.push(db.collection('users').doc(req.from).get().then(function(ud) {
                var u = ud.data(); if (!u) return '';
                return '<div class="card" style="padding:15px;margin-bottom:10px">' +
                    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
                        '<img src="' + (u.avatar || defaultAvatar(u.name)) + '" style="width:44px;height:44px;border-radius:50%;border:2px solid var(--gold);object-fit:cover" onerror="this.src=\'' + defaultAvatar(u.name) + '\'">' +
                        '<div><b>' + u.name + '</b><br><small style="color:var(--gold-light)">' + u.username + '</small></div>' +
                    '</div>' +
                    '<p style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:12px">💬 ' + (req.message || 'No message') + '</p>' +
                    '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">' +
                        '<button class="btn" style="font-size:11px;padding:8px" onclick="acceptRequest(\'' + doc.id + '\',\'' + req.from + '\',\'' + req.chatId + '\')">✅ Accept</button>' +
                        '<button class="btn-out" style="font-size:11px;padding:8px;color:#FF4757;border-color:#FF4757" onclick="rejectRequest(\'' + doc.id + '\')">❌ Reject</button>' +
                        '<button class="btn-out" style="font-size:11px;padding:8px" onclick="alert(\'' + (req.message || 'No message') + '\')">👁️ View</button>' +
                        '<button class="btn-out" style="font-size:11px;padding:8px" onclick="blockSender(\'' + req.from + '\',\'' + doc.id + '\')">🚫 Block</button>' +
                    '</div></div>';
            }));
        });
        Promise.all(promises).then(function(results) { container.innerHTML = results.join('') || '<p style="text-align:center;color:rgba(255,255,255,0.6);padding:30px">No requests</p>'; });
    });
}

function acceptRequest(rid, from, cid) { db.collection('chat_requests').doc(rid).update({status:'accepted'}); db.collection('chats').doc(cid).update({approved:true}); showToast('Accepted! ✅'); activeTab='chats'; loadChatList(); }
function rejectRequest(rid) { db.collection('chat_requests').doc(rid).update({status:'rejected'}); showToast('Rejected ❌'); loadChatList(); }
function blockSender(uid, rid) { if(!confirm('Block this user?'))return; db.collection('users').doc(currentUser.uid).update({blockedUsers:firebase.firestore.FieldValue.arrayUnion(uid)}); db.collection('chat_requests').doc(rid).update({status:'blocked'}); if(!currentUserData.blockedUsers)currentUserData.blockedUsers=[]; currentUserData.blockedUsers.push(uid); showToast('Blocked 🚫'); loadChatList(); }

function openChatWindow(cid, uid, name, avt, ai) {
    chatId = cid; chatUser = { uid: uid, name: name, avt: avt, ai: ai || false };
    var win = document.getElementById('chatWindow'); win.classList.add('show');
    document.getElementById('chatName').textContent = name;
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('msgInput').value = '';
    document.getElementById('typingIndicator').textContent = '';
    setTimeout(function() { document.getElementById('msgInput').focus(); }, 300);
    
    var ai2 = document.getElementById('chatAvatar'), ae = document.getElementById('chatAvatarEmoji');
    if (ai) { ai2.style.display='none'; ae.style.display='inline'; ae.textContent=avt; document.getElementById('chatStatus').textContent='● Active now'; document.getElementById('chatStatus').style.color='#2ED573'; }
    else { ae.style.display='none'; ai2.style.display='inline'; ai2.src=avt||defaultAvatar(name); ai2.onerror=function(){this.style.display='none';}; updateStatus(uid); }
    if (chatListener) chatListener();
    
    chatListener = db.collection('chats').doc(cid).collection('messages').orderBy('timestamp','asc').onSnapshot(function(snap) {
        var mc = document.getElementById('chatMessages'); if (!mc) return; mc.innerHTML = '';
        snap.forEach(function(doc) {
            var m = doc.data(), sent = m.senderId === currentUser.uid;
            mc.innerHTML += '<div class="' + (sent?'msg-sent':'msg-rec') + '">' + (m.mediaUrl?'<img src="'+m.mediaUrl+'" style="max-width:180px;border-radius:10px;margin-bottom:4px">':'') + m.text +
                '<div style="display:flex;justify-content:space-between;margin-top:3px"><small style="opacity:0.7;font-size:10px">'+(m.timestamp?formatTime(m.timestamp.toDate()):'')+'</small>'+(sent?'<small style="font-size:10px;color:rgba(255,255,255,0.4)">'+(m.seen?'✓✓ Seen':'✓ Sent')+'</small>':'')+'</div></div>';
        });
        mc.scrollTop = mc.scrollHeight;
    });
    if (!ai) { db.collection('chats').doc(cid).collection('messages').where('senderId','==',uid).where('seen','==',false).get().then(function(snap){snap.forEach(function(doc){doc.ref.update({seen:true});});}); }
}

function updateStatus(uid) { db.collection('users').doc(uid).onSnapshot(function(doc){var u=doc.data(),el=document.getElementById('chatStatus');if(!el)return;if(u&&u.onlineStatus==='online'){el.textContent='● Active now';el.style.color='#2ED573';}else{var ls=u&&u.lastSeen?u.lastSeen.toDate():null;el.textContent=getLastSeenText(ls);el.style.color='rgba(255,255,255,0.5)';}}); }

function closeChat() { document.getElementById('chatWindow').classList.remove('show'); if(chatListener)chatListener(); chatListener=null; chatId=null; chatUser=null; }

function sendMessage() {
    var input = document.getElementById('msgInput'); if (!input) return;
    var t = input.value.trim(); if (!t || !chatId || !chatUser) return;
    
    db.collection('chats').doc(chatId).collection('messages').add({senderId:currentUser.uid,text:t,timestamp:firebase.firestore.FieldValue.serverTimestamp(),seen:false});
    db.collection('chats').doc(chatId).set({participants:[currentUser.uid,chatUser.uid],lastMessage:t,lastMessageTime:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    input.value=''; input.focus();
    if (t.split(' ').length >= 3 && typeof addXP === 'function') addXP(5);
    
    if (chatUser.ai) {
        document.getElementById('typingIndicator').textContent = chatUser.name + ' is typing...';
        setTimeout(function() {
            document.getElementById('typingIndicator').textContent = '';
            var replies = {annaya_ai:["Hey! How are you? 😊","That's interesting! 💫","Just painting 🎨","Life's good!"],tarun_ai:["Yo! 👋","Coding all day 💻","Cool bro!","What games? 🎮"],chronox_ai:["How can I help? 🕷️","Ask me anything!","ChronoX is awesome!"]};
            var reply = (replies[chatUser.uid]||replies.chronox_ai)[Math.floor(Math.random()*4)];
            
            if (typeof GEMINI_KEY !== 'undefined' && GEMINI_KEY && GEMINI_KEY.length > 5) {
                var p = chatUser.uid==='annaya_ai'?'You are Annaya, 22yo female artist. Be warm.':chatUser.uid==='tarun_ai'?'You are Tarun, 24yo male coder. Be cool.':'You are ChronoX AI. Be helpful.';
                fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key='+GEMINI_KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:p+'\nReply in 1-2 sentences to: "'+t+'"'}]}]})})
                .then(function(r){return r.json();}).then(function(d){if(d.candidates&&d.candidates[0])reply=d.candidates[0].content.parts[0].text;saveAIReply(reply);}).catch(function(){saveAIReply(reply);});
            } else { saveAIReply(reply); }
        }, 1000 + Math.random() * 2000);
    }
}

function saveAIReply(reply) { db.collection('chats').doc(chatId).collection('messages').add({senderId:chatUser.uid,text:reply,timestamp:firebase.firestore.FieldValue.serverTimestamp(),seen:true}); db.collection('chats').doc(chatId).update({lastMessage:reply,lastMessageTime:firebase.firestore.FieldValue.serverTimestamp()}); }

function getLastSeenText(ls) { if(!ls)return'Offline';var d=Date.now()-ls,m=Math.floor(d/60000),h=Math.floor(d/3600000);if(m<1)return'Just now';if(m<60)return m+'m ago';if(h<24)return h+'h ago';return ls.toLocaleDateString('en-IN',{day:'numeric',month:'short'}); }

function attachMedia() { var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=function(){var f=inp.files[0];if(!f||!chatId)return;var r=new FileReader();r.onload=function(e){db.collection('chats').doc(chatId).collection('messages').add({senderId:currentUser.uid,text:'📷 Photo',mediaUrl:e.target.result,timestamp:firebase.firestore.FieldValue.serverTimestamp(),seen:false});db.collection('chats').doc(chatId).set({lastMessage:'📷 Photo',lastMessageTime:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});};r.readAsDataURL(f);};inp.click(); }

document.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){var w=document.getElementById('chatWindow');if(w&&w.classList.contains('show')){e.preventDefault();sendMessage();}}});
document.addEventListener('click',function(e){if(e.target.classList.contains('modal'))e.target.classList.remove('show');});
console.log('✅ Chat ready');
