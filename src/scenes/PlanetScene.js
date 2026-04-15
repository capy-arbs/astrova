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

    // Terrain variation — darker patches
    gfx.fillStyle(pType.accent);
    for (let i = 0; i < 50; i++) {
      const rx = Phaser.Math.Between(0, PLANET_SIZE - 40);
      const ry = Phaser.Math.Between(0, PLANET_SIZE - 40);
      const rw = Phaser.Math.Between(20, 80);
      const rh = Phaser.Math.Between(20, 60);
      gfx.fillRoundedRect(rx, ry, rw, rh, 4);
    }

    // Terrain features based on planet type
    if (pType.name === 'Terran') {
      // Trees / vegetation
      for (let i = 0; i < 20; i++) {
        const tx = Phaser.Math.Between(30, PLANET_SIZE - 30);
        const ty = Phaser.Math.Between(30, PLANET_SIZE - 30);
        gfx.fillStyle(0x226622); gfx.fillCircle(tx, ty, Phaser.Math.Between(6, 12));
        gfx.fillStyle(0x33aa33); gfx.fillCircle(tx, ty - 2, Phaser.Math.Between(4, 8));
      }
      // Water pools
      for (let i = 0; i < 5; i++) {
        const wx = Phaser.Math.Between(50, PLANET_SIZE - 50);
        const wy = Phaser.Math.Between(50, PLANET_SIZE - 50);
        gfx.fillStyle(0x2266aa, 0.6); gfx.fillEllipse(wx, wy, Phaser.Math.Between(30, 60), Phaser.Math.Between(15, 30));
      }
    } else if (pType.name === 'Ice') {
      // Ice formations / crystals
      for (let i = 0; i < 25; i++) {
        const ix = Phaser.Math.Between(20, PLANET_SIZE - 20);
        const iy = Phaser.Math.Between(20, PLANET_SIZE - 20);
        const size = Phaser.Math.Between(3, 10);
        gfx.fillStyle(0xccddff, 0.7);
        gfx.fillTriangle(ix, iy - size * 2, ix - size, iy, ix + size, iy);
      }
      // Snow drifts
      for (let i = 0; i < 8; i++) {
        const sx = Phaser.Math.Between(0, PLANET_SIZE);
        const sy = Phaser.Math.Between(0, PLANET_SIZE);
        gfx.fillStyle(0xddeeff, 0.3); gfx.fillEllipse(sx, sy, Phaser.Math.Between(40, 100), Phaser.Math.Between(20, 40));
      }
    } else if (pType.name === 'Lava') {
      // Lava rivers
      for (let i = 0; i < 6; i++) {
        const lx = Phaser.Math.Between(0, PLANET_SIZE);
        const ly = Phaser.Math.Between(0, PLANET_SIZE);
        gfx.lineStyle(Phaser.Math.Between(3, 8), 0xff4400, 0.6);
        gfx.lineBetween(lx, ly, lx + Phaser.Math.Between(-100, 100), ly + Phaser.Math.Between(-100, 100));
      }
      // Volcanic vents
      for (let i = 0; i < 10; i++) {
        const vx = Phaser.Math.Between(30, PLANET_SIZE - 30);
        const vy = Phaser.Math.Between(30, PLANET_SIZE - 30);
        gfx.fillStyle(0x331100); gfx.fillCircle(vx, vy, Phaser.Math.Between(4, 8));
        gfx.fillStyle(0xff6600, 0.4); gfx.fillCircle(vx, vy, Phaser.Math.Between(2, 4));
      }
    } else {
      // Barren — craters and rocks
      for (let i = 0; i < 15; i++) {
        const cx = Phaser.Math.Between(30, PLANET_SIZE - 30);
        const cy = Phaser.Math.Between(30, PLANET_SIZE - 30);
        const cr = Phaser.Math.Between(8, 25);
        gfx.lineStyle(1, 0x555544, 0.5); gfx.strokeCircle(cx, cy, cr);
        gfx.fillStyle(0x444433, 0.3); gfx.fillCircle(cx, cy, cr - 2);
      }
      // Scattered rocks
      for (let i = 0; i < 20; i++) {
        const rx = Phaser.Math.Between(10, PLANET_SIZE - 10);
        const ry = Phaser.Math.Between(10, PLANET_SIZE - 10);
        gfx.fillStyle(0x666655); gfx.fillCircle(rx, ry, Phaser.Math.Between(2, 5));
      }
    }

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
      gfx2.fillStyle(0x555566); gfx2.fillRect(sx - 25, sy - 20, 50, 40);
      gfx2.fillStyle(0x666677); gfx2.fillRect(sx - 15, sy - 25, 30, 10);
      gfx2.fillStyle(0x88aa88); gfx2.fillCircle(sx, sy - 30, 4);
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
    Object.entries(RARE_RESOURCES).forEach(([key, rare]) => {
      if (Math.random() < rare.spawnChance) {
        let rx, ry;
        do {
          rx = Phaser.Math.Between(50, PLANET_SIZE - 50);
          ry = Phaser.Math.Between(50, PLANET_SIZE - 50);
        } while (Phaser.Math.Distance.Between(rx, ry, PLANET_SIZE/2, PLANET_SIZE/2) < 80);

        const node = this.add.circle(rx, ry, 7, parseInt(rare.color.replace('#','0x'))).setDepth(3);
        const glow = this.add.circle(rx, ry, 12, parseInt(rare.color.replace('#','0x')), 0.3).setDepth(2.5);
        this.tweens.add({ targets: glow, alpha: 0.1, scale: 1.3, duration: 600, yoyo: true, repeat: -1 });
        // Also pulse the node itself
        this.tweens.add({ targets: node, scale: 1.3, duration: 800, yoyo: true, repeat: -1 });

        this.resourceNodes.push({ sprite: node, glow, x: rx, y: ry, resource: key, collected: false, rare: true });
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

    // ── Story quest: land on planet ─────────────────────────────────
    if (SpaceState.activeMission && SpaceState.activeMission.id.startsWith('s')) {
      const sq = STORY_QUESTS[SpaceState.storyProgress];
      if (sq && sq.goal.type === 'land' && sq.goal.planet === this.planetInfo.name) {
        SpaceState.activeMission.progress = 1;
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

      // Reveal uncollected resources in range — make them pulse brighter
      this.resourceNodes.forEach(node => {
        if (node.collected) return;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y);
        if (d < scanRange) {
          // Flash the node
          this.tweens.add({ targets: node.sprite, scale: 2, duration: 200, yoyo: true });
          if (node.glow) this.tweens.add({ targets: node.glow, alpha: 0.8, scale: 2, duration: 300, yoyo: true });
        }
      });

      // Scanning XP
      SpaceState.skills.scanning.totalExp += 5;
      SpaceState.checkSkillUp('scanning');
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

    // ── Resource collection ──────────────────────────────────────────
    this.resourceNodes.forEach(node => {
      if (node.collected) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y);
      if (d < 14) {
        // Check cargo capacity BEFORE collecting
        if (SpaceState.isCargoFull()) {
          this._domFloat(node.x, node.y, 'Cargo full!', '#ff4444');
          return;
        }

        node.collected = true;
        node.sprite.destroy();
        node.glow.destroy();

        // Mining bonus: extra resources at higher levels
        const amount = SpaceState.getMiningBonus();
        SpaceState.addCargo(node.resource, amount);

        // Mining XP
        SpaceState.skills.mining.totalExp += 12;
        const gained = SpaceState.checkSkillUp('mining');

        this._domFloat(node.x, node.y, `+${amount} ${this._resourceName(node.resource)}`, this._resourceColorHex(node.resource));
        if (gained > 0) this._domFloat(node.x, node.y - 16, `Mining LV${SpaceState.skills.mining.level}!`, '#ffee44');

        // Story quest: deliver resource tracking
        if (SpaceState.activeMission && SpaceState.activeMission.id.startsWith('s')) {
          const sq = STORY_QUESTS[SpaceState.storyProgress];
          if (sq && sq.goal.type === 'deliver' && sq.goal.resource === node.resource) {
            SpaceState.activeMission.progress = (SpaceState.activeMission.progress || 0) + amount;
            if (SpaceState.activeMission.progress >= sq.goal.count) {
              this._domFloat(node.x, node.y - 30, 'Story objective complete! Return to station.', '#ffcc44');
            }
          }
        }

        // Repeatable mission: deliver tracking
        if (SpaceState.activeMission && !SpaceState.activeMission.id.startsWith('s')) {
          const m = MISSIONS.find(mi => mi.id === SpaceState.activeMission.id);
          if (m && m.goal.type === 'deliver' && m.goal.resource === node.resource) {
            SpaceState.activeMission.progress = (SpaceState.activeMission.progress || 0) + amount;
          }
        }
      }
    });

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
    if (SpaceState.activeMission) {
      const sq = STORY_QUESTS[SpaceState.storyProgress];
      const m = MISSIONS.find(mi => mi.id === SpaceState.activeMission.id);
      const quest = SpaceState.activeMission.id.startsWith('s') ? sq : m;
      if (quest) {
        const prog = SpaceState.activeMission.progress || 0;
        const goal = quest.goal.count || quest.goal.amount || 1;
        document.getElementById('hud-location').textContent += ` | Quest: ${prog}/${goal}`;
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
