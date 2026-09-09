/**
 * Main React Application Root
 */

function App() {
  const [currentView, setCurrentView] = React.useState('library');
  const [activeGameId, setActiveGameId] = React.useState(null);

  // Hash-based routing for GitHub Pages
  React.useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('play/')) {
        const id = hash.replace('play/', '');
        setActiveGameId(id);
        setCurrentView(`play:${id}`);
      } else if (hash === 'portfolio') {
        setCurrentView('portfolio');
        setActiveGameId(null);
      } else {
        setCurrentView('library');
        setActiveGameId(null);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view, gameId = null) => {
    if (view === 'library') {
      window.location.hash = 'arcade';
    } else if (view === 'portfolio') {
      window.location.hash = 'portfolio';
    } else if (view === 'play' && gameId) {
      window.location.hash = `play/${gameId}`;
    }
  };

  return React.createElement(
    'div',
    { className: 'app-root' },
    // Ambient Background Orbs
    React.createElement(
      'div',
      { className: 'ambient-glow', 'aria-hidden': 'true' },
      React.createElement('div', { className: 'glow-orb glow-orb-1' }),
      React.createElement('div', { className: 'glow-orb glow-orb-2' }),
      React.createElement('div', { className: 'glow-orb glow-orb-3' })
    ),

    // Navigation Bar
    React.createElement(window.Navbar, {
      currentView: currentView,
      onNavigate: (target) => navigateTo(target)
    }),

    // Active View
    React.createElement(
      'main',
      null,
      currentView === 'library' &&
        React.createElement(window.GameLibrary, {
          onSelectGame: (id) => navigateTo('play', id),
          onNavigatePortfolio: () => navigateTo('portfolio')
        }),

      currentView.startsWith('play:') &&
        React.createElement(window.GamePlayer, {
          gameId: activeGameId,
          onBack: () => navigateTo('library')
        }),

      currentView === 'portfolio' &&
        React.createElement(window.PortfolioPage, {
          onNavigateArcade: () => navigateTo('library')
        })
    ),

    // Footer
    React.createElement(window.Footer, {
      onNavigate: (target) => navigateTo(target)
    })
  );
}

// Mount to DOM
const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(React.createElement(App));
}
