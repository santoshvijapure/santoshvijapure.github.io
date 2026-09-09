/**
 * GameLibrary React Component
 * Displays the main arcade hub, search, category pills, and game cards.
 */

window.GameLibrary = function ({ onSelectGame, onNavigatePortfolio }) {
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const games = window.GAMES_REGISTRY || [];
  const categories = window.GAME_CATEGORIES || [];

  const filteredGames = games.filter((game) => {
    const matchesCategory = activeCategory === 'all' || game.category === activeCategory;
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return React.createElement(
    'div',
    { className: 'arcade-hub-container' },
    // Hero Banner
    React.createElement(
      'div',
      { className: 'arcade-hero' },
      React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'div',
          { className: 'section-tag' },
          React.createElement('span', { className: 'status-dot' }),
          React.createElement('span', null, 'Playable Dev Playgrounds & Arcade Hub')
        ),
        React.createElement(
          'h1',
          { className: 'hero-title' },
          'Welcome to the ',
          React.createElement('span', { className: 'gradient-text' }, 'Dev Arcade'),
          '.'
        ),
        React.createElement(
          'p',
          { className: 'hero-description' },
          'A collection of interactive games built by Santosh Vijapure (Senior Software Engineer). Defend production servers from memory leaks, slide git branches, and play classic dev games.'
        ),
        React.createElement(
          'div',
          { className: 'arcade-quick-stats' },
          React.createElement(
            'div',
            { className: 'stat-pill' },
            React.createElement('strong', null, games.filter((g) => g.status === 'playable').length.toString()),
            ' Playable Games'
          ),
          React.createElement(
            'div',
            { className: 'stat-pill' },
            React.createElement('strong', null, '60 FPS'),
            ' Canvas 2D'
          ),
          React.createElement(
            'div',
            { className: 'stat-pill' },
            React.createElement('strong', null, '8-Bit'),
            ' Web Audio Synthesis'
          ),
          React.createElement(
            'button',
            {
              className: 'btn btn-secondary btn-sm',
              onClick: onNavigatePortfolio
            },
            'View Santosh\'s Portfolio →'
          )
        )
      )
    ),

    // Search and Category Filter Bar
    React.createElement(
      'div',
      { className: 'container arcade-filter-section' },
      React.createElement(
        'div',
        { className: 'arcade-filter-bar' },
        // Categories
        React.createElement(
          'div',
          { className: 'category-pills' },
          categories.map((cat) =>
            React.createElement(
              'button',
              {
                key: cat.id,
                className: `category-btn ${activeCategory === cat.id ? 'active' : ''}`,
                onClick: () => setActiveCategory(cat.id)
              },
              `${cat.icon} ${cat.label}`
            )
          )
        ),

        // Search Input
        React.createElement(
          'div',
          { className: 'search-box' },
          React.createElement(
            'svg',
            {
              width: 16,
              height: 16,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: 2
            },
            React.createElement('circle', { cx: 11, cy: 11, r: 8 }),
            React.createElement('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })
          ),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Search games, tags, topics...',
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value)
          })
        )
      )
    ),

    // Games Grid
    React.createElement(
      'div',
      { className: 'container arcade-games-grid' },
      filteredGames.map((game) => {
        const isPlayable = game.status === 'playable';
        return React.createElement(
          'div',
          {
            key: game.id,
            className: `game-card ${isPlayable ? 'playable' : 'upcoming'}`,
            onClick: () => isPlayable && onSelectGame(game.id)
          },
          React.createElement(
            'div',
            { className: 'game-card-header' },
            React.createElement('span', { className: 'game-icon' }, game.icon),
            React.createElement(
              'span',
              {
                className: `game-badge ${isPlayable ? 'badge-live' : 'badge-upcoming'}`
              },
              game.badge
            )
          ),
          React.createElement('h3', { className: 'game-title' }, game.title),
          React.createElement('p', { className: 'game-tagline' }, game.tagline),
          React.createElement(
            'div',
            { className: 'game-tags' },
            game.tags.map((tag, i) =>
              React.createElement('span', { key: i, className: 'game-tag-pill' }, tag)
            )
          ),
          React.createElement(
            'div',
            { className: 'game-card-footer' },
            React.createElement(
              'span',
              { className: 'game-difficulty' },
              `Level: ${game.difficulty}`
            ),
            isPlayable
              ? React.createElement(
                  'button',
                  {
                    className: 'btn btn-primary btn-sm play-btn',
                    onClick: (e) => {
                      e.stopPropagation();
                      onSelectGame(game.id);
                    }
                  },
                  'PLAY NOW ▶'
                )
              : React.createElement(
                  'span',
                  { className: 'coming-soon-label' },
                  'Coming Soon ⏳'
                )
          )
        );
      }),

      // "Add More Games" Developer slot
      React.createElement(
        'div',
        { className: 'game-card add-game-slot' },
        React.createElement('span', { className: 'add-icon' }, '➕'),
        React.createElement('h3', null, 'Extensible Game Library'),
        React.createElement(
          'p',
          null,
          'Add your own games! Simply drop a new game config into ',
          React.createElement('code', null, 'js/games/registry.js'),
          ' and create a canvas/component engine.'
        )
      )
    )
  );
};
