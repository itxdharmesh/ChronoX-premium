function startNeonDrift() {
    const content = document.getElementById('contentArea');

    content.innerHTML = `
        <div class="game-container">
            <canvas id="driftCanvas" width="400" height="700"></canvas>
        </div>
    `;

    const canvas = document.getElementById("driftCanvas");
    const ctx = canvas.getContext("2d");

    let score = 0;
    let speed = 5;

    const player = {
        x: 170,
        y: 580,
        width: 60,
        height: 100
    };

    const obstacles = [];

    function spawnObstacle() {
        obstacles.push({
            x: [40,170,300][Math.floor(Math.random()*3)],
            y: -120,
            width: 60,
            height: 100
        });
    }

    setInterval(spawnObstacle, 1200);

    function drawRoad() {
        ctx.fillStyle = "#05070D";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.strokeStyle = "#00D4FF";
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.moveTo(130,0);
        ctx.lineTo(130,700);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(270,0);
        ctx.lineTo(270,700);
        ctx.stroke();
    }

    function drawPlayer() {
        ctx.fillStyle = "#C83CFF";
        ctx.fillRect(
            player.x,
            player.y,
            player.width,
            player.height
        );
    }

    function drawObstacles() {
        ctx.fillStyle = "#FF3D5A";

        obstacles.forEach(o=>{
            ctx.fillRect(
                o.x,
                o.y,
                o.width,
                o.height
            );
        });
    }

    function update() {

        drawRoad();

        obstacles.forEach((o,index)=>{

            o.y += speed;

            if(
                player.x < o.x + o.width &&
                player.x + player.width > o.x &&
                player.y < o.y + o.height &&
                player.y + player.height > o.y
            ){
                alert("Game Over\nScore: "+score);
                location.reload();
            }

            if(o.y > canvas.height){
                obstacles.splice(index,1);
                score++;
            }
        });

        drawPlayer();
        drawObstacles();

        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.fillText("Score: "+score,20,40);

        requestAnimationFrame(update);
    }

    document.addEventListener("keydown",(e)=>{

        if(e.key==="ArrowLeft")
            player.x=Math.max(40,player.x-130);

        if(e.key==="ArrowRight")
            player.x=Math.min(300,player.x+130);

    });

    update();
              }
