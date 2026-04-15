const PLANET_SIZE = 800;
const WALK_SPEED  = 80;

const PLANET_TYPES = {
  'planet-terran': {
    ground: 0x3a7a3a, accent: 0x2a5a2a, name: 'Terran',
    resources: ['plant-fiber', 'water-sample', 'bio-matter'],
  },
  'planet-ice': {
    ground: 0x8ab8cc, accent: 0x6a98bb, name: 'Ice',
    resources: ['ice-crystal', 'cryo-compound', 'water-sample'],
  },
  'planet-lava': {
    ground: 0x6a2a1a, accent: 0x4a1a0a, name: 'Lava',
    resources: ['magma-ore', 'obsidian-shard', 'thermal-core'],
  },
  'planet-barren': {
    ground: 0x7a6a5a, accent: 0x5a4a3a, name: 'Barren',
    resources: ['scrap-metal', 'dust-crystal', 'ancient-relic'],
  },
};

class PlanetScene extends Phaser.Scene {
  constructor() { super({ key: 'PlanetScene' }); }

  init(data) {
    this.planetInfo = data.planet;
  }

  preload() {
    this.load.image('landed-ship', VOID_MAIN + 'Main Ship/Main Ship - Bases/PNGs/Main Ship - Base - Full health.png');
    this.load.spritesheet('astronaut', 'assets/sprites/astronaut/Astronaut.png', { frameWidth: 64, frameHeight: 64 });
  }

  create() {
    const pType = PLANET_TYPES[this.planetInfo.key] || PLANET_TYPES['planet-barren'];

    // ── Ground ───────────────────────────────────────────────────────
    const gfx = this.add.graphics();
    gfx.fillStyle(pType.ground);
    gfx.fillRect(0, 0, PLANET_SIZE, PLANET_SIZE);

    // Terrain variation — layered patches for natural look
    for (let layer = 0; layer < 3; layer++) {
      const alpha = [0.15, 0.25, 0.35][layer];
      const count = [30, 40, 25][layer];
      gfx.fillStyle(pType.accent, alpha);
      for (let i = 0; i < count; i++) {
        const rx = Phaser.Math.Between(0, PLANET_SIZE - 40);
        const ry = Phaser.Math.Between(0, PLANET_SIZE - 40);
        const rw = Phaser.Math.Between(15, 90);
        const rh = Phaser.Math.Between(15, 70);
        gfx.fillRoundedRect(rx, ry, rw, rh, Phaser.Math.Between(3, 10));
      }
    }

    // Terrain features based on planet type
    if (pType.name === 'Terran') {
      // Grass tufts
      for (let i = 0; i < 60; i++) {
        const gx = Phaser.Math.Between(10, PLANET_SIZE - 10);
        const gy = Phaser.Math.Between(10, PLANET_SIZE - 10);
        const shade = Phaser.Math.Between(0, 1) ? 0x338833 : 0x2a7a2a;
        gfx.fillStyle(shade, 0.5);
        gfx.fillCircle(gx, gy, Phaser.Math.Between(1, 3));
      }
      // Trees / vegetation (larger, more layered)
      for (let i = 0; i < 30; i++) {
        const tx = Phaser.Math.Between(30, PLANET_SIZE - 30);
        const ty = Phaser.Math.Between(30, PLANET_SIZE - 30);
        const treeSize = Phaser.Math.Between(6, 14);
        // Trunk
        gfx.fillStyle(0x4a3520); gfx.fillRect(tx - 1, ty, 3, treeSize * 0.6);
        // Canopy shadow
        gfx.fillStyle(0x1a5518); gfx.fillCircle(tx, ty - 1, treeSize);
        // Canopy highlight
        gfx.fillStyle(0x33aa33); gfx.fillCircle(tx - 1, ty - 3, treeSize * 0.7);
      }
      // Water pools with shore gradient
      for (let i = 0; i < 7; i++) {
        const wx = Phaser.Math.Between(60, PLANET_SIZE - 60);
        const wy = Phaser.Math.Between(60, PLANET_SIZE - 60);
        const ww = Phaser.Math.Between(30, 70);
        const wh = Phaser.Math.Between(15, 35);
        gfx.fillStyle(0x44aa77, 0.3); gfx.fillEllipse(wx, wy, ww + 8, wh + 6); // shore
        gfx.fillStyle(0x2266aa, 0.6); gfx.fillEllipse(wx, wy, ww, wh);
        gfx.fillStyle(0x4488cc, 0.3); gfx.fillEllipse(wx - 3, wy - 2, ww * 0.4, wh * 0.3); // glint
      }
      // Flower patches
      const flowerColors = [0xff6688, 0xffaa44, 0xffff66, 0xcc88ff];
      for (let i = 0; i < 15; i++) {
        const fx = Phaser.Math.Between(20, PLANET_SIZE - 20);
        const fy = Phaser.Math.Between(20, PLANET_SIZE - 20);
        gfx.fillStyle(flowerColors[i % flowerColors.length], 0.7);
        gfx.fillCircle(fx, fy, 2);
        gfx.fillCircle(fx + 3, fy + 1, 1.5);
      }
    } else if (pType.name === 'Ice') {
      // Frost texture overlay
      for (let i = 0; i < 40; i++) {
        gfx.fillStyle(0xeef4ff, Phaser.Math.FloatBetween(0.05, 0.15));
        const fx = Phaser.Math.Between(0, PLANET_SIZE);
        const fy = Phaser.Math.Between(0, PLANET_SIZE);
        gfx.fillCircle(fx, fy, Phaser.Math.Between(10, 40));
      }
      // Ice formations / crystals (taller, more detailed)
      for (let i = 0; i < 30; i++) {
        const ix = Phaser.Math.Between(20, PLANET_SIZE - 20);
        const iy = Phaser.Math.Between(20, PLANET_SIZE - 20);
        const size = Phaser.Math.Between(3, 12);
        // Crystal shadow
        gfx.fillStyle(0x6688aa, 0.3);
        gfx.fillTriangle(ix + 2, iy - size * 2, ix - size + 2, iy + 2, ix + size + 2, iy + 2);
        // Crystal body
        gfx.fillStyle(0xccddff, 0.7);
        gfx.fillTriangle(ix, iy - size * 2, ix - size, iy, ix + size, iy);
        // Crystal highlight
        gfx.fillStyle(0xeef8ff, 0.4);
        gfx.fillTriangle(ix - 1, iy - size * 1.5, ix - size * 0.3, iy - size * 0.3, ix + size * 0.2, iy - size * 0.5);
      }
      // Snow drifts (more, varied)
      for (let i = 0; i < 14; i++) {
        const sx = Phaser.Math.Between(0, PLANET_SIZE);
        const sy = Phaser.Math.Between(0, PLANET_SIZE);
        gfx.fillStyle(0xddeeff, 0.25); gfx.fillEllipse(sx, sy, Phaser.Math.Between(30, 120), Phaser.Math.Between(15, 50));
      }
      // Frozen cracks
      for (let i = 0; i < 8; i++) {
        const cx = Phaser.Math.Between(50, PLANET_SIZE - 50);
        const cy = Phaser.Math.Between(50, PLANET_SIZE - 50);
        gfx.lineStyle(1, 0xaaccdd, 0.4);
        let px = cx, py = cy;
        for (let j = 0; j < 5; j++) {
          const nx = px + Phaser.Math.Between(-20, 20);
          const ny = py + Phaser.Math.Between(-20, 20);
          gfx.lineBetween(px, py, nx, ny);
          px = nx; py = ny;
        }
      }
    } else if (pType.name === 'Lava') {
      // Scorched ground patches
      for (let i = 0; i < 20; i++) {
        gfx.fillStyle(0x1a0800, 0.3);
        gfx.fillCircle(Phaser.Math.Between(20, PLANET_SIZE - 20), Phaser.Math.Between(20, PLANET_SIZE - 20), Phaser.Math.Between(10, 30));
      }
      // Lava rivers (curved, glowing)
      for (let i = 0; i < 8; i++) {
        let lx = Phaser.Math.Between(0, PLANET_SIZE);
        let ly = Phaser.Math.Between(0, PLANET_SIZE);
        const width = Phaser.Math.Between(3, 10);
        // Glow
        gfx.lineStyle(width + 4, 0xff2200, 0.15);
        const pts = [];
        for (let j = 0; j < 4; j++) {
          const nx = lx + Phaser.Math.Between(-60, 60);
          const ny = ly + Phaser.Math.Between(-60, 60);
          gfx.lineBetween(lx, ly, nx, ny);
          pts.push({ x: lx, y: ly });
          lx = nx; ly = ny;
        }
        // Core
        gfx.lineStyle(width, 0xff4400, 0.6);
        for (let j = 0; j < pts.length - 1; j++) {
          gfx.lineBetween(pts[j].x, pts[j].y, pts[j+1].x, pts[j+1].y);
        }
        // Bright center
        gfx.lineStyle(Math.max(1, width - 2), 0xff8800, 0.3);
        for (let j = 0; j < pts.length - 1; j++) {
          gfx.lineBetween(pts[j].x, pts[j].y, pts[j+1].x, pts[j+1].y);
        }
      }
      // Volcanic vents (with glow rings)
      for (let i = 0; i < 12; i++) {
        const vx = Phaser.Math.Between(30, PLANET_SIZE - 30);
        const vy = Phaser.Math.Between(30, PLANET_SIZE - 30);
        const vr = Phaser.Math.Between(4, 10);
        gfx.fillStyle(0xff4400, 0.15); gfx.fillCircle(vx, vy, vr * 3); // glow
        gfx.fillStyle(0x331100); gfx.fillCircle(vx, vy, vr);
        gfx.fillStyle(0xff6600, 0.5); gfx.fillCircle(vx, vy, vr * 0.5);
      }
      // Obsidian shards scattered
      for (let i = 0; i < 15; i++) {
        const ox = Phaser.Math.Between(10, PLANET_SIZE - 10);
        const oy = Phaser.Math.Between(10, PLANET_SIZE - 10);
        gfx.fillStyle(0x221122, 0.6);
        gfx.fillTriangle(ox, oy - 4, ox - 2, oy + 2, ox + 2, oy + 2);
      }
    } else {
      // Barren — craters and rocks (more detailed)
      // Large craters with depth
      for (let i = 0; i < 10; i++) {
        const cx = Phaser.Math.Between(40, PLANET_SIZE - 40);
        const cy = Phaser.Math.Between(40, PLANET_SIZE - 40);
        const cr = Phaser.Math.Between(12, 35);
        gfx.fillStyle(0x444433, 0.2); gfx.fillCircle(cx, cy, cr + 3); // rim
        gfx.lineStyle(1, 0x555544, 0.5); gfx.strokeCircle(cx, cy, cr);
        gfx.fillStyle(0x333322, 0.4); gfx.fillCircle(cx + 1, cy + 1, cr - 3); // shadow
        gfx.fillStyle(0x555544, 0.15); gfx.fillCircle(cx - 2, cy - 2, cr * 0.4); // highlight
      }
      // Small craters
      for (let i = 0; i < 20; i++) {
        const cx = Phaser.Math.Between(20, PLANET_SIZE - 20);
        const cy = Phaser.Math.Between(20, PLANET_SIZE - 20);
        const cr = Phaser.Math.Between(3, 8);
        gfx.lineStyle(1, 0x555544, 0.3); gfx.strokeCircle(cx, cy, cr);
      }
      // Scattered rocks (varied sizes)
      for (let i = 0; i < 35; i++) {
        const rx = Phaser.Math.Between(10, PLANET_SIZE - 10);
        const ry = Phaser.Math.Between(10, PLANET_SIZE - 10);
        const rr = Phaser.Math.Between(1, 6);
        gfx.fillStyle(Phaser.Math.Between(0, 1) ? 0x666655 : 0x776655);
        gfx.fillCircle(rx, ry, rr);
        if (rr > 3) { gfx.fillStyle(0x888877, 0.3); gfx.fillCircle(rx - 1, ry - 1, rr * 0.4); }
      }
      // Dust trails
      for (let i = 0; i < 6; i++) {
        let dx = Phaser.Math.Between(50, PLANET_SIZE - 50);
        let dy = Phaser.Math.Between(50, PLANET_SIZE - 50);
        gfx.lineStyle(Phaser.Math.Between(2, 5), 0x665544, 0.15);
        for (let j = 0; j < 4; j++) {
          const nx = dx + Phaser.Math.Between(-30, 30);
          const ny = dy + Phaser.Math.Between(-30, 30);
          gfx.lineBetween(dx, dy, nx, ny);
          dx = nx; dy = ny;
        }
      }
    }

    // ── Ambient particles ────────────────────────────────────────────
    this._createAmbientParticles(pType);

    // ── World bounds ─────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, PLANET_SIZE, PLANET_SIZE);

    // ── Landed ship (return point) ───────────────────────────────────
    this.landedShip = this.add.image(PLANET_SIZE / 2, PLANET_SIZE / 2, 'landed-ship');
    this.landedShip.setScale(1.5).setDepth(1).setAngle(0);

    this.shipPromptVisible = false;

    // ── Settlement ──────────────────────────────────────────────────
    this.settlement = PLANET_SETTLEMENTS[this.planetInfo.name] || null;
    if (this.settlement) {
      const sx = 200, sy = 200;
      const gfx2 = this.add.graphics();
      // Main building
      gfx2.fillStyle(0x444455); gfx2.fillRect(sx - 28, sy - 18, 56, 36);
      gfx2.fillStyle(0x555566); gfx2.fillRect(sx - 25, sy - 20, 50, 34);
      // Roof
      gfx2.fillStyle(0x666677); gfx2.fillTriangle(sx - 30, sy - 18, sx + 30, sy - 18, sx, sy - 35);
      // Door
      gfx2.fillStyle(0x334455); gfx2.fillRect(sx - 5, sy + 2, 10, 14);
      // Windows (warm light)
      gfx2.fillStyle(0xffcc66, 0.7); gfx2.fillRect(sx - 18, sy - 10, 6, 6);
      gfx2.fillStyle(0xffcc66, 0.7); gfx2.fillRect(sx + 12, sy - 10, 6, 6);
      // Antenna / beacon
      gfx2.lineStyle(1, 0x88aacc); gfx2.lineBetween(sx, sy - 35, sx, sy - 45);
      gfx2.fillStyle(0x44ff88, 0.8); gfx2.fillCircle(sx, sy - 46, 2);
      // Side building
      gfx2.fillStyle(0x3a3a4a); gfx2.fillRect(sx + 32, sy - 10, 20, 26);
      gfx2.fillStyle(0x4a4a5a); gfx2.fillRect(sx + 34, sy - 12, 16, 24);
      gfx2.fillStyle(0xffcc66, 0.5); gfx2.fillRect(sx + 38, sy - 6, 4, 4);
      // Ground pad
      gfx2.fillStyle(0x333344, 0.3); gfx2.fillEllipse(sx + 5, sy + 18, 70, 12);
      this.settlementX = sx;
      this.settlementY = sy;
      this.settlementPromptVisible = false;
    }

    // ── Player (astronaut) ─────────────────────────────────────────
    this.player = this.physics.add.sprite(PLANET_SIZE / 2, PLANET_SIZE / 2 + 40, 'astronaut', 0);
    this.player.setScale(0.5);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);

    // Walk animations based on actual spritesheet layout:
    // 0-3: front (down), 4-7: back (up), 8-11: side (right, flip for left)
    if (!this.anims.exists('astro-down')) {
      this.anims.create({ key: 'astro-down',  frames: this.anims.generateFrameNumbers('astronaut', { frames: [0, 1, 2, 3] }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: 'astro-up',    frames: this.anims.generateFrameNumbers('astronaut', { frames: [4, 5, 6, 7] }), frameRate: 6, repeat: -1 });
      this.anims.create({ key: 'astro-right', frames: this.anims.generateFrameNumbers('astronaut', { frames: [8, 9, 10, 11] }), frameRate: 6, repeat: -1 });
      // Left reuses right frames — we flip the sprite
      this.anims.create({ key: 'astro-left',  frames: this.anims.generateFrameNumbers('astronaut', { frames: [8, 9, 10, 11] }), frameRate: 6, repeat: -1 });
    }
    this.lastDir = 'down';

    // ── Camera ───────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, PLANET_SIZE, PLANET_SIZE);
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // ── Resource nodes ───────────────────────────────────────────────
    this.resourceNodes = [];
    for (let i = 0; i < 12; i++) {
      let rx, ry;
      do {
        rx = Phaser.Math.Between(50, PLANET_SIZE - 50);
        ry = Phaser.Math.Between(50, PLANET_SIZE - 50);
      } while (Phaser.Math.Distance.Between(rx, ry, PLANET_SIZE/2, PLANET_SIZE/2) < 80);

      const resKey = pType.resources[Phaser.Math.Between(0, pType.resources.length - 1)];
      const color = this._resourceColor(resKey);
      const node = this.add.circle(rx, ry, 5, color).setDepth(2);
      const glow = this.add.circle(rx, ry, 8, color, 0.3).setDepth(1.5);
      this.tweens.add({ targets: glow, alpha: 0.1, duration: 800, yoyo: true, repeat: -1 });

      this.resourceNodes.push({ sprite: node, glow, x: rx, y: ry, resource: resKey, collected: false });
    }

    // Rare resources (random chance to spawn)
    // Rare resources — HIDDEN until scanned
    const bonusChance = SpaceState.getRareResourceChance();
    Object.entries(RARE_RESOURCES).forEach(([key, rare]) => {
      // Base spawn chance + bonus from Scanning skill
      if (Math.random() < rare.spawnChance + bonusChance) {
        let rx, ry;
        do {
          rx = Phaser.Math.Between(50, PLANET_SIZE - 50);
          ry = Phaser.Math.Between(50, PLANET_SIZE - 50);
        } while (Phaser.Math.Distance.Between(rx, ry, PLANET_SIZE/2, PLANET_SIZE/2) < 80);

        const colorHex = parseInt(rare.color.replace('#', '0x'));
        const node = this.add.circle(rx, ry, 7, colorHex).setDepth(3).setVisible(false);
        const glow = this.add.circle(rx, ry, 12, colorHex, 0.3).setDepth(2.5).setVisible(false);

        this.resourceNodes.push({ sprite: node, glow, x: rx, y: ry, resource: key, collected: false, rare: true, revealed: false });
      }
    });

    // ── Input ────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.iKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    this.explorationTimer = 0;
    this.scanCooldown = 0;
    this.scanPulses = [];
    this.distanceTraveled = 0;
    this.lastPlayerPos = { x: this.player.x, y: this.player.y };

    // Mining interaction state
    this.miningTarget = null;    // current node being mined
    this.miningProgress = 0;     // 0 → 1
    this.miningBarBg = null;
    this.miningBarFill = null;

    // ── Story quest: land on planet ─────────────────────────────────
    if (SpaceState.activeStoryQuest) {
      const sq = STORY_QUESTS[SpaceState.storyProgress];
      if (sq && sq.goal.type === 'land' && sq.goal.planet === this.planetInfo.name) {
        SpaceState.activeStoryQuest.progress = 1;
      }
    }

    // ── HUD update ───────────────────────────────────────────────────
    document.getElementById('hud-location').textContent = this.planetInfo.name + ' (Surface)';
    this._updatePlanetHUD();
  }

  update(time, delta) {
    // ── Movement ─────────────────────────────────────────────────────
    const up    = this.cursors.up.isDown    || this.wasd.W.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.S.isDown;
    const left  = this.cursors.left.isDown  || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;

    // Sprint with SHIFT
    const sprinting = this.shiftKey.isDown;
    const moveSpeed = sprinting ? WALK_SPEED * 1.6 : WALK_SPEED;

    let vx = touchState.ax * moveSpeed, vy = touchState.ay * moveSpeed;
    if (up)    vy = -moveSpeed;
    if (down)  vy = moveSpeed;
    if (left)  vx = -moveSpeed;
    if (right) vx = moveSpeed;
    this.player.body.setVelocity(vx, vy);

    // Track distance for exploration XP
    const dx = this.player.x - this.lastPlayerPos.x;
    const dy = this.player.y - this.lastPlayerPos.y;
    const moved = Math.sqrt(dx*dx + dy*dy);
    this.lastPlayerPos = { x: this.player.x, y: this.player.y };

    if (moved > 0.5) {
      this.distanceTraveled += moved;
      // Exploration XP every 200px traveled
      if (this.distanceTraveled >= 200) {
        this.distanceTraveled -= 200;
        SpaceState.skills.exploration.totalExp += 3;
        SpaceState.checkSkillUp('exploration');
      }
    }

    // ── Scanner pulse (Q key) ────────────────────────────────────────
    if (this.scanCooldown > 0) this.scanCooldown -= delta;
    if (Phaser.Input.Keyboard.JustDown(this.qKey) && this.scanCooldown <= 0) {
      this.scanCooldown = 3000; // 3 second cooldown
      const scanRange = 100 + SpaceState.skills.scanning.level * 5;

      // Visual pulse ring
      const ring = this.add.circle(this.player.x, this.player.y, 10, 0x44aaff, 0.3).setDepth(20);
      this.tweens.add({
        targets: ring, scale: scanRange / 10, alpha: 0, duration: 800,
        onComplete: () => ring.destroy(),
      });

      // Reveal resources in range
      let revealedRare = false;
      this.resourceNodes.forEach(node => {
        if (node.collected) return;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y);
        if (d < scanRange) {
          if (node.rare && !node.revealed) {
            // REVEAL hidden rare resource!
            node.revealed = true;
            node.sprite.setVisible(true);
            node.glow.setVisible(true);
            // Dramatic reveal animation
            node.sprite.setScale(0.1).setAlpha(0);
            node.glow.setScale(0.1).setAlpha(0);
            this.tweens.add({ targets: node.sprite, scale: 1.3, alpha: 1, duration: 500, ease: 'Back.easeOut',
              onComplete: () => this.tweens.add({ targets: node.sprite, scale: 1.3, duration: 800, yoyo: true, repeat: -1 })
            });
            this.tweens.add({ targets: node.glow, scale: 1, alpha: 0.3, duration: 500,
              onComplete: () => this.tweens.add({ targets: node.glow, alpha: 0.1, scale: 1.3, duration: 600, yoyo: true, repeat: -1 })
            });
            this._domFloat(node.x, node.y - 10, `RARE: ${this._resourceName(node.resource)}!`, this._resourceColorHex(node.resource));
            revealedRare = true;
          } else if (!node.rare) {
            // Flash normal nodes
            this.tweens.add({ targets: node.sprite, scale: 2, duration: 200, yoyo: true });
            if (node.glow) this.tweens.add({ targets: node.glow, alpha: 0.8, scale: 2, duration: 300, yoyo: true });
          }
        }
      });

      if (revealedRare) {
        // Bonus Scanning XP for finding rare
        SpaceState.skills.scanning.totalExp += 15;
      }

      // Scanning XP
      SpaceState.skills.scanning.totalExp += 5;
      SpaceState.checkSkillUp('scanning');
    }

    // ── Deep Scan item effect ──────────────────────────────────────
    if (SpaceState._deepScanPending) {
      SpaceState._deepScanPending = false;
      this.resourceNodes.forEach(node => {
        if (node.rare && !node.revealed && !node.collected) {
          node.revealed = true;
          node.sprite.setVisible(true);
          node.glow.setVisible(true);
          node.sprite.setScale(0.1).setAlpha(0);
          node.glow.setScale(0.1).setAlpha(0);
          this.tweens.add({ targets: node.sprite, scale: 1.3, alpha: 1, duration: 500, ease: 'Back.easeOut',
            onComplete: () => this.tweens.add({ targets: node.sprite, scale: 1.3, duration: 800, yoyo: true, repeat: -1 })
          });
          this.tweens.add({ targets: node.glow, scale: 1, alpha: 0.3, duration: 500,
            onComplete: () => this.tweens.add({ targets: node.glow, alpha: 0.1, scale: 1.3, duration: 600, yoyo: true, repeat: -1 })
          });
          this._domFloat(node.x, node.y - 10, `RARE: ${this._resourceName(node.resource)}!`, this._resourceColorHex(node.resource));
        }
      });
    }

    // ── Inventory (I key) ────────────────────────────────────────────
    if (Phaser.Input.Keyboard.JustDown(this.iKey)) {
      showCargoScreen();
    }

    // Animate astronaut
    if (vx !== 0 || vy !== 0) {
      if (Math.abs(vy) >= Math.abs(vx)) {
        this.lastDir = vy < 0 ? 'up' : 'down';
      } else {
        this.lastDir = vx < 0 ? 'left' : 'right';
      }
      this.player.play('astro-' + this.lastDir, true);
      this.player.setFlipX(this.lastDir === 'left');
    } else {
      this.player.stop();
      const idleFrames = { down: 0, up: 4, right: 8, left: 8 };
      this.player.setFrame(idleFrames[this.lastDir]);
      this.player.setFlipX(this.lastDir === 'left');
    }

    // ── Resource mining (hold-to-gather) ────────────────────────────
    const isGathering = (vx === 0 && vy === 0); // must be standing still
    let nearestNode = null;
    let nearestDist = 20; // gather range

    this.resourceNodes.forEach(node => {
      if (node.collected) return;
      if (node.rare && !node.revealed) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearestNode = node;
      }
    });

    if (nearestNode && isGathering) {
      // Start or continue mining
      if (this.miningTarget !== nearestNode) {
        this.miningTarget = nearestNode;
        this.miningProgress = 0;
        this._showMiningBar(nearestNode);
      }

      // Mining speed: base 1s, reduced by mining level (min 0.3s)
      const gatherTime = Math.max(0.3, 1.0 - SpaceState.skills.mining.level * 0.012);
      // Mining boost buff
      const miningBuff = (SpaceState.activeBuff && SpaceState.activeBuff.effect === 'mining-boost') ? 1.5 : 1.0;
      this.miningProgress += (delta / 1000) / gatherTime * miningBuff;
      this._updateMiningBar();

      if (this.miningProgress >= 1) {
        // Gather complete!
        if (SpaceState.isCargoFull()) {
          this._domFloat(nearestNode.x, nearestNode.y, 'Cargo full!', '#ff4444');
          this.miningProgress = 0;
        } else {
          this._completeGather(nearestNode);
        }
      }
    } else {
      // Not near a node or moving — cancel mining
      if (this.miningTarget) {
        this.miningTarget = null;
        this.miningProgress = 0;
        this._hideMiningBar();
      }
    }

    // ── Ship return prompt ───────────────────────────────────────────
    const shipDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.landedShip.x, this.landedShip.y);
    if (shipDist < 30) {
      if (!this.shipPromptVisible) {
        showWorldPrompt('ship-return', this.landedShip.x, this.landedShip.y - 20, '[E] Take Off');
        this.shipPromptVisible = true;
      }
      const ePressed = Phaser.Input.Keyboard.JustDown(this.eKey) || (touchState.action && !this._lastTouchAction);
      this._lastTouchAction = touchState.action;
      if (ePressed) {
        this._takeOff();
      }
    } else if (this.shipPromptVisible) {
      hideWorldPrompt('ship-return');
      this.shipPromptVisible = false;
    }

    // ── Ambient particles ──────────────────────────────────────────────
    if (this.ambientParticles) this._updateAmbientParticles(delta);

    // ── Planet HUD ────────────────────────────────────────────────────
    this._updatePlanetHUD();

    // ── Settlement interaction ────────────────────────────────────────
    if (this.settlement) {
      const sDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.settlementX, this.settlementY);
      if (sDist < 35) {
        if (!this.settlementPromptVisible) {
          showWorldPrompt('settlement', this.settlementX, this.settlementY - 30, `[E] Enter ${this.settlement.name}`);
          this.settlementPromptVisible = true;
        }
        const ePressedS = Phaser.Input.Keyboard.JustDown(this.eKey) || (touchState.action && !this._lastTouchAction2);
        this._lastTouchAction2 = touchState.action;
        if (ePressedS) {
          showSettlementScreen(this.settlement, this.planetInfo.name);
        }
      } else if (this.settlementPromptVisible) {
        hideWorldPrompt('settlement');
        this.settlementPromptVisible = false;
      }
    }
  }

  _takeOff() {
    hideWorldPrompt('ship-return');
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('FlightScene');
    });
  }

  _updatePlanetHUD() {
    const p = SpaceState.player;
    const maxHp = p.maxHp + SpaceState.getMaxHpBonus();
    document.getElementById('hp-fill').style.width = (p.hp / maxHp * 100) + '%';
    document.getElementById('hp-text').textContent = `${Math.floor(p.hp)}/${maxHp}`;
    document.getElementById('hud-credits').textContent = `Credits: ${p.credits} | Cargo: ${SpaceState.getCargoUsed()}/${SpaceState.getCargoCapacity()}`;
    document.getElementById('hud-location').textContent = this.planetInfo.name + (this.shiftKey && this.shiftKey.isDown ? ' [SPRINT]' : '') + ' | [Q] Scan | [I] Cargo | [E] Ship';

    // Quest progress
    if (SpaceState.activeStoryQuest) {
      const sq = STORY_QUESTS[SpaceState.storyProgress];
      if (sq) {
        const p = SpaceState.activeStoryQuest.progress || 0;
        const g = sq.goal.count || sq.goal.amount || 1;
        document.getElementById('hud-location').textContent += ` | ★ ${p}/${g}`;
      }
    }
    if (SpaceState.activeContract) {
      const m = MISSIONS.find(mi => mi.id === SpaceState.activeContract.id);
      if (m) {
        const p = SpaceState.activeContract.progress || 0;
        const g = m.goal.count || m.goal.amount || 1;
        document.getElementById('hud-location').textContent += ` | • ${p}/${g}`;
      }
    }
  }

  _resourceColor(key) {
    const def = RESOURCE_DEFS[key] || RARE_RESOURCES[key];
    if (def && def.color) return parseInt(def.color.replace('#', '0x'));
    return 0xffffff;
  }

  _resourceColorHex(key) {
    const def = RESOURCE_DEFS[key] || RARE_RESOURCES[key];
    return def ? def.color : '#ffffff';
  }

  _resourceName(key) {
    return key.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  }

  _showMiningBar(node) {
    this._hideMiningBar();
    this.miningBarBg = this.add.rectangle(node.x, node.y - 14, 24, 4, 0x222222).setDepth(20).setOrigin(0.5);
    this.miningBarFill = this.add.rectangle(node.x - 11, node.y - 14, 0, 4, 0x44cc88).setDepth(21).setOrigin(0, 0.5);
  }

  _updateMiningBar() {
    if (this.miningBarFill) {
      this.miningBarFill.width = Math.min(1, this.miningProgress) * 22;
    }
  }

  _hideMiningBar() {
    if (this.miningBarBg) { this.miningBarBg.destroy(); this.miningBarBg = null; }
    if (this.miningBarFill) { this.miningBarFill.destroy(); this.miningBarFill = null; }
  }

  _completeGather(node) {
    node.collected = true;
    node.sprite.destroy();
    node.glow.destroy();
    this._hideMiningBar();
    this.miningTarget = null;
    this.miningProgress = 0;

    const amount = SpaceState.getMiningBonus();
    SpaceState.addCargo(node.resource, amount);

    // Mining XP (rare resources give more)
    const xpGain = node.rare ? 25 : 12;
    SpaceState.skills.mining.totalExp += xpGain;
    const gained = SpaceState.checkSkillUp('mining');

    this._domFloat(node.x, node.y, `+${amount} ${this._resourceName(node.resource)}`, this._resourceColorHex(node.resource));
    if (gained > 0) this._domFloat(node.x, node.y - 16, `Mining LV${SpaceState.skills.mining.level}!`, '#ffee44');

    // Story quest: deliver resource tracking
    if (SpaceState.activeStoryQuest) {
      const sq = STORY_QUESTS[SpaceState.storyProgress];
      if (sq && sq.goal.type === 'deliver' && sq.goal.resource === node.resource) {
        SpaceState.activeStoryQuest.progress = (SpaceState.activeStoryQuest.progress || 0) + amount;
        if (SpaceState.activeStoryQuest.progress >= sq.goal.count) {
          this._domFloat(node.x, node.y - 30, 'Story objective complete! Return to station.', '#ffcc44');
        }
      }
    }

    // Repeatable mission: deliver tracking
    if (SpaceState.activeContract) {
      const m = MISSIONS.find(mi => mi.id === SpaceState.activeContract.id);
      if (m && m.goal.type === 'deliver' && m.goal.resource === node.resource) {
        SpaceState.activeContract.progress = (SpaceState.activeContract.progress || 0) + amount;
      }
    }
  }

  _createAmbientParticles(pType) {
    // Create drifting particles based on biome
    this.ambientParticles = [];
    const count = 20;

    if (pType.name === 'Terran') {
      // Floating spores / pollen
      for (let i = 0; i < count; i++) {
        const p = this.add.circle(
          Phaser.Math.Between(0, PLANET_SIZE),
          Phaser.Math.Between(0, PLANET_SIZE),
          Phaser.Math.Between(1, 2),
          Phaser.Math.Between(0, 1) ? 0xaaff88 : 0xffee88,
          Phaser.Math.FloatBetween(0.2, 0.5)
        ).setDepth(15);
        this.ambientParticles.push({ sprite: p, vx: Phaser.Math.FloatBetween(-6, 6), vy: Phaser.Math.FloatBetween(-10, -3) });
      }
    } else if (pType.name === 'Ice') {
      // Snowflakes
      for (let i = 0; i < 30; i++) {
        const p = this.add.circle(
          Phaser.Math.Between(0, PLANET_SIZE),
          Phaser.Math.Between(0, PLANET_SIZE),
          Phaser.Math.Between(1, 3),
          0xeef4ff,
          Phaser.Math.FloatBetween(0.3, 0.7)
        ).setDepth(15);
        this.ambientParticles.push({ sprite: p, vx: Phaser.Math.FloatBetween(-8, 8), vy: Phaser.Math.FloatBetween(5, 15) });
      }
    } else if (pType.name === 'Lava') {
      // Ash / embers
      for (let i = 0; i < 25; i++) {
        const isEmber = Math.random() < 0.3;
        const p = this.add.circle(
          Phaser.Math.Between(0, PLANET_SIZE),
          Phaser.Math.Between(0, PLANET_SIZE),
          Phaser.Math.Between(1, isEmber ? 2 : 1),
          isEmber ? 0xff6600 : 0x888888,
          Phaser.Math.FloatBetween(0.2, isEmber ? 0.7 : 0.4)
        ).setDepth(15);
        this.ambientParticles.push({ sprite: p, vx: Phaser.Math.FloatBetween(-5, 10), vy: Phaser.Math.FloatBetween(-15, -5) });
      }
    } else {
      // Dust motes
      for (let i = 0; i < 15; i++) {
        const p = this.add.circle(
          Phaser.Math.Between(0, PLANET_SIZE),
          Phaser.Math.Between(0, PLANET_SIZE),
          1,
          0xaa9977,
          Phaser.Math.FloatBetween(0.15, 0.35)
        ).setDepth(15);
        this.ambientParticles.push({ sprite: p, vx: Phaser.Math.FloatBetween(-3, 8), vy: Phaser.Math.FloatBetween(-3, 3) });
      }
    }
  }

  _updateAmbientParticles(delta) {
    const dt = delta / 1000;
    for (const p of this.ambientParticles) {
      p.sprite.x += p.vx * dt;
      p.sprite.y += p.vy * dt;
      // Wrap around
      if (p.sprite.x < -10) p.sprite.x = PLANET_SIZE + 10;
      if (p.sprite.x > PLANET_SIZE + 10) p.sprite.x = -10;
      if (p.sprite.y < -10) p.sprite.y = PLANET_SIZE + 10;
      if (p.sprite.y > PLANET_SIZE + 10) p.sprite.y = -10;
    }
  }

  _domFloat(x, y, msg, color) {
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = msg;
    el.style.color = color || '#fff';
    const cam = this.cameras.main;
    const canvas = document.querySelector('canvas');
    const scaleX = canvas.clientWidth / this.scale.width;
    const scaleY = canvas.clientHeight / this.scale.height;
    el.style.left = ((x - cam.scrollX) * scaleX) + 'px';
    el.style.top = ((y - cam.scrollY) * scaleY) + 'px';
    document.getElementById('float-container').appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }
}
