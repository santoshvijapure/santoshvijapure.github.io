/**
 * Merge Conflict: 2048 Dev Edition Game Engine
 */

window.createDev2048Game = function (containerId, onScoreUpdate, onGameOver) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const TILE_CONFIG = {
    2: { label: 'git init', color: '#334155', text: '#f8fafc' },
    4: { label: 'commit', color: '#475569', text: '#f8fafc' },
    8: { label: 'push', color: '#2563eb', text: '#f8fafc' },
    16: { label: 'branch', color: '#0284c7', text: '#f8fafc' },
    32: { label: 'pull req', color: '#0d9488', text: '#f8fafc' },
    64: { label: 'review', color: '#16a34a', text: '#f8fafc' },
    128: { label: 'CI pass', color: '#eab308', text: '#0f172a' },
    256: { label: 'QA signoff', color: '#f97316', text: '#ffffff' },
    512: { label: 'staging', color: '#ea580c', text: '#ffffff' },
    1024: { label: 'canary', color: '#ec4899', text: '#ffffff' },
    2048: { label: 'PROD RELEASE!', color: '#a855f7', text: '#ffffff' }
  };

  let board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  let score = 0;
  let won = false;
  let over = false;

  function initBoard() {
    board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    score = 0;
    won = false;
    over = false;
    addRandomTile();
    addRandomTile();
    render();
    if (onScoreUpdate) onScoreUpdate(score);
  }

  function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return;
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[randomCell.r][randomCell.c] = Math.random() < 0.88 ? 2 : 4;
  }

  function slide(row) {
    let arr = row.filter((val) => val);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        score += arr[i];
        arr[i + 1] = 0;
        if (arr[i] === 2048 && !won) {
          won = true;
        }
      }
    }
    arr = arr.filter((val) => val);
    while (arr.length < 4) arr.push(0);
    return arr;
  }

  function moveLeft() {
    let changed = false;
    for (let r = 0; r < 4; r++) {
      const original = [...board[r]];
      board[r] = slide(board[r]);
      if (board[r].some((val, idx) => val !== original[idx])) changed = true;
    }
    return changed;
  }

  function moveRight() {
    let changed = false;
    for (let r = 0; r < 4; r++) {
      const original = [...board[r]];
      let reversed = [...board[r]].reverse();
      reversed = slide(reversed);
      board[r] = reversed.reverse();
      if (board[r].some((val, idx) => val !== original[idx])) changed = true;
    }
    return changed;
  }

  function moveUp() {
    let changed = false;
    for (let c = 0; c < 4; c++) {
      const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
      const slid = slide(col);
      for (let r = 0; r < 4; r++) {
        if (board[r][c] !== slid[r]) changed = true;
        board[r][c] = slid[r];
      }
    }
    return changed;
  }

  function moveDown() {
    let changed = false;
    for (let c = 0; c < 4; c++) {
      const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
      const slid = slide(col);
      const reversed = slid.reverse();
      for (let r = 0; r < 4; r++) {
        if (board[r][c] !== reversed[r]) changed = true;
        board[r][c] = reversed[r];
      }
    }
    return changed;
  }

  function isGameOver() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) return false;
        if (r < 3 && board[r][c] === board[r + 1][c]) return false;
        if (c < 3 && board[r][c] === board[r][c + 1]) return false;
      }
    }
    return true;
  }

  function handleMove(direction) {
    if (over) return;
    let moved = false;
    if (direction === 'left') moved = moveLeft();
    if (direction === 'right') moved = moveRight();
    if (direction === 'up') moved = moveUp();
    if (direction === 'down') moved = moveDown();

    if (moved) {
      addRandomTile();
      render();
      if (onScoreUpdate) onScoreUpdate(score);

      if (isGameOver()) {
        over = true;
        render();
        if (onGameOver) onGameOver(score, won);
      }
    }
  }

  function handleKeyDown(e) {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { handleMove('left'); e.preventDefault(); }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { handleMove('right'); e.preventDefault(); }
    if (e.code === 'ArrowUp' || e.code === 'KeyW') { handleMove('up'); e.preventDefault(); }
    if (e.code === 'ArrowDown' || e.code === 'KeyS') { handleMove('down'); e.preventDefault(); }
    if (e.code === 'Space' && over) initBoard();
  }

  window.addEventListener('keydown', handleKeyDown);

  function render() {
    container.innerHTML = `
      <div class="dev-2048-container">
        <div class="dev-2048-header">
          <div class="dev-2048-score-box">
            <span class="label">DEPLOY SCORE</span>
            <span class="val">${score}</span>
          </div>
          <button class="btn btn-secondary btn-sm" id="btnRestart2048">Restart</button>
        </div>

        <div class="dev-2048-grid">
          ${board
            .map((row, r) =>
              row
                .map((val, c) => {
                  const info = TILE_CONFIG[val] || { label: '', color: 'rgba(255,255,255,0.05)', text: '#fff' };
                  return `
                    <div class="dev-2048-tile ${val ? 'active' : 'empty'}" style="background-color: ${val ? info.color : 'rgba(255,255,255,0.04)'}; color: ${info.text};">
                      ${val ? `<span class="tile-val">${val}</span><span class="tile-label">${info.label}</span>` : ''}
                    </div>
                  `;
                })
                .join('')
            )
            .join('')}
        </div>

        ${over ? `
          <div class="dev-2048-overlay">
            <h3>${won ? 'MERGE SUCCESS! 🚀' : 'MERGE CONFLICT!'}</h3>
            <p>${won ? 'Reached Production Release!' : 'No more legal git merges available.'}</p>
            <button class="btn btn-primary btn-sm" id="btnRetry2048">Retry Pipeline</button>
          </div>
        ` : ''}

        <div class="dev-2048-tips">
          Use <strong>[Arrow Keys]</strong> or <strong>[W/A/S/D]</strong> to slide and merge branches.
        </div>
      </div>
    `;

    const rBtn = document.getElementById('btnRestart2048');
    if (rBtn) rBtn.addEventListener('click', initBoard);

    const retryBtn = document.getElementById('btnRetry2048');
    if (retryBtn) retryBtn.addEventListener('click', initBoard);
  }

  initBoard();

  return {
    destroy: () => {
      window.removeEventListener('keydown', handleKeyDown);
      container.innerHTML = '';
    },
    move: handleMove,
    restart: initBoard
  };
};
