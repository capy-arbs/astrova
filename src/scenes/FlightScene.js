const ASSET = 'assets/sprites/';
const VOID_MAIN  = ASSET + 'Foozle_2DS0011_Void_MainShip/';
const VOID_ENV   = ASSET + 'Foozle_2DS0015_Void_EnvironmentPack/';
const VOID_FLEET = ASSET + 'Foozle_2DS0012_Void_EnemyFleet_1/';
const VOID_PICK  = ASSET + 'Foozle_2DS0016_Void_PickupsPack/';

const SHIP_SPEED     = 160;
const BULLET_SPEED   = 400;
const FIRE_RATE      = 180;
const WORLD_SIZE     = 3000; // 3000x3000 world to explore

class FlightScene extends Phaser.Scene {
  constructor() { super({ key: 'FlightScene' }); }

  preload() {
    // Backgrounds (parallax layers)
    this.load.image('bg-void',  VOID_ENV + 'Backgrounds/PNGs/Condesed/Starry background  - Layer 01 - Void.png');
    this.load.image('bg-stars', VOID_ENV + 'Backgrounds/PNGs/Condesed/Starry background  - Layer 02 - Stars.png');
    this.load.image('bg-stars2',VOID_ENV + 'Backgrounds/PNGs/Condesed/Starry background  - Layer 03 - Stars.png');

    // Player ship
    this.load.image('ship', VOID_MAIN + 'Main Ship/Main Ship - Bases/PNGs/Main Ship - Base - Full health.png');
    this.load.spritesheet('ship-engine', VOID_MAIN + 'Main Ship/Main Ship - Engine Effects/PNGs/Main Ship - Engines - Base Engine - Spritesheet.png',
      { frameWidth: 48, frameHeight: 48 });
    this.load.image('bullet', VOID_MAIN + "Main ship weapons/PNGs/Main ship weapon - Projectile - Auto cannon bullet.png");

    // Enemy ships (Kla'ed faction)
    this.load.image('enemy-fighter', VOID_FLEET + "Kla'ed/Base/PNGs/Kla'ed - Fighter - Base.png");
    this.load.image('enemy-scout',   VOID_FLEET + "Kla'ed/Base/PNGs/Kla'ed - Scout - Base.png");
    this.load.image('enemy-bomber',  VOID_FLEET + "Kla'ed/Base/PNGs/Kla'ed - Bomber - Base.png");

    // Planets
    this.load.image('planet-terran', ASSET + 'Terran.png');
    this.load.image('planet-ice',    ASSET + 'Ice.png');
    this.load.image('planet-lava',   ASSET + 'Lava.png');
    this.load.image('planet-barren', ASSET + 'Baren.png');
  }

  create() {
    // ── World bounds ─────────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

    // ── Parallax backgrounds (tile the whole world) ──────────────────
    this.bgVoid   = this.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, 'bg-void').setOrigin(0).setScrollFactor(0).setDepth(-3);
    this.bgStars  = this.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, 'bg-stars').setOrigin(0).setScrollFactor(0).setDepth(-2);
    this.bgStars2 = this.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, 'bg-stars2').setOrigin(0).setScrollFactor(0).setDepth(-1);

    // ── Planets (points of interest in the world) ────────────────────
    this.planetData = [
      { key: 'planet-terran', x: 500,  y: 500,  name: 'Terra Nova',    scale: 2.0 },
      { key: 'planet-ice',    x: 2400, y: 600,  name: 'Glacius',       scale: 1.8 },
      { key: 'planet-lava',   x: 1500, y: 2400, name: 'Inferno',       scale: 2.2 },
      { key: 'planet-barren', x: 400,  y: 2200, name: 'Dust Rock',     scale: 1.5 },
      { key: 'planet-terran', x: 2600, y: 2000, name: 'New Eden',      scale: 1.6 },
    ];

    this.planetSprites = this.planetData.map(p => {
      const sprite = this.add.image(p.x, p.y, p.key).setScale(p.scale).setDepth(0);
      sprite.setData('name', p.name);
      return sprite;
    });

    // ── Space Station ────────────────────────────────────────────────
    this.stationX = 1500;
    this.stationY = 1500;
    // Draw station as a simple geometric shape (no sprite needed)
    const stGfx = this.add.graphics();
    stGfx.fillStyle(0x556677);
    stGfx.fillRect(this.stationX - 16, this.stationY - 16, 32, 32);
    stGfx.fillStyle(0x8899aa);
    stGfx.fillRect(this.stationX - 8, this.stationY - 20, 16, 40);
    stGfx.fillRect(this.stationX - 20, this.stationY - 8, 40, 16);
    stGfx.fillStyle(0xaabbcc);
    stGfx.fillCircle(this.stationX, this.stationY, 6);
    stGfx.setDepth(0.5);

    // ── Player ship ──────────────────────────────────────────────────
    // Spawn at return position if coming back from planet, else center
    const spawnX = SpaceState.spaceReturn ? SpaceState.spaceReturn.x : WORLD_SIZE / 2;
    const spawnY = SpaceState.spaceReturn ? SpaceState.spaceReturn.y : WORLD_SIZE / 2;
    SpaceState.spaceReturn = null;

    this.player = this.physics.add.sprite(spawnX, spawnY, 'ship');
    this.player.setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.92);
    this.player.setMaxVelocity(SHIP_SPEED);

    // Engine effect
    this.engine = this.add.sprite(this.player.x, this.player.y, 'ship-engine');
    this.engine.setDepth(9);
    if (!this.anims.exists('engine-idle')) {
      this.anims.create({
        key: 'engine-idle',
        frames: this.anims.generateFrameNumbers('ship-engine', { start: 0, end: 3 }),
        frameRate: 8, repeat: -1,
      });
    }
    this.engine.play('engine-idle');

    // ── Camera follows player ────────────────────────────────────────
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // ── Bullets ──────────────────────────────────────────────────────
    this.bullets = this.physics.add.group({ maxSize: 30 });
    this.lastFired = 0;

    // ── Enemies (scattered around the world) ─────────────────────────
    this.enemies = this.physics.add.group();
    this._spawnEnemies();

    // ── Collisions ───────────────────────────────────────────────────
    this.physics.add.overlap(this.bullets, this.enemies, this._bulletHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this._enemyHitPlayer, null, this);

    // ── Input ────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.isInvincible = false;
    this.facingAngle = -Math.PI / 2;
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.iKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.nearPlanet = null;
    this.pilotingTimer = 0;
  }

  update(time, delta) {
    const cam = this.cameras.main;

    // ── Parallax scroll based on camera position ─────────────────────
    this.bgVoid.tilePositionX   = cam.scrollX * 0.05;
    this.bgVoid.tilePositionY   = cam.scrollY * 0.05;
    this.bgStars.tilePositionX  = cam.scrollX * 0.15;
    this.bgStars.tilePositionY  = cam.scrollY * 0.15;
    this.bgStars2.tilePositionX = cam.scrollX * 0.3;
    this.bgStars2.tilePositionY = cam.scrollY * 0.3;

    // ── Player movement (8-directional with rotation) ────────────────
    const up    = this.cursors.up.isDown    || this.wasd.W.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.S.isDown;
    const left  = this.cursors.left.isDown  || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;

    let ax = 0, ay = 0;
    if (up)    ay = -1;
    if (down)  ay = 1;
    if (left)  ax = -1;
    if (right) ax = 1;

    // Ship speed from piloting skill
    const shipSpeed = SpaceState.getShipSpeed();
    this.player.setMaxVelocity(shipSpeed);

    if (ax !== 0 || ay !== 0) {
      const len = Math.sqrt(ax * ax + ay * ay);
      ax /= len; ay /= len;
      this.player.setAcceleration(ax * 500, ay * 500);
      this.facingAngle = Math.atan2(ay, ax);

      // Piloting XP from flying
      this.pilotingTimer += delta;
      if (this.pilotingTimer >= 3000) {
        this.pilotingTimer -= 3000;
        SpaceState.skills.piloting.totalExp += 4;
        const gained = SpaceState.checkSkillUp('piloting');
        if (gained > 0) this._domFloat(this.player.x, this.player.y - 30, `Piloting LV${SpaceState.skills.piloting.level}!`, '#44ddff');
      }
    } else {
      this.player.setAcceleration(0, 0);
      this.pilotingTimer = 0;
    }

    // Rotate ship to face movement direction
    const targetDeg = Phaser.Math.RadToDeg(this.facingAngle) + 90;
    let currentAngle = this.player.angle;
    let diff = targetDeg - currentAngle;
    // Normalize to -180..180
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    this.player.setAngle(currentAngle + diff * 0.12);

    // Engine follows ship
    this.engine.setPosition(this.player.x, this.player.y);
    this.engine.setAngle(this.player.angle);

    // ── Shooting (fires in facing direction) ─────────────────────────
    if (this.spaceKey.isDown && time > this.lastFired + FIRE_RATE) {
      this._fireBullet();
      this.lastFired = time;
    }

    // ── Clean up far bullets ─────────────────────────────────────────
    this.bullets.children.each(b => {
      if (!b.active) return;
      const d = Phaser.Math.Distance.Between(b.x, b.y, this.player.x, this.player.y);
      if (d > 600) b.destroy();
    });

    // ── Enemy AI ─────────────────────────────────────────────────────
    this.enemies.children.each(e => {
      if (!e.active) return;
      const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
      const aggroRange = e.getData('aggro') || 400;

      if (dist < aggroRange) {
        const angle = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
        const spd = e.getData('speed') || 60;
        e.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
        e.setAngle(Phaser.Math.RadToDeg(angle) + 90);
      } else {
        // Idle drift
        e.setVelocity(e.body.velocity.x * 0.98, e.body.velocity.y * 0.98);
      }
    });

    // ── Planet proximity check ───────────────────────────────────────
    this.nearPlanet = null;
    for (let i = 0; i < this.planetSprites.length; i++) {
      const p = this.planetSprites[i];
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
      if (d < 80) { this.nearPlanet = this.planetData[i]; break; }
    }
    document.getElementById('hud-location').textContent = this.nearPlanet
      ? this.nearPlanet.name + ' — [E] to land'
      : 'Deep Space';

    // ── Land on planet ───────────────────────────────────────────────
    if (this.nearPlanet && Phaser.Input.Keyboard.JustDown(this.eKey)) {
      // Exploration XP for new planets
      if (!SpaceState.discoveredPlanets.includes(this.nearPlanet.name)) {
        SpaceState.discoveredPlanets.push(this.nearPlanet.name);
        SpaceState.skills.exploration.totalExp += 50;
        const gained = SpaceState.checkSkillUp('exploration');
        this._domFloat(this.player.x, this.player.y - 30, `Discovered ${this.nearPlanet.name}! +50 XP`, '#ddaa44');
        if (gained > 0) this._domFloat(this.player.x, this.player.y - 50, `Exploration LV${SpaceState.skills.exploration.level}!`, '#ffee44');
      }
      this._landOnPlanet(this.nearPlanet);
    }

    // ── Station proximity ──────────────────────────────────────────────
    const stDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.stationX, this.stationY);
    if (stDist < 50) {
      document.getElementById('hud-location').textContent = 'Outpost Alpha — [E] to dock';
      if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
        showStationScreen();
      }
    }

    // ── Cargo screen ─────────────────────────────────────────────────
    if (Phaser.Input.Keyboard.JustDown(this.iKey)) {
      showCargoScreen();
    }

    // ── Save ─────────────────────────────────────────────────────────
    if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
      SpaceState.save();
      this._domFloat(this.player.x, this.player.y - 30, 'Game Saved', '#88ff88');
    }

    // ── HUD ──────────────────────────────────────────────────────────
    this._updateHUD();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  _landOnPlanet(planet) {
    // Save space position for return
    SpaceState.spaceReturn = { x: this.player.x, y: this.player.y };
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('PlanetScene', { planet });
    });
  }

  _fireBullet() {
    const angle = Phaser.Math.DegToRad(this.player.angle - 90);
    const ox = Math.cos(angle) * 24;
    const oy = Math.sin(angle) * 24;
    const bullet = this.bullets.create(this.player.x + ox, this.player.y + oy, 'bullet');
    if (!bullet) return;
    bullet.setVelocity(Math.cos(angle) * BULLET_SPEED, Math.sin(angle) * BULLET_SPEED);
    bullet.setAngle(this.player.angle);
    bullet.setDepth(8);
  }

  _spawnEnemies() {
    const types = [
      { key: 'enemy-fighter', hp: 2, speed: 70,  aggro: 350, scale: 0.5 },
      { key: 'enemy-scout',   hp: 1, speed: 100, aggro: 450, scale: 0.45 },
      { key: 'enemy-bomber',  hp: 4, speed: 40,  aggro: 300, scale: 0.6 },
    ];

    // Scatter enemies around the world, away from center spawn
    for (let i = 0; i < 20; i++) {
      const type = types[Phaser.Math.Between(0, types.length - 1)];
      let x, y;
      do {
        x = Phaser.Math.Between(100, WORLD_SIZE - 100);
        y = Phaser.Math.Between(100, WORLD_SIZE - 100);
      } while (Phaser.Math.Distance.Between(x, y, WORLD_SIZE/2, WORLD_SIZE/2) < 300);

      const enemy = this.enemies.create(x, y, type.key);
      enemy.setScale(type.scale);
      enemy.setDepth(5);
      enemy.setData('hp', type.hp);
      enemy.setData('maxHp', type.hp);
      enemy.setData('speed', type.speed);
      enemy.setData('aggro', type.aggro);
      enemy.setData('spawnX', x);
      enemy.setData('spawnY', y);
      enemy.setData('type', type);
    }
  }

  _bulletHitEnemy(bullet, enemy) {
    bullet.destroy();

    const dmg = SpaceState.getBulletDamage();
    let hp = enemy.getData('hp') - dmg;
    enemy.setData('hp', hp);
    enemy.setTint(0xff4444);
    this.time.delayedCall(80, () => { if (enemy.active) enemy.clearTint(); });

    if (hp <= 0) {
      SpaceState.player.credits += 10;
      SpaceState.skills.combat.totalExp += 15;
      const combatGain = SpaceState.checkSkillUp('combat');
      this._domFloat(enemy.x, enemy.y, '+10 credits', '#ddcc44');
      if (combatGain > 0) this._domFloat(enemy.x, enemy.y - 20, `Combat LV${SpaceState.skills.combat.level}!`, '#ffee44');

      const sx = enemy.getData('spawnX');
      const sy = enemy.getData('spawnY');
      const type = enemy.getData('type');

      this.tweens.add({
        targets: enemy, alpha: 0, scale: 0.1, duration: 200,
        onComplete: () => {
          enemy.destroy();
          // Respawn after delay
          this.time.delayedCall(15000, () => {
            const e = this.enemies.create(sx, sy, type.key);
            e.setScale(type.scale).setDepth(5);
            e.setData('hp', type.hp);
            e.setData('maxHp', type.hp);
            e.setData('speed', type.speed);
            e.setData('aggro', type.aggro);
            e.setData('spawnX', sx);
            e.setData('spawnY', sy);
            e.setData('type', type);
            e.setAlpha(0);
            this.tweens.add({ targets: e, alpha: 1, duration: 500 });
          });
        },
      });
    }
  }

  _enemyHitPlayer(player, enemy) {
    if (this.isInvincible) return;

    const p = SpaceState.player;
    if (p.shield > 0) {
      p.shield = Math.max(0, p.shield - 15);
      this._domFloat(player.x, player.y, '-15 shield', '#6699ff');
    } else {
      p.hp = Math.max(0, p.hp - 20);
      this._domFloat(player.x, player.y, '-20 hull', '#ff4444');
    }

    this.isInvincible = true;
    this.tweens.add({
      targets: player, alpha: 0.3,
      duration: 80, yoyo: true, repeat: 4,
      onComplete: () => { player.setAlpha(1); this.isInvincible = false; },
    });

    enemy.destroy();

    if (p.hp <= 0) {
      // TODO: game over
    }
  }

  _updateHUD() {
    const p = SpaceState.player;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxHp * 100) + '%';
    document.getElementById('hp-text').textContent = `${p.hp}/${p.maxHp}`;
    document.getElementById('shield-fill').style.width = (p.shield / p.maxShield * 100) + '%';
    document.getElementById('shield-text').textContent = `${p.shield}/${p.maxShield}`;
    document.getElementById('hud-credits').textContent = `Credits: ${p.credits}`;
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
