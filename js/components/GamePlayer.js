/**
 * GamePlayer React Component
 * In-app arcade console to play the selected game.
 */

window.GamePlayer = function ({ gameId, onBack }) {
  const game = (window.GAMES_REGISTRY || []).find((g) => g.id === gameId);
  const [score, setScore] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);

  const gameInstanceRef = React.useRef(null);

  React.useEffect(() => {
    // Mount selected game
    if (gameId === 'code-defender' && window.createCodeDefenderGame) {
      gameInstanceRef.current = window.createCodeDefenderGame('arcadeCanvas', (newScore) => {
        setScore(newScore);
      });
    } else if (gameId === 'dev-snake' && window.createDevSnakeGame) {
      gameInstanceRef.current = window.createDevSnakeGame('snakeCanvas', (newScore) => {
        setScore(newScore);
      });
    } else if (gameId === 'dev-2048' && window.createDev2048Game) {
      gameInstanceRef.current = window.createDev2048Game('dev2048Mount', (newScore) => {
        setScore(newScore);
      });
    }

    return () => {
      if (gameInstanceRef.current && gameInstanceRef.current.destroy) {
        gameInstanceRef.current.destroy();
      }
    };
  }, [gameId]);

  const handleRestart = () => {
    if (gameInstanceRef.current && gameInstanceRef.current.restart) {
      gameInstanceRef.current.restart();
    }
  };

  const handleTogglePause = () => {
    if (gameInstanceRef.current && gameInstanceRef.current.togglePause) {
      gameInstanceRef.current.togglePause();
      setIsPaused(!isPaused);
    }
  };

  const handleToggleSound = () => {
    if (gameInstanceRef.current && gameInstanceRef.current.toggleSound) {
      const muted = gameInstanceRef.current.toggleSound();
      setIsMuted(muted);
    }
  };

  if (!game) {
    return React.createElement(
      'div',
      { className: 'container', style: { padding: '100px 0', textAlign: 'center' } },
      React.createElement('h2', null, 'Game Not Found'),
      React.createElement(
        'button',
        { className: 'btn btn-primary', onClick: onBack },
        '← Return to Arcade Hub'
      )
    );
  }

  return React.createElement(
    'div',
    { className: 'arcade-player-view' },
    React.createElement(
      'div',
      { className: 'container' },
      // Top Navigation Bar
      React.createElement(
        'div',
        { className: 'player-top-bar' },
        React.createElement(
          'button',
          { className: 'btn btn-secondary btn-sm', onClick: onBack },
          '← Back to Arcade Hub'
        ),
        React.createElement(
          'div',
          { className: 'player-game-title' },
          React.createElement('span', null, game.icon),
          React.createElement('strong', null, game.title)
        ),
        React.createElement(
          'div',
          { className: 'player-actions' },
          gameId === 'code-defender' &&
            React.createElement(
              'button',
              { className: 'btn btn-ghost btn-sm', onClick: handleToggleSound },
              isMuted ? '🔇 Unmute' : '🔊 Sound'
            ),
          React.createElement(
            'button',
            { className: 'btn btn-secondary btn-sm', onClick: handleRestart },
            '🔄 Restart'
          )
        )
      ),

      // Arcade Machine Cabinet Frame
      React.createElement(
        'div',
        { className: 'arcade-cabinet-frame' },
        React.createElement(
          'div',
          { className: 'cabinet-screen-wrapper' },
          // Game Canvas/Container selection
          gameId === 'code-defender' &&
            React.createElement('canvas', { id: 'arcadeCanvas' }),
          gameId === 'dev-snake' &&
            React.createElement('canvas', { id: 'snakeCanvas' }),
          gameId === 'dev-2048' &&
            React.createElement('div', { id: 'dev2048Mount' })
        ),

        // Virtual Touch Controls
        gameId === 'code-defender' &&
          React.createElement(
            'div',
            { className: 'virtual-touch-controls' },
            React.createElement(
              'div',
              { className: 'touch-dpad' },
              React.createElement(
                'button',
                {
                  className: 'touch-btn',
                  onTouchStart: (e) => {
                    e.preventDefault();
                    if (gameInstanceRef.current) gameInstanceRef.current.triggerLeft(true);
                  },
                  onTouchEnd: (e) => {
                    e.preventDefault();
                    if (gameInstanceRef.current) gameInstanceRef.current.triggerLeft(false);
                  }
                },
                '←'
              ),
              React.createElement(
                'button',
                {
                  className: 'touch-btn',
                  onTouchStart: (e) => {
                    e.preventDefault();
                    if (gameInstanceRef.current) gameInstanceRef.current.triggerRight(true);
                  },
                  onTouchEnd: (e) => {
                    e.preventDefault();
                    if (gameInstanceRef.current) gameInstanceRef.current.triggerRight(false);
                  }
                },
                '→'
              )
            ),
            React.createElement(
              'button',
              {
                className: 'touch-fire',
                onTouchStart: (e) => {
                  e.preventDefault();
                  if (gameInstanceRef.current) gameInstanceRef.current.triggerShoot(true);
                },
                onTouchEnd: (e) => {
                  e.preventDefault();
                  if (gameInstanceRef.current) gameInstanceRef.current.triggerShoot(false);
                }
              },
              'FIRE'
            )
          ),

        gameId === 'dev-snake' &&
          React.createElement(
            'div',
            { className: 'virtual-touch-controls', style: { justifyContent: 'center', gap: '8px' } },
            React.createElement(
              'button',
              {
                className: 'touch-btn',
                onClick: () => gameInstanceRef.current && gameInstanceRef.current.setDirection('left')
              },
              '←'
            ),
            React.createElement(
              'button',
              {
                className: 'touch-btn',
                onClick: () => gameInstanceRef.current && gameInstanceRef.current.setDirection('up')
              },
              '↑'
            ),
            React.createElement(
              'button',
              {
                className: 'touch-btn',
                onClick: () => gameInstanceRef.current && gameInstanceRef.current.setDirection('down')
              },
              '↓'
            ),
            React.createElement(
              'button',
              {
                className: 'touch-btn',
                onClick: () => gameInstanceRef.current && gameInstanceRef.current.setDirection('right')
              },
              '→'
            )
          )
      ),

      // Game Instructions & Meta
      React.createElement(
        'div',
        { className: 'player-instructions-card' },
        React.createElement('h3', null, 'Controls & Instructions'),
        React.createElement('p', null, game.controls),
        React.createElement('p', { style: { color: 'var(--text-muted)' } }, game.description),
        React.createElement(
          'div',
          { className: 'game-tags', style: { marginTop: '14px' } },
          game.tags.map((t, i) =>
            React.createElement('span', { key: i, className: 'game-tag-pill' }, t)
          )
        )
      )
    )
  );
};
