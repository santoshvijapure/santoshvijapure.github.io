/**
 * WebCraft 3D: Minecraft Web Edition
 * A complete first-person 3D voxel sandbox engine built with Three.js.
 * Features procedural terrain generation, oak trees, block mining & placing,
 * procedural pixel-art block textures, hotbar selection, and Web Audio API sounds.
 */

window.createWebCraftGame = function (containerId, onScoreUpdate, onGameOver) {
  const container = document.getElementById(containerId);
  if (!container || !window.THREE) return null;

  const THREE = window.THREE;
  let animId = null;

  // --- Audio Synthesizer ---
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playSound(type) {
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === 'break') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.12);
      } else if (type === 'place') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.1);
      } else if (type === 'step') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(now + 0.05);
      }
    } catch (e) {}
  }

  // --- Procedural 32x32 Block Textures ---
  function createProceduralTexture(type, side = 'all') {
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const ctx = c.getContext('2d');

    if (type === 'dirt') {
      ctx.fillStyle = '#866043';
      ctx.fillRect(0, 0, 32, 32);
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = Math.random() < 0.5 ? '#68482f' : '#9c7352';
        ctx.fillRect(Math.floor(Math.random() * 32), Math.floor(Math.random() * 32), 2, 2);
      }
    } else if (type === 'grass') {
      if (side === 'top') {
        ctx.fillStyle = '#5b8c32';
        ctx.fillRect(0, 0, 32, 32);
        for (let i = 0; i < 70; i++) {
          ctx.fillStyle = Math.random() < 0.5 ? '#4c7828' : '#6ea33d';
          ctx.fillRect(Math.floor(Math.random() * 32), Math.floor(Math.random() * 32), 2, 2);
        }
      } else if (side === 'bottom') {
        ctx.fillStyle = '#866043';
        ctx.fillRect(0, 0, 32, 32);
      } else {
        // Grass side: green overhang over dirt base
        ctx.fillStyle = '#866043';
        ctx.fillRect(0, 0, 32, 32);
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = '#68482f';
          ctx.fillRect(Math.floor(Math.random() * 32), Math.floor(Math.random() * 32), 2, 2);
        }
        ctx.fillStyle = '#5b8c32';
        ctx.fillRect(0, 0, 32, 8);
        for (let x = 0; x < 32; x += 4) {
          const drop = Math.floor(Math.random() * 6) + 4;
          ctx.fillRect(x, 8, 4, drop);
        }
      }
    } else if (type === 'stone') {
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(0, 0, 32, 32);
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = Math.random() < 0.5 ? '#5e5e5e' : '#949494';
        ctx.fillRect(Math.floor(Math.random() * 32), Math.floor(Math.random() * 32), 2, 2);
      }
    } else if (type === 'wood') {
      ctx.fillStyle = '#bc9862';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#9c7946';
      for (let y = 0; y < 32; y += 8) {
        ctx.fillRect(0, y, 32, 1);
      }
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = '#a6824d';
        ctx.fillRect(Math.floor(Math.random() * 32), Math.floor(Math.random() * 32), 2, 2);
      }
    } else if (type === 'leaves') {
      ctx.fillStyle = '#376822';
      ctx.fillRect(0, 0, 32, 32);
      for (let i = 0; i < 90; i++) {
        ctx.fillStyle = Math.random() < 0.5 ? '#2c531a' : '#49852f';
        ctx.fillRect(Math.floor(Math.random() * 32), Math.floor(Math.random() * 32), 3, 3);
      }
    } else if (type === 'brick') {
      ctx.fillStyle = '#9c493b';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#d1c0b4';
      ctx.fillRect(0, 8, 32, 2);
      ctx.fillRect(0, 18, 32, 2);
      ctx.fillRect(0, 28, 32, 2);
      ctx.fillRect(16, 0, 2, 8);
      ctx.fillRect(8, 10, 2, 8);
      ctx.fillRect(24, 10, 2, 8);
      ctx.fillRect(16, 20, 2, 8);
    } else if (type === 'tnt') {
      ctx.fillStyle = '#db3b26';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 10, 32, 12);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('TNT', 6, 19);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  // Materials Cache
  const materials = {
    dirt: new THREE.MeshLambertMaterial({ map: createProceduralTexture('dirt') }),
    grass: [
      new THREE.MeshLambertMaterial({ map: createProceduralTexture('grass', 'side') }),
      new THREE.MeshLambertMaterial({ map: createProceduralTexture('grass', 'side') }),
      new THREE.MeshLambertMaterial({ map: createProceduralTexture('grass', 'top') }),
      new THREE.MeshLambertMaterial({ map: createProceduralTexture('grass', 'bottom') }),
      new THREE.MeshLambertMaterial({ map: createProceduralTexture('grass', 'side') }),
      new THREE.MeshLambertMaterial({ map: createProceduralTexture('grass', 'side') })
    ],
    stone: new THREE.MeshLambertMaterial({ map: createProceduralTexture('stone') }),
    wood: new THREE.MeshLambertMaterial({ map: createProceduralTexture('wood') }),
    leaves: new THREE.MeshLambertMaterial({ map: createProceduralTexture('leaves') }),
    brick: new THREE.MeshLambertMaterial({ map: createProceduralTexture('brick') }),
    tnt: new THREE.MeshLambertMaterial({ map: createProceduralTexture('tnt') })
  };

  const BLOCK_TYPES = [
    { id: 'grass', name: 'Grass Block', icon: '🟩', mat: materials.grass },
    { id: 'dirt', name: 'Dirt Block', icon: '🟫', mat: materials.dirt },
    { id: 'stone', name: 'Stone Block', icon: '⬜', mat: materials.stone },
    { id: 'wood', name: 'Wood Planks', icon: '🪵', mat: materials.wood },
    { id: 'brick', name: 'Red Bricks', icon: '🧱', mat: materials.brick },
    { id: 'leaves', name: 'Oak Leaves', icon: '🍃', mat: materials.leaves },
    { id: 'tnt', name: 'TNT Explosive', icon: '🧨', mat: materials.tnt }
  ];

  let selectedBlockIdx = 0;

  // Setup DOM Elements
  container.innerHTML = `
    <div class="webcraft-container" style="position: relative; width: 100%; height: 560px; overflow: hidden; background: #87ceeb; border-radius: 14px;">
      <div id="webcraftViewport" style="width: 100%; height: 100%;"></div>

      <!-- Center Crosshair -->
      <div class="webcraft-crosshair" style="position: absolute; top: 50%; left: 50%; width: 14px; height: 14px; transform: translate(-50%, -50%); pointer-events: none; z-index: 10;">
        <div style="position: absolute; top: 6px; left: 0; width: 14px; height: 2px; background: rgba(255,255,255,0.8); box-shadow: 0 0 2px #000;"></div>
        <div style="position: absolute; top: 0; left: 6px; width: 2px; height: 14px; background: rgba(255,255,255,0.8); box-shadow: 0 0 2px #000;"></div>
      </div>

      <!-- Controls Overlay Prompt -->
      <div id="webcraftOverlay" style="position: absolute; inset: 0; background: rgba(7, 9, 14, 0.75); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 20; color: #fff; cursor: pointer; text-align: center; padding: 20px;">
        <h2 style="font-size: 2rem; margin-bottom: 8px; color: #38bdf8;">⛏️ WEBCRAFT 3D</h2>
        <p style="font-size: 1rem; color: #cbd5e1; margin-bottom: 16px;">Click anywhere to enter first-person voxel world</p>
        <div style="font-family: monospace; font-size: 0.85rem; color: #94a3b8; line-height: 1.8; background: rgba(255,255,255,0.06); padding: 12px 20px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);">
          [W/A/S/D] Walk &bull; [Space] Jump &bull; [Mouse] Look Around<br/>
          [Left Click] Mine/Break Block &bull; [Right Click] Place Block<br/>
          [1-7] Select Active Hotbar Block
        </div>
      </div>

      <!-- Hotbar on Bottom -->
      <div id="webcraftHotbar" style="position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; background: rgba(15, 20, 34, 0.9); border: 2px solid rgba(255,255,255,0.2); padding: 6px; border-radius: 12px; z-index: 15;">
        ${BLOCK_TYPES.map(
          (b, i) => `
          <button class="hotbar-slot ${i === 0 ? 'active' : ''}" data-idx="${i}" style="width: 44px; height: 44px; background: ${i === 0 ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)'}; border: 2px solid ${i === 0 ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; border-radius: 8px; font-size: 1.3rem; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative;">
            <span>${b.icon}</span>
            <span style="position: absolute; bottom: 2px; right: 4px; font-size: 10px; font-family: monospace; color: #94a3b8;">${i + 1}</span>
          </button>
        `
        ).join('')}
      </div>

      <!-- Block Counter HUD -->
      <div style="position: absolute; top: 16px; left: 16px; font-family: monospace; font-size: 12px; color: #fff; background: rgba(0,0,0,0.6); padding: 6px 12px; border-radius: 6px; z-index: 10;">
        BLOCKS MINED: <span id="webcraftMinedCount">0</span>
      </div>
    </div>
  `;

  const viewport = document.getElementById('webcraftViewport');
  const overlay = document.getElementById('webcraftOverlay');
  const minedCountEl = document.getElementById('webcraftMinedCount');

  // Three.js Scene Setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#78b5e8');
  scene.fog = new THREE.FogExp2('#78b5e8', 0.025);

  const aspect = viewport.clientWidth / viewport.clientHeight;
  const camera = new THREE.PerspectiveCamera(70, aspect, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(viewport.clientWidth, viewport.clientHeight);
  renderer.shadowMap.enabled = true;
  viewport.appendChild(renderer.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 0.85);
  sunLight.position.set(40, 80, 50);
  scene.add(sunLight);

  // Voxel Block Geometry
  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  const blocks = new Map(); // key "x,y,z" -> Mesh

  function addBlock(x, y, z, mat) {
    const key = `${x},${y},${z}`;
    if (blocks.has(key)) return;

    const mesh = new THREE.Mesh(boxGeo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    blocks.set(key, mesh);
    return mesh;
  }

  function removeBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    const mesh = blocks.get(key);
    if (mesh) {
      scene.remove(mesh);
      blocks.delete(key);
      return true;
    }
    return false;
  }

  // Generate Procedural Terrain
  const WORLD_SIZE = 20;
  for (let x = -WORLD_SIZE / 2; x <= WORLD_SIZE / 2; x++) {
    for (let z = -WORLD_SIZE / 2; z <= WORLD_SIZE / 2; z++) {
      // Sinusoidal hills
      const height = Math.floor(Math.sin(x * 0.35) * Math.cos(z * 0.35) * 2.5 + 4);

      // Bedrock / Stone
      for (let y = 0; y < height - 2; y++) {
        addBlock(x, y, z, materials.stone);
      }
      // Dirt
      for (let y = Math.max(0, height - 2); y < height; y++) {
        addBlock(x, y, z, materials.dirt);
      }
      // Grass Top
      addBlock(x, height, z, materials.grass);

      // Random Oak Trees
      if (Math.random() < 0.025 && x > -8 && x < 8 && z > -8 && z < 8) {
        const treeY = height + 1;
        // Trunk
        for (let ty = 0; ty < 4; ty++) {
          addBlock(x, treeY + ty, z, materials.wood);
        }
        // Leaf crown
        for (let lx = -1; lx <= 1; lx++) {
          for (let lz = -1; lz <= 1; lz++) {
            for (let ly = 3; ly <= 4; ly++) {
              if (lx === 0 && lz === 0 && ly === 3) continue;
              addBlock(x + lx, treeY + ly, z + lz, materials.leaves);
            }
          }
        }
        addBlock(x, treeY + 5, z, materials.leaves);
      }
    }
  }

  // Player State
  const player = {
    position: new THREE.Vector3(0, 10, 0),
    velocity: new THREE.Vector3(),
    rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
    canJump: true,
    blocksMined: 0
  };

  camera.position.copy(player.position);

  // Controls State
  const move = { fwd: false, bwd: false, left: false, right: false, jump: false };
  let isLocked = false;

  // Pointer lock handling
  overlay.addEventListener('click', () => {
    initAudio();
    overlay.style.display = 'none';
    renderer.domElement.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    isLocked = document.pointerLockElement === renderer.domElement;
    if (!isLocked) {
      overlay.style.display = 'flex';
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (!isLocked) return;
    const sensitivity = 0.0022;
    player.rotation.y -= e.movementX * sensitivity;
    player.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, player.rotation.x - e.movementY * sensitivity));
    camera.quaternion.setFromEuler(player.rotation);
  });

  // Hotbar UI Selection
  const hotbarBtns = container.querySelectorAll('.hotbar-slot');
  function selectHotbar(idx) {
    if (idx < 0 || idx >= BLOCK_TYPES.length) return;
    selectedBlockIdx = idx;
    hotbarBtns.forEach((btn, i) => {
      btn.style.background = i === idx ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)';
      btn.style.borderColor = i === idx ? '#38bdf8' : 'rgba(255,255,255,0.1)';
    });
  }

  hotbarBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectHotbar(parseInt(btn.dataset.idx, 10));
    });
  });

  // Raycaster for Mining & Building
  const raycaster = new THREE.Raycaster();
  raycaster.far = 7.0; // Reach distance

  function handlePointerAction(button) {
    if (!isLocked) return;
    initAudio();

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const meshes = Array.from(blocks.values());
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const p = hit.object.position;

      if (button === 0) {
        // Mine / Destroy block
        removeBlock(p.x, p.y, p.z);
        playSound('break');
        player.blocksMined++;
        if (minedCountEl) minedCountEl.textContent = player.blocksMined;
        if (onScoreUpdate) onScoreUpdate(player.blocksMined * 50);
      } else if (button === 2) {
        // Place selected block at normal offset
        const norm = hit.face.normal;
        const placeX = Math.round(p.x + norm.x);
        const placeY = Math.round(p.y + norm.y);
        const placeZ = Math.round(p.z + norm.z);

        // Don't place inside player body
        const playerBlockX = Math.round(player.position.x);
        const playerBlockY = Math.round(player.position.y);
        const playerBlockZ = Math.round(player.position.z);

        if (
          placeX === playerBlockX &&
          (placeY === playerBlockY || placeY === playerBlockY - 1) &&
          placeZ === playerBlockZ
        ) {
          return;
        }

        const selectedMat = BLOCK_TYPES[selectedBlockIdx].mat;
        addBlock(placeX, placeY, placeZ, selectedMat);
        playSound('place');
      }
    }
  }

  renderer.domElement.addEventListener('mousedown', (e) => {
    handlePointerAction(e.button);
  });

  // Prevent right-click context menu on canvas
  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

  // Keyboard Handler
  function handleKeyDown(e) {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') move.fwd = true;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') move.bwd = true;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') move.left = true;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') move.right = true;
    if (e.code === 'Space') {
      if (player.canJump) {
        player.velocity.y = 8.5;
        player.canJump = false;
        playSound('step');
      }
      e.preventDefault();
    }

    // Number keys 1-7 for hotbar
    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= BLOCK_TYPES.length) {
      selectHotbar(num - 1);
    }
  }

  function handleKeyUp(e) {
    if (e.code === 'KeyW' || e.code === 'ArrowUp') move.fwd = false;
    if (e.code === 'KeyS' || e.code === 'ArrowDown') move.bwd = false;
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') move.left = false;
    if (e.code === 'KeyD' || e.code === 'ArrowRight') move.right = false;
  }

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Resize Listener
  function onResize() {
    if (!viewport) return;
    const w = viewport.clientWidth;
    const h = viewport.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // Physics & Game Loop
  let lastTime = performance.now();

  function animate(now) {
    animId = requestAnimationFrame(animate);

    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (isLocked) {
      // Movement relative to camera yaw
      const moveSpeed = 7.0;
      const fwdVec = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
      const sideVec = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);

      const moveDir = new THREE.Vector3();
      if (move.fwd) moveDir.add(fwdVec);
      if (move.bwd) moveDir.sub(fwdVec);
      if (move.left) moveDir.sub(sideVec);
      if (move.right) moveDir.add(sideVec);

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize().multiplyScalar(moveSpeed * dt);
        player.position.add(moveDir);
      }

      // Gravity
      player.velocity.y -= 22 * dt;
      player.position.y += player.velocity.y * dt;

      // Ground collision (find block below feet)
      const feetX = Math.round(player.position.x);
      const feetZ = Math.round(player.position.z);

      let highestBlock = 0;
      for (let y = 20; y >= 0; y--) {
        if (blocks.has(`${feetX},${y},${feetZ}`)) {
          highestBlock = y + 1.8; // Player eye height
          break;
        }
      }

      if (player.position.y <= highestBlock) {
        player.position.y = highestBlock;
        player.velocity.y = 0;
        player.canJump = true;
      }

      camera.position.copy(player.position);
    }

    renderer.render(scene, camera);
  }

  animId = requestAnimationFrame(animate);

  return {
    destroy: () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', onResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      container.innerHTML = '';
    },
    restart: () => {
      player.position.set(0, 10, 0);
      player.velocity.set(0, 0, 0);
    }
  };
};
