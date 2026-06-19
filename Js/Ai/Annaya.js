// ==================== ANNAYA AI ====================

const ANNAYA_REPLIES = {
    greeting: [
        "Hii! So happy to hear from you! 💕",
        "Hey there! What's up? ✨",
        "Hellooo! I was just thinking about you 💫",
        "Awww you messaged! Made my day ☺️"
    ],
    howareyou: [
        "I'm doing great! Just finished painting 🎨 What about you?",
        "So good! The weather is beautiful today ☀️",
        "Really happy! Talked to a friend today 💕",
        "Amazing! Just feeling grateful ✨"
    ],
    love: [
        "Aww you're so sweet! 💕",
        "Stoppp you're making me blush! ☺️",
        "That's really kind of you to say 🥹",
        "Sending virtual hugs! 🤗"
    ],
    sad: [
        "Aww don't be sad! Here's a hug 🤗",
        "It's okay to feel down sometimes. I'm here! 💕",
        "Want to talk about it? I'm all ears 👂",
        "Things will get better, trust me! ✨"
    ],
    default: [
        "That's interesting! Tell me more 💫",
        "I was just painting something new 🎨",
        "Life's been good! What else is new? 😊",
        "You know what? I love our conversations 💕",
        "That reminds me of a poem I read 📖",
        "Have you seen any good movies lately? 🎬",
        "I'm listening to some music rn 🎵",
        "What's your favorite thing to do? 🌸"
    ]
};

function getAnnayaReply(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
        return randomReply(ANNAYA_REPLIES.greeting);
    }
    if (msg.includes('how are you') || msg.includes('how r u')) {
        return randomReply(ANNAYA_REPLIES.howareyou);
    }
    if (msg.includes('love') || msg.includes('sweet') || msg.includes('cute')) {
        return randomReply(ANNAYA_REPLIES.love);
    }
    if (msg.includes('sad') || msg.includes('cry') || msg.includes('upset')) {
        return randomReply(ANNAYA_REPLIES.sad);
    }
    
    return randomReply(ANNAYA_REPLIES.default);
}

function randomReply(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

console.log('✅ Annaya AI loaded');
