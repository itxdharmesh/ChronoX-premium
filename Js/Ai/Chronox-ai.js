// ==================== CHRONOX AI ASSISTANT ====================

const CHRONOX_REPLIES = {
    greeting: [
        "Welcome to ChronoX! How can I assist you today? 🕷️",
        "Hello! I'm ChronoX AI, your app assistant. What can I help with?",
        "Hey there! Need help navigating ChronoX? 😊"
    ],
    features: [
        "ChronoX has: 💬 Real-time Chat, 🏆 Achievements, 🔥 Streaks, 🎮 Games, ❓ Quiz, and more!",
        "You can chat with AI friends Annaya & Tarun, play games, take quizzes, and earn achievements!",
        "Explore: Home (streaks & leaderboard), Chats (messages), Discover (find people), Games, Quiz!"
    ],
    achievements: [
        "Earn achievements by: sending messages (5+ words), maintaining streaks, getting followers, uploading avatar, writing bio!",
        "Each achievement gives you points. Check your profile > Achievements to see progress! 🏆",
        "You currently have achievements unlocked. Keep going to unlock more! 🔓"
    ],
    streak: [
        "Streaks track consecutive days you open the app. Come back daily to build your streak! 🔥",
        "Don't break your streak! Even opening the app once counts. Best streak is saved forever!",
        "Your current streak is visible on the Home page. Keep it going! 💪"
    ],
    help: [
        "Use bottom navigation to switch between pages. Tap icons: 🏠Home 💬Chats 🔍Discover ❓Quiz 🎮Games 👤Profile",
        "To chat: Go to Chats > Tap any conversation > Type message > Send! AI friends reply automatically! 🤖",
        "To find people: Go to Discover > Search username > Follow or Chat with them!",
        "Need more help? Just ask me anything about ChronoX! 🕷️"
    ],
    default: [
        "I'm here to help with ChronoX! Ask me about features, achievements, streaks, or how to use the app 🕷️",
        "Not sure about something? I can explain any ChronoX feature! Just ask 😊",
        "ChronoX is a premium social network. Want to know what makes it special? 🌟"
    ]
};

function getChronoXReply(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
        return randomReply(CHRONOX_REPLIES.greeting);
    }
    if (msg.includes('feature') || msg.includes('what can') || msg.includes('tell me about')) {
        return randomReply(CHRONOX_REPLIES.features);
    }
    if (msg.includes('achievement') || msg.includes('points') || msg.includes('unlock')) {
        return randomReply(CHRONOX_REPLIES.achievements);
    }
    if (msg.includes('streak') || msg.includes('daily') || msg.includes('login')) {
        return randomReply(CHRONOX_REPLIES.streak);
    }
    if (msg.includes('help') || msg.includes('how') || msg.includes('what') || msg.includes('where')) {
        return randomReply(CHRONOX_REPLIES.help);
    }
    
    return randomReply(CHRONOX_REPLIES.default);
}

function randomReply(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

console.log('✅ ChronoX AI loaded');
