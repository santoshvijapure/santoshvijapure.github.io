/**
 * Dino Jump: Candy Valley (Kids Endless Runner)
 * Help baby Dino leap over sweet obstacles, grab star candies, and double-jump!
 */

window.createDinoJumpGame = function (canvasId, onScoreUpdate, onGameOver) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');

  const width = 700;
  const height = 450;
  canvas.width = width;
  canvas.height = height;

  const groundY = height - 90;

  let audioCtx = null;
  let isMuted = false;

  function initAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type) {
    if (isMuted || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;

      if (type === 'jump') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'doubleJump') {
        [440, 660, 880].forEach((f, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.04);
          gain.gain.setValueAtTime(0.2, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.05);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + (i + 1) * 0.05);
        });
      } else if (type === 'star') {
        [880, 1100, 1320].forEach((f, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.04);
          gain.gain.setValueAtTime(0.18, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.05);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + (i + 1) * 0.05);
        });
      } else if (type === 'hit') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {}
  }

  // Dino Player State
  const dino = {
    x: 80,
    y: groundY - 50,
    width: 52,
    height: 52,
    vy: 0,
    gravity: 0.65,
    isGrounded: true,
    jumpsLeft: 2,
    rotation: 0,
    shieldTimer: 0,
    runFrame: 0
  };

  let speed = 4.2;
  let distance = 0;
  let score = 0;
  let starsCollected = 0;
  let highScore = parseInt(localStorage.getItem('dino_high_score') || '0', 10);
  let state = 'PLAYING'; // PLAYING, GAMEOVER

  let obstacles = [];
  let collectibles = [];
  let particles = [];
  let floatingTexts = [];
  let clouds = [];
  let hills = [];
  let spawnTimer = 0;
  let itemSpawnTimer = 0;
  let animId = null;
  let lastTime = performance.now();

  // Background Scenery Setup
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: Math.random() * width,
      y: 20 + Math.random() * 80,
      size: 40 + Math.random() * 40,
      speed: 0.3 + Math.random() * 0.3
    });
  }

  for (let i = 0; i < 4; i++) {
    hills.push({
      x: i * 240,
      y: groundY,
      r: 90 + Math.random() * 40,
      color: i % 2 === 0 ? '#bbf7d0' : '#86efac'
    });
  }

  function triggerJump() {
    initAudio();
    if (state === 'GAMEOVER') {
      restart();
      return;
    }

    if (dino.jumpsLeft > 0) {
      if (dino.jumpsLeft === 2) {
        dino.vy = -12.2;
        dino.isGrounded = false;
        dino.jumpsLeft = 1;
        playSound('jump');
        createDustPuff(dino.x + 20, dino.y + dino.height);
      } else if (dino.jumpsLeft === 1) {
        dino.vy = -11.0;
        dino.jumpsLeft = 0;
        dino.rotation = -Math.PI * 2; // acrobatic backflip
        playSound('doubleJump');
        addFloatingText(dino.x + 25, dino.y - 10, 'DOUBLE JUMP! 💫', '#38bdf8');
        createSparkles(dino.x + 25, dino.y + 25, 12, '#38bdf8');
      }
    }
  }

  function createDustPuff(x, y) {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2,
        r: 3 + Math.random() * 4,
        color: '#fef08a',
        alpha: 0.8,
        life: 0.4
      });
    }
  }

  function createSparkles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        r: 3 + Math.random() * 3,
        color: color || '#facc15',
        alpha: 1,
        life: 0.5
      });
    }
  }

  function addFloatingText(x, y, text, color) {
    floatingTexts.push({
      x,
      y,
      text,
      color,
      vy: -1.6,
      alpha: 1
    });
  }

  function spawnObstacle() {
    const types = [
      { name: 'cupcake', width: 42, height: 46, emoji: '🧁', color: '#f472b6' },
      { name: 'mushroom', width: 38, height: 42, emoji: '🍄', color: '#ef4444' },
      { name: 'lollipop', width: 36, height: 50, emoji: '🍭', color: '#a855f7' }
    ];
    const ob = types[Math.floor(Math.random() * types.length)];
    obstacles.push({
      x: width + 20,
      y: groundY - ob.height,
      width: ob.width,
      height: ob.height,
      emoji: ob.emoji,
      color: ob.color
    });
  }

  function spawnCollectible() {
    const isCupcake = Math.random() < 0.25;
    const yOffset = Math.random() < 0.5 ? 40 : 100; // Low or high jump star
    collectibles.push({
      x: width + 30,
      y: groundY - yOffset - 30,
      size: 28,
      type: isCupcake ? 'cupcake' : 'star',
      points: isCupcake ? 50 : 20,
      icon: isCupcake ? '🍬' : '⭐',
      collected: false,
      floatOffset: Math.random() * Math.PI * 2
    });
  }

  // Keyboard & Touch Handlers
  function handleKeyDown(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      triggerJump();
      e.preventDefault();
    }
  }

  window.addEventListener('keydown', handleKeyDown);

  canvas.addEventListener('mousedown', (e) => {
    triggerJump();
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    triggerJump();
  }, { passive: false });

  function restart() {
    dino.y = groundY - 50;
    dino.vy = 0;
    dino.isGrounded = true;
    dino.jumpsLeft = 2;
    dino.rotation = 0;
    dino.shieldTimer = 0;
    speed = 4.2;
    distance = 0;
    score = 0;
    starsCollected = 0;
    state = 'PLAYING';
    obstacles = [];
    collectibles = [];
    particles = [];
    floatingTexts = [];
    spawnTimer = 0;
    itemSpawnTimer = 0;
    if (onScoreUpdate) onScoreUpdate(0);
  }

  // Game Loop
  function tick(now) {
    animId = requestAnimationFrame(tick);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (state === 'PLAYING') {
      distance += speed * 60 * dt * 0.1;
      score = Math.floor(distance) + starsCollected * 20;
      if (onScoreUpdate) onScoreUpdate(score);

      // Speed increases gently
      speed = Math.min(8.5, 4.2 + (distance / 600) * 1.5);

      // Dino Physics
      dino.vy += dino.gravity * 60 * dt;
      dino.y += dino.vy * 60 * dt;

      if (dino.y >= groundY - dino.height) {
        dino.y = groundY - dino.height;
        dino.vy = 0;
        dino.isGrounded = true;
        dino.jumpsLeft = 2;
        dino.rotation = 0;
      }

      if (dino.rotation < 0) {
        dino.rotation += 12 * dt;
        if (dino.rotation > 0) dino.rotation = 0;
      }

      dino.runFrame += speed * 0.2;

      // Shield timer
      if (dino.shieldTimer > 0) {
        dino.shieldTimer -= dt;
      }

      // Spawn Obstacles
      spawnTimer += dt;
      const spawnInterval = Math.max(1.3, 2.5 - (speed - 4.2) * 0.25);
      if (spawnTimer > spawnInterval) {
        spawnObstacle();
        spawnTimer = 0;
      }

      // Spawn Collectibles
      itemSpawnTimer += dt;
      if (itemSpawnTimer > 1.8) {
        spawnCollectible();
        itemSpawnTimer = 0;
      }

      // Move Hills & Background
      hills.forEach((h) => {
        h.x -= speed * 0.35 * 60 * dt;
        if (h.x + h.r < 0) h.x = width + h.r;
      });

      clouds.forEach((c) => {
        c.x -= c.speed * 60 * dt;
        if (c.x + c.size * 2 < 0) c.x = width + 40;
      });

      // Update Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const ob = obstacles[i];
        ob.x -= speed * 60 * dt;

        // Collision detection (with gentle kid-friendly margins)
        const margin = 10;
        if (
          dino.x + margin < ob.x + ob.width - margin &&
          dino.x + dino.width - margin > ob.x + margin &&
          dino.y + margin < ob.y + ob.height &&
          dino.y + dino.height > ob.y + margin
        ) {
          if (dino.shieldTimer > 0) {
            // Shield destroys obstacle
            createSparkles(ob.x + ob.width / 2, ob.y + ob.height / 2, 16, '#38bdf8');
            addFloatingText(ob.x, ob.y - 10, 'SMASHED! 💥', '#38bdf8');
            obstacles.splice(i, 1);
            continue;
          } else {
            // Hit obstacle
            playSound('hit');
            state = 'GAMEOVER';
            if (score > highScore) {
              highScore = score;
              localStorage.setItem('dino_high_score', highScore.toString());
            }
            if (onGameOver) onGameOver(score);
            break;
          }
        }

        if (ob.x < -60) obstacles.splice(i, 1);
      }

      // Update Collectibles
      for (let i = collectibles.length - 1; i >= 0; i--) {
        const item = collectibles[i];
        item.x -= speed * 60 * dt;

        // Collision with dino
        if (
          !item.collected &&
          Math.hypot(dino.x + dino.width / 2 - item.x, dino.y + dino.height / 2 - item.y) <
            dino.width / 2 + item.size / 2
        ) {
          item.collected = true;
          starsCollected++;
          score += item.points;
          playSound('star');
          createSparkles(item.x, item.y, 14, '#facc15');
          addFloatingText(item.x, item.y - 12, `+${item.points} ⭐`, '#facc15');
          collectibles.splice(i, 1);
          continue;
        }

        if (item.x < -40) collectibles.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= dt / p.life;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    // Update Floating Texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const t = floatingTexts[i];
      t.y += t.vy * 60 * dt;
      t.alpha -= 0.9 * dt;
      if (t.alpha <= 0) floatingTexts.splice(i, 1);
    }

    render();
  }

  function render() {
    // Pastel Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#fbcfe8');
    skyGrad.addColorStop(0.4, '#fed7aa');
    skyGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw Clouds
    clouds.forEach((c) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * 0.4, 0, Math.PI * 2);
      ctx.arc(c.x + c.size * 0.35, c.y - c.size * 0.1, c.size * 0.35, 0, Math.PI * 2);
      ctx.arc(c.x + c.size * 0.7, c.y, c.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Rolling Hills
    hills.forEach((h) => {
      ctx.fillStyle = h.color;
      ctx.beginPath();
      ctx.arc(h.x, h.y + 40, h.r, Math.PI, 0, false);
      ctx.fill();
    });

    // Candy Ground Layer
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
    groundGrad.addColorStop(0, '#4ade80');
    groundGrad.addColorStop(0.2, '#22c55e');
    groundGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, width, height - groundY);

    // Ground top border highlight
    ctx.fillStyle = '#86efac';
    ctx.fillRect(0, groundY, width, 5);

    // Striped Sugar Path
    ctx.fillStyle = '#16a34a';
    for (let x = -(distance * 8) % 40; x < width; x += 40) {
      ctx.fillRect(x, groundY + 12, 18, 6);
    }

    // Draw Collectibles
    collectibles.forEach((item) => {
      const bob = Math.sin(performance.now() * 0.006 + item.floatOffset) * 6;
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, item.x, item.y + bob);
    });

    // Draw Obstacles
    obstacles.forEach((ob) => {
      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ob.emoji, ob.x + ob.width / 2, ob.y + ob.height / 2);
    });

    // Draw Dino Hero
    drawDino();

    // Draw Particles
    particles.forEach((p) => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Floating Texts
    floatingTexts.forEach((t) => {
      ctx.save();
      ctx.font = 'bold 16px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = t.color;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });

    // Draw HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, width, 48);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⭐ ${score}`, 20, 24);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px "Outfit", sans-serif';
    ctx.fillText(`HI: ${highScore}  |  STARS: ${starsCollected}`, 150, 24);

    // Kid-Friendly Jump Prompt Button on Top Right
    ctx.fillStyle = '#22c55e';
    roundRect(ctx, width - 130, 8, 115, 32, 16);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🦘 TAP TO JUMP', width - 72, 24);

    // Game Over Overlay
    if (state === 'GAMEOVER') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 36px "Outfit", sans-serif';
      ctx.fillText('Oops! Bonk! 💥', width / 2, height / 2 - 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = '22px "Outfit", sans-serif';
      ctx.fillText(`Score: ${score}  •  Stars: ${starsCollected} ⭐`, width / 2, height / 2 - 10);

      // Play Again Button
      ctx.fillStyle = '#22c55e';
      roundRect(ctx, width / 2 - 110, height / 2 + 30, 220, 52, 26);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Outfit", sans-serif';
      ctx.fillText('Tap to Play Again! 🦖', width / 2, height / 2 + 62);
    }
  }

  function drawDino() {
    ctx.save();
    ctx.translate(dino.x + dino.width / 2, dino.y + dino.height / 2);
    ctx.rotate(dino.rotation);

    // Rainbow shield aura
    if (dino.shieldTimer > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, dino.width * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Dino Body (chubby happy green dinosaur)
    const dinoGreen = '#22c55e';
    const dinoDark = '#16a34a';
    const dinoBelly = '#86efac';

    // Tail
    ctx.fillStyle = dinoGreen;
    ctx.beginPath();
    ctx.moveTo(-16, 8);
    ctx.lineTo(-28, 2);
    ctx.lineTo(-18, 16);
    ctx.closePath();
    ctx.fill();

    // Spikes on back
    ctx.fillStyle = '#facc15';
    [-12, -4, 4].forEach((sx) => {
      ctx.beginPath();
      ctx.moveTo(sx - 4, -14);
      ctx.lineTo(sx, -22);
      ctx.lineTo(sx + 4, -14);
      ctx.closePath();
      ctx.fill();
    });

    // Body oval
    ctx.fillStyle = dinoGreen;
    ctx.beginPath();
    ctx.ellipse(0, 2, 20, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Light belly
    ctx.fillStyle = dinoBelly;
    ctx.beginPath();
    ctx.ellipse(6, 6, 12, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Head / Snout
    ctx.fillStyle = dinoGreen;
    ctx.beginPath();
    ctx.ellipse(10, -10, 16, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Big Cartoon Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(14, -13, 6, 0, Math.PI * 2);
    ctx.fill();

    // Pupil looking forward
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(16, -13, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // Eye sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(17, -14.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Rosy Pink Cheek
    ctx.fillStyle = 'rgba(244, 63, 94, 0.55)';
    ctx.beginPath();
    ctx.arc(11, -5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Smiling mouth
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(18, -4, 4, 0.2, Math.PI * 0.7);
    ctx.stroke();

    // Feet animation
    ctx.fillStyle = dinoDark;
    if (dino.isGrounded) {
      const legOffset = Math.sin(dino.runFrame) * 6;
      // Left foot
      roundRect(ctx, -10 + legOffset, 18, 10, 8, 4);
      ctx.fill();
      // Right foot
      roundRect(ctx, 4 - legOffset, 18, 10, 8, 4);
      ctx.fill();
    } else {
      // Tucked feet in air
      roundRect(ctx, -8, 16, 8, 8, 4);
      roundRect(ctx, 4, 16, 8, 8, 4);
      ctx.fill();
    }

    ctx.restore();
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  animId = requestAnimationFrame(tick);

  return {
    destroy: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    },
    restart: () => {
      restart();
    },
    toggleSound: () => {
      isMuted = !isMuted;
      return isMuted;
    }
  };
};
