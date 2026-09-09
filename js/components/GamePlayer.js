/**
 * GamePlayer React Component
 * In-app arcade console to play the selected game.
 */

window.GamePlayer = function ({ gameId, onBack }) {
  const game = (window.GAMES_REGISTRY || []).find((g) => g.id === gameId);
  const [score, setScore] = React.useState(0);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const gameInstanceRef = React.useRef(null);
  const cabinetRef = React.useRef(null);

  React.useEffect(() => {
    // Mount selected game
    if (gameId === 'web-craft' && window.createWebCraftGame) {
      gameInstanceRef.current = window.createWebCraftGame('webcraftMount', (newScore) => {
        setScore(newScore);
      });
    } else if (gameId === 'code-defender' && window.createCodeDefenderGame) {
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
    } else if (gameId === 'balloon-pop' && window.createBalloonPopGame) {
      gameInstanceRef.current = window.createBalloonPopGame('balloonCanvas', (newScore) => {
        setScore(newScore);
      });
    } else if (gameId === 'dino-jump' && window.createDinoJumpGame) {
      gameInstanceRef.current = window.createDinoJumpGame('dinoCanvas', (newScore) => {
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

  const handleToggleFullscreen = () => {
    const cabinet = cabinetRef.current;
    const isCurrentlyFs = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      isFullscreen
    );

    if (!isCurrentlyFs) {
      if (cabinet) {
        if (cabinet.requestFullscreen) {
          cabinet.requestFullscreen().catch(() => {});
        } else if (cabinet.webkitRequestFullscreen) {
          cabinet.webkitRequestFullscreen();
        } else if (cabinet.mozRequestFullScreen) {
          cabinet.mozRequestFullScreen();
        } else if (cabinet.msRequestFullscreen) {
          cabinet.msRequestFullscreen();
        }
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen && document.mozFullScreenElement) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen && document.msFullscreenElement) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }

    setTimeout(() => window.dispatchEvent(new Event('resize')), 80);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
  };

  React.useEffect(() => {
    const handleFsChange = () => {
      const isNowFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isNowFs);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 80);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
    };

    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    events.forEach((evt) => document.addEventListener(evt, handleFsChange));

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen && !document.fullscreenElement) {
        setIsFullscreen(false);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      events.forEach((evt) => document.removeEventListener(evt, handleFsChange));
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  React.useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

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
    { className: `arcade-player-view ${isFullscreen ? 'view-fullscreen' : ''}` },
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
          React.createElement(
            'button',
            {
              className: 'btn btn-primary btn-sm btn-fullscreen-toggle',
              onClick: handleToggleFullscreen,
              title: isFullscreen ? 'Exit Full Screen Mode' : 'Enter Full Screen Mode'
            },
            React.createElement('span', { style: { marginRight: '5px' } }, isFullscreen ? '✕' : '⛶'),
            isFullscreen ? 'Exit Fullscreen' : 'Full Screen'
          ),
          (gameId === 'code-defender' || gameId === 'balloon-pop' || gameId === 'dino-jump') &&
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
        {
          ref: cabinetRef,
          className: `arcade-cabinet-frame ${isFullscreen ? 'is-fullscreen' : ''}`
        },
        // Floating Fullscreen Toolbar HUD (Visible when Fullscreen)
        isFullscreen &&
          React.createElement(
            'div',
            { className: 'floating-fs-toolbar' },
            (gameId === 'code-defender' || gameId === 'balloon-pop' || gameId === 'dino-jump') &&
              React.createElement(
                'button',
                {
                  className: 'floating-fs-tool-btn',
                  onClick: handleToggleSound,
                  title: isMuted ? 'Unmute' : 'Mute'
                },
                isMuted ? '🔇 Unmute' : '🔊 Sound'
              ),
            React.createElement(
              'button',
              {
                className: 'floating-fs-tool-btn',
                onClick: handleRestart,
                title: 'Restart Game'
              },
              '🔄 Restart'
            ),
            React.createElement(
              'button',
              {
                className: 'floating-fs-tool-btn floating-fs-exit-btn',
                onClick: handleToggleFullscreen,
                title: 'Exit Full Screen (Esc)'
              },
              React.createElement('span', null, '✕ Exit Full Screen'),
              React.createElement('kbd', { className: 'fs-kbd' }, 'ESC')
            )
          ),

        React.createElement(
          'div',
          { className: 'cabinet-screen-wrapper' },
          // Game Canvas/Container selection
          gameId === 'web-craft' &&
            React.createElement('div', {
              id: 'webcraftMount',
              style: isFullscreen
                ? { width: '100vw', height: '100vh' }
                : { width: '100%', height: '560px' }
            }),
          gameId === 'code-defender' &&
            React.createElement('canvas', { id: 'arcadeCanvas' }),
          gameId === 'dev-snake' &&
            React.createElement('canvas', { id: 'snakeCanvas' }),
          gameId === 'dev-2048' &&
            React.createElement('div', { id: 'dev2048Mount' }),
          gameId === 'balloon-pop' &&
            React.createElement('canvas', { id: 'balloonCanvas' }),
          gameId === 'dino-jump' &&
            React.createElement('canvas', { id: 'dinoCanvas' })
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
