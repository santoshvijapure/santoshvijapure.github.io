/**
 * PortfolioPage React Component
 * Full 5.5+ years Senior Software Engineer profile for Santosh Vijapure.
 */

window.PortfolioPage = function ({ onNavigateArcade }) {
  const [toastVisible, setToastVisible] = React.useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('vijapuresantosh@gmail.com');
    } catch (e) {
      const temp = document.createElement('input');
      temp.value = 'vijapuresantosh@gmail.com';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return React.createElement(
    'div',
    { className: 'portfolio-page-view' },

    // Hero Section
    React.createElement(
      'section',
      { id: 'home', className: 'hero-section' },
      React.createElement(
        'div',
        { className: 'container hero-grid' },
        React.createElement(
          'div',
          { className: 'hero-content' },
          React.createElement(
            'div',
            { className: 'hero-badge-pill' },
            React.createElement('span', { className: 'status-dot' }),
            React.createElement('span', null, 'Senior Software Engineer • 5.5+ Yrs Production Experience')
          ),
          React.createElement(
            'h1',
            { className: 'hero-title' },
            'Architecting ',
            React.createElement('span', { className: 'gradient-text' }, 'Scalable React Systems'),
            ' & High-Impact Modernizations.'
          ),
          React.createElement(
            'p',
            { className: 'hero-description' },
            'Senior Software Engineer leading multi-quarter Angular-to-React modernizations, shared cross-platform libraries, and high-conversion experiences at ',
            React.createElement('strong', null, 'Oportun'),
            '. Previously scaled digital acquisitions and analytics platforms to ',
            React.createElement('strong', null, '1M+ daily visits'),
            ' at ',
            React.createElement('strong', null, 'Airtel'),
            '.'
          ),
          React.createElement(
            'div',
            { className: 'hero-actions' },
            React.createElement(
              'button',
              {
                className: 'btn btn-primary',
                onClick: onNavigateArcade
              },
              React.createElement('span', null, '🕹️ Play Arcade Games'),
              React.createElement(
                'svg',
                { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 },
                React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 }),
                React.createElement('polyline', { points: '12 5 19 12 12 19' })
              )
            ),
            React.createElement(
              'a',
              { href: '#experience', className: 'btn btn-secondary' },
              'View Experience'
            ),
            React.createElement(
              'a',
              {
                href: 'assets/resume.pdf',
                target: '_blank',
                rel: 'noopener noreferrer',
                className: 'btn btn-ghost'
              },
              'Download Resume (PDF)'
            )
          ),
          React.createElement(
            'div',
            { className: 'hero-meta-strip' },
            React.createElement(
              'div',
              { className: 'meta-item' },
              React.createElement(
                'svg',
                { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
                React.createElement('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
                React.createElement('circle', { cx: 12, cy: 10, r: 3 })
              ),
              React.createElement('span', null, 'Pune, India (Remote / Hybrid)')
            ),
            React.createElement(
              'div',
              { className: 'meta-item' },
              React.createElement(
                'svg',
                { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
                React.createElement('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
              ),
              React.createElement('span', null, 'Oportun L.O.V.E • Airtel ACE • Google AI')
            )
          )
        ),

        // Profile Visual Card
        React.createElement(
          'div',
          { className: 'hero-visual' },
          React.createElement(
            'div',
            { className: 'avatar-card-container' },
            React.createElement('div', { className: 'avatar-glow-ring' }),
            React.createElement(
              'div',
              { className: 'float-badge badge-top-left' },
              React.createElement('span', null, '⚡ Oportun &bull; Angular ➔ React')
            ),
            React.createElement(
              'div',
              { className: 'avatar-card' },
              React.createElement(
                'div',
                { className: 'avatar-img-wrapper' },
                React.createElement('img', { src: 'assets/avatar.jpg', alt: 'Santosh Vijapure', className: 'avatar-img' })
              ),
              React.createElement('h2', { className: 'avatar-name' }, 'Santosh Vijapure'),
              React.createElement('p', { className: 'avatar-title' }, 'Senior Software Engineer'),
              React.createElement(
                'div',
                { className: 'avatar-location' },
                React.createElement('span', null, 'Frontend Architecture & Modernization')
              ),
              React.createElement(
                'div',
                { className: 'avatar-stats-mini' },
                React.createElement(
                  'div',
                  { className: 'mini-stat' },
                  React.createElement('span', { className: 'mini-stat-num' }, '5.5+'),
                  React.createElement('span', { className: 'mini-stat-label' }, 'Years Exp')
                ),
                React.createElement(
                  'div',
                  { className: 'mini-stat' },
                  React.createElement('span', { className: 'mini-stat-num' }, '+14.4%'),
                  React.createElement('span', { className: 'mini-stat-label' }, 'Conv. Lift')
                )
              )
            ),
            React.createElement(
              'div',
              { className: 'float-badge badge-bottom-right' },
              React.createElement('span', null, 'React &bull; TypeScript &bull; Observability')
            )
          )
        )
      )
    ),

    // Impact Metrics
    React.createElement(
      'section',
      { className: 'metrics-section' },
      React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'div',
          { className: 'metrics-grid' },
          React.createElement(
            'div',
            { className: 'metric-card' },
            React.createElement('span', { className: 'metric-number' }, '5.5+'),
            React.createElement('h3', { className: 'metric-label' }, 'Years Experience'),
            React.createElement('p', { className: 'metric-detail' }, 'Across Oportun, Airtel, and Betaflux delivering high scale')
          ),
          React.createElement(
            'div',
            { className: 'metric-card' },
            React.createElement('span', { className: 'metric-number' }, '+14.4%'),
            React.createElement('h3', { className: 'metric-label' }, 'Payment Conversion Lift'),
            React.createElement('p', { className: 'metric-detail' }, 'At Oportun alongside 18–23.8% higher CTR & 27% Tools enrollment')
          ),
          React.createElement(
            'div',
            { className: 'metric-card' },
            React.createElement('span', { className: 'metric-number' }, '1M+'),
            React.createElement('h3', { className: 'metric-label' }, 'Daily Visits Scaled'),
            React.createElement('p', { className: 'metric-detail' }, 'Managed across Airtel acquisitions and high-traffic funnels')
          ),
          React.createElement(
            'div',
            { className: 'metric-card' },
            React.createElement('span', { className: 'metric-number' }, '75%'),
            React.createElement('h3', { className: 'metric-label' }, 'Faster Debugging'),
            React.createElement('p', { className: 'metric-detail' }, 'From 2hrs down to 15-30m with New Relic & Session Replay')
          )
        )
      )
    ),

    // Work Experience Timeline
    React.createElement(
      'section',
      { id: 'experience' },
      React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'div',
          { className: 'section-tag' },
          React.createElement('span', null, 'Professional Experience')
        ),
        React.createElement(
          'h2',
          { className: 'section-heading' },
          'Engineering ',
          React.createElement('span', { className: 'gradient-text' }, 'Track Record'),
          '.'
        ),

        React.createElement(
          'div',
          { className: 'timeline-container' },

          // Oportun
          React.createElement(
            'article',
            { className: 'timeline-card' },
            React.createElement('div', { className: 'timeline-node' }, React.createElement('div', { className: 'timeline-node-inner' })),
            React.createElement(
              'div',
              { className: 'timeline-header' },
              React.createElement(
                'div',
                null,
                React.createElement('h3', { className: 'role-title' }, 'Senior Software Engineer'),
                React.createElement('div', { className: 'company-badge' }, 'Oportun • Full-time • May 2024 – Present (Remote, India)')
              )
            ),
            React.createElement(
              'ul',
              { className: 'experience-points' },
              React.createElement('li', null, React.createElement('strong', null, 'Angular to React Modernization: '), 'Defined multi-quarter technical roadmap, migration strategy, shared architecture, and engineering standards.'),
              React.createElement('li', null, React.createElement('strong', null, 'Shared Cross-Platform Business Logic Library: '), 'Reused across web and mobile apps, cutting duplication and accelerating future releases.'),
              React.createElement('li', null, React.createElement('strong', null, 'Single Best Offer (SBO) Re-Architecture: '), 'Consolidated 13 API integrations across 14 screens, driving a +14.4% payment conversion lift and 18-23.8% higher CTR.'),
              React.createElement('li', null, React.createElement('strong', null, 'Observability SME: '), 'Implemented New Relic dashboards, Session Replay, and WDIO automation, reducing debugging from 2 hours to 15-30 minutes.')
            ),
            React.createElement(
              'div',
              { className: 'award-banner' },
              React.createElement('span', { className: 'award-text' }, '🏆 Recipient of the Oportun L.O.V.E Recognition for modernization leadership.')
            ),
            React.createElement(
              'div',
              { className: 'tech-tags-wrap' },
              ['React', 'React Native', 'TypeScript', 'Redux Toolkit', 'Angular Migration', 'New Relic', 'WDIO', 'Tailwind CSS'].map((t, i) =>
                React.createElement('span', { key: i, className: 'tech-tag' }, t)
              )
            )
          ),

          // Airtel
          React.createElement(
            'article',
            { className: 'timeline-card' },
            React.createElement('div', { className: 'timeline-node' }, React.createElement('div', { className: 'timeline-node-inner' })),
            React.createElement(
              'div',
              { className: 'timeline-header' },
              React.createElement(
                'div',
                null,
                React.createElement('h3', { className: 'role-title' }, 'Software Engineer E1 – Frontend'),
                React.createElement('div', { className: 'company-badge' }, 'Airtel • Full-time • Mar 2021 – Apr 2024 (Pune, India)')
              )
            ),
            React.createElement(
              'ul',
              { className: 'experience-points' },
              React.createElement('li', null, React.createElement('strong', null, '1M+ Daily Scale Acquisitions: '), 'Built and optimized customer acquisition journeys serving over 1 million daily visits.'),
              React.createElement('li', null, React.createElement('strong', null, 'Configurable Analytics Platform: '), 'Built dynamic dashboard engine enabling business users to configure analytical charts without engineering effort.'),
              React.createElement('li', null, React.createElement('strong', null, 'Enterprise CEM Platform: '), 'Revamped Customer Experience Management platform processing 60,000+ daily cases with multi-tenancy.')
            ),
            React.createElement(
              'div',
              { className: 'award-banner' },
              React.createElement('span', { className: 'award-text' }, '🏆 Awarded the Airtel ACE Award for engineering excellence.')
            ),
            React.createElement(
              'div',
              { className: 'tech-tags-wrap' },
              ['React.js', 'Next.js', 'TypeScript', 'Redux Toolkit', 'Dynamic Dashboards', 'Multi-Tenancy', 'Jest'].map((t, i) =>
                React.createElement('span', { key: i, className: 'tech-tag' }, t)
              )
            )
          ),

          // Betaflux
          React.createElement(
            'article',
            { className: 'timeline-card' },
            React.createElement('div', { className: 'timeline-node' }, React.createElement('div', { className: 'timeline-node-inner' })),
            React.createElement(
              'div',
              { className: 'timeline-header' },
              React.createElement(
                'div',
                null,
                React.createElement('h3', { className: 'role-title' }, 'Associate Software Engineer – Frontend'),
                React.createElement('div', { className: 'company-badge' }, 'Betaflux • Full-time • Jul 2020 – Feb 2021 (Remote, India)')
              )
            ),
            React.createElement(
              'ul',
              { className: 'experience-points' },
              React.createElement('li', null, 'Built React and Next.js applications for warehousing logistics and ed-tech products.'),
              React.createElement('li', null, 'Integrated secure payment checkout workflows and achieved 90%+ Lighthouse performance scores.')
            )
          )
        )
      )
    ),

    // Contact Card
    React.createElement(
      'section',
      { id: 'contact' },
      React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          'div',
          { className: 'contact-card' },
          React.createElement(
            'div',
            { className: 'contact-content' },
            React.createElement(
              'div',
              { className: 'section-tag' },
              React.createElement('span', null, 'Get in Touch')
            ),
            React.createElement(
              'h2',
              { className: 'contact-heading' },
              'Let\'s Build Something ',
              React.createElement('span', { className: 'gradient-text' }, 'Extraordinary'),
              '.'
            ),
            React.createElement(
              'p',
              { className: 'contact-desc' },
              'Open to Senior Software Engineer and Lead Frontend opportunities. Feel free to connect or review my resume.'
            ),
            React.createElement(
              'div',
              { className: 'contact-actions' },
              React.createElement(
                'div',
                {
                  className: 'copy-email-box',
                  onClick: handleCopyEmail,
                  title: 'Click to copy email'
                },
                React.createElement(
                  'svg',
                  { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
                  React.createElement('rect', { x: 9, y: 9, width: 13, height: 13, rx: 2, ry: 2 }),
                  React.createElement('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })
                ),
                React.createElement('span', null, 'vijapuresantosh@gmail.com')
              ),
              React.createElement(
                'a',
                { href: 'tel:+917709141381', className: 'btn btn-secondary' },
                '+91 7709141381'
              ),
              React.createElement(
                'a',
                {
                  href: 'assets/resume.pdf',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: 'btn btn-primary'
                },
                'Download Resume (PDF)'
              )
            )
          )
        )
      )
    ),

    // Toast Notification
    toastVisible &&
      React.createElement(
        'div',
        { className: 'toast-notice visible' },
        React.createElement(
          'svg',
          { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 },
          React.createElement('polyline', { points: '20 6 9 17 4 12' })
        ),
        React.createElement('span', null, 'Email copied to clipboard!')
      )
  );
};
