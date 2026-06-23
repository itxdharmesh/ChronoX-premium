// reactionmaster.js

var reactionActive = false;
var reactionStart = 0;
var reactionBest = parseInt(localStorage.getItem('reactionBest') || '9999');

function startReactionMaster() {

    reactionActive = false;

    var c = document.getElementById('contentArea');

    c.innerHTML =
        '<div style="text-align:center">' +
            '<h2 style="color:#D4AF37">⚡ Reaction Master</h2>' +

            '<div style="margin:10px 0">' +
                '<span style="color:#2ED573">Best: </span>' +
                '<b id="bestReaction">' + (reactionBest === 9999 ? '--' : reactionBest + 'ms') + '</b>' +
            '</div>' +

            '<div id="reactionBox" style="' +
                'height:350px;' +
                'border-radius:20px;' +
                'background:#FF4757;' +
                'display:flex;' +
                'align-items:center;' +
                'justify-content:center;' +
                'font-size:24px;' +
                'font-weight:bold;' +
                'cursor:pointer;' +
                'margin:10px auto;' +
                'max-width:350px;' +
            '">' +
                'Wait...' +
            '</div>' +

            '<div id="reactionResult" style="margin-top:15px"></div>' +

            '<button class="btn-out" onclick="startReactionMaster()">🔄 Restart</button>' +
        '</div>';

    var box = document.getElementById('reactionBox');

    var delay = 2000 + Math.random() * 3000;

    setTimeout(function() {

        reactionActive = true;

        box.style.background = '#2ED573';
        box.innerHTML = 'CLICK!';

        reactionStart = Date.now();

    }, delay);

    box.onclick = function() {

        if (!reactionActive) {

            document.getElementById('reactionResult').innerHTML =
                '<span style="color:#FF4757">Too Early!</span>';

            return;
        }

        var reaction = Date.now() - reactionStart;

        reactionActive = false;

        if (reaction < reactionBest) {

            reactionBest = reaction;
            localStorage.setItem('reactionBest', reactionBest);
        }

        var xp = Math.max(5, Math.floor((500 - reaction) / 10));

        document.getElementById('reactionResult').innerHTML =
            '<h3>' + reaction + ' ms</h3>' +
            '<p>+ ' + xp + ' XP</p>';

        if (typeof addXP === 'function') {
            addXP(xp);
        }
    };
}
