// ==================== QUIZ SYSTEM ====================

const QUIZ_QUESTIONS = [
    { q: "What is the capital of France?", options: ["London", "Paris", "Berlin", "Madrid"], answer: 1 },
    { q: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], answer: 2 },
    { q: "What is 2 + 2 × 2?", options: ["6", "8", "4", "10"], answer: 0 },
    { q: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], answer: 2 },
    { q: "What is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
    { q: "Which animal is known as the King of the Jungle?", options: ["Tiger", "Lion", "Elephant", "Bear"], answer: 1 },
    { q: "What is H2O?", options: ["Oxygen", "Hydrogen", "Water", "Air"], answer: 2 },
    { q: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2 },
    { q: "What is the fastest land animal?", options: ["Lion", "Cheetah", "Horse", "Dog"], answer: 1 },
    { q: "Which year did India gain independence?", options: ["1945", "1947", "1950", "1942"], answer: 1 },
    { q: "What is the square root of 64?", options: ["6", "7", "8", "9"], answer: 2 },
    { q: "Who wrote Romeo and Juliet?", options: ["Dickens", "Shakespeare", "Austen", "Hemingway"], answer: 1 },
    { q: "What is the chemical symbol for gold?", options: ["Ag", "Fe", "Au", "Cu"], answer: 2 },
    { q: "Which is the smallest country?", options: ["Monaco", "Vatican City", "Maldives", "Singapore"], answer: 1 },
    { q: "How many colors in a rainbow?", options: ["5", "6", "7", "8"], answer: 2 }
];

let quizQuestions = [];
let quizCurrent = 0;
let quizScore = 0;
let quizAnswered = false;

function openQuiz() {
    quizQuestions = shuffleArray(QUIZ_QUESTIONS).slice(0, 10);
    quizCurrent = 0;
    quizScore = 0;
    quizAnswered = false;
    
    openModal('quizModal');
    showQuizQuestion();
}

function showQuizQuestion() {
    if (quizCurrent >= quizQuestions.length) {
        showQuizResult();
        return;
    }
    
    const q = quizQuestions[quizCurrent];
    quizAnswered = false;
    
    document.getElementById('quizContent').innerHTML = `
        <div class="modal-header">
            <h2>❓ Quiz</h2>
            <span style="color:var(--text2);font-size:13px">${quizCurrent + 1}/10</span>
        </div>
        <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width:${(quizCurrent / 10) * 100}%"></div>
        </div>
        <h3 style="margin:15px 0;color:#fff">${q.q}</h3>
        <div class="quiz-options">
            ${q.options.map((opt, i) => `
                <button class="quiz-option" id="opt${i}" onclick="selectQuizAnswer(${i})">${opt}</button>
            `).join('')}
        </div>
        <button class="btn-gold hidden" id="quizNextBtn" onclick="nextQuizQuestion()">Next →</button>
    `;
}

function selectQuizAnswer(index) {
    if (quizAnswered) return;
    quizAnswered = true;
    
    const q = quizQuestions[quizCurrent];
    const isCorrect = index === q.answer;
    
    if (isCorrect) {
        quizScore++;
        document.getElementById(`opt${index}`).classList.add('correct');
    } else {
        document.getElementById(`opt${index}`).classList.add('wrong');
        document.getElementById(`opt${q.answer}`).classList.add('correct');
    }
    
    document.getElementById('quizNextBtn').classList.remove('hidden');
}

function nextQuizQuestion() {
    quizCurrent++;
    showQuizQuestion();
}

async function showQuizResult() {
    let message, emoji, motivation;
    
    if (quizScore <= 3) {
        emoji = '😢';
        message = 'Need Hardwork';
        motivation = 'Don\'t give up! Every expert was once a beginner. Keep learning and you\'ll improve! 💪';
    } else if (quizScore <= 6) {
        emoji = '🌟';
        message = 'Good';
        motivation = 'You\'re doing well! A little more practice and you\'ll be amazing. Stay curious! 📚';
    } else if (quizScore <= 8) {
        emoji = '😍';
        message = 'Amazing';
        motivation = 'Great job! You really know your stuff. Keep this momentum going! 🚀';
    } else if (quizScore === 9) {
        emoji = '👏';
        message = 'Excellent';
        motivation = 'Almost perfect! You\'re among the best. One more step to greatness! ⭐';
    } else {
        emoji = '😱';
        message = 'Unbelievable';
        motivation = 'PERFECT SCORE! You\'re a genius! The world needs minds like yours. Incredible! 🏆👑';
    }
    
    // Save score
    if (currentUser) {
        await db.collection('users').doc(currentUser.uid).update({
            quizScores: firebase.firestore.FieldValue.arrayUnion(quizScore)
        });
        checkAchievements();
    }
    
    document.getElementById('quizContent').innerHTML = `
        <div style="text-align:center;padding:20px">
            <div style="font-size:60px">${emoji}</div>
            <h2 style="color:var(--gold);margin:15px 0">${quizScore} / 10 Points</h2>
            <h3 style="color:#fff;margin:10px 0">${message}</h3>
            <p style="color:var(--text2);margin:15px 0;line-height:1.6">${motivation}</p>
            <button class="btn-gold" onclick="openQuiz()">Try Again</button>
            <button class="btn-outline" onclick="closeModal('quizModal');navigateTo('home')">Go Home</button>
        </div>
    `;
}

console.log('✅ Quiz loaded');
