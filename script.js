window.onload = function(){

    const playBtn = document.getElementById("playBtn");
    const menu = document.getElementById("menu");
    const gameContainer = document.getElementById("gameContainer");
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    
    const alienSelect = document.getElementById("alienSelect");
    const powerSound = document.getElementById("powerSound");
    
    const bgFull = document.getElementById("bgFull");
    const bgBox = document.getElementById("bgBox");
    
    let ballX, ballY, dx, dy;
    let paddleX;
    let paddleWidth = 120;
    
    let bricks = [];
    let particles = [];
    
    let lastTime = 0;
    let score = 0;
    
    let alien;
    let win = false;
    let winTimer = 0;
    
    // ✅ INIT
    function init(){
    
        alien = alienSelect.value;
    
        ballX = 360;
        ballY = 300;
    
        let baseSpeed = 800;
        paddleWidth = 150;
    
        if(alien==="xlr8"){ baseSpeed = 750; }
        if(alien==="fourarms"){ paddleWidth = 200; baseSpeed = 550; }
        if(alien==="heatblast"){ baseSpeed = 650; }
    
        let angle = Math.PI / 4;
    
        dx = Math.cos(angle) * baseSpeed;
        dy = -Math.sin(angle) * baseSpeed;
    
        paddleX = canvas.width/2 - paddleWidth/2;
        score = 0;
    
        bricks = [];
        for(let r=0;r<5;r++){
            for(let c=0;c<10;c++){
                bricks.push({
                    x:c*70+20,
                    y:r*30+40,
                    alive:true,
                    energy:Math.random()*Math.PI*2
                });
            }
        }
    
        particles = [];
    }
    
    // ✅ OMNITRIX ANIMATION
    function drawWinAnimation(){
    
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
    
        let radius = 60 + Math.sin(Date.now()*0.01)*20;
    
        ctx.beginPath();
        ctx.arc(canvas.width/2,canvas.height/2,radius,0,Math.PI*2);
    
        ctx.fillStyle = "#00ff88";
        ctx.shadowColor = "#00ff88";
        ctx.shadowBlur = 60;
        ctx.fill();
        ctx.shadowBlur = 0;
    
        ctx.fillStyle = "#00ff88";
        ctx.font = "28px Arial";
        ctx.textAlign = "center";
        ctx.fillText("OMNITRIX ACTIVATED", canvas.width/2, canvas.height/2 + 80);
    }
    
    // ✅ START GAME
    playBtn.onclick = ()=>{
        menu.style.display="none";
        gameContainer.style.display="block";
    
        bgFull.muted=false;
        bgBox.muted=false;
        bgFull.play();
        bgBox.play();
    
        powerSound.play();
    
        init();
        requestAnimationFrame(loop);
    };
    
    // ✅ CONTROLS
    document.addEventListener("mousemove", e=>{
        paddleX = e.clientX - canvas.offsetLeft - paddleWidth/2;
    
        if(paddleX < 0) paddleX = 0;
        if(paddleX > canvas.width - paddleWidth)
            paddleX = canvas.width - paddleWidth;
    });
    
    // ✅ GAME LOOP
    function loop(time){
    
        if(!lastTime) lastTime = time;
        let dt = (time - lastTime)/1000;
    
        // ⭐ prevent lag spikes
        if(dt > 0.02) dt = 0.02;
    
        lastTime = time;
    
        ctx.clearRect(0,0,720,480);
    
        // ✅ OMNITRIX MODE
        if(win){
    
            drawWinAnimation();
    
            winTimer--;
    
            if(winTimer <= 0){
                win = false;
                init();
                lastTime = 0;
            }
    
            requestAnimationFrame(loop);
            return;
        }
    
        /* 🌌 REALISTIC STARS */
        if(particles.length < 150){
            particles.push({
                x: Math.random()*720,
                y: Math.random()*480,
                size: Math.random()*1.8 + 0.2,
                speed: 5 + Math.random()*15,
                alpha: Math.random(),
                twinkle: Math.random()*0.03,
                depth: Math.random()
            });
        }
    
        particles.forEach((p,i)=>{
            p.alpha += p.twinkle;
            if(p.alpha > 1 || p.alpha < 0) p.twinkle *= -1;
    
            p.y += p.speed * (0.3 + p.depth) * dt;
    
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
            ctx.fill();
    
            if(p.y > 480){
                p.y = 0;
                p.x = Math.random()*720;
            }
        });
    
        /* MOVE BALL */
        ballX += dx * dt;
        ballY += dy * dt;
    
        /* CONSTANT SPEED */
        let baseSpeed = 450;
        if(alien==="xlr8") baseSpeed = 650;
        if(alien==="fourarms") baseSpeed = 500;
        if(alien==="heatblast") baseSpeed = 520;
    
        let currentSpeed = Math.sqrt(dx*dx + dy*dy);
        dx = (dx/currentSpeed) * baseSpeed;
        dy = (dy/currentSpeed) * baseSpeed;
    
        /* WALL */
        if(ballX < 10){ ballX = 10; dx *= -1; }
        if(ballX > 710){ ballX = 710; dx *= -1; }
        if(ballY < 10){ dy *= -1; }
    
        /* BALL */
        ctx.beginPath();
        ctx.arc(ballX,ballY,10,0,Math.PI*2);
    
        if(alien==="heatblast"){
            ctx.fillStyle="orange";
            ctx.shadowColor="red";
        }else{
            ctx.fillStyle="#00ff88";
            ctx.shadowColor="#00ff88";
        }
    
        ctx.shadowBlur=20;
        ctx.fill();
        ctx.shadowBlur=0;
    
        /* PADDLE */
        ctx.fillStyle="#00ff88";
        ctx.fillRect(paddleX,460,paddleWidth,10);
    
        if(ballY>450 && ballX>paddleX && ballX<paddleX+paddleWidth){
    
            let hitPoint = (ballX - (paddleX + paddleWidth/2)) / (paddleWidth/2);
    
            let maxAngle = Math.PI / 3;
            let angle = hitPoint * maxAngle;
    
            dx = Math.sin(angle) * baseSpeed;
            dy = -Math.cos(angle) * baseSpeed;
        }
    
        /* 🟩 BRICKS */
        bricks.forEach(b=>{
            if(b.alive){
    
                b.energy += dt*2;
                let glow = Math.sin(b.energy)*50 + 200;
    
                ctx.fillStyle = `rgb(0,${glow},100)`;
                ctx.shadowColor="#00ff88";
                ctx.shadowBlur=15;
    
                ctx.fillRect(b.x,b.y,60,20);
    
                ctx.shadowBlur=0;
    
                if(ballX>b.x && ballX<b.x+60 && ballY>b.y && ballY<b.y+20){
                    b.alive=false;
                    dy*=-1;
                    score+=10;
                }
            }
        });
    
        /* WIN CHECK */
        if(!win && bricks.every(b => !b.alive)){
            win = true;
            winTimer = 120;
        }
    
        /* FALL RESET */
        if(ballY > canvas.height){
            init();
        }
    
        document.getElementById("scoreText").innerText="SCORE: "+score;
    
        requestAnimationFrame(loop);
    }
    };