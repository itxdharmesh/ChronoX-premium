var mmCards = [];
var mmFlipped = [];
var mmMatched = 0;
var mmMoves = 0;
var mmTimer = 0;
var mmInterval;
var mmLocked = false;

function startMemoryMatch() {

    mmCards = [];
    mmFlipped = [];
    mmMatched = 0;
    mmMoves = 0;
    mmTimer = 0;
    mmLocked = false;

    var emojis = [
        "⚽","⚽",
        "🏆","🏆",
        "🔥","🔥",
        "⚡","⚡",
        "🚀","🚀",
        "💎","💎",
        "🎯","🎯",
        "👑","👑"
    ];

    emojis.sort(() => Math.random() - 0.5);

    mmCards = emojis;

    document.getElementById("contentArea").innerHTML =
    `
    <div style="text-align:center">

        <h2 style="color:#D4AF37">
            🧠 Memory Match Pro
        </h2>

        <div style="
            display:flex;
            justify-content:center;
            gap:20px;
            margin:10px 0;
        ">
            <div>
                ⏱️
                <span id="mmTime">0</span>s
            </div>

            <div>
                🎯
                <span id="mmMoves">0</span>
            </div>
        </div>

        <div
            id="mmBoard"
            style="
                display:grid;
                grid-template-columns:repeat(4,1fr);
                gap:10px;
                max-width:360px;
                margin:auto;
            "
        ></div>

    </div>
    `;

    createMemoryBoard();

    mmInterval = setInterval(function(){

        mmTimer++;

        document.getElementById("mmTime").textContent =
        mmTimer;

    },1000);
}

function createMemoryBoard(){

    var board =
    document.getElementById("mmBoard");

    board.innerHTML = "";

    mmCards.forEach(function(card,index){

        var div =
        document.createElement("div");

        div.className = "memory-card";

        div.style.height = "75px";
        div.style.borderRadius = "18px";
        div.style.cursor = "pointer";
        div.style.fontSize = "34px";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "center";
        div.style.background =
        "linear-gradient(135deg,#141A38,#0A0E27)";
        div.style.border =
        "1px solid rgba(212,175,55,.2)";

        div.textContent = "❓";

        div.onclick = function(){

            flipCard(div,index);
        };

        board.appendChild(div);

    });
}

function flipCard(card,index){

    if(mmLocked) return;

    if(mmFlipped.includes(index))
        return;

    card.textContent =
    mmCards[index];

    mmFlipped.push(index);

    if(mmFlipped.length === 2){

        mmMoves++;

        document.getElementById(
            "mmMoves"
        ).textContent = mmMoves;

        mmLocked = true;

        setTimeout(function(){

            checkMatch();

        },700);
    }
}

function checkMatch(){

    var cards =
    document.querySelectorAll(
        ".memory-card"
    );

    var first = mmFlipped[0];
    var second = mmFlipped[1];

    if(mmCards[first] === mmCards[second]){

        cards[first].style.background =
        "linear-gradient(135deg,#2ED573,#16A34A)";

        cards[second].style.background =
        "linear-gradient(135deg,#2ED573,#16A34A)";

        mmMatched += 2;

        if(mmMatched === mmCards.length){

            finishMemoryGame();
        }

    }else{

        cards[first].textContent = "❓";
        cards[second].textContent = "❓";
    }

    mmFlipped = [];
    mmLocked = false;
}

function finishMemoryGame(){

    clearInterval(mmInterval);

    var score =
    Math.max(
        100 - mmMoves * 3,
        20
    );

    var xp =
    Math.floor(score / 2);

    if(typeof addXP === "function")
        addXP(xp);

    var best =
    parseInt(
        localStorage.getItem(
            "memoryBest"
        ) || 0
    );

    if(score > best){

        localStorage.setItem(
            "memoryBest",
            score
        );
    }

    setTimeout(function(){

        alert(
            "🏆 Victory!\n\n" +
            "Score: " + score +
            "\nMoves: " + mmMoves +
            "\nTime: " + mmTimer +
            "s\nXP: +" + xp
        );

    },300);
}
