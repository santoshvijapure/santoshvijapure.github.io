/**
 * DevSnake: Memory Leak Hunter Game Engine
 */

window.createDevSnakeGame = function (canvasId, onScoreUpdate, onGameOver) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');

  const width = 600;
  const height = 600;
  canvas.width = width;
  canvas.height = height;

  const gridSize = 20;
  const tileCount = width / gridSize;

  let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];

  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };

  let food = spawnItem();
  let bonusItem = null;
  let bonusTimer = 0;
  let obstacles = [];

  let score = 0;
  let state = 'PLAYING'; // PLAYING, PAUSED, GAMEOVER
  let speed = 110; // ms per tick
  let lastTick = performance.now();
  let animId = null;

  function spawnItem() {
    let newX, newY, collision;
    do {
      newX = Math.floor(Math.random() * (tileCount - 2)) + 1;
      newY = Math.floor(Math.random() * (tileCount - 2)) + 1;
      collision = snake.some((s) => s.x === newX && s.y === newY);
    } while (collision);

    const types = ['commit', 'test', 'coffee'];
    const type = types[Math.floor(Math.random() * types.length)];
    return { x: newX, y: newY, type };
  }

  function handleKeyDown(e) {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (dir.y === 0) nextDir = { x: 0, y: -1 };
      e.preventDefault();
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      if (dir.y === 0) nextDir = { x: 0, y: 1 };
      e.preventDefault();
    } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      if (dir.x === 0) nextDir = { x: -1, y: 0 };
      e.preventDefault();
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      if (dir.x === 0) nextDir = { x: 1, y: 0 };
      e.preventDefault();
    } else if (e.code === 'KeyP') {
      state = state === 'PLAYING' ? 'PAUSED' : 'PLAYING';
    } else if (e.code === 'Space' && state === 'GAMEOVER') {
      reset();
    }
  }

  window.addEventListener('keydown', handleKeyDown);

  function reset() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    speed = 110;
    obstacles = [];
    food = spawnItem();
    state = 'PLAYING';
    if (onScoreUpdate) onScoreUpdate(score);
  }

  function update() {
    if (state !== 'PLAYING') return;

    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      state = 'GAMEOVER';
      if (onGameOver) onGameOver(score, false);
      return;
    }

    // Self collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      state = 'GAMEOVER';
      if (onGameOver) onGameOver(score, false);
      return;
    }

    // Obstacle collision
    if (obstacles.some((o) => o.x === head.x && o.y === head.y)) {
      state = 'GAMEOVER';
      if (onGameOver) onGameOver(score, false);
      return;
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
      score += food.type === 'coffee' ? 250 : food.type === 'test' ? 150 : 100;
      if (onScoreUpdate) onScoreUpdate(score);

      // Speed up slightly
      speed = Math.max(65, 110 - Math.floor(score / 500) * 5);

      // Add memory leak obstacles periodically
      if (score % 600 === 0 && obstacles.length < 12) {
        obstacles.push(spawnItem());
      }

      food = spawnItem();
    } else {
      snake.pop();
    }
  }

  function draw() {
    // Grid background
    ctx.fillStyle = '#07090e';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw Obstacles (Memory Leaks)
    obstacles.forEach((o) => {
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.fillRect(o.x * gridSize + 2, o.y * gridSize + 2, gridSize - 4, gridSize - 4);
      ctx.shadowBlur = 0;
    });

    // Draw Food
    ctx.save();
    ctx.fillStyle = food.type === 'coffee' ? '#f59e0b' : food.type === 'test' ? '#06b6d4' : '#10b981';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // Draw Snake
    snake.forEach((s, idx) => {
      ctx.fillStyle = idx === 0 ? '#38bdf8' : '#6366f1';
      ctx.shadowColor = idx === 0 ? '#38bdf8' : 'transparent';
      ctx.shadowBlur = idx === 0 ? 10 : 0;
      ctx.fillRect(s.x * gridSize + 1, s.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
    ctx.shadowBlur = 0;

    // HUD Header
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`COMMITS MERGED: ${score}`, 14, 24);
    ctx.textAlign = 'right';
    ctx.fillText(`PIPELINE LENGTH: ${snake.length}`, width - 14, 24);

    if (state === 'PAUSED') {
      ctx.fillStyle = 'rgba(7,9,14,0.7)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', width / 2, height / 2);
    } else if (state === 'GAMEOVER') {
      ctx.fillStyle = 'rgba(7,9,14,0.85)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MEMORY OVERFLOW (CRASH)', width / 2, height / 2 - 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '15px monospace';
      ctx.fillText(`TOTAL COMMITS: ${score}`, width / 2, height / 2 + 15);
      ctx.fillStyle = '#10b981';
      ctx.fillText('Press [SPACEBAR] to Re-run Pipeline', width / 2, height / 2 + 48);
    }
  }

  function loop(now) {
    if (now - lastTick > speed) {
      update();
      lastTick = now;
    }
    draw();
    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);

  return {
    destroy: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    },
    togglePause: () => {
      state = state === 'PLAYING' ? 'PAUSED' : 'PLAYING';
    },
    restart: () => {
      reset();
    },
    setDirection: (d) => {
      if (d === 'up' && dir.y === 0) nextDir = { x: 0, y: -1 };
      if (d === 'down' && dir.y === 0) nextDir = { x: 0, y: 1 };
      if (d === 'left' && dir.x === 0) nextDir = { x: -1, y: 0 };
      if (d === 'right' && dir.x === 0) nextDir = { x: 1, y: 0 };
      if (state === 'GAMEOVER') reset();
    }
  };
};
