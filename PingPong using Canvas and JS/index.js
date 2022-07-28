// canvas
const { body } = document;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const width = 400;
const height = 600;
const screenWidth = window.screen.width;
const canvasPosition = screenWidth / 2 - width / 2;
const isMobile = window.matchMedia('(max-width: 600px)');
const gameOverEl = document.createElement('div');

// paddle
let paddleWidth = 60;
let paddleHeight = 10;
let paddleDiff = 30;
let paddleTopX = 170;
let paddleBottomX = 170;
let playerMoved = false;
let paddleContact = false;

// ball 
let ballX = width / 2;
let ballY = height / 2;

// speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// change Mobile Setting
if (isMobile.matches) {
    speedY = -2;
    speedX = speedY;
    computerSpeed = 4;
} else {
    speedY = -1;
    speedX = speedY;
    computerSpeed = 3;
}

// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 7;
let isGameOver = true;
let isNewGame = true;

// Render everything on canvas
function renderCanvas() {
    // creating rectangle
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, width, height);

    //paddle color
    ctx.fillStyle = 'white';

    // paddel top
    ctx.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

    // paddle bottom
    ctx.fillRect(paddleBottomX, 580, paddleWidth, paddleHeight);

    // Dashed center line
    ctx.beginPath();
    ctx.setLineDash([4]);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // creating ball(circle)
    ctx.beginPath();
    ctx.arc(ballX, ballY, 5, 2 * Math.PI, false);
    ctx.fillStyle = "white"
    ctx.fill();

    // players scores
    ctx.font = "32px Josefin Sans";
    ctx.fillText(computerScore, 10, height / 2 - 30);
    ctx.fillText(playerScore, 10, height / 2 + 50);

}

// create canvas
function createCanvas() {
    canvas.width = width;
    canvas.height = height;
    body.appendChild(canvas);
    renderCanvas();
}

// reset ball to center
function ballReset() {
    ballX = width / 2;
    ballY = height / 2;
    speedY = -3;
    paddleContact = false;
}

// adjust ball movement
function ballMove() {
    // Vertical Speed
    ballY += -speedY;
    // Horizontal Speed
    if (playerMoved && paddleContact) {
        ballX += speedX;
    }
}

// Called Every Frame
function animate() {
    renderCanvas();
    ballMove();
    ballBoundaries();
    computerAI();
    gameOver();
    if (!isGameOver) {
        window.requestAnimationFrame(animate);
    }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
    // Bounce off Left Wall
    if (ballX < 0 && speedX < 0) {
        speedX = -speedX;
    }
    // Bounce off Right Wall
    if (ballX > width && speedX > 0) {
        speedX = -speedX;
    }
    // Bounce off player paddle (bottom)
    if (ballY > height - paddleDiff) {
        if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
            paddleContact = true;
            // Add Speed on Hit
            if (playerMoved) {
                speedY -= 1;
                // Max Speed
                if (speedY < -5) {
                    speedY = -5;
                    computerSpeed = 6;
                }
            }
            speedY = -speedY;
            trajectoryX = ballX - (paddleBottomX + paddleDiff);
            speedX = trajectoryX * 0.3;
        } else if (ballY > height) {
            // Reset Ball, add to Computer Score
            ballReset();
            computerScore++;
        }
    }
    // Bounce off computer paddle (top)
    if (ballY < paddleDiff) {
        if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
            // Add Speed on Hit
            if (playerMoved) {
                speedY += 1;
                // Max Speed
                if (speedY > 5) {
                    speedY = 5;
                }
            }
            speedY = -speedY;
        } else if (ballY < 0) {
            // Reset Ball, add to Player Score
            ballReset();
            playerScore++;
        }
    }
}

// Computer Movement
function computerAI() {
    if (playerMoved) {
        if (paddleTopX + paddleDiff < ballX) {
            paddleTopX += computerSpeed;
        } else {
            paddleTopX -= computerSpeed;
        }
    }
}

function showGameOverEl(winner) {
    // Hide Canvas
    canvas.hidden = true;
    // Container
    gameOverEl.textContent = '';
    gameOverEl.classList.add('game-over-container');
    // Title
    const title = document.createElement('h1');
    title.textContent = `${winner} Wins!`;
    // Button
    const playAgainBtn = document.createElement('button');
    playAgainBtn.setAttribute('onclick', 'startGame()');
    playAgainBtn.textContent = 'Play Again';
    // Append
    gameOverEl.append(title, playAgainBtn);
    body.appendChild(gameOverEl);
}

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
    if (playerScore === winningScore || computerScore === winningScore) {
        isGameOver = true;
        // Set Winner
        const winner = playerScore === winningScore ? 'Player' : 'Computer';
        showGameOverEl(winner);
    }
}


// start game and reset everything
function startGame() {
    if (isGameOver && !isNewGame) {
        body.removeChild(gameOverEl);
        canvas.hidden = false;
    }
    isGameOver = false;
    isNewGame = false;
    playerScore = 0;
    computerScore = 0;
    ballReset();
    createCanvas();
    animate();
    // setInterval(animate, 1000 / 60);
    canvas.addEventListener('mousemove', (e) => {

        // console.log(e.clientX);
        playerMoved = true;

        // compansate for canvas being centered
        paddleBottomX = e.clientX - canvasPosition - paddleDiff;

        if (paddleBottomX < paddleDiff) {
            paddleBottomX = 0;
        }

        if (paddleBottomX > width - paddleWidth) {
            paddleBottomX = width - paddleWidth;
        }

        // Hide Cursor
        canvas.style.cursor = 'none';
    })
}



// on load
startGame();