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

    // Terrain variation — scatter darker patches
    gfx.fillStyle(pType.accent);
    for (let i = 0; i < 40; i++) {
      const rx = Phaser.Math.Between(0, PLANET_SIZE - 40);
      const ry = Phaser.Math.Between(0, PLANET_SIZE - 40);
      const rw = Phaser.Math.Between(20, 80);
      const rh = Phaser.Math.Between(20, 60);
      gfx.fillRoundedRect(rx, ry, rw, rh, 4);
    }

    // ── World bounds ─────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, PLANET_SIZE, PLANET_SIZE);

    // ── Landed ship (return point) ───────────────────────────────────
    this.landedShip = this.add.image(PLANET_SIZE / 2, PLANET_SIZE / 2, 'landed-ship');
    this.landedShip.setScale(1.5).setDepth(1).setAngle(0);

    this.shipPromptVisible = false;

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

    // ── Input ────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // ── HUD update ───────────────────────────────────────────────────
    document.getElementById('hud-location').textContent = this.planetInfo.name + ' (Surface)';
  }

  update(time, delta) {
    // ── Movement ─────────────────────────────────────────────────────
    const up    = this.cursors.up.isDown    || this.wasd.W.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.S.isDown;
    const left  = this.cursors.left.isDown  || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;

    let vx = touchState.ax * WALK_SPEED, vy = touchState.ay * WALK_SPEED;
    if (up)    vy = -WALK_SPEED;
    if (down)  vy = WALK_SPEED;
    if (left)  vx = -WALK_SPEED;
    if (right) vx = WALK_SPEED;
    this.player.body.setVelocity(vx, vy);

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
  }

  _takeOff() {
    hideWorldPrompt('ship-return');
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('FlightScene');
    });
  }

  _resourceColor(key) {
    const colors = {
      'plant-fiber': 0x44cc44, 'water-sample': 0x4488ff, 'bio-matter': 0x88cc44,
      'ice-crystal': 0x88ddff, 'cryo-compound': 0x44aadd, 'magma-ore': 0xff6622,
      'obsidian-shard': 0x553344, 'thermal-core': 0xff4400, 'scrap-metal': 0xaaaaaa,
      'dust-crystal': 0xccbb88, 'ancient-relic': 0xddaa44,
    };
    return colors[key] || 0xffffff;
  }

  _resourceColorHex(key) {
    const colors = {
      'plant-fiber': '#44cc44', 'water-sample': '#4488ff', 'bio-matter': '#88cc44',
      'ice-crystal': '#88ddff', 'cryo-compound': '#44aadd', 'magma-ore': '#ff6622',
      'obsidian-shard': '#aa6688', 'thermal-core': '#ff4400', 'scrap-metal': '#aaaaaa',
      'dust-crystal': '#ccbb88', 'ancient-relic': '#ddaa44',
    };
    return colors[key] || '#ffffff';
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
