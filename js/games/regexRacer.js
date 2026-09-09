/**
 * Regex Racer: High-Speed Pattern Matching Game Engine
 * Cyberpunk synthwave highway racer powered by regular expression pattern matching!
 */

window.createRegexRacerGame = function (containerId, onScoreUpdate, onGameOver) {
  const container = document.getElementById(containerId);
  if (!container) return null;

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

      if (type === 'boost') {
        // Futuristic nitro jet swoosh
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'hit') {
        // Laser pop explosion
        [587, 880, 1174].forEach((f, i) => {
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
      } else if (type === 'error') {
        // Low buzzy error
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.setValueAtTime(90, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      }
    } catch (e) {}
  }

  // Missions & Challenge Stages
  const CHALLENGES = [
    {
      level: 1,
      name: 'Digit Sprint',
      prompt: 'Match strings containing only digits (e.g. 404, 99)',
      hint: 'Try: \\d+ or [0-9]+',
      targets: [
        { text: '404', isGoal: true },
        { text: 'alpha', isGoal: false },
        { text: '99', isGoal: true },
        { text: 'test', isGoal: false },
        { text: '2026', isGoal: true }
      ]
    },
    {
      level: 2,
      name: 'Hashtag Highway',
      prompt: 'Match all hashtag tags starting with #',
      hint: 'Try: #\\w+ or #[a-z]+',
      targets: [
        { text: '#react', isGoal: true },
        { text: 'javascript', isGoal: false },
        { text: '#webdev', isGoal: true },
        { text: 'python', isGoal: false },
        { text: '#gaming', isGoal: true }
      ]
    },
    {
      level: 3,
      name: 'Error Code Interceptor',
      prompt: 'Match error codes starting with ERR_ followed by numbers',
      hint: 'Try: ERR_\\d+ or ERR_[0-9]+',
      targets: [
        { text: 'ERR_500', isGoal: true },
        { text: 'OK_200', isGoal: false },
        { text: 'ERR_403', isGoal: true },
        { text: 'SUCCESS', isGoal: false },
        { text: 'ERR_502', isGoal: true }
      ]
    },
    {
      level: 4,
      name: 'Email Vault',
      prompt: 'Match all valid email addresses with @',
      hint: 'Try: \\w+@\\w+\\.\\w+ or .*@.*',
      targets: [
        { text: 'dev@test.io', isGoal: true },
        { text: 'not_an_email', isGoal: false },
        { text: 'admin@corp.org', isGoal: true },
        { text: 'hello.world', isGoal: false },
        { text: 'user@portun.com', isGoal: true }
      ]
    },
    {
      level: 5,
      name: 'Vowel Overdrive',
      prompt: 'Match words starting with a vowel (A, E, I, O, U)',
      hint: 'Try: ^[aeiou]\\w*',
      targets: [
        { text: 'apple', isGoal: true },
        { text: 'banana', isGoal: false },
        { text: 'orange', isGoal: true },
        { text: 'melon', isGoal: false },
        { text: 'umbrella', isGoal: true }
      ]
    }
  ];

  let currentLevelIdx = 0;
  let score = 0;
  let nitro = 100;
  let combo = 0;
  let speed = 45; // virtual mph
  let targetSpeed = 45;
  let isBoosting = false;
  let boostTimer = 0;
  let animId = null;
  let lastTime = performance.now();

  // Setup DOM Structure
  container.innerHTML = `
    <div class="regex-racer-container" style="position: relative; width: 100%; max-width: 680px; margin: 0 auto; background: #070913; border-radius: 16px; overflow: hidden; font-family: var(--font-sans, sans-serif); color: #fff;">
      <!-- Canvas Viewport -->
      <canvas id="racerCanvas" width="680" height="420" style="display: block; width: 100%; height: auto; background: #05060c;"></canvas>

      <!-- Mission Control Bar -->
      <div class="racer-controls-pane" style="padding: 16px 20px; background: rgba(13, 17, 30, 0.95); border-top: 1px solid rgba(99, 102, 241, 0.3);">
        <!-- Mission Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="background: linear-gradient(135deg, #6366f1, #ec4899); color: #fff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px;" id="racerStageBadge">STAGE 1</span>
            <strong style="font-size: 14px; color: #f1f5f9;" id="racerPromptText">Match all numbers</strong>
          </div>
          <span style="font-size: 11px; color: #94a3b8; font-family: monospace;" id="racerHint">Hint: \\d+</span>
        </div>

        <!-- Regex Input Form -->
        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
          <span style="color: #38bdf8; font-family: monospace; font-size: 18px; font-weight: bold;">/</span>
          <input type="text" id="racerInput" placeholder="Type regex pattern (e.g. \\d+)..." autofocus autocomplete="off" spellcheck="false" style="flex: 1; background: rgba(0, 0, 0, 0.5); border: 1.5px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-family: 'JetBrains Mono', monospace; font-size: 16px; padding: 10px 14px; border-radius: 8px; outline: none; transition: border 0.2s;" />
          <span style="color: #38bdf8; font-family: monospace; font-size: 16px; font-weight: bold;">/i</span>
          <button id="racerSubmitBtn" class="btn btn-primary btn-sm" style="background: linear-gradient(135deg, #06b6d4, #6366f1); border: none; font-weight: bold; padding: 10px 18px; cursor: pointer; border-radius: 8px; color: #fff;">TEST & BOOST 🚀</button>
        </div>

        <!-- Quick Tokens Row for Touch / Ease -->
        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
          <span style="font-size: 11px; color: #64748b; margin-right: 4px;">Quick Tokens:</span>
          <button class="racer-token-btn" data-token="\\d+" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 4px; cursor: pointer;">\\d+</button>
          <button class="racer-token-btn" data-token="\\w+" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 4px; cursor: pointer;">\\w+</button>
          <button class="racer-token-btn" data-token="^" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 4px; cursor: pointer;">^start</button>
          <button class="racer-token-btn" data-token="$" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 4px; cursor: pointer;">end$</button>
          <button class="racer-token-btn" data-token="[A-Z]" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 4px; cursor: pointer;">[A-Z]</button>
          <button class="racer-token-btn" data-token=".*" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 4px; cursor: pointer;">.*</button>
          <button id="racerClearBtn" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; font-family: monospace; font-size: 11px; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-left: auto;">Clear ⌫</button>
        </div>
      </div>
    </div>
  `;

  const canvas = document.getElementById('racerCanvas');
  const ctx = canvas.getContext('2d');
  const inputEl = document.getElementById('racerInput');
  const submitBtn = document.getElementById('racerSubmitBtn');
  const promptEl = document.getElementById('racerPromptText');
  const badgeEl = document.getElementById('racerStageBadge');
  const hintEl = document.getElementById('racerHint');
  const clearBtn = document.getElementById('racerClearBtn');

  // Token buttons insert
  const tokenBtns = container.querySelectorAll('.racer-token-btn');
  tokenBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      initAudio();
      inputEl.value += btn.dataset.token;
      inputEl.focus();
      checkPatternLive();
    });
  });

  clearBtn.addEventListener('click', () => {
    inputEl.value = '';
    inputEl.focus();
    checkPatternLive();
  });

  // Racing Objects & Drones
  let targetDrones = [];
  let roadOffset = 0;
  let particles = [];
  let floatingTexts = [];

  function loadStage(idx) {
    const stage = CHALLENGES[idx % CHALLENGES.length];
    currentLevelIdx = idx % CHALLENGES.length;
    badgeEl.textContent = `STAGE ${currentLevelIdx + 1} OF ${CHALLENGES.length}`;
    promptEl.textContent = stage.prompt;
    hintEl.textContent = stage.hint;
    inputEl.value = '';

    // Position drones along the road
    targetDrones = stage.targets.map((t, i) => {
      const laneX = 140 + i * 95;
      return {
        text: t.text,
        isGoal: t.isGoal,
        x: laneX,
        y: 160 + (i % 2) * 50,
        width: 80,
        height: 38,
        matched: false,
        destroyed: false
      };
    });

    checkPatternLive();
  }

  function checkPatternLive() {
    const val = inputEl.value.trim();
    if (!val) {
      targetDrones.forEach((d) => (d.matched = false));
      inputEl.style.borderColor = 'rgba(56, 189, 248, 0.4)';
      return;
    }

    try {
      const reg = new RegExp(val, 'i');
      inputEl.style.borderColor = '#10b981';
      targetDrones.forEach((d) => {
        d.matched = reg.test(d.text);
      });
    } catch (e) {
      inputEl.style.borderColor = '#ef4444';
      targetDrones.forEach((d) => (d.matched = false));
    }
  }

  inputEl.addEventListener('input', checkPatternLive);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeBoost();
    }
  });

  submitBtn.addEventListener('click', () => {
    executeBoost();
  });

  function executeBoost() {
    initAudio();
    const val = inputEl.value.trim();
    if (!val) return;

    try {
      const reg = new RegExp(val, 'i');
      const allGoalsMatched = targetDrones.filter((d) => d.isGoal).every((d) => reg.test(d.text));
      const noBadMatched = !targetDrones.filter((d) => !d.isGoal).some((d) => reg.test(d.text));

      if (allGoalsMatched && noBadMatched) {
        // Success! Nitro Boost!
        playSound('boost');
        playSound('hit');
        isBoosting = true;
        boostTimer = 1.2;
        targetSpeed = 160;
        combo++;
        const pts = 250 * combo;
        score += pts;
        if (onScoreUpdate) onScoreUpdate(score);

        // Explode matched drones
        targetDrones.forEach((d) => {
          if (d.isGoal) {
            d.destroyed = true;
            createSparks(d.x + d.width / 2, d.y + d.height / 2, 25, '#10b981');
          }
        });

        addFloatingText(canvas.width / 2, 180, `NITRO BOOST! +${pts}`, '#38bdf8');

        // Transition to next level
        setTimeout(() => {
          if (currentLevelIdx + 1 < CHALLENGES.length) {
            loadStage(currentLevelIdx + 1);
          } else {
            // Victory lap
            addFloatingText(canvas.width / 2, 200, `🏆 CIRCUIT CHAMPION! FINAL SCORE: ${score}`, '#facc15');
            setTimeout(() => loadStage(0), 2000);
          }
        }, 1200);
      } else {
        // Partial or incorrect
        playSound('error');
        combo = 0;
        inputEl.style.animation = 'shake 0.3s';
        setTimeout(() => (inputEl.style.animation = ''), 300);

        if (!allGoalsMatched) {
          addFloatingText(canvas.width / 2, 200, 'Missing some goal targets!', '#f87171');
        } else {
          addFloatingText(canvas.width / 2, 200, 'Oops! Matched a decoy string!', '#f87171');
        }
      }
    } catch (e) {
      playSound('error');
      addFloatingText(canvas.width / 2, 200, 'Invalid Regex Syntax!', '#f87171');
    }
  }

  function createSparks(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 6;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color: color || '#38bdf8',
        r: 3 + Math.random() * 3,
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
      vy: -1.5,
      alpha: 1
    });
  }

  loadStage(0);

  // Animation Loop
  function tick(now) {
    animId = requestAnimationFrame(tick);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Boost timer
    if (isBoosting) {
      boostTimer -= dt;
      if (boostTimer <= 0) {
        isBoosting = false;
        targetSpeed = 45;
      }
    }

    // Smooth speed interpolation
    speed += (targetSpeed - speed) * 4 * dt;
    roadOffset = (roadOffset + speed * 60 * dt * 0.1) % 50;

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
      t.alpha -= 0.8 * dt;
      if (t.alpha <= 0) floatingTexts.splice(i, 1);
    }

    render();
  }

  function render() {
    const w = canvas.width;
    const h = canvas.height;

    // Dark synthwave sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    skyGrad.addColorStop(0, '#060713');
    skyGrad.addColorStop(0.6, '#180e29');
    skyGrad.addColorStop(1, '#3b0764');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Glowing Neon Synthwave Sun
    const sunX = w / 2;
    const sunY = h * 0.38;
    const sunR = 55;
    const sunGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
    sunGrad.addColorStop(0, '#fde047');
    sunGrad.addColorStop(0.5, '#ec4899');
    sunGrad.addColorStop(1, '#a855f7');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal sun laser slats
    ctx.fillStyle = '#060713';
    for (let i = 0; i < 5; i++) {
      const slatY = sunY + 8 + i * 8;
      ctx.fillRect(sunX - sunR, slatY, sunR * 2, 2.5 + i * 0.5);
    }

    // Perspective Highway Road
    const horizonY = h * 0.42;
    ctx.fillStyle = '#0a0d1a';
    ctx.beginPath();
    ctx.moveTo(w * 0.35, horizonY);
    ctx.lineTo(w * 0.65, horizonY);
    ctx.lineTo(w + 60, h);
    ctx.lineTo(-60, h);
    ctx.closePath();
    ctx.fill();

    // Road side neon boundaries
    ctx.strokeStyle = isBoosting ? '#38bdf8' : '#ec4899';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.35, horizonY);
    ctx.lineTo(-60, h);
    ctx.moveTo(w * 0.65, horizonY);
    ctx.lineTo(w + 60, h);
    ctx.stroke();

    // Dashed road lane markers
    ctx.strokeStyle = isBoosting ? '#00f2fe' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 10; i++) {
      const p = (i * 25 + roadOffset) % 250;
      const normY = p / 250;
      const y = horizonY + normY * (h - horizonY);
      const halfW = 40 + normY * (w * 0.45);
      ctx.beginPath();
      ctx.moveTo(w / 2 - halfW * 0.35, y);
      ctx.lineTo(w / 2 - halfW * 0.35, y + 10 + normY * 15);
      ctx.moveTo(w / 2 + halfW * 0.35, y);
      ctx.lineTo(w / 2 + halfW * 0.35, y + 10 + normY * 15);
      ctx.stroke();
    }

    // Speed Lines during Nitro
    if (isBoosting) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        const sx = Math.random() * w;
        const sy = Math.random() * h;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - 40, sy);
        ctx.stroke();
      }
    }

    // Draw Target Drones
    targetDrones.forEach((d) => {
      if (d.destroyed) return;

      ctx.save();
      // Target Box
      ctx.fillStyle = d.matched
        ? d.isGoal
          ? 'rgba(16, 185, 129, 0.9)'
          : 'rgba(239, 68, 68, 0.9)'
        : 'rgba(30, 41, 59, 0.85)';
      ctx.strokeStyle = d.matched
        ? d.isGoal
          ? '#10b981'
          : '#ef4444'
        : d.isGoal
        ? '#38bdf8'
        : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = d.matched ? 2.5 : 1.5;

      roundRect(ctx, d.x, d.y, d.width, d.height, 8);
      ctx.fill();
      ctx.stroke();

      // Target Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(d.text, d.x + d.width / 2, d.y + d.height / 2);

      // Status indicator tag
      if (d.matched && d.isGoal) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(d.x + d.width - 6, d.y + 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // Draw Player Race Car
    const carX = w / 2;
    const carY = h - 65;

    ctx.save();
    ctx.translate(carX, carY);

    // Nitro exhaust flame
    if (isBoosting) {
      const flameLen = 25 + Math.random() * 20;
      const flameGrad = ctx.createLinearGradient(0, 20, 0, 20 + flameLen);
      flameGrad.addColorStop(0, '#38bdf8');
      flameGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-10, 22);
      ctx.lineTo(0, 22 + flameLen);
      ctx.lineTo(10, 22);
      ctx.closePath();
      ctx.fill();
    }

    // Car Body (Aerodynamic Cyberpunk racer)
    ctx.fillStyle = isBoosting ? '#0284c7' : '#4338ca';
    ctx.strokeStyle = isBoosting ? '#38bdf8' : '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -32);
    ctx.lineTo(24, 15);
    ctx.lineTo(20, 24);
    ctx.lineTo(-20, 24);
    ctx.lineTo(-24, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Windshield
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(12, 6);
    ctx.lineTo(-12, 6);
    ctx.closePath();
    ctx.fill();

    // Spoiler
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(-26, 20, 52, 6);

    // Glowing Neon Taillights
    ctx.fillStyle = isBoosting ? '#00f2fe' : '#ef4444';
    ctx.fillRect(-18, 24, 8, 3);
    ctx.fillRect(10, 24, 8, 3);

    ctx.restore();

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
      ctx.font = 'bold 18px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = t.color;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });

    // Top Speed & HUD overlay
    ctx.fillStyle = 'rgba(10, 15, 29, 0.75)';
    ctx.fillRect(16, 14, 140, 36);
    roundRect(ctx, 16, 14, 140, 36, 8);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`⚡ ${Math.round(speed)} MPH`, 26, 38);

    ctx.fillStyle = 'rgba(10, 15, 29, 0.75)';
    ctx.fillRect(w - 180, 14, 164, 36);
    roundRect(ctx, w - 180, 14, 164, 36, 8);

    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE: ${score}`, w - 26, 38);
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
    },
    restart: () => {
      score = 0;
      combo = 0;
      loadStage(0);
      if (onScoreUpdate) onScoreUpdate(0);
    },
    toggleSound: () => {
      isMuted = !isMuted;
      return isMuted;
    }
  };
};
