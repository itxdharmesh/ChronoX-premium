// js/games/memorymatch.js

function startMemoryMatch() {
    var c = document.getElementById('contentArea');
    if (!c) return;

    c.innerHTML = `
        <div id="mmContainer" style="position:relative; width:100%; height:100%; min-height: 500px; height: calc(100vh - 120px); overflow-y:auto; overflow-x:hidden; background: #0b0f19; font-family: 'Poppins', sans-serif; user-select:none; -webkit-user-select:none; padding: 20px 10px; touch-action: manipulation;">
            
            <div style="width:100%; display:flex; justify-content:space-between; margin-bottom: 20px; z-index:10;">
                <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #38bdf8; padding: 6px 14px; border-radius: 10px; min-width: 90px;">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">FLIPS</span>
                    <span id="mmFlips" style="color:#38bdf8; font-weight:900; font-size:16px; text-shadow: 0 0 10px rgba(56,189,248,0.4);">0</span>
                </div>
                <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #a855f7; padding: 6px 14px; border-radius: 10px; text-align: right; min-width: 90px;">
                    <span style="font-size:9px; color:rgba(255,255,255,0.4); display:block; letter-spacing:1px;">MATCHES</span>
                    <span id="mmMatches" style="color:#a855f7; font-weight:800; font-size:16px;">0/8</span>
                </div>
            </div>

            <div id="mmGrid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; width: 100%; max-width: 400px; margin: 0 auto; min-height: 320px;"></div>

            <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
                <button id="mmExitBtn" style="background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.4); color:#f43f5e; padding:10px 20px; border-radius:12px; font-size:11px; font-weight:700; cursor:pointer; letter-spacing:1px; transition: 0.2s;">ABORT MODULE</button>
            </div>

            <div id="mmScreen" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: rgba(15, 23, 42, 0.98); border:1px solid #38bdf8; backdrop-filter:blur(20px); padding:35px 25px; border-radius:24px; text-align:center; width:90%; max-width:340px; box-shadow:0 20px 60px rgba(0,0,0,0.8); z-index:20; display:block;">
                <div style="width:60px; height:60px; background: rgba(56,189,248,0.15); border: 2px solid #38bdf8; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:26px;">🧠</div>
                <h1 style="font-size:22px; font-weight:900; letter-spacing:2px; color:#fff; margin-bottom:5px;">MEMORY MATRIX</h1>
                <p id="mmSub" style="font-size:11px; color:rgba(255,255,255,0.6); margin-bottom:25px; letter-spacing:1px; line-height:1.5;">FLIP CARDS AND FIND ALL LINKED <br>CYBERNETIC TWIN SHAPES</p>
                <button id="mmBtn" style="background:linear-gradient(135deg,#38bdf8, #a855f7); border:none; padding:12px 30px; font-size:13px; font-weight:800; color:#fff; border-radius:12px; cursor:pointer; text-transform:uppercase; width:100%; box-shadow: 0 5px 15px rgba(56,189,248,0.3);">ENGAGE SYSTEM</button>
            </div>
        </div>
    `;

    const grid = document.getElementById('mmGrid');
    const mmScreen = document.getElementById('mmScreen');
    const mmSub = document.getElementById('mmSub');
    const mmBtn = document.getElementById('mmBtn');
    const mmExitBtn = document.getElementById('mmExitBtn');
    const mmFlips = document.getElementById('mmFlips');
    const mmMatches = document.getElementById('mmMatches');

    // Cyber Deck Dataset Array (8 Twins = 16 Cards)
    const cardIcons = ['🤖', '⚔️', '🧬', '💥', '🛸', '🎯', '⚡', '🌌'];
    let cardDeck = [];
    let flippedCards = [];
    let lockGrid = false;
    let flipCount = 0;
    let matchCount = 0;

    function initDeck() {
        // Create duplicate twin arrays
        let doubles = [...cardIcons, ...cardIcons];
        
        // Secure Shuffle Deck Engine (Fisher-Yates)
        for (let i = doubles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [doubles[i], doubles[j]] = [doubles[j], doubles[i]];
        }
        cardDeck = doubles;
    }

    function createMatrixLayout() {
        grid.innerHTML = '';
        initDeck();

        cardDeck.forEach((icon, index) => {
            const card = document.createElement('div');
            card.dataset.icon = icon;
            card.dataset.id = index;
            
            // Neon Futuristic Styling Properties
            card.style.cssText = `
                background: #131a2e;
                border: 1px solid rgba(56, 189, 248, 0.2);
                border-radius: 12px;
                height: 85px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0px; /* Hide text initially */
                cursor: pointer;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: inset 0 0 15px rgba(0,0,0,0.5);
            `;

            // Explicit Safe Event Binding
            card.addEventListener('click', () => handleCardFlip(card));
            grid.appendChild(card);
        });
    }

    function handleCardFlip(card) {
        if (lockGrid) return;
        // Block double clicks on already flipped/matched cards
        if (card.style.background === 'rgb(21, 128, 61)' || card.style.fontSize !== '0px') return;

        // Visual State Modification (Flip State Open)
        card.style.background = '#1e293b';
        card.style.borderColor = '#38bdf8';
        card.style.fontSize = '26px';
        card.style.transform = 'scale(1.05)';
        card.innerText = card.dataset.icon;

        flippedCards.push(card);

        if (flippedCards.length === 2) {
            flipCount++;
            if (mmFlips) mmFlips.innerText = flipCount;
            evaluateMatchResult();
        }
    }

    function evaluateMatchResult() {
        lockGrid = true;
        const [card1, card2] = flippedCards;

        if (card1.dataset.icon === card2.dataset.icon && card1.dataset.id !== card2.dataset.id) {
            // SUCCESS MATCH STATE DETECTED
            setTimeout(() => {
                let matchGlow = 'rgb(21, 128, 61)'; // Solid Forest Cyber Green
                card1.style.background = matchGlow;
                card1.style.borderColor = '#22c55e';
                card1.style.transform = 'scale(1)';
                
                card2.style.background = matchGlow;
                card2.style.borderColor = '#22c55e';
                card2.style.transform = 'scale(1)';

                matchCount++;
                if (mmMatches) mmMatches.innerText = `${matchCount}/8`;

                flippedCards = [];
                lockGrid = false;

                if (matchCount === 8) handleGameVictory();
            }, 350);
        } else {
            // MISMATCH REVERSAL SEQUENCE
            setTimeout(() => {
                card1.style.background = '#131a2e';
                card1.style.borderColor = 'rgba(56, 189, 248, 0.2)';
                card1.style.fontSize = '0px';
                card1.style.transform = 'scale(1)';
                card1.innerText = '';

                card2.style.background = '#131a2e';
                card2.style.borderColor = 'rgba(56, 189, 248, 0.2)';
                card2.style.fontSize = '0px';
                card2.style.transform = 'scale(1)';
                card2.innerText = '';

                flippedCards = [];
                lockGrid = false;
            }, 800); // 800ms grid memory hold window time
        }
    }

    function bootSequence() {
        mmScreen.style.display = 'none';
        flipCount = 0;
        matchCount = 0;
        flippedCards = [];
        lockGrid = false;
        
        if (mmFlips) mmFlips.innerText = "0";
        if (mmMatches) mmMatches.innerText = "0/8";

        createMatrixLayout();
    }

    function handleGameVictory() {
        mmScreen.style.display = 'block';
        mmSub.innerHTML = `MATRIX SYNC COMPLETED! <br>Total Evaluation Flips: <span style="color:#22c55e; font-weight:900;">${flipCount}</span>`;
        mmBtn.innerText = "RE-INITIALIZE GRID";
    }

    mmBtn.onclick = bootSequence;

    mmExitBtn.onclick = function() {
        if (typeof openGames === 'function') openGames();
    };
}
