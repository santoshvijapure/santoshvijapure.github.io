/**
 * Code Defender: Production Panic
 * A retro arcade shooter built for Santosh Vijapure's portfolio.
 * Features 60fps HTML5 Canvas rendering, Web Audio API sound synthesis,
 * particle engine, wave progression, touch/keyboard controls, and high scores.
 */

(function () {
  'use strict';

  // --- Audio Synthesizer (Web Audio API) ---
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playLaser() {
      if (this.isMuted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
      } catch (e) {}
    }

    playExplosion() {
      if (this.isMuted || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
      } catch (e) {}
    }

    playPowerup() {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.2, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.06);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + (idx + 1) * 0.06);
        });
      } catch (e) {}
    }

    playGameOver() {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [330, 293, 261, 196];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.14);
          gain.gain.setValueAtTime(0.25, now + idx * 0.14);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (idx + 1) * 0.14);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.14);
          osc.stop(now + (idx + 1) * 0.14);
        });
      } catch (e) {}
    }
  }

  // --- Game Engine ---
  class CodeDefender {
    constructor() {
      this.canvas = document.getElementById('arcadeCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.sounds = new SoundManager();

      this.width = 600;
      this.height = 700;
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      this.state = 'START'; // START, PLAYING, PAUSED, GAMEOVER, VICTORY
      this.score = 0;
      this.highScore = parseInt(localStorage.getItem('code_defender_highscore') || '0', 10);
      this.wave = 1;
      this.maxWaves = 3;

      this.keys = { left: false, right: false, shoot: false };
      this.lastShootTime = 0;

      this.player = null;
      this.bullets = [];
      this.enemies = [];
      this.particles = [];
      this.powerups = [];
      this.stars = [];

      this.initStars();
      this.initEventListeners();
      this.resetGame();

      this.lastFrameTime = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    }

    initStars() {
      this.stars = [];
      for (let i = 0; i < 80; i++) {
        this.stars.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: Math.random() * 2 + 0.8,
          speed: Math.random() * 2.5 + 0.8,
          color: ['#6366f1', '#06b6d4', '#a855f7', '#ffffff'][Math.floor(Math.random() * 4)]
        });
      }
    }

    resetGame() {
      this.player = {
        x: this.width / 2 - 20,
        y: this.height - 70,
        width: 44,
        height: 38,
        speed: 6.5,
        health: 3,
        maxHealth: 3,
        tripleShotTimer: 0,
        shieldTimer: 0,
        speedBoostTimer: 0
      };

      this.score = 0;
      this.wave = 1;
      this.bullets = [];
      this.enemies = [];
      this.particles = [];
      this.powerups = [];
      this.waveSpawnTimer = 0;
      this.boss = null;
      this.spawnWave(this.wave);
    }

    spawnWave(waveNum) {
      this.enemies = [];
      const waveNames = ['Betaflux Era (Syntax Bugs)', 'Airtel Scale (1M+ Outages)', 'Oportun Legacy Monolith (Boss)'];
      this.currentWaveName = waveNames[waveNum - 1] || `Wave ${waveNum}`;

      if (waveNum === 1) {
        // Wave 1: NullPointers & Basic bugs
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 6; col++) {
            this.enemies.push({
              x: 60 + col * 80,
              y: 60 + row * 45,
              width: 38,
              height: 28,
              type: row === 0 ? 'NullPointer' : 'SyntaxError',
              health: 1,
              maxHealth: 1,
              speedX: 1.5,
              direction: 1,
              points: 100,
              color: row === 0 ? '#f43f5e' : '#fb923c'
            });
          }
        }
      } else if (waveNum === 2) {
        // Wave 2: MemoryLeaks & Wavy Spaghetti Code
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 7; col++) {
            this.enemies.push({
              x: 50 + col * 72,
              y: 50 + row * 45,
              width: 36,
              height: 30,
              type: row === 0 ? 'MemoryLeak' : 'SpaghettiCode',
              health: row === 0 ? 2 : 1,
              maxHealth: row === 0 ? 2 : 1,
              speedX: 2.2,
              direction: 1,
              points: 200,
              color: row === 0 ? '#ec4899' : '#06b6d4'
            });
          }
        }
      } else if (waveNum === 3) {
        // Wave 3: Boss fight against the Legacy Monolith
        this.enemies.push({
          x: this.width / 2 - 80,
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

    spawnPowerup(x, y) {
      if (Math.random() < 0.28) {
        const types = ['triple', 'shield', 'coffee'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.powerups.push({
          x: x,
          y: y,
          width: 24,
          height: 24,
          type: type,
          speedY: 2.2
        });
      }
    }

    addParticles(x, y, color, count = 12) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1.5,
          color: color,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02
        });
      }
    }

    initEventListeners() {
      window.addEventListener('keydown', (e) => {
        if (!this.isModalOpen()) return;
        this.sounds.init();

        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
        if (e.code === 'Space') {
          this.keys.shoot = true;
          if (this.state === 'START' || this.state === 'GAMEOVER' || this.state === 'VICTORY') {
            this.resetGame();
            this.state = 'PLAYING';
          }
          e.preventDefault();
        }
        if (e.code === 'KeyP') {
          if (this.state === 'PLAYING') this.state = 'PAUSED';
          else if (this.state === 'PAUSED') this.state = 'PLAYING';
        }
        if (e.code === 'KeyM') {
          this.sounds.isMuted = !this.sounds.isMuted;
          this.updateSoundBtn();
        }
        if (e.code === 'Escape') {
          closeArcadeModal();
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
        if (e.code === 'Space') this.keys.shoot = false;
      });

      // Virtual Mobile Touch Controls
      const touchLeft = document.getElementById('touchLeft');
      const touchRight = document.getElementById('touchRight');
      const touchFire = document.getElementById('touchFire');

      if (touchLeft && touchRight && touchFire) {
        touchLeft.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.left = true; });
        touchLeft.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.left = false; });

        touchRight.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys.right = true; });
        touchRight.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.right = false; });

        touchFire.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.sounds.init();
          this.keys.shoot = true;
          if (this.state === 'START' || this.state === 'GAMEOVER' || this.state === 'VICTORY') {
            this.resetGame();
            this.state = 'PLAYING';
          }
        });
        touchFire.addEventListener('touchend', (e) => { e.preventDefault(); this.keys.shoot = false; });
      }

      // Sound toggle button in HUD
      const soundBtn = document.getElementById('arcadeSoundToggle');
      if (soundBtn) {
        soundBtn.addEventListener('click', () => {
          this.sounds.init();
          this.sounds.isMuted = !this.sounds.isMuted;
          this.updateSoundBtn();
        });
      }

      // Close modal button
      const closeBtn = document.getElementById('closeArcadeBtn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => closeArcadeModal());
      }
    }

    updateSoundBtn() {
      const btn = document.getElementById('arcadeSoundToggle');
      if (btn) {
        btn.innerHTML = this.sounds.isMuted 
          ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg> Muted`
          : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> Sound On`;
      }
    }

    isModalOpen() {
      const modal = document.getElementById('arcadeModal');
      return modal && modal.classList.contains('active');
    }

    update() {
      if (this.state !== 'PLAYING') return;

      const currentSpeed = this.player.speedBoostTimer > 0 ? this.player.speed * 1.5 : this.player.speed;
      if (this.keys.left) this.player.x = Math.max(10, this.player.x - currentSpeed);
      if (this.keys.right) this.player.x = Math.min(this.width - this.player.width - 10, this.player.x + currentSpeed);

      // Decrement timers
      if (this.player.tripleShotTimer > 0) this.player.tripleShotTimer--;
      if (this.player.shieldTimer > 0) this.player.shieldTimer--;
      if (this.player.speedBoostTimer > 0) this.player.speedBoostTimer--;

      // Shooting
      const now = performance.now();
      const fireInterval = this.player.speedBoostTimer > 0 ? 120 : 180;
      if (this.keys.shoot && now - this.lastShootTime > fireInterval) {
        this.shoot();
        this.lastShootTime = now;
      }

      // Update Bullets
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.y += b.vy;
        b.x += b.vx || 0;

        if (b.y < -20 || b.y > this.height + 20) {
          this.bullets.splice(i, 1);
        }
      }

      // Update Powerups
      for (let i = this.powerups.length - 1; i >= 0; i--) {
        const p = this.powerups[i];
        p.y += p.speedY;

        // Player collection collision
        if (this.checkCollision(this.player, p)) {
          this.sounds.playPowerup();
          this.addParticles(p.x, p.y, '#10b981', 16);

          if (p.type === 'triple') this.player.tripleShotTimer = 400;
          if (p.type === 'shield') this.player.shieldTimer = 500;
          if (p.type === 'coffee') this.player.speedBoostTimer = 450;

          this.score += 250;
          this.powerups.splice(i, 1);
          continue;
        }

        if (p.y > this.height) {
          this.powerups.splice(i, 1);
        }
      }

      // Update Enemies
      let changeDir = false;
      let dropDown = false;

      this.enemies.forEach((enemy) => {
        if (!enemy.isBoss) {
          enemy.x += enemy.speedX * enemy.direction;
          if (enemy.x + enemy.width > this.width - 15 || enemy.x < 15) {
            changeDir = true;
          }
        } else {
          // Boss movement
          enemy.x += enemy.speedX * enemy.direction;
          if (enemy.x + enemy.width > this.width - 20 || enemy.x < 20) {
            enemy.direction *= -1;
          }

          // Boss attacks
          enemy.attackTimer = (enemy.attackTimer || 0) + 1;
          if (enemy.attackTimer > 60) {
            enemy.attackTimer = 0;
            // Boss shoots 3 bugs downward
            for (let angle = -1; angle <= 1; angle++) {
              this.bullets.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height,
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
        this.enemies.forEach((enemy) => {
          if (!enemy.isBoss) {
            enemy.direction *= -1;
            enemy.y += 18;
            if (enemy.y + enemy.height >= this.player.y) {
              this.playerHit();
            }
          }
        });
      }

      // Check Bullet vs Enemy collisions
      for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
        const b = this.bullets[bi];

        if (b.isEnemy) {
          // Enemy bullet hitting player
          if (this.checkCollision(b, this.player)) {
            this.bullets.splice(bi, 1);
            this.playerHit();
          }
          continue;
        }

        for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
          const e = this.enemies[ei];
          if (this.checkCollision(b, e)) {
            this.bullets.splice(bi, 1);
            e.health--;
            this.addParticles(b.x, b.y, e.color, 6);

            if (e.health <= 0) {
              this.sounds.playExplosion();
              this.addParticles(e.x + e.width / 2, e.y + e.height / 2, e.color, 24);
              this.score += e.points;
              this.spawnPowerup(e.x, e.y);
              this.enemies.splice(ei, 1);
            }
            break;
          }
        }
      }

      // Check if wave is cleared
      if (this.enemies.length === 0) {
        if (this.wave < this.maxWaves) {
          this.wave++;
          this.sounds.playPowerup();
          this.spawnWave(this.wave);
        } else {
          this.state = 'VICTORY';
          this.saveHighScore();
        }
      }

      // Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }

      // Update background starfield
      this.stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > this.height) {
          star.y = 0;
          star.x = Math.random() * this.width;
        }
      });
    }

    shoot() {
      this.sounds.playLaser();
      const px = this.player.x + this.player.width / 2;
      const py = this.player.y;

      if (this.player.tripleShotTimer > 0) {
        this.bullets.push({ x: px, y: py, width: 4, height: 16, vy: -9, vx: 0, color: '#38bdf8' });
        this.bullets.push({ x: px - 12, y: py + 4, width: 4, height: 16, vy: -8.5, vx: -2, color: '#a855f7' });
        this.bullets.push({ x: px + 12, y: py + 4, width: 4, height: 16, vy: -8.5, vx: 2, color: '#a855f7' });
      } else {
        this.bullets.push({ x: px - 8, y: py, width: 4, height: 16, vy: -9, vx: 0, color: '#06b6d4' });
        this.bullets.push({ x: px + 8, y: py, width: 4, height: 16, vy: -9, vx: 0, color: '#06b6d4' });
      }
    }

    playerHit() {
      if (this.player.shieldTimer > 0) {
        this.player.shieldTimer = 0;
        this.addParticles(this.player.x + 20, this.player.y + 20, '#06b6d4', 20);
        return;
      }

      this.player.health--;
      this.sounds.playExplosion();
      this.addParticles(this.player.x + 20, this.player.y + 20, '#f43f5e', 24);

      if (this.player.health <= 0) {
        this.state = 'GAMEOVER';
        this.sounds.playGameOver();
        this.saveHighScore();
      }
    }

    saveHighScore() {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('code_defender_highscore', this.highScore.toString());
      }
    }

    checkCollision(r1, r2) {
      return (
        r1.x < r2.x + r2.width &&
        r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.height &&
        r1.y + r1.height > r2.y
      );
    }

    draw() {
      const ctx = this.ctx;
      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, this.width, this.height);

      // Draw Starfield
      this.stars.forEach((star) => {
        ctx.fillStyle = star.color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.globalAlpha = 1.0;

      // Draw Particles
      this.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      ctx.globalAlpha = 1.0;

      // Draw Bullets
      this.bullets.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(b.x - b.width / 2, b.y, b.width, b.height);
        ctx.shadowBlur = 0;
      });

      // Draw Powerups
      this.powerups.forEach((p) => {
        ctx.save();
        ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
        ctx.fillStyle = p.type === 'triple' ? '#38bdf8' : p.type === 'shield' ? '#10b981' : '#f59e0b';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = p.type === 'triple' ? '3X' : p.type === 'shield' ? '🛡️' : '⚡';
        ctx.fillText(label, 0, 0);
        ctx.restore();
      });

      // Draw Enemies
      this.enemies.forEach((e) => {
        ctx.save();
        if (e.isBoss) {
          // Boss: Legacy Monolith
          ctx.fillStyle = e.color;
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 16;
          ctx.fillRect(e.x, e.y, e.width, e.height);
          ctx.shadowBlur = 0;

          // Boss Health Bar
          const healthRatio = e.health / e.maxHealth;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(e.x, e.y - 14, e.width, 8);
          ctx.fillStyle = '#ec4899';
          ctx.fillRect(e.x, e.y - 14, e.width * healthRatio, 8);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👾 LEGACY MONOLITH BOSS', e.x + e.width / 2, e.y + 36);
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillText(`HP: ${e.health} / ${e.maxHealth}`, e.x + e.width / 2, e.y + 54);
        } else {
          // Regular Bug Invaders
          ctx.fillStyle = e.color;
          ctx.shadowColor = e.color;
          ctx.shadowBlur = 6;
          ctx.fillRect(e.x, e.y, e.width, e.height);
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#080b11';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const symbol = e.type === 'NullPointer' ? 'NULL' : e.type === 'MemoryLeak' ? 'LEAK' : 'ERR';
          ctx.fillText(symbol, e.x + e.width / 2, e.y + e.height / 2);
        }
        ctx.restore();
      });

      // Draw Player Ship
      if (this.player && this.state !== 'GAMEOVER') {
        const px = this.player.x;
        const py = this.player.y;

        ctx.save();
        // Thruster flame
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(px + 14, py + 34);
        ctx.lineTo(px + 22, py + 42 + Math.random() * 6);
        ctx.lineTo(px + 30, py + 34);
        ctx.fill();

        // Ship Body
        ctx.fillStyle = '#6366f1';
        ctx.shadowColor = '#818cf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(px + 22, py);
        ctx.lineTo(px + 44, py + 34);
        ctx.lineTo(px + 30, py + 28);
        ctx.lineTo(px + 22, py + 34);
        ctx.lineTo(px + 14, py + 28);
        ctx.lineTo(px, py + 34);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Cockpit
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px + 22, py + 16, 4, 0, Math.PI * 2);
        ctx.fill();

        // Shield indicator ring
        if (this.player.shieldTimer > 0) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(px + 22, py + 18, 30, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw Top HUD
      this.drawHUD();

      // Overlays for Game States
      if (this.state === 'START') this.drawStartScreen();
      if (this.state === 'PAUSED') this.drawPauseScreen();
      if (this.state === 'GAMEOVER') this.drawGameOverScreen();
      if (this.state === 'VICTORY') this.drawVictoryScreen();
    }

    drawHUD() {
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px JetBrains Mono, monospace';

      // Score & High Score
      ctx.fillText(`SCORE: ${this.score}`, 16, 26);
      ctx.textAlign = 'right';
      ctx.fillText(`HIGH: ${this.highScore}`, this.width - 16, 26);

      // Wave info
      ctx.textAlign = 'center';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`WAVE ${this.wave} / ${this.maxWaves}`, this.width / 2, 26);

      // Health Lives (Hearts)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f43f5e';
      let hearts = '';
      for (let i = 0; i < this.player.health; i++) hearts += '❤️ ';
      ctx.fillText(`HEALTH: ${hearts}`, 16, 46);

      // Active Boosts
      if (this.player.tripleShotTimer > 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`⚡ TRIPLE SHOT: ${(this.player.tripleShotTimer / 60).toFixed(1)}s`, 16, 64);
      } else if (this.player.shieldTimer > 0) {
        ctx.fillStyle = '#10b981';
        ctx.fillText(`🛡️ SHIELD: ${(this.player.shieldTimer / 60).toFixed(1)}s`, 16, 64);
      }
      ctx.restore();
    }

    drawStartScreen() {
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 11, 17, 0.85)';
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#6366f1';
      ctx.font = 'bold 30px Plus Jakarta Sans, sans-serif';
      ctx.fillText('CODE DEFENDER', this.width / 2, this.height / 2 - 90);

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 16px JetBrains Mono, monospace';
      ctx.fillText('PRODUCTION PANIC', this.width / 2, this.height / 2 - 56);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '14px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Protect production from incoming bugs & outages!', this.width / 2, this.height / 2 - 14);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.fillText('Desktop: [A]/[D] or [Arrows] to Move & [Space] to Shoot', this.width / 2, this.height / 2 + 30);
      ctx.fillText('Mobile: Use On-Screen D-Pad and Fire button', this.width / 2, this.height / 2 + 52);

      // Pulsing Start prompt
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
      const pulse = Math.sin(performance.now() / 250) * 0.3 + 0.7;
      ctx.globalAlpha = pulse;
      ctx.fillText('PRESS [SPACEBAR] OR TAP FIRE TO START', this.width / 2, this.height / 2 + 110);
      ctx.restore();
    }

    drawPauseScreen() {
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 11, 17, 0.7)';
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 28px Plus Jakarta Sans, sans-serif';
      ctx.fillText('PAUSED', this.width / 2, this.height / 2);
      ctx.font = '14px JetBrains Mono, monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('Press [P] to Resume', this.width / 2, this.height / 2 + 36);
      ctx.restore();
    }

    drawGameOverScreen() {
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 11, 17, 0.88)';
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 32px Plus Jakarta Sans, sans-serif';
      ctx.fillText('SERVER CRASHED (500)', this.width / 2, this.height / 2 - 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px JetBrains Mono, monospace';
      ctx.fillText(`FINAL SCORE: ${this.score}`, this.width / 2, this.height / 2 - 10);
      ctx.fillStyle = '#a855f7';
      ctx.fillText(`HIGH SCORE: ${this.highScore}`, this.width / 2, this.height / 2 + 16);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Press [SPACEBAR] to Deploy Hotfix & Retry', this.width / 2, this.height / 2 + 65);
      ctx.restore();
    }

    drawVictoryScreen() {
      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = 'rgba(8, 11, 17, 0.88)';
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 32px Plus Jakarta Sans, sans-serif';
      ctx.fillText('PRODUCTION SAVED! 🚀', this.width / 2, this.height / 2 - 60);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Rank: Staff Frontend Legend', this.width / 2, this.height / 2 - 20);

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px JetBrains Mono, monospace';
      ctx.fillText(`FINAL SCORE: ${this.score}`, this.width / 2, this.height / 2 + 14);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Press [SPACEBAR] to Play Again', this.width / 2, this.height / 2 + 70);
      ctx.restore();
    }

    loop() {
      this.update();
      this.draw();
      requestAnimationFrame(this.loop.bind(this));
    }
  }

  // --- Modal Helpers & Global Triggers ---
  window.openArcadeModal = function () {
    const modal = document.getElementById('arcadeModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (!window.codeDefenderGame) {
        window.codeDefenderGame = new CodeDefender();
      } else {
        window.codeDefenderGame.sounds.init();
      }
    }
  };

  window.closeArcadeModal = function () {
    const modal = document.getElementById('arcadeModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (window.codeDefenderGame && window.codeDefenderGame.state === 'PLAYING') {
        window.codeDefenderGame.state = 'PAUSED';
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const openBtns = document.querySelectorAll('.trigger-arcade-game');
    openBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openArcadeModal();
      });
    });
  });
})();
