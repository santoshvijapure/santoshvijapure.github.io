/**
 * Game Library Registry
 * Central configuration where games are registered.
 * Adding a new game is as easy as adding a new object to GAMES_REGISTRY!
 */

window.GAMES_REGISTRY = [
  {
    id: 'web-craft',
    title: 'WebCraft 3D: Minecraft Edition',
    category: 'arcade',
    badge: '3D Voxel Sandbox',
    tagline: 'Explore, mine, and build in a 3D procedural voxel sandbox world.',
    icon: '⛏️',
    difficulty: 'Sandbox',
    status: 'playable',
    rating: '5.0 ★',
    tags: ['Three.js', '3D Voxel', 'Minecraft Web', 'First-Person', 'Building'],
    controls: '[Click to Lock Pointer] • [W/A/S/D] Walk • [Space] Jump • [Left-Click] Mine • [Right-Click] Place • [1-7] Hotbar',
    description: 'A real first-person 3D voxel sandbox inspired by Minecraft! Explore procedural hills, oak trees, and clouds. Mine blocks with cracking sounds, place bricks, wood, TNT, and glass with 7 selectable hotbar materials.'
  },
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
    id: 'balloon-pop',
    title: 'Balloon Pop Blitz',
    category: 'kids',
    badge: 'Kids Favorite',
    tagline: 'Pop colorful floating balloons, collect golden stars, and unleash rainbow confetti bursts!',
    icon: '🎈',
    difficulty: 'Kids / Easy',
    status: 'playable',
    rating: '5.0 ★',
    tags: ['Kids', 'Touch Friendly', 'Sound Effects', 'Confetti', 'Endless Fun'],
    controls: 'Desktop: Click balloons to pop! Mobile/Tablet: Tap with fingers (Multi-touch support).',
    description: 'A cheerful balloon popping game designed for kids of all ages! Colorful balloons float gracefully into the sky. Tap or click them to pop with realistic rubber pop sounds, sparkles, and cascading confetti bursts. Features Zen Free-Pop mode and 60-Second Star Blitz!'
  },
  {
    id: 'dino-jump',
    title: 'Dino Jump: Candy Valley',
    category: 'kids',
    badge: 'Kids Runner',
    tagline: 'Help baby Dino leap across Candy Valley, jump over sweets, and collect golden star treats!',
    icon: '🦖',
    difficulty: 'Kids / Easy',
    status: 'playable',
    rating: '4.9 ★',
    tags: ['Kids Runner', 'One-Touch Jump', 'Double Jump', 'Charming', 'Side-Scroller'],
    controls: 'Desktop: [Spacebar], [Up Arrow], or Click to Jump. Tap again in mid-air to Double Jump!',
    description: 'A delightful endless runner where an adorable baby Dino dashes through magical Candy Valley under cheerful skies. Jump over cupcakes and mushrooms while collecting golden stars. Includes an instant acrobatic double-jump and bouncy audio chimes!'
  },
  {
    id: 'regex-racer',
    title: 'Regex Racer',
    category: 'puzzle',
    badge: 'Pattern Racer',
    tagline: 'Cyberpunk synthwave racer powered by regular expression pattern matching!',
    icon: '🏎️',
    difficulty: 'Medium',
    status: 'playable',
    rating: '5.0 ★',
    tags: ['RegEx', 'Cyberpunk', 'Synthwave', 'Typing', 'Speedrun'],
    controls: 'Type your Regex pattern and hit [Enter] or BOOST! Use Quick Token buttons for mobile/speed play.',
    description: 'Hit the neon synthwave highway in a high-speed cyberpunk racer! Craft regular expressions to target and vaporize approaching strings. Complete stages without hitting decoys to unleash blazing nitro thrusts and climb the leaderboard.'
  },
  {
    id: 'css-gridlock',
    title: 'CSS Gridlock',
    category: 'puzzle',
    badge: 'Flexbox Puzzle',
    tagline: 'Solve production layout chaos using real Flexbox and CSS Grid alignments!',
    icon: '🧩',
    difficulty: 'Easy / Medium',
    status: 'playable',
    rating: '5.0 ★',
    tags: ['CSS', 'Flexbox', 'Layouts', 'Web Dev', 'Puzzle'],
    controls: 'Click CSS property buttons (justify-content, align-items, flex-direction) to align target components!',
    description: 'The ultimate web developer challenge: How to center a <div> and fix broken production layouts! Click real Flexbox properties to glide components into their target zones and save the release from CSS chaos.'
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
  { id: 'kids', label: 'Kids Zone', icon: '🎈' },
  { id: 'arcade', label: 'Arcade & Action', icon: '👾' },
  { id: 'classic', label: 'Retro Classics', icon: '🕹️' },
  { id: 'puzzle', label: 'Brain & Puzzles', icon: '🧩' }
];
