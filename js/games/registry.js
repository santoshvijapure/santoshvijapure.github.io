/**
 * Game Library Registry
 * Central configuration where games are registered.
 * Adding a new game is as easy as adding a new object to GAMES_REGISTRY!
 */

window.GAMES_REGISTRY = [
  {
    id: 'code-defender',
    title: 'Code Defender: Production Panic',
    category: 'arcade',
    badge: 'Flagship Shooter',
    tagline: 'Defend production servers from bugs, memory leaks, and the Legacy Monolith Boss.',
    icon: '👾',
    difficulty: 'Medium',
    status: 'playable',
    rating: '5.0 ★',
    tags: ['Canvas 2D', 'Space Shooter', 'Web Audio API', 'Boss Fight'],
    controls: 'Desktop: [A]/[D] or [Arrows] to Move, [Space] to Shoot. Mobile: On-Screen D-Pad & Fire.',
    description: 'A 60 FPS retro space-invader style arcade shooter. Collect React 19 Turbo, Lighthouse 100 Shields, and Espresso Speed Boosts across 3 career waves ending with the Legacy Monolith Boss fight!'
  },
  {
    id: 'dev-snake',
    title: 'DevSnake: Memory Leak Hunter',
    category: 'classic',
    badge: 'Retro Classic',
    tagline: 'Collect clean code commits and garbage collect bugs before your memory overflows.',
    icon: '🐍',
    difficulty: 'Easy',
    status: 'playable',
    rating: '4.8 ★',
    tags: ['Retro Arcade', 'Snake', 'Garbage Collector', 'Quick Play'],
    controls: 'Desktop: [Arrows] or [W/A/S/D] to steer. Mobile: Swipe or On-Screen arrows.',
    description: 'Navigate the runtime memory grid. Slurp up clean commits (green nodes) to increase your sprint velocity, and avoid running into unresolved merge conflicts and memory boundaries.'
  },
  {
    id: 'dev-2048',
    title: 'Merge Conflict: 2048 Dev Edition',
    category: 'puzzle',
    badge: 'Dev Puzzle',
    tagline: 'Merge code branches from git init all the way to a Production Release!',
    icon: '🔢',
    difficulty: 'Hard',
    status: 'playable',
    rating: '4.9 ★',
    tags: ['Puzzle', 'Git Workflow', 'Brain Teaser', 'Strategy'],
    controls: 'Desktop: [Arrow Keys] or [W/A/S/D] to slide. Mobile: Touch Swipe.',
    description: 'A developer twist on 2048. Slide and merge matching branches: 2 (git init) + 2 = 4 (Commit) &rarr; 8 (Branch) &rarr; 16 (Pull Request) &rarr; ... &rarr; 2048 (Production Deploy)!'
  },
  {
    id: 'regex-racer',
    title: 'Regex Racer',
    category: 'puzzle',
    badge: 'Coming Soon',
    tagline: 'High-speed pattern matching against the clock.',
    icon: '🏎️',
    difficulty: 'Hard',
    status: 'upcoming',
    rating: 'Preview',
    tags: ['RegEx', 'Typing', 'Speedrun'],
    controls: 'Keyboard Pattern Matching',
    description: 'In active development! Race through pattern-matching tracks by crafting regex expressions that capture target strings in record time.'
  },
  {
    id: 'css-gridlock',
    title: 'CSS Gridlock',
    category: 'puzzle',
    badge: 'Coming Soon',
    tagline: 'Solve layout chaos using Flexbox and CSS Grid alignments.',
    icon: '🧩',
    difficulty: 'Medium',
    status: 'upcoming',
    rating: 'Preview',
    tags: ['CSS', 'Flexbox', 'Layouts'],
    controls: 'Drag & Drop Alignments',
    description: 'In active development! A puzzle game where you fix broken production CSS layouts and unstick misaligned DOM elements.'
  },
  {
    id: 'algo-dungeon',
    title: 'Algo Dungeon: Big-O Crawler',
    category: 'arcade',
    badge: 'Coming Soon',
    tagline: 'Dungeon crawler powered by sorting and graph traversal algorithms.',
    icon: '⚔️',
    difficulty: 'Expert',
    status: 'upcoming',
    rating: 'Preview',
    tags: ['Algorithms', 'Dungeon Crawler', 'Data Structures'],
    controls: 'Keyboard & Inventory',
    description: 'In active development! Defeat O(N^2) complexity monsters using optimal O(N log N) spells and binary search teleports.'
  }
];

window.GAME_CATEGORIES = [
  { id: 'all', label: 'All Games', icon: '🎮' },
  { id: 'arcade', label: 'Arcade & Action', icon: '👾' },
  { id: 'classic', label: 'Retro Classics', icon: '🕹️' },
  { id: 'puzzle', label: 'Brain & Puzzles', icon: '🧩' }
];
