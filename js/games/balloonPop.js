/**
 * Balloon Pop Blitz: Kids Balloon Popping Game Engine
 * Colorful, joyful balloon popping with realistic pop sounds, confetti bursts, and stars!
 */

window.createBalloonPopGame = function (canvasId, onScoreUpdate, onGameOver) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');

  const width = 600;
  const height = 650;
  canvas.width = width;
  canvas.height = height;

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

      if (type === 'pop') {
        // Cheerful bouncy rubber pop
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const freq = 450 + Math.random() * 250;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'star') {
        // Bright star chime
        [784, 988, 1175, 1568].forEach((f, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.04);
          gain.gain.setValueAtTime(0.2, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.05);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + (i + 1) * 0.05);
        });
      } else if (type === 'rainbow') {
        // Triumphant rainbow fanfare
        [523, 659, 784, 1046, 1318].forEach((f, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.06);
          gain.gain.setValueAtTime(0.22, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.08);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + (i + 1) * 0.08);
        });
      }
    } catch (e) {}
  }

  const BALLOON_PALETTES = [
    { name: 'Red', fill: '#ef4444', light: '#f87171', shadow: '#b91c1c' },
    { name: 'Blue', fill: '#3b82f6', light: '#60a5fa', shadow: '#1d4ed8' },
    { name: 'Green', fill: '#10b981', light: '#34d399', shadow: '#047857' },
    { name: 'Yellow', fill: '#facc15', light: '#fde047', shadow: '#ca8a04' },
    { name: 'Purple', fill: '#a855f7', light: '#c084fc', shadow: '#7e22ce' },
    { name: 'Orange', fill: '#f97316', light: '#fb923c', shadow: '#c2410c' },
    { name: 'Pink', fill: '#ec4899', light: '#f472b6', shadow: '#be185d' },
    { name: 'Cyan', fill: '#06b6d4', light: '#22d3ee', shadow: '#0e7490' }
  ];

  let score = 0;
  let balloonsPopped = 0;
  let combo = 0;
  let lastPopTime = 0;
  let gameMode = 'zen'; // 'zen' or 'blitz'
  let timeLeft = 60; // seconds for blitz mode
  let isGameOver = false;

  let balloons = [];
  let confetti = [];
  let floatingTexts = [];
  let clouds = [];
  let spawnTimer = 0;
  let animId = null;
  let lastTick = performance.now();

  // Initialize gentle background clouds
  for (let i = 0; i < 6; i++) {
    clouds.push({
      x: Math.random() * width,
      y: 40 + Math.random() * 200,
      width: 70 + Math.random() * 60,
      speed: 0.15 + Math.random() * 0.25,
      opacity: 0.25 + Math.random() * 0.3
    });
  }

  function spawnBalloon() {
    const palette = BALLOON_PALETTES[Math.floor(Math.random() * BALLOON_PALETTES.length)];
    const roll = Math.random();
    let type = 'regular';
    let icon = '';
    let bonus = 10;

    if (roll < 0.08) {
      type = 'rainbow';
      icon = '🌈';
      bonus = 50;
    } else if (roll < 0.18) {
      type = 'star';
      icon = '⭐';
      bonus = 30;
    } else if (roll < 0.26) {
      type = 'heart';
      icon = '💖';
      bonus = 20;
    }

    const radius = 32 + Math.random() * 14;
    const x = radius + Math.random() * (width - radius * 2);

    balloons.push({
      x,
      y: height + radius + 10,
      baseX: x,
      radius,
      palette,
      type,
      icon,
      bonus,
      speed: 1.2 + Math.random() * 1.6 + (gameMode === 'blitz' ? 0.6 : 0),
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      wobbleAmp: 10 + Math.random() * 15,
      phase: Math.random() * Math.PI * 2,
      popped: false
    });
  }

  function createConfettiBurst(x, y, count, isSpecial) {
    const colors = isSpecial
      ? ['#ff0055', '#ff9900', '#ffee00', '#33cc33', '#0099ff', '#9933ff', '#ffffff']
      : ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.5;
      confetti.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        alpha: 1,
        life: 0.8 + Math.random() * 0.6
      });
    }
  }

  function addFloatingText(x, y, text, color) {
    floatingTexts.push({
      x,
      y,
      text,
      color,
      vy: -1.8,
      alpha: 1,
      scale: 1.2
    });
  }

  function popBalloon(balloon, index) {
    initAudio();
    balloon.popped = true;
    balloonsPopped++;

    const now = performance.now();
    if (now - lastPopTime < 800) {
      combo++;
    } else {
      combo = 1;
    }
    lastPopTime = now;

    let pts = balloon.bonus * Math.min(combo, 5);
    score += pts;
    if (onScoreUpdate) onScoreUpdate(score);

    if (balloon.type === 'rainbow') {
      playSound('rainbow');
      createConfettiBurst(balloon.x, balloon.y, 45, true);
      addFloatingText(balloon.x, balloon.y, `RAINBOW PARTY! +${pts}`, '#f43f5e');
      // Pop all nearby balloons
      balloons.forEach((other) => {
        if (!other.popped && Math.hypot(other.x - balloon.x, other.y - balloon.y) < 180) {
          other.popped = true;
          balloonsPopped++;
          score += other.bonus;
          createConfettiBurst(other.x, other.y, 16, false);
        }
      });
    } else if (balloon.type === 'star') {
      playSound('star');
      createConfettiBurst(balloon.x, balloon.y, 25, true);
      addFloatingText(balloon.x, balloon.y, `SUPER STAR! +${pts}`, '#eab308');
    } else {
      playSound('pop');
      createConfettiBurst(balloon.x, balloon.y, 18, false);
      const text = combo > 1 ? `+${pts} (${combo}x!)` : `+${pts}`;
      addFloatingText(balloon.x, balloon.y, text, balloon.palette.light);
    }

    balloons.splice(index, 1);
  }

  function handleInteraction(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // Check click on mode switch buttons (top left)
    if (y < 45) {
      if (x >= 16 && x <= 110) {
        gameMode = 'zen';
        score = 0;
        balloonsPopped = 0;
        combo = 0;
        return;
      } else if (x >= 120 && x <= 220) {
        gameMode = 'blitz';
        score = 0;
        balloonsPopped = 0;
        combo = 0;
        timeLeft = 60;
        isGameOver = false;
        return;
      }
    }

    if (isGameOver) {
      restart();
      return;
    }

    // Check hit test on balloons (reverse to pop top-most first)
    for (let i = balloons.length - 1; i >= 0; i--) {
      const b = balloons[i];
      const dist = Math.hypot(b.x - x, b.y - y);
      if (dist <= b.radius * 1.15) {
        popBalloon(b, i);
        break; // pop one per tap/click
      }
    }
  }

  canvas.addEventListener('mousedown', (e) => {
    handleInteraction(e.clientX, e.clientY);
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (let i = 0; i < e.touches.length; i++) {
      handleInteraction(e.touches[i].clientX, e.touches[i].clientY);
    }
  }, { passive: false });

  function restart() {
    score = 0;
    balloonsPopped = 0;
    combo = 0;
    timeLeft = 60;
    isGameOver = false;
    balloons = [];
    confetti = [];
    floatingTexts = [];
    if (onScoreUpdate) onScoreUpdate(0);
  }

  // Game Loop
  function tick(now) {
    animId = requestAnimationFrame(tick);
    const dt = Math.min((now - lastTick) / 1000, 0.1);
    lastTick = now;

    // Countdown timer for blitz mode
    if (gameMode === 'blitz' && !isGameOver) {
      timeLeft -= dt;
      if (timeLeft <= 0) {
        timeLeft = 0;
        isGameOver = true;
        if (onGameOver) onGameOver(score);
      }
    }

    // Spawn balloons
    spawnTimer += dt;
    const spawnRate = gameMode === 'blitz' ? 0.35 : 0.55;
    if (!isGameOver && spawnTimer > spawnRate && balloons.length < 16) {
      spawnBalloon();
      spawnTimer = 0;
    }

    // Update balloons
    for (let i = balloons.length - 1; i >= 0; i--) {
      const b = balloons[i];
      b.y -= b.speed * 60 * dt;
      b.phase += b.wobbleSpeed * 60 * dt;
      b.x = b.baseX + Math.sin(b.phase) * b.wobbleAmp;

      // Remove if escaped top
      if (b.y < -b.radius - 20) {
        balloons.splice(i, 1);
        if (gameMode === 'blitz') combo = 0;
      }
    }

    // Update confetti
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 2.2 * dt; // gravity
      c.rotation += c.rotSpeed;
      c.alpha -= dt / c.life;
      if (c.alpha <= 0 || c.y > height + 20) {
        confetti.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const t = floatingTexts[i];
      t.y += t.vy * 60 * dt;
      t.alpha -= 0.85 * dt;
      t.scale = Math.max(1, t.scale - dt);
      if (t.alpha <= 0) {
        floatingTexts.splice(i, 1);
      }
    }

    // Update clouds
    clouds.forEach((c) => {
      c.x += c.speed;
      if (c.x > width + 80) c.x = -80;
    });

    render();
  }

  function render() {
    // Joyful sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(0.5, '#7dd3fc');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw clouds
    clouds.forEach((c) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${c.opacity})`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.width * 0.35, 0, Math.PI * 2);
      ctx.arc(c.x + c.width * 0.25, c.y - c.width * 0.15, c.width * 0.3, 0, Math.PI * 2);
      ctx.arc(c.x + c.width * 0.5, c.y, c.width * 0.3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Balloons
    balloons.forEach((b) => {
      ctx.save();
      ctx.translate(b.x, b.y);

      // Balloon string
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, b.radius);
      ctx.quadraticCurveTo(
        Math.sin(b.phase * 2) * 8,
        b.radius + 18,
        Math.cos(b.phase) * 6,
        b.radius + 36
      );
      ctx.stroke();

      // Balloon body (oval shape)
      ctx.beginPath();
      ctx.ellipse(0, 0, b.radius * 0.88, b.radius, 0, 0, Math.PI * 2);

      if (b.type === 'rainbow') {
        const rainbowGrad = ctx.createLinearGradient(-b.radius, -b.radius, b.radius, b.radius);
        rainbowGrad.addColorStop(0, '#f43f5e');
        rainbowGrad.addColorStop(0.2, '#f97316');
        rainbowGrad.addColorStop(0.4, '#eab308');
        rainbowGrad.addColorStop(0.6, '#10b981');
        rainbowGrad.addColorStop(0.8, '#3b82f6');
        rainbowGrad.addColorStop(1, '#a855f7');
        ctx.fillStyle = rainbowGrad;
      } else {
        const bGrad = ctx.createRadialGradient(
          -b.radius * 0.3,
          -b.radius * 0.3,
          b.radius * 0.1,
          0,
          0,
          b.radius
        );
        bGrad.addColorStop(0, b.palette.light);
        bGrad.addColorStop(0.65, b.palette.fill);
        bGrad.addColorStop(1, b.palette.shadow);
        ctx.fillStyle = bGrad;
      }
      ctx.fill();

      // Balloon knot at bottom
      ctx.fillStyle = b.type === 'rainbow' ? '#f43f5e' : b.palette.shadow;
      ctx.beginPath();
      ctx.moveTo(-4, b.radius);
      ctx.lineTo(4, b.radius);
      ctx.lineTo(6, b.radius + 6);
      ctx.lineTo(-6, b.radius + 6);
      ctx.closePath();
      ctx.fill();

      // Glossy highlight shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.ellipse(-b.radius * 0.32, -b.radius * 0.35, b.radius * 0.22, b.radius * 0.36, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Icon in center if special
      if (b.icon) {
        ctx.font = `${Math.round(b.radius * 0.8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.icon, 0, 2);
      }

      ctx.restore();
    });

    // Draw Confetti
    confetti.forEach((c) => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((c.rotation * Math.PI) / 180);
      ctx.fillStyle = c.color;
      ctx.globalAlpha = Math.max(0, c.alpha);
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
      ctx.restore();
    });

    // Draw Floating Score Texts
    floatingTexts.forEach((t) => {
      ctx.save();
      ctx.font = `bold ${Math.round(20 * t.scale)}px "Outfit", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = t.color;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });

    // HUD & Header Bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, 0, width, 52);

    // Mode Selector Pills
    // Zen Mode Tab
    ctx.fillStyle = gameMode === 'zen' ? '#6366f1' : 'rgba(255,255,255,0.12)';
    roundRect(ctx, 14, 10, 96, 32, 16);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🫧 Zen Pop', 62, 26);

    // Blitz Mode Tab
    ctx.fillStyle = gameMode === 'blitz' ? '#ec4899' : 'rgba(255,255,255,0.12)';
    roundRect(ctx, 118, 10, 104, 32, 16);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('⚡ 60s Blitz', 170, 26);

    // Right Side: Score & Popped
    ctx.textAlign = 'right';
    ctx.font = 'bold 16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`SCORE: ${score}`, width - 18, 22);

    ctx.font = '12px "Outfit", sans-serif';
    ctx.fillStyle = '#94a3b8';
    if (gameMode === 'blitz') {
      const sec = Math.ceil(timeLeft);
      ctx.fillText(`⏱️ TIME: ${sec}s  |  🎈 ${balloonsPopped}`, width - 18, 40);
    } else {
      ctx.fillText(`🎈 POPPED: ${balloonsPopped}`, width - 18, 40);
    }

    // Combo Streak Indicator
    if (combo > 1) {
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🔥 ${combo}X COMBO!`, width / 2, 26);
    }

    // Blitz Game Over Modal
    if (isGameOver) {
      ctx.fillStyle = 'rgba(7, 10, 18, 0.82)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 36px "Outfit", sans-serif';
      ctx.fillText('🎉 TIME IS UP! 🎉', width / 2, height / 2 - 60);

      ctx.fillStyle = '#ffffff';
      ctx.font = '20px "Outfit", sans-serif';
      ctx.fillText(`You popped ${balloonsPopped} balloons!`, width / 2, height / 2 - 15);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 32px "JetBrains Mono", monospace';
      ctx.fillText(`FINAL SCORE: ${score}`, width / 2, height / 2 + 30);

      // Play Again Button
      ctx.fillStyle = '#ec4899';
      roundRect(ctx, width / 2 - 100, height / 2 + 70, 200, 48, 24);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px "Outfit", sans-serif';
      ctx.fillText('Play Again 🎈', width / 2, height / 2 + 94);
    }
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

  // Pre-populate some balloons
  for (let i = 0; i < 5; i++) {
    spawnBalloon();
    balloons[i].y = height - 80 - i * 100;
  }

  animId = requestAnimationFrame(tick);

  return {
    destroy: () => {
      cancelAnimationFrame(animId);
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
