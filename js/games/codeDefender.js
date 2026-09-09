/**
 * Code Defender Game Engine (Modularized)
 */

window.createCodeDefenderGame = function (canvasId, onScoreUpdate, onGameOver) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');

  let audioCtx = null;
  let isMuted = false;

  function initAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playSound(type) {
    if (isMuted || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === 'laser') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.1);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.2);
      } else if (type === 'powerup') {
        [523, 659, 784, 1046].forEach((freq, i) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + i * 0.05);
          g.gain.setValueAtTime(0.15, now + i * 0.05);
          g.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.05);
          o.connect(g);
          g.connect(audioCtx.destination);
          o.start(now + i * 0.05);
          o.stop(now + (i + 1) * 0.05);
        });
      }
    } catch (e) {}
  }

  const width = 600;
  const height = 700;
  canvas.width = width;
  canvas.height = height;

  let state = 'PLAYING'; // PLAYING, PAUSED, GAMEOVER, VICTORY
  let score = 0;
  let wave = 1;
  const maxWaves = 3;

  const keys = { left: false, right: false, shoot: false };
  let lastShootTime = 0;

  let player = {
    x: width / 2 - 22,
    y: height - 70,
    width: 44,
    height: 38,
    speed: 6.5,
    health: 3,
    tripleShotTimer: 0,
    shieldTimer: 0
  };

  let bullets = [];
  let enemies = [];
  let particles = [];
  let powerups = [];
  let stars = [];
  let animId = null;

  for (let i = 0; i < 70; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speed: Math.random() * 2 + 0.8,
      color: ['#6366f1', '#06b6d4', '#a855f7', '#ffffff'][Math.floor(Math.random() * 4)]
    });
  }

  function spawnWave(waveNum) {
    enemies = [];
    if (waveNum === 1) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 6; c++) {
          enemies.push({
            x: 60 + c * 80,
            y: 50 + r * 45,
            width: 38,
            height: 28,
            type: r === 0 ? 'NullPointer' : 'SyntaxError',
            health: 1,
            speedX: 1.6,
            direction: 1,
            points: 100,
            color: r === 0 ? '#f43f5e' : '#fb923c'
          });
        }
      }
    } else if (waveNum === 2) {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 7; c++) {
          enemies.push({
            x: 50 + c * 72,
            y: 50 + r * 44,
            width: 36,
            height: 30,
            type: r === 0 ? 'MemoryLeak' : 'SpaghettiCode',
            health: r === 0 ? 2 : 1,
            speedX: 2.2,
            direction: 1,
            points: 200,
            color: r === 0 ? '#ec4899' : '#06b6d4'
          });
        }
      }
    } else if (waveNum === 3) {
      enemies.push({
        x: width / 2 - 80,
        y: 60,
        width: 160,
        height: 80,
        type: 'LegacyMonolith',
        isBoss: true,
        health: 50,
        maxHealth: 50,
        speedX: 2.8,
        direction: 1,
        points: 5000,
        color: '#8b5cf6',
        attackTimer: 0
      });
    }
  }

  spawnWave(1);

  function addParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1.5,
        color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  function handleKeyDown(e) {
    initAudio();
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'Space') {
      keys.shoot = true;
      if (state === 'GAMEOVER' || state === 'VICTORY') reset();
      e.preventDefault();
    }
    if (e.code === 'KeyP') state = state === 'PLAYING' ? 'PAUSED' : 'PLAYING';
    if (e.code === 'KeyM') isMuted = !isMuted;
  }

  function handleKeyUp(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'Space') keys.shoot = false;
  }

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  function reset() {
    score = 0;
    wave = 1;
    player.health = 3;
    player.x = width / 2 - 22;
    player.tripleShotTimer = 0;
    player.shieldTimer = 0;
    bullets = [];
    particles = [];
    powerups = [];
    spawnWave(1);
    state = 'PLAYING';
  }

  function update() {
    if (state !== 'PLAYING') return;

    if (keys.left) player.x = Math.max(10, player.x - player.speed);
    if (keys.right) player.x = Math.min(width - player.width - 10, player.x + player.speed);

    if (player.tripleShotTimer > 0) player.tripleShotTimer--;
    if (player.shieldTimer > 0) player.shieldTimer--;

    const now = performance.now();
    if (keys.shoot && now - lastShootTime > 160) {
      playSound('laser');
      const px = player.x + player.width / 2;
      const py = player.y;

      if (player.tripleShotTimer > 0) {
        bullets.push({ x: px, y: py, width: 4, height: 16, vy: -9, vx: 0, color: '#38bdf8' });
        bullets.push({ x: px - 12, y: py + 4, width: 4, height: 16, vy: -8.5, vx: -2, color: '#a855f7' });
        bullets.push({ x: px + 12, y: py + 4, width: 4, height: 16, vy: -8.5, vx: 2, color: '#a855f7' });
      } else {
        bullets.push({ x: px - 8, y: py, width: 4, height: 16, vy: -9, vx: 0, color: '#06b6d4' });
        bullets.push({ x: px + 8, y: py, width: 4, height: 16, vy: -9, vx: 0, color: '#06b6d4' });
      }
      lastShootTime = now;
    }

    // Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.y += b.vy;
      b.x += b.vx || 0;
      if (b.y < -20 || b.y > height + 20) bullets.splice(i, 1);
    }

    // Enemies
    let changeDir = false;
    enemies.forEach((e) => {
      if (!e.isBoss) {
        e.x += e.speedX * e.direction;
        if (e.x + e.width > width - 15 || e.x < 15) changeDir = true;
      } else {
        e.x += e.speedX * e.direction;
        if (e.x + e.width > width - 20 || e.x < 20) e.direction *= -1;

        e.attackTimer = (e.attackTimer || 0) + 1;
        if (e.attackTimer > 60) {
          e.attackTimer = 0;
          for (let angle = -1; angle <= 1; angle++) {
            bullets.push({
              x: e.x + e.width / 2,
              y: e.y + e.height,
              width: 8,
              height: 14,
              vy: 4.5,
              vx: angle * 1.5,
              isEnemy: true,
              color: '#ec4899'
            });
          }
        }
      }
    });

    if (changeDir) {
      enemies.forEach((e) => {
        if (!e.isBoss) {
          e.direction *= -1;
          e.y += 18;
          if (e.y + e.height >= player.y) playerHit();
        }
      });
    }

    // Bullet vs enemy collisions
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      if (b.isEnemy) {
        if (checkColl(b, player)) {
          bullets.splice(bi, 1);
          playerHit();
        }
        continue;
      }

      for (let ei = enemies.length - 1; ei >= 0; ei--) {
        const e = enemies[ei];
        if (checkColl(b, e)) {
          bullets.splice(bi, 1);
          e.health--;
          addParticles(b.x, b.y, e.color, 5);

          if (e.health <= 0) {
            playSound('hit');
            addParticles(e.x + e.width / 2, e.y + e.height / 2, e.color, 20);
            score += e.points;
            if (onScoreUpdate) onScoreUpdate(score);

            if (Math.random() < 0.25) {
              powerups.push({
                x: e.x,
                y: e.y,
                width: 22,
                height: 22,
                type: Math.random() < 0.5 ? 'triple' : 'shield',
                speedY: 2.2
              });
            }
            enemies.splice(ei, 1);
          }
          break;
        }
      }
    }

    // Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.y += p.speedY;
      if (checkColl(player, p)) {
        playSound('powerup');
        addParticles(p.x, p.y, '#10b981', 14);
        if (p.type === 'triple') player.tripleShotTimer = 380;
        if (p.type === 'shield') player.shieldTimer = 450;
        score += 200;
        if (onScoreUpdate) onScoreUpdate(score);
        powerups.splice(i, 1);
        continue;
      }
      if (p.y > height) powerups.splice(i, 1);
    }

    // Wave Progression
    if (enemies.length === 0) {
      if (wave < maxWaves) {
        wave++;
        playSound('powerup');
        spawnWave(wave);
      } else {
        state = 'VICTORY';
        if (onGameOver) onGameOver(score, true);
      }
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    // Stars
    stars.forEach((s) => {
      s.y += s.speed;
      if (s.y > height) {
        s.y = 0;
        s.x = Math.random() * width;
      }
    });
  }

  function playerHit() {
    if (player.shieldTimer > 0) {
      player.shieldTimer = 0;
      addParticles(player.x + 22, player.y + 19, '#06b6d4', 16);
      return;
    }
    player.health--;
    playSound('hit');
    addParticles(player.x + 22, player.y + 19, '#f43f5e', 22);

    if (player.health <= 0) {
      state = 'GAMEOVER';
      if (onGameOver) onGameOver(score, false);
    }
  }

  function checkColl(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  function draw() {
    ctx.fillStyle = '#07090e';
    ctx.fillRect(0, 0, width, height);

    // Stars
    stars.forEach((s) => {
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });

    // Particles
    particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1.0;

    // Bullets
    bullets.forEach((b) => {
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height);
      ctx.shadowBlur = 0;
    });

    // Powerups
    powerups.forEach((p) => {
      ctx.fillStyle = p.type === 'triple' ? '#38bdf8' : '#10b981';
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2, p.y + p.height / 2, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    // Enemies
    enemies.forEach((e) => {
      ctx.fillStyle = e.color;
      if (e.isBoss) {
        ctx.fillRect(e.x, e.y, e.width, e.height);
        // Boss health bar
        const r = e.health / e.maxHealth;
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(e.x, e.y - 12, e.width, 6);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(e.x, e.y - 12, e.width * r, 6);
      } else {
        ctx.fillRect(e.x, e.y, e.width, e.height);
        ctx.fillStyle = '#080b11';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(e.type === 'NullPointer' ? 'NULL' : 'BUG', e.x + e.width / 2, e.y + e.height / 2 + 3);
      }
    });

    // Player
    if (state !== 'GAMEOVER') {
      const px = player.x;
      const py = player.y;

      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(px + 14, py + 34);
      ctx.lineTo(px + 22, py + 42);
      ctx.lineTo(px + 30, py + 34);
      ctx.fill();

      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(px + 22, py);
      ctx.lineTo(px + 44, py + 34);
      ctx.lineTo(px + 22, py + 28);
      ctx.lineTo(px, py + 34);
      ctx.closePath();
      ctx.fill();

      if (player.shieldTimer > 0) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px + 22, py + 18, 28, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Top HUD
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText(`SCORE: ${score}`, 16, 24);
    ctx.textAlign = 'right';
    ctx.fillText(`WAVE: ${wave}/${maxWaves}`, width - 16, 24);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#f43f5e';
    let hStr = '';
    for (let i = 0; i < player.health; i++) hStr += '❤️ ';
    ctx.fillText(`HEALTH: ${hStr}`, 16, 44);

    // Overlay States
    if (state === 'PAUSED') {
      ctx.fillStyle = 'rgba(7,9,14,0.75)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', width / 2, height / 2);
    } else if (state === 'GAMEOVER') {
      ctx.fillStyle = 'rgba(7,9,14,0.88)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PRODUCTION OUTAGE (500)', width / 2, height / 2 - 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.fillText(`FINAL SCORE: ${score}`, width / 2, height / 2 + 10);
      ctx.fillStyle = '#10b981';
      ctx.fillText('Press [SPACEBAR] to Retry', width / 2, height / 2 + 45);
    } else if (state === 'VICTORY') {
      ctx.fillStyle = 'rgba(7,9,14,0.88)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PRODUCTION SAVED! 🚀', width / 2, height / 2 - 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.fillText(`SCORE: ${score}`, width / 2, height / 2 + 10);
    }
  }

  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);

  return {
    destroy: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    },
    togglePause: () => {
      state = state === 'PLAYING' ? 'PAUSED' : 'PLAYING';
    },
    toggleSound: () => {
      isMuted = !isMuted;
      return isMuted;
    },
    restart: () => {
      reset();
    },
    triggerLeft: (press) => { keys.left = press; },
    triggerRight: (press) => { keys.right = press; },
    triggerShoot: (press) => {
      initAudio();
      keys.shoot = press;
      if (press && (state === 'GAMEOVER' || state === 'VICTORY')) reset();
    }
  };
};
