
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const rules = document.getElementById("rules");

rulesBtn.addEventListener("click", () => {
  rules.classList.add("show");
});

closeBtn.addEventListener("click", () => {
  rules.classList.remove("show");
});

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 4,
  dx: 3,
  dy: -3
};

const paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 30,
  w: 80,
  h: 10,
  speed: 8,
  dx: 0
};

const brickRowCount = 5;
const brickColumnCount = 9;

const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60
};

const bricks = [];

for (let row = 0; row < brickRowCount; row++) {
  bricks[row] = [];

  for (let col = 0; col < brickColumnCount; col++) {
    bricks[row][col] = {
      x: col * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX,
      y: row * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY,
      w: brickInfo.w,
      h: brickInfo.h,
      visible: true
    };
  }
}

let score = 0;
let gameOver = false;

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = "#0095dd";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.fillStyle = "#190146";
  ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
}

function drawBricks() {
  bricks.forEach(row => {
    row.forEach(brick => {
      if (brick.visible) {
        ctx.fillStyle = "#0095dd";
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x, brick.y, brick.w, brick.h);
      }
    });
  });
}

function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#222";

  if (score >= 25) {
    ctx.fillText("ЗНУ найкращі!!!", canvas.width - 210, 30);
  } else {
    ctx.fillText(`Рахунок: ${score}`, canvas.width - 140, 30);
  }
}

function showAllBricks() {
  bricks.forEach(row => {
    row.forEach(brick => {
      brick.visible = true;
    });
  });
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  ball.speed = 4;

  const angle = (Math.random() * 0.6 + 0.4) * Math.PI / 4;

  ball.dx =  ball.speed * Math.sin(angle);
  ball.dy = -ball.speed * Math.cos(angle);
}

function resetGame() {
  score = 0;
  showAllBricks();
  resetBall();

  paddle.x = canvas.width / 2 - paddle.w / 2;
  paddle.dx = 0;
}

function increaseScore() {
  score++;

  if (score % 10 === 0) {
    ball.speed += 1;

    const currentSpeed = Math.hypot(ball.dx, ball.dy);

    if (currentSpeed > 0) {
      ball.dx = (ball.dx / currentSpeed) * ball.speed;
      ball.dy = (ball.dy / currentSpeed) * ball.speed;
    }
  }

  if (score % (brickRowCount * brickColumnCount) === 0) {
    showAllBricks();
  }
}

function movePaddle() {
  paddle.x += paddle.dx;

  if (paddle.x < 0) {
    paddle.x = 0;
  }

  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }
}

function checkBrickCollision() {
  for (const row of bricks) {
    for (const brick of row) {
      if (!brick.visible) {
        continue;
      }

      const hit =
        ball.x + ball.size >= brick.x &&
        ball.x - ball.size <= brick.x + brick.w &&
        ball.y + ball.size >= brick.y &&
        ball.y - ball.size <= brick.y + brick.h;

      if (hit) {
        const overlapLeft =
          ball.x + ball.size - brick.x;

        const overlapRight =
          brick.x + brick.w - (ball.x - ball.size);

        const overlapTop =
          ball.y + ball.size - brick.y;

        const overlapBottom =
          brick.y + brick.h - (ball.y - ball.size);

        const minOverlap = Math.min(
          overlapLeft,
          overlapRight,
          overlapTop,
          overlapBottom
        );

        if (minOverlap === overlapLeft) {
          ball.dx = -Math.abs(ball.dx);
        } else if (minOverlap === overlapRight) {
          ball.dx = Math.abs(ball.dx);
        } else if (minOverlap === overlapTop) {
          ball.dy = -Math.abs(ball.dy);
        } else {
          ball.dy = Math.abs(ball.dy);
        }

        brick.visible = false;

        increaseScore();

        return;
      }
    }
  }
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x - ball.size <= 0) {
    ball.x = ball.size;
    ball.dx = Math.abs(ball.dx);
  } else if (ball.x + ball.size >= canvas.width) {
    ball.x = canvas.width - ball.size;
    ball.dx = -Math.abs(ball.dx);
  }

  if (ball.y - ball.size <= 0) {
    ball.y = ball.size;
    ball.dy = Math.abs(ball.dy);
  }

  if (
    ball.dy > 0 &&
    ball.y + ball.size >= paddle.y &&
    ball.y - ball.size <= paddle.y + paddle.h &&
    ball.x + ball.size >= paddle.x &&
    ball.x - ball.size <= paddle.x + paddle.w
  ) {
    const paddleCenter = paddle.x + paddle.w / 2;

    let hitPosition =
      (ball.x - paddleCenter) / (paddle.w / 2);

    hitPosition = Math.max(-1, Math.min(1, hitPosition));

    const maxAngle = Math.PI / 3;
    const angle = hitPosition * maxAngle;

    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);

    ball.y = paddle.y - ball.size;
  }

  checkBrickCollision();

  if (ball.y - ball.size > canvas.height) {
    resetGame();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawScore();
  drawBricks();
  drawBall();
  drawPaddle();
}

function update() {
  if (!gameOver) {
    movePaddle();
    moveBall();
    draw();
  }

  requestAnimationFrame(update);
}

document.addEventListener("keydown", event => {
  if (event.key === "ArrowRight") {
    paddle.dx = paddle.speed;
    event.preventDefault();
  } else if (event.key === "ArrowLeft") {
    paddle.dx = -paddle.speed;
    event.preventDefault();
  }
});

document.addEventListener("keyup", event => {
  if (
    event.key === "ArrowRight" ||
    event.key === "ArrowLeft"
  ) {
    paddle.dx = 0;
  }
});

draw();
update();
