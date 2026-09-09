/**
 * Algo Dungeon: Big-O Crawler Game Engine
 * Cyber-fantasy dungeon crawler powered by algorithms and data structures!
 */

window.createAlgoDungeonGame = function (canvasId, onScoreUpdate, onGameOver) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');

  const width = 700;
  const height = 520;
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

      if (type === 'binarySearch') {
        // High-precision laser slice (O(log N))
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'hashMap') {
        // Instant O(1) teleport strike
        [988, 1318].forEach((f, i) => {
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
      } else if (type === 'mergeSort') {
        // Dividing and merging chord
        [440, 554, 659, 880].forEach((f, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          gain.gain.setValueAtTime(0.18, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.06);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + (i + 1) * 0.06);
        });
      } else if (type === 'dpShield') {
        // Hum of memoization shield
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'monsterHit') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.15);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'win') {
        [523, 659, 784, 1046, 1318].forEach((f, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.08);
          gain.gain.setValueAtTime(0.25, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.09);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + (i + 1) * 0.09);
        });
      }
    } catch (e) {}
  }

  // Dungeon State
  const SPELLS = [
    {
      id: 'binarySearch',
      key: '1',
      name: 'Binary Search Laser',
      bigO: 'O(log N)',
      cost: 15,
      cooldown: 0.35,
      color: '#38bdf8',
      desc: 'Pierces through rows of enemies with divide-and-conquer laser beam!'
    },
    {
      id: 'hashMap',
      key: '2',
      name: 'O(1) Hash Strike',
      bigO: 'O(1)',
      cost: 25,
      cooldown: 0.5,
      color: '#a855f7',
      desc: 'Instant-cast teleport strike directly on nearest target!'
    },
    {
      id: 'mergeSort',
      key: '3',
      name: 'Merge Sort Whirlwind',
      bigO: 'O(N log N)',
      cost: 35,
      cooldown: 0.8,
      color: '#10b981',
      desc: 'Splits and reorders chaotic swarms with area-of-effect damage!'
    },
    {
      id: 'dpShield',
      key: '4',
      name: 'DP Memo Shield',
      bigO: 'O(N)',
      cost: 30,
      cooldown: 1.5,
      color: '#f59e0b',
      desc: 'Caches damage states, granting invulnerability and reflective barrier!'
    }
  ];

  let selectedSpellIdx = 0;
  let spellCooldowns = [0, 0, 0, 0];

  // Player State
  const player = {
    x: width / 2,
    y: height / 2 + 50,
    r: 18,
    speed: 3.8,
    health: 100,
    maxHealth: 100,
    cpuCycles: 100,
    maxCpuCycles: 100,
    shieldTimer: 0,
    facing: 'up' // up, down, left, right
  };

  const keys = { w: false, a: false, s: false, d: false };

  let currentChamber = 1;
  const maxChambers = 3;
  let score = 0;
  let state = 'PLAYING'; // PLAYING, VICTORY, GAMEOVER

  let enemies = [];
  let projectiles = [];
  let particles = [];
  let floatingTexts = [];
  let items = [];
  let animId = null;
  let lastTime = performance.now();

  function spawnChamber(chamberNum) {
    currentChamber = chamberNum;
    enemies = [];
    projectiles = [];
    items = [];
    player.x = width / 2;
    player.y = height - 90;

    if (chamberNum === 1) {
      // Chamber 1: Nested Loop Slimes (O(N^2))
      for (let i = 0; i < 6; i++) {
        enemies.push({
          x: 100 + (i % 3) * 200,
          y: 90 + Math.floor(i / 3) * 110,
          r: 20,
          type: 'slime',
          name: 'Nested Loop Slime',
          bigO: 'O(N²)',
          health: 35,
          maxHealth: 35,
          speed: 1.1,
          color: '#ec4899',
          emoji: '👾'
        });
      }
      // Pickups
      items.push({ x: 200, y: height / 2, type: 'ram', label: '16GB RAM (+HP)', icon: '💾' });
      items.push({ x: width - 200, y: height / 2, type: 'cpu', label: 'Overclock (+CPU)', icon: '⚡' });
    } else if (chamberNum === 2) {
      // Chamber 2: Bubble Sort Golems & Recursion Wisps
      for (let i = 0; i < 4; i++) {
        enemies.push({
          x: 140 + i * 140,
          y: 90 + (i % 2) * 70,
          r: 26,
          type: 'golem',
          name: 'Bubble Sort Golem',
          bigO: 'O(N²)',
          health: 70,
          maxHealth: 70,
          speed: 0.9,
          color: '#f97316',
          emoji: '🗿'
        });
      }
      for (let i = 0; i < 3; i++) {
        enemies.push({
          x: 180 + i * 160,
          y: 220,
          r: 16,
          type: 'wisp',
          name: 'Recursion Wisp',
          bigO: 'O(2ⁿ)',
          health: 30,
          maxHealth: 30,
          speed: 1.8,
          color: '#a855f7',
          emoji: '👻'
        });
      }
    } else if (chamberNum === 3) {
      // Chamber 3: The Exponential Monolith Boss (O(2^N))
      enemies.push({
        x: width / 2,
        y: 130,
        r: 44,
        type: 'boss',
        name: 'The Exponential Monolith',
        bigO: 'O(2ⁿ)',
        health: 350,
        maxHealth: 350,
        speed: 0.8,
        color: '#dc2626',
        emoji: '🐉',
        attackTimer: 0
      });
    }

    addFloatingText(width / 2, height / 2 - 40, `CHAMBER ${chamberNum}: MEMORY HEAP`, '#38bdf8');
  }

  function castSpell(spellIdx) {
    initAudio();
    if (state !== 'PLAYING') return;

    const spell = SPELLS[spellIdx];
    if (spellCooldowns[spellIdx] > 0) return;
    if (player.cpuCycles < spell.cost) {
      addFloatingText(player.x, player.y - 20, 'Not enough CPU Cycles! ⚡', '#f87171');
      return;
    }

    player.cpuCycles -= spell.cost;
    spellCooldowns[spellIdx] = spell.cooldown;

    if (spell.id === 'binarySearch') {
      // Fires a fast piercing laser in facing direction
      playSound('binarySearch');
      let vx = 0, vy = -12;
      if (player.facing === 'down') { vx = 0; vy = 12; }
      else if (player.facing === 'left') { vx = -12; vy = 0; }
      else if (player.facing === 'right') { vx = 12; vy = 0; }

      projectiles.push({
        x: player.x,
        y: player.y,
        vx,
        vy,
        r: 8,
        damage: 40,
        color: spell.color,
        pierce: true,
        type: 'laser'
      });
      addFloatingText(player.x, player.y - 25, 'O(log N) LASER! ⚡', spell.color);
    } else if (spell.id === 'hashMap') {
      // Instantly damages nearest enemy (O(1) lookup!)
      playSound('hashMap');
      let nearest = null;
      let minDist = Infinity;
      enemies.forEach((e) => {
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d < minDist) {
          minDist = d;
          nearest = e;
        }
      });

      if (nearest) {
        nearest.health -= 55;
        createSparks(nearest.x, nearest.y, 20, spell.color);
        addFloatingText(nearest.x, nearest.y - 20, 'O(1) HASH STRIKE! -55', spell.color);
        if (nearest.health <= 0) onEnemyDefeated(nearest);
      } else {
        addFloatingText(player.x, player.y - 20, 'Key not found in Map!', '#94a3b8');
      }
    } else if (spell.id === 'mergeSort') {
      // 8-directional whirlwind projectiles
      playSound('mergeSort');
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        projectiles.push({
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * 8.5,
          vy: Math.sin(angle) * 8.5,
          r: 7,
          damage: 30,
          color: spell.color,
          type: 'orb'
        });
      }
      addFloatingText(player.x, player.y - 25, 'O(N log N) MERGE! 🌪️', spell.color);
    } else if (spell.id === 'dpShield') {
      // Invulnerability shield
      playSound('dpShield');
      player.shieldTimer = 4.5; // 4.5 seconds
      createSparks(player.x, player.y, 25, spell.color);
      addFloatingText(player.x, player.y - 25, 'MEMOIZATION SHIELD! 🛡️', spell.color);
    }
  }

  function onEnemyDefeated(enemy) {
    playSound('monsterHit');
    createSparks(enemy.x, enemy.y, 25, enemy.color);
    const pts = enemy.type === 'boss' ? 1000 : 150;
    score += pts;
    if (onScoreUpdate) onScoreUpdate(score);
    addFloatingText(enemy.x, enemy.y - 15, `+${pts} CPU PTS`, '#facc15');

    const idx = enemies.indexOf(enemy);
    if (idx !== -1) enemies.splice(idx, 1);

    // Check if chamber cleared
    if (enemies.length === 0) {
      if (currentChamber < maxChambers) {
        playSound('win');
        setTimeout(() => spawnChamber(currentChamber + 1), 1000);
      } else {
        // Victory!
        playSound('win');
        state = 'VICTORY';
        if (onGameOver) onGameOver(score);
      }
    }
  }

  function createSparks(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        r: 3 + Math.random() * 3,
        color: color || '#38bdf8',
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
      color: color || '#fff',
      vy: -1.4,
      alpha: 1
    });
  }

  // Keyboard Handler
  function handleKeyDown(e) {
    const k = e.key.toLowerCase();
    if (k === 'w' || e.code === 'ArrowUp') { keys.w = true; player.facing = 'up'; e.preventDefault(); }
    if (k === 's' || e.code === 'ArrowDown') { keys.s = true; player.facing = 'down'; e.preventDefault(); }
    if (k === 'a' || e.code === 'ArrowLeft') { keys.a = true; player.facing = 'left'; e.preventDefault(); }
    if (k === 'd' || e.code === 'ArrowRight') { keys.d = true; player.facing = 'right'; e.preventDefault(); }

    if (k === '1') castSpell(0);
    if (k === '2') castSpell(1);
    if (k === '3') castSpell(2);
    if (k === '4') castSpell(3);
    if (e.code === 'Space') {
      castSpell(selectedSpellIdx);
      e.preventDefault();
    }
  }

  function handleKeyUp(e) {
    const k = e.key.toLowerCase();
    if (k === 'w' || e.code === 'ArrowUp') keys.w = false;
    if (k === 's' || e.code === 'ArrowDown') keys.s = false;
    if (k === 'a' || e.code === 'ArrowLeft') keys.a = false;
    if (k === 'd' || e.code === 'ArrowRight') keys.d = false;
  }

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Mouse / Touch interaction on canvas
  canvas.addEventListener('mousedown', (e) => {
    initAudio();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check click on bottom spellbook hotbar
    if (clickY > height - 58) {
      const slotW = 140;
      const startX = (width - slotW * 4) / 2;
      const slotIdx = Math.floor((clickX - startX) / slotW);
      if (slotIdx >= 0 && slotIdx < 4) {
        selectedSpellIdx = slotIdx;
        castSpell(slotIdx);
        return;
      }
    }

    if (state === 'GAMEOVER' || state === 'VICTORY') {
      restart();
      return;
    }

    // Otherwise cast currently selected spell
    castSpell(selectedSpellIdx);
  });

  function restart() {
    score = 0;
    player.health = 100;
    player.cpuCycles = 100;
    player.shieldTimer = 0;
    state = 'PLAYING';
    spawnChamber(1);
    if (onScoreUpdate) onScoreUpdate(0);
  }

  // Initial chamber
  spawnChamber(1);

  // Game Loop
  function tick(now) {
    animId = requestAnimationFrame(tick);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Update cooldowns
    for (let i = 0; i < 4; i++) {
      if (spellCooldowns[i] > 0) {
        spellCooldowns[i] = Math.max(0, spellCooldowns[i] - dt);
      }
    }

    // Regen CPU Cycles
    player.cpuCycles = Math.min(player.maxCpuCycles, player.cpuCycles + 16 * dt);

    // Shield timer
    if (player.shieldTimer > 0) {
      player.shieldTimer = Math.max(0, player.shieldTimer - dt);
    }

    if (state === 'PLAYING') {
      // Move Player
      let dx = 0, dy = 0;
      if (keys.w) dy -= 1;
      if (keys.s) dy += 1;
      if (keys.a) dx -= 1;
      if (keys.d) dx += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      player.x += dx * player.speed * 60 * dt;
      player.y += dy * player.speed * 60 * dt;

      // Dungeon wall boundaries
      const pad = 36;
      player.x = Math.max(pad + player.r, Math.min(width - pad - player.r, player.x));
      player.y = Math.max(pad + player.r + 20, Math.min(height - pad - player.r - 54, player.y));

      // Update Items
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (Math.hypot(player.x - it.x, player.y - it.y) < player.r + 18) {
          if (it.type === 'ram') {
            player.health = Math.min(player.maxHealth, player.health + 40);
            addFloatingText(it.x, it.y, '+40 RAM HEALTH! 💾', '#10b981');
          } else if (it.type === 'cpu') {
            player.cpuCycles = player.maxCpuCycles;
            addFloatingText(it.x, it.y, 'MAX OVERCLOCK! ⚡', '#38bdf8');
          }
          playSound('win');
          items.splice(i, 1);
        }
      }

      // Update Projectiles
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;

        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (Math.hypot(p.x - e.x, p.y - e.y) < p.r + e.r) {
            e.health -= p.damage;
            playSound('monsterHit');
            createSparks(p.x, p.y, 8, p.color);
            addFloatingText(e.x, e.y - 15, `-${p.damage}`, p.color);

            if (!p.pierce) {
              projectiles.splice(i, 1);
            }
            if (e.health <= 0) {
              onEnemyDefeated(e);
            }
            break;
          }
        }

        // Out of bounds
        if (p.x < 20 || p.x > width - 20 || p.y < 20 || p.y > height - 60) {
          projectiles.splice(i, 1);
        }
      }

      // Update Enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        // Move towards player
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(angle) * e.speed * 60 * dt;
        e.y += Math.sin(angle) * e.speed * 60 * dt;

        // Boss attack cycle
        if (e.type === 'boss') {
          e.attackTimer = (e.attackTimer || 0) + dt;
          if (e.attackTimer > 2.2) {
            e.attackTimer = 0;
            // Spawn recursion wisps
            if (enemies.length < 5) {
              enemies.push({
                x: e.x + (Math.random() - 0.5) * 80,
                y: e.y + 40,
                r: 16,
                type: 'wisp',
                name: 'O(2ⁿ) Spawn',
                bigO: 'O(2ⁿ)',
                health: 25,
                maxHealth: 25,
                speed: 1.6,
                color: '#ec4899',
                emoji: '💥'
              });
              addFloatingText(e.x, e.y + 50, 'BRANCH SPAWN!', '#f43f5e');
            }
          }
        }

        // Collision with player
        if (Math.hypot(player.x - e.x, player.y - e.y) < player.r + e.r) {
          if (player.shieldTimer > 0) {
            // Shield repels and damages enemy
            e.health -= 25 * dt;
            createSparks(player.x, player.y, 4, '#f59e0b');
          } else {
            player.health -= 18 * dt;
            if (player.health <= 0) {
              player.health = 0;
              state = 'GAMEOVER';
              if (onGameOver) onGameOver(score);
            }
          }
        }
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
      t.alpha -= 0.85 * dt;
      if (t.alpha <= 0) floatingTexts.splice(i, 1);
    }

    render();
  }

  function render() {
    // Dungeon Floor (Dark stone bricks)
    ctx.fillStyle = '#0a0d18';
    ctx.fillRect(0, 0, width, height);

    // Draw Stone Tiles Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 36; x < width - 36; x += 44) {
      ctx.beginPath();
      ctx.moveTo(x, 36);
      ctx.lineTo(x, height - 70);
      ctx.stroke();
    }
    for (let y = 36; y < height - 70; y += 44) {
      ctx.beginPath();
      ctx.moveTo(36, y);
      ctx.lineTo(width - 36, y);
      ctx.stroke();
    }

    // Outer Dungeon Walls
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, width - 72, height - 100);

    // Glowing Runes in Corners
    ctx.font = '16px monospace';
    ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.fillText('0xDEAD', 46, 56);
    ctx.fillText('0xBEEF', width - 110, 56);
    ctx.fillText('O(1)', 46, height - 85);
    ctx.fillText('O(log N)', width - 110, height - 85);

    // Draw Items
    items.forEach((it) => {
      ctx.save();
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(it.icon, it.x, it.y);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(it.label, it.x, it.y + 20);
      ctx.restore();
    });

    // Draw Projectiles
    projectiles.forEach((p) => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Enemies
    enemies.forEach((e) => {
      ctx.save();
      ctx.translate(e.x, e.y);

      // Body circle / glow
      ctx.fillStyle = e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, e.r, 0, Math.PI * 2);
      ctx.fill();

      // Emoji Avatar
      ctx.font = `${Math.round(e.r * 1.2)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.emoji, 0, 0);

      // Big-O Badge Tag
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 4;
      ctx.fillText(e.bigO, 0, -e.r - 8);

      // Health Bar
      const barW = e.r * 2;
      const barH = 4;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-barW / 2, e.r + 6, barW, barH);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-barW / 2, e.r + 6, barW * (e.health / e.maxHealth), barH);

      ctx.restore();
    });

    // Draw Algo Wizard Player
    drawPlayer();

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
      ctx.font = 'bold 14px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = t.color;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 6;
      ctx.globalAlpha = Math.max(0, t.alpha);
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });

    // Top HUD Stats Bar
    ctx.fillStyle = 'rgba(10, 15, 29, 0.88)';
    ctx.fillRect(0, 0, width, 36);

    // HP Bar
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`HP: ${Math.round(player.health)}/${player.maxHealth}`, 20, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(115, 11, 100, 14);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(115, 11, Math.max(0, 100 * (player.health / player.maxHealth)), 14);

    // CPU Cycles Bar
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`CPU: ${Math.round(player.cpuCycles)}%`, 235, 18);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(305, 11, 100, 14);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(305, 11, Math.max(0, 100 * (player.cpuCycles / player.maxCpuCycles)), 14);

    // Chamber & Score
    ctx.textAlign = 'right';
    ctx.fillStyle = '#facc15';
    ctx.fillText(`SCORE: ${score}  |  CHAMBER ${currentChamber}/${maxChambers}`, width - 20, 18);

    // Bottom Spellbook Hotbar
    ctx.fillStyle = '#060810';
    ctx.fillRect(0, height - 60, width, 60);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, height - 60, width, 60);

    const slotW = 150;
    const startX = (width - slotW * 4) / 2;
    SPELLS.forEach((spell, i) => {
      const sx = startX + i * slotW;
      const sy = height - 54;
      const isSelected = selectedSpellIdx === i;
      const isCooling = spellCooldowns[i] > 0;

      ctx.save();
      ctx.fillStyle = isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = isSelected ? spell.color : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = isSelected ? 2 : 1;
      roundRect(ctx, sx, sy, slotW - 8, 48, 8);
      ctx.fill();
      ctx.stroke();

      // Key Badge
      ctx.fillStyle = isSelected ? spell.color : '#64748b';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`[${spell.key}]`, sx + 8, sy + 16);

      // Big O
      ctx.fillStyle = '#facc15';
      ctx.fillText(spell.bigO, sx + 32, sy + 16);

      // Spell Name
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Outfit", sans-serif';
      ctx.fillText(spell.name, sx + 8, sy + 32);

      // Cost
      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px monospace';
      ctx.fillText(`${spell.cost}⚡`, sx + slotW - 32, sy + 16);

      // Cooldown overlay
      if (isCooling) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        roundRect(ctx, sx, sy, slotW - 8, 48, 8);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${spellCooldowns[i].toFixed(1)}s`, sx + (slotW - 8) / 2, sy + 26);
      }

      ctx.restore();
    });

    // Game Over Overlay
    if (state === 'GAMEOVER') {
      ctx.fillStyle = 'rgba(10, 15, 29, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 36px "Outfit", sans-serif';
      ctx.fillText('💀 STACK OVERFLOW! 💀', width / 2, height / 2 - 40);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '18px "Outfit", sans-serif';
      ctx.fillText(`Final Algorithmic Score: ${score}`, width / 2, height / 2);

      ctx.fillStyle = '#38bdf8';
      roundRect(ctx, width / 2 - 110, height / 2 + 30, 220, 48, 24);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px "Outfit", sans-serif';
      ctx.fillText('Reboot Heap (Restart) 🔄', width / 2, height / 2 + 58);
    }

    // Victory Overlay
    if (state === 'VICTORY') {
      ctx.fillStyle = 'rgba(10, 15, 29, 0.88)';
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 36px "Outfit", sans-serif';
      ctx.fillText('🏆 O(1) MASTER CHAMPION! 🏆', width / 2, height / 2 - 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = '18px "Outfit", sans-serif';
      ctx.fillText(`All Big-O Monsters Vanquished! Final Score: ${score}`, width / 2, height / 2);

      ctx.fillStyle = '#10b981';
      roundRect(ctx, width / 2 - 110, height / 2 + 30, 220, 48, 24);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px "Outfit", sans-serif';
      ctx.fillText('Play Again ⚔️', width / 2, height / 2 + 58);
    }
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);

    // Memoization Shield aura
    if (player.shieldTimer > 0) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, player.r + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Hero Wizard Robe
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.arc(0, 0, player.r, 0, Math.PI * 2);
    ctx.fill();

    // Wizard Cloak trim
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wizard Hat / Face
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, -3, 6, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Staff Tip
    let staffX = 14, staffY = 0;
    if (player.facing === 'left') { staffX = -14; staffY = 0; }
    else if (player.facing === 'up') { staffX = 0; staffY = -14; }
    else if (player.facing === 'down') { staffX = 0; staffY = 14; }

    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(staffX, staffY, 4.5, 0, Math.PI * 2);
    ctx.fill();

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
      window.removeEventListener('keyup', handleKeyUp);
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
