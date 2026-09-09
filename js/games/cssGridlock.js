/**
 * CSS Gridlock: Layout Puzzle Engine
 * Solve production layout chaos using real Flexbox and CSS Grid alignments!
 */

window.createCssGridlockGame = function (containerId, onScoreUpdate, onGameOver) {
  const container = document.getElementById(containerId);
  if (!container) return null;

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
      if (type === 'click') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'win') {
        [523, 659, 784, 1046].forEach((f, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.07);
          gain.gain.setValueAtTime(0.2, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.08);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + (i + 1) * 0.08);
        });
      }
    } catch (e) {}
  }

  const LEVELS = [
    {
      level: 1,
      title: 'How to Center a <div>',
      mission: 'The ultimate web developer rite of passage! Center the Login Card both horizontally and vertically.',
      items: [{ label: '🔑 Login Card', color: '#6366f1', w: '160px', h: '90px' }],
      target: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
      },
      options: {
        justifyContent: ['flex-start', 'center', 'flex-end', 'space-between'],
        alignItems: ['flex-start', 'center', 'flex-end'],
        flexDirection: ['row', 'column']
      }
    },
    {
      level: 2,
      title: 'The Responsive Navbar',
      mission: 'Spread the Brand Logo and Nav Menu to opposite edges, keeping them vertically aligned in the center.',
      items: [
        { label: '⚡ Brand Logo', color: '#38bdf8', w: '140px', h: '50px' },
        { label: '🍔 Nav Menu', color: '#ec4899', w: '120px', h: '50px' }
      ],
      target: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
      },
      options: {
        justifyContent: ['flex-start', 'center', 'space-between', 'space-around'],
        alignItems: ['flex-start', 'center', 'flex-end'],
        flexDirection: ['row', 'column']
      }
    },
    {
      level: 3,
      title: 'Mobile App Bottom CTA',
      mission: 'Stack components vertically into a column and push the Checkout Button to the very bottom.',
      items: [
        { label: '🛒 Cart Items', color: '#10b981', w: '200px', h: '60px' },
        { label: '💳 Checkout CTA', color: '#f59e0b', w: '200px', h: '50px' }
      ],
      target: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'column'
      },
      options: {
        justifyContent: ['flex-start', 'center', 'space-between'],
        alignItems: ['flex-start', 'center', 'flex-end'],
        flexDirection: ['row', 'column']
      }
    },
    {
      level: 4,
      title: 'Pricing Cards Trio',
      mission: 'Distribute the 3 pricing tiers with equal breathing room (space-around) and vertically centered.',
      items: [
        { label: '🥉 Starter', color: '#64748b', w: '100px', h: '85px' },
        { label: '🥈 Pro', color: '#3b82f6', w: '100px', h: '105px' },
        { label: '🥇 Enterprise', color: '#8b5cf6', w: '100px', h: '85px' }
      ],
      target: {
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row'
      },
      options: {
        justifyContent: ['flex-start', 'center', 'space-between', 'space-around'],
        alignItems: ['flex-start', 'center', 'flex-end'],
        flexDirection: ['row', 'column']
      }
    },
    {
      level: 5,
      title: 'The Production Dashboard',
      mission: 'Pin navigation items to the top right corner of the container (end of row, top of container).',
      items: [
        { label: '🔔 Notifications', color: '#ef4444', w: '130px', h: '45px' },
        { label: '👤 User Profile', color: '#06b6d4', w: '130px', h: '45px' }
      ],
      target: {
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        flexDirection: 'row'
      },
      options: {
        justifyContent: ['flex-start', 'center', 'flex-end', 'space-between'],
        alignItems: ['flex-start', 'center', 'flex-end'],
        flexDirection: ['row', 'column']
      }
    }
  ];

  let currentLevelIdx = 0;
  let score = 0;

  // Player's selected CSS properties
  let currentCSS = {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'row'
  };

  function renderLevel() {
    const lvl = LEVELS[currentLevelIdx % LEVELS.length];

    // Reset default selections
    currentCSS = {
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      flexDirection: 'row'
    };

    container.innerHTML = `
      <div class="css-gridlock-container" style="max-width: 680px; margin: 0 auto; background: #090c16; border-radius: 16px; border: 1px solid rgba(99,102,241,0.3); overflow: hidden; font-family: var(--font-sans, sans-serif); color: #f8fafc;">
        <!-- Header -->
        <div style="padding: 16px 20px; background: rgba(15, 23, 42, 0.85); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <span style="background: #3b82f6; color: #fff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px;">LEVEL ${lvl.level} OF ${LEVELS.length}</span>
            <h3 style="margin: 4px 0 0; font-size: 16px; color: #38bdf8;">${lvl.title}</h3>
          </div>
          <div style="font-family: monospace; font-size: 14px; color: #facc15; font-weight: bold;">
            SCORE: <span id="gridlockScore">${score}</span>
          </div>
        </div>

        <!-- Mission Description -->
        <div style="padding: 12px 20px; background: rgba(30, 41, 59, 0.4); font-size: 13px; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.05); line-height: 1.5;">
          🎯 <strong>MISSION:</strong> ${lvl.mission}
        </div>

        <!-- Interactive Visual Viewport Preview -->
        <div style="padding: 20px; position: relative;">
          <div id="gridlockViewport" style="position: relative; width: 100%; height: 260px; background: #030712; border: 2px dashed rgba(99, 102, 241, 0.4); border-radius: 12px; display: flex; justify-content: ${currentCSS.justifyContent}; align-items: ${currentCSS.alignItems}; flex-direction: ${currentCSS.flexDirection}; padding: 14px; box-sizing: border-box; transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);">
            ${lvl.items
              .map(
                (item) => `
              <div class="gridlock-item" style="background: ${item.color}; min-width: ${item.w}; min-height: ${item.h}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.5); border: 1.5px solid rgba(255,255,255,0.25); margin: 6px; transition: all 0.35s ease;">
                ${item.label}
              </div>
            `
              )
              .join('')}
          </div>

          <!-- Target Match Overlay Banner -->
          <div id="gridlockMatchNotice" style="display: none; position: absolute; inset: 20px; background: rgba(16, 185, 129, 0.88); border-radius: 12px; flex-direction: column; align-items: center; justify-content: center; color: #fff; text-align: center; backdrop-filter: blur(6px); z-index: 20;">
            <span style="font-size: 32px; margin-bottom: 8px;">🎉</span>
            <h3 style="margin: 0 0 6px; font-size: 20px;">PERFECT ALIGNMENT!</h3>
            <p style="margin: 0; font-size: 13px; color: #e2e8f0;">Advancing to next production layout...</p>
          </div>
        </div>

        <!-- CSS Controls Interactive Workbench -->
        <div style="padding: 16px 20px 22px; background: rgba(15, 23, 42, 0.9); border-top: 1px solid rgba(255,255,255,0.08);">
          <div style="font-family: monospace; font-size: 12px; color: #94a3b8; margin-bottom: 12px;">
            .container { <span style="color: #38bdf8;">display: flex;</span> }
          </div>

          <!-- justify-content selector -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: 12px; font-family: monospace; color: #38bdf8; margin-bottom: 6px;">justify-content:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${lvl.options.justifyContent
                .map(
                  (val) => `
                <button class="css-prop-btn ${val === currentCSS.justifyContent ? 'active' : ''}" data-prop="justifyContent" data-val="${val}" style="background: ${val === currentCSS.justifyContent ? '#6366f1' : 'rgba(255,255,255,0.06)'}; border: 1px solid ${val === currentCSS.justifyContent ? '#818cf8' : 'rgba(255,255,255,0.12)'}; color: #fff; font-family: monospace; font-size: 11px; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s;">
                  ${val}
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- align-items selector -->
          <div style="margin-bottom: 12px;">
            <div style="font-size: 12px; font-family: monospace; color: #ec4899; margin-bottom: 6px;">align-items:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${lvl.options.alignItems
                .map(
                  (val) => `
                <button class="css-prop-btn ${val === currentCSS.alignItems ? 'active' : ''}" data-prop="alignItems" data-val="${val}" style="background: ${val === currentCSS.alignItems ? '#ec4899' : 'rgba(255,255,255,0.06)'}; border: 1px solid ${val === currentCSS.alignItems ? '#f472b6' : 'rgba(255,255,255,0.12)'}; color: #fff; font-family: monospace; font-size: 11px; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s;">
                  ${val}
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- flex-direction selector -->
          <div>
            <div style="font-size: 12px; font-family: monospace; color: #10b981; margin-bottom: 6px;">flex-direction:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${lvl.options.flexDirection
                .map(
                  (val) => `
                <button class="css-prop-btn ${val === currentCSS.flexDirection ? 'active' : ''}" data-prop="flexDirection" data-val="${val}" style="background: ${val === currentCSS.flexDirection ? '#10b981' : 'rgba(255,255,255,0.06)'}; border: 1px solid ${val === currentCSS.flexDirection ? '#34d399' : 'rgba(255,255,255,0.12)'}; color: #fff; font-family: monospace; font-size: 11px; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s;">
                  ${val}
                </button>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    const vp = document.getElementById('gridlockViewport');
    const notice = document.getElementById('gridlockMatchNotice');
    const btns = container.querySelectorAll('.css-prop-btn');

    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        initAudio();
        playSound('click');
        const prop = btn.dataset.prop;
        const val = btn.dataset.val;
        currentCSS[prop] = val;

        // Update active class on row
        const siblings = btn.parentElement.querySelectorAll('.css-prop-btn');
        siblings.forEach((s) => {
          s.classList.remove('active');
          s.style.background = 'rgba(255,255,255,0.06)';
          s.style.borderColor = 'rgba(255,255,255,0.12)';
        });
        btn.classList.add('active');
        btn.style.background = prop === 'alignItems' ? '#ec4899' : prop === 'flexDirection' ? '#10b981' : '#6366f1';
        btn.style.borderColor = '#fff';

        // Apply dynamically to viewport
        vp.style[prop] = val;

        // Check if matches target!
        const lvl = LEVELS[currentLevelIdx % LEVELS.length];
        const isMatch =
          currentCSS.justifyContent === lvl.target.justifyContent &&
          currentCSS.alignItems === lvl.target.alignItems &&
          currentCSS.flexDirection === lvl.target.flexDirection;

        if (isMatch) {
          playSound('win');
          score += 200;
          if (onScoreUpdate) onScoreUpdate(score);
          const scoreEl = document.getElementById('gridlockScore');
          if (scoreEl) scoreEl.textContent = score;

          notice.style.display = 'flex';

          setTimeout(() => {
            currentLevelIdx++;
            if (currentLevelIdx >= LEVELS.length) {
              // Loop back
              currentLevelIdx = 0;
            }
            renderLevel();
          }, 1400);
        }
      });
    });
  }

  renderLevel();

  return {
    destroy: () => {
      container.innerHTML = '';
    },
    restart: () => {
      currentLevelIdx = 0;
      score = 0;
      renderLevel();
      if (onScoreUpdate) onScoreUpdate(0);
    },
    toggleSound: () => {
      isMuted = !isMuted;
      return isMuted;
    }
  };
};
