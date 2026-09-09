/**
 * Footer React Component
 */

window.Footer = function ({ onNavigate }) {
  return React.createElement(
    'footer',
    { className: 'site-footer' },
    React.createElement(
      'div',
      { className: 'container footer-content' },
      React.createElement(
        'div',
        { className: 'footer-left' },
        React.createElement('p', null, '© 2026 Santosh Vijapure • Senior Software Engineer & Game Hub'),
        React.createElement(
          'p',
          { style: { fontSize: '0.8rem', color: 'var(--text-dim)' } },
          'Engineered with React 18 & Modular Canvas Engines • Hosted on GitHub Pages'
        )
      ),
      React.createElement(
        'div',
        { className: 'footer-right' },
        React.createElement(
          'button',
          {
            className: 'footer-link',
            style: { background: 'none', border: 'none', cursor: 'pointer' },
            onClick: () => onNavigate('library')
          },
          'Arcade Hub'
        ),
        React.createElement(
          'button',
          {
            className: 'footer-link',
            style: { background: 'none', border: 'none', cursor: 'pointer' },
            onClick: () => onNavigate('portfolio')
          },
          'Developer Portfolio'
        ),
        React.createElement(
          'a',
          {
            href: 'https://github.com/santoshvijapure/santoshvijapure.github.io',
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'footer-link'
          },
          'GitHub Repo'
        )
      )
    )
  );
};
