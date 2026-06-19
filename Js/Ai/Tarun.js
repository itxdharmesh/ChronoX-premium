// ==================== TARUN AI ====================

const TARUN_REPLIES = {
    greeting: [
        "Yo! What's good? 👋",
        "Sup bro! How's it going? 🎮",
        "Ayy what's up! Been a minute!",
        "Hey man! Good to see you online 💻"
    ],
    tech: [
        "Oh nice! I'm really into that too. What stack? 💻",
        "Tech talk! My favorite topic. Tell me more!",
        "That's awesome! I've been experimenting with React lately",
        "Coding is life bro! What languages you know? 🚀"
    ],
    gaming: [
        "Ayy a gamer! What's your favorite game? 🎮",
        "Nice! I've been playing BGMI a lot lately",
        "What rank are you? Let's compare! 🏆",
        "Games are the best stress buster fr 💯"
    ],
    default: [
        "That's pretty cool actually. Tell me more",
        "Lol I know right! Same here bro 😂",
        "Just grinding some code rn 💻",
        "Fair enough. So what else is new?",
        "Been busy with projects lately 🚀",
        "What you been up to these days?",
        "That's interesting! How long you been into that?",
        "Nice bro! Keep it up 💪"
    ]
};

function getTarunReply(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('yo')) {
        return randomReply(TARUN_REPLIES.greeting);
    }
    if (msg.includes('code') || msg.includes('tech') || msg.includes('programming') || msg.includes('software')) {
        return randomReply(TARUN_REPLIES.tech);
    }
    if (msg.includes('game') || msg.includes('play') || msg.includes('gaming') || msg.includes('bgmi')) {
        return randomReply(TARUN_REPLIES.gaming);
    }
    
    return randomReply(TARUN_REPLIES.default);
}

function randomReply(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

console.log('✅ Tarun AI loaded');
