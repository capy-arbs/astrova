const ASSET = 'assets/sprites/';
const VOID_MAIN  = ASSET + 'Foozle_2DS0011_Void_MainShip/';
const VOID_ENV   = ASSET + 'Foozle_2DS0015_Void_EnvironmentPack/';
const VOID_FLEET = ASSET + 'Foozle_2DS0012_Void_EnemyFleet_1/';

const WORLD_SIZE       = 3000;
const SHIELD_REGEN_RATE = 2;   // per second
const SHIELD_REGEN_DELAY = 3000; // ms after last hit before regen starts

class FlightScene extends Phaser.Scene {
  constructor() { super({ key: 'FlightScene' }); }

  preload() {
    // Backgrounds
    this.load.image('bg-void',  VOID_ENV + 'Backgrounds/PNGs/Condesed/Starry background  - Layer 01 - Void.png');
    this.load.image('bg-stars', VOID_ENV + 'Backgrounds/PNGs/Condesed/Starry background  - Layer 02 - Stars.png');
    this.load.image('bg-stars2',VOID_ENV + 'Backgrounds/PNGs/Condesed/Starry background  - Layer 03 - Stars.png');

    // Ship damage states
    this.load.image('ship-full',         VOID_MAIN + 'Main Ship/Main Ship - Bases/PNGs/Main Ship - Base - Full health.png');
    this.load.image('ship-slight',       VOID_MAIN + 'Main Ship/Main Ship - Bases/PNGs/Main Ship - Base - Slight damage.png');
    this.load.image('ship-damaged',      VOID_MAIN + 'Main Ship/Main Ship - Bases/PNGs/Main Ship - Base - Damaged.png');
    this.load.image('ship-very-damaged', VOID_MAIN + 'Main Ship/Main Ship - Bases/PNGs/Main Ship - Base - Very damaged.png');

    this.load.spritesheet('ship-engine', VOID_MAIN + 'Main Ship/Main Ship - Engine Effects/PNGs/Main Ship - Engines - Base Engine - Spritesheet.png',
      { frameWidth: 48, frameHeight: 48 });

    // Projectiles (spritesheets)
    this.load.spritesheet('bullet-auto',   VOID_MAIN + 'Main ship weapons/PNGs/Main ship weapon - Projectile - Auto cannon bullet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('bullet-rocket', VOID_MAIN + 'Main ship weapons/PNGs/Main ship weapon - Projectile - Rocket.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('bullet-zapper', VOID_MAIN + 'Main ship weapons/PNGs/Main ship weapon - Projectile - Zapper.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('bullet-bsg',    VOID_MAIN + 'Main ship weapons/PNGs/Main ship weapon - Projectile - Big Space Gun.png', { frameWidth: 32, frameHeight: 32 });

    // Enemies
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
    const sys = STAR_SYSTEMS[SpaceState.currentSystem];

    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

    // ── Parallax backgrounds ─────────────────────────────────────────
    this.bgVoid   = this.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, 'bg-void').setOrigin(0).setScrollFactor(0).setDepth(-3);
    this.bgStars  = this.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, 'bg-stars').setOrigin(0).setScrollFactor(0).setDepth(-2);
    this.bgStars2 = this.add.tileSprite(0, 0, WORLD_SIZE, WORLD_SIZE, 'bg-stars2').setOrigin(0).setScrollFactor(0).setDepth(-1);

    // ── Planets ──────────────────────────────────────────────────────
    this.planetData = sys.planets;
    this.planetSprites = this.planetData.map(p => {
      const sprite = this.add.image(p.x, p.y, p.key).setScale(p.scale).setDepth(0);
      sprite.setData('name', p.name);
      return sprite;
    });

    // ── Station ──────────────────────────────────────────────────────
    if (sys.station) {
      this.stationX = sys.station.x;
      this.stationY = sys.station.y;
      const stGfx = this.add.graphics();
      stGfx.fillStyle(0x556677);
      stGfx.fillRect(this.stationX - 16, this.stationY - 16, 32, 32);
      stGfx.fillStyle(0x8899aa);
      stGfx.fillRect(this.stationX - 8, this.stationY - 20, 16, 40);
      stGfx.fillRect(this.stationX - 20, this.stationY - 8, 40, 16);
      stGfx.fillStyle(0xaabbcc);
      stGfx.fillCircle(this.stationX, this.stationY, 6);
      stGfx.setDepth(0.5);
    }

    // ── Jump Gates ───────────────────────────────────────────────────
    this.jumpGates = (sys.jumpGates || []).map(g => {
      const gfx = this.add.graphics();
      gfx.lineStyle(2, 0x44aaff);
      gfx.strokeCircle(g.x, g.y, 20);
      gfx.lineStyle(1, 0x2266aa);
      gfx.strokeCircle(g.x, g.y, 14);
      gfx.fillStyle(0x112244, 0.5);
      gfx.fillCircle(g.x, g.y, 12);
      gfx.setDepth(0.5);

      // Pulsing glow
      const glow = this.add.circle(g.x, g.y, 22, 0x4488ff, 0.15).setDepth(0.4);
      this.tweens.add({ targets: glow, alpha: 0.05, scale: 1.3, duration: 1200, yoyo: true, repeat: -1 });

      return { ...g, gfx };
    });

    // ── Player ship ──────────────────────────────────────────────────
    const spawnX = SpaceState.spaceReturn ? SpaceState.spaceReturn.x : WORLD_SIZE / 2;
    const spawnY = SpaceState.spaceReturn ? SpaceState.spaceReturn.y : WORLD_SIZE / 2;
    SpaceState.spaceReturn = null;

    this.player = this.physics.add.sprite(spawnX, spawnY, SpaceState.getShipDamageKey());
    this.player.setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.92);
    this.player.setMaxVelocity(SpaceState.getShipSpeed());

    // Engine effect
    this.engine = this.add.sprite(this.player.x, this.player.y, 'ship-engine').setDepth(9);
    if (!this.anims.exists('engine-idle')) {
      this.anims.create({ key: 'engine-idle', frames: this.anims.generateFrameNumbers('ship-engine', { start: 0, end: 3 }), frameRate: 8, repeat: -1 });
    }
    this.engine.play('engine-idle');

    // ── Camera ───────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // ── Bullets ──────────────────────────────────────────────────────
    this.bullets = this.physics.add.group({ maxSize: 30 });
    this.lastFired = 0;

    // ── Enemies ──────────────────────────────────────────────────────
    this.enemies = this.physics.add.group();
    this._spawnEnemies(sys.enemyCount || 20);

    // ── Collisions ───────────────────────────────────────────────────
    this.physics.add.overlap(this.bullets, this.enemies, this._bulletHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this._enemyHitPlayer, null, this);

    // ── Input ────────────────────────────────────────────────────────
    this.cursors  = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.eKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.iKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
    this.sKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.facingAngle = -Math.PI / 2;
    this.isInvincible = false;
    this.pilotingTimer = 0;
    this.lastHitTime = 0;
    this.nearPlanet = null;

    // ── Minimap ──────────────────────────────────────────────────────
    this.minimap = this.add.graphics().setScrollFactor(0).setDepth(100);

    // ── System name flash ────────────────────────────────────────────
    this._domFloat(spawnX, spawnY - 40, sys.name, '#aabbcc', 2000);
  }

  update(time, delta) {
    const cam = this.cameras.main;

    // ── Parallax ─────────────────────────────────────────────────────
    this.bgVoid.tilePositionX   = cam.scrollX * 0.05;
    this.bgVoid.tilePositionY   = cam.scrollY * 0.05;
    this.bgStars.tilePositionX  = cam.scrollX * 0.15;
    this.bgStars.tilePositionY  = cam.scrollY * 0.15;
    this.bgStars2.tilePositionX = cam.scrollX * 0.3;
    this.bgStars2.tilePositionY = cam.scrollY * 0.3;

    // ── Shield regen ─────────────────────────────────────────────────
    const p = SpaceState.player;
    if (p.shield < p.maxShield && (time - this.lastHitTime) > SHIELD_REGEN_DELAY) {
      p.shield = Math.min(p.maxShield, p.shield + SHIELD_REGEN_RATE * (delta / 1000));
    }

    // ── Ship damage visual ───────────────────────────────────────────
    this.player.setTexture(SpaceState.getShipDamageKey());

    // ── Movement ─────────────────────────────────────────────────────
    const up    = this.cursors.up.isDown    || this.wasd.W.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.S.isDown;
    const left  = this.cursors.left.isDown  || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;

    const shipSpeed = SpaceState.getShipSpeed();
    this.player.setMaxVelocity(shipSpeed);

    let ax = 0, ay = 0;
    if (up) ay = -1; if (down) ay = 1;
    if (left) ax = -1; if (right) ax = 1;

    if (ax !== 0 || ay !== 0) {
      const len = Math.sqrt(ax*ax + ay*ay);
      this.player.setAcceleration((ax/len) * 500, (ay/len) * 500);
      this.facingAngle = Math.atan2(ay/len, ax/len);

      this.pilotingTimer += delta;
      if (this.pilotingTimer >= 3000) {
        this.pilotingTimer -= 3000;
        SpaceState.skills.piloting.totalExp += 4;
        const g = SpaceState.checkSkillUp('piloting');
        if (g > 0) this._domFloat(this.player.x, this.player.y - 30, `Piloting LV${SpaceState.skills.piloting.level}!`, '#44ddff');
      }
    } else {
      this.player.setAcceleration(0, 0);
      this.pilotingTimer = 0;
    }

    // Smooth rotation
    const targetDeg = Phaser.Math.RadToDeg(this.facingAngle) + 90;
    let diff = targetDeg - this.player.angle;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    this.player.setAngle(this.player.angle + diff * 0.12);

    this.engine.setPosition(this.player.x, this.player.y);
    this.engine.setAngle(this.player.angle);

    // ── Shooting ─────────────────────────────────────────────────────
    const fireRate = SpaceState.getFireRate();
    if (this.spaceKey.isDown && time > this.lastFired + fireRate) {
      this._fireBullet();
      this.lastFired = time;
    }

    // Clean up far bullets
    this.bullets.children.each(b => {
      if (b.active && Phaser.Math.Distance.Between(b.x, b.y, this.player.x, this.player.y) > 600) b.destroy();
    });

    // ── Enemy AI ─────────────────────────────────────────────────────
    this.enemies.children.each(e => {
      if (!e.active) return;
      const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
      if (dist < (e.getData('aggro') || 400)) {
        const angle = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
        const spd = e.getData('speed') || 60;
        e.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
        e.setAngle(Phaser.Math.RadToDeg(angle) + 90);
      } else {
        e.setVelocity(e.body.velocity.x * 0.98, e.body.velocity.y * 0.98);
      }
    });

    // ── Planet proximity ─────────────────────────────────────────────
    this.nearPlanet = null;
    for (let i = 0; i < this.planetSprites.length; i++) {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.planetSprites[i].x, this.planetSprites[i].y) < 80) {
        this.nearPlanet = this.planetData[i]; break;
      }
    }

    // ── Jump gate proximity ──────────────────────────────────────────
    let nearGate = null;
    for (const g of this.jumpGates) {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, g.x, g.y) < 30) {
        nearGate = g; break;
      }
    }

    // ── HUD location text ────────────────────────────────────────────
    if (nearGate) {
      document.getElementById('hud-location').textContent = nearGate.name + ' — [E] to jump';
    } else if (this.nearPlanet) {
      document.getElementById('hud-location').textContent = this.nearPlanet.name + ' — [E] to land';
    } else if (this.stationX && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.stationX, this.stationY) < 50) {
      document.getElementById('hud-location').textContent = 'Outpost — [E] to dock';
    } else {
      document.getElementById('hud-location').textContent = STAR_SYSTEMS[SpaceState.currentSystem].name;
    }

    // ── E key interactions ───────────────────────────────────────────
    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      if (nearGate) {
        this._jumpToSystem(nearGate.target);
      } else if (this.nearPlanet) {
        if (!SpaceState.discoveredPlanets.includes(this.nearPlanet.name)) {
          SpaceState.discoveredPlanets.push(this.nearPlanet.name);
          SpaceState.skills.exploration.totalExp += 50;
          const g = SpaceState.checkSkillUp('exploration');
          this._domFloat(this.player.x, this.player.y - 30, `Discovered ${this.nearPlanet.name}! +50 XP`, '#ddaa44');
          if (g > 0) this._domFloat(this.player.x, this.player.y - 50, `Exploration LV${SpaceState.skills.exploration.level}!`, '#ffee44');
        }
        this._landOnPlanet(this.nearPlanet);
      } else if (this.stationX && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.stationX, this.stationY) < 50) {
        showStationScreen();
      }
    }

    // ── Cargo / Save ─────────────────────────────────────────────────
    if (Phaser.Input.Keyboard.JustDown(this.iKey)) showCargoScreen();
    if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
      SpaceState.save();
      this._domFloat(this.player.x, this.player.y - 30, 'Game Saved', '#88ff88');
    }

    // ── Minimap ──────────────────────────────────────────────────────
    this._drawMinimap();

    // ── HUD ──────────────────────────────────────────────────────────
    this._updateHUD();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  _fireBullet() {
    const wep = WEAPONS[SpaceState.player.weapon] || WEAPONS['auto-cannon'];
    const angle = Phaser.Math.DegToRad(this.player.angle - 90) + (Math.random() - 0.5) * wep.spread;
    const ox = Math.cos(angle) * 24;
    const oy = Math.sin(angle) * 24;
    const bullet = this.bullets.create(this.player.x + ox, this.player.y + oy, wep.bulletKey, 0);
    if (!bullet) return;
    bullet.setVelocity(Math.cos(angle) * wep.bulletSpeed, Math.sin(angle) * wep.bulletSpeed);
    bullet.setAngle(this.player.angle);
    bullet.setDepth(8).setScale(0.8);
  }

  _landOnPlanet(planet) {
    SpaceState.spaceReturn = { x: this.player.x, y: this.player.y };
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('PlanetScene', { planet }));
  }

  _jumpToSystem(targetSystem) {
    SpaceState.currentSystem = targetSystem;
    SpaceState.spaceReturn = null;
    SpaceState.save();
    this.cameras.main.fadeOut(800, 255, 255, 255); // white flash for hyperspace
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart());
  }

  _spawnEnemies(count) {
    const types = [
      { key: 'enemy-fighter', hp: 2, speed: 70,  aggro: 350, scale: 0.5 },
      { key: 'enemy-scout',   hp: 1, speed: 100, aggro: 450, scale: 0.45 },
      { key: 'enemy-bomber',  hp: 4, speed: 40,  aggro: 300, scale: 0.6 },
    ];
    for (let i = 0; i < count; i++) {
      const type = types[Phaser.Math.Between(0, types.length - 1)];
      let x, y;
      do {
        x = Phaser.Math.Between(100, WORLD_SIZE - 100);
        y = Phaser.Math.Between(100, WORLD_SIZE - 100);
      } while (Phaser.Math.Distance.Between(x, y, WORLD_SIZE/2, WORLD_SIZE/2) < 300);

      const e = this.enemies.create(x, y, type.key);
      e.setScale(type.scale).setDepth(5);
      e.setData('hp', type.hp).setData('maxHp', type.hp).setData('speed', type.speed);
      e.setData('aggro', type.aggro).setData('spawnX', x).setData('spawnY', y).setData('type', type);
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
      const g = SpaceState.checkSkillUp('combat');
      this._domFloat(enemy.x, enemy.y, '+10 cr', '#ddcc44');
      if (g > 0) this._domFloat(enemy.x, enemy.y - 20, `Combat LV${SpaceState.skills.combat.level}!`, '#ffee44');

      const sx = enemy.getData('spawnX'), sy = enemy.getData('spawnY'), type = enemy.getData('type');
      this.tweens.add({
        targets: enemy, alpha: 0, scale: 0.1, duration: 200,
        onComplete: () => {
          enemy.destroy();
          this.time.delayedCall(15000, () => {
            const e = this.enemies.create(sx, sy, type.key);
            e.setScale(type.scale).setDepth(5).setAlpha(0);
            e.setData('hp', type.hp).setData('maxHp', type.hp).setData('speed', type.speed);
            e.setData('aggro', type.aggro).setData('spawnX', sx).setData('spawnY', sy).setData('type', type);
            this.tweens.add({ targets: e, alpha: 1, duration: 500 });
          });
        },
      });
    }
  }

  _enemyHitPlayer(player, enemy) {
    if (this.isInvincible) return;
    this.lastHitTime = this.time.now;

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
      targets: player, alpha: 0.3, duration: 80, yoyo: true, repeat: 4,
      onComplete: () => { player.setAlpha(1); this.isInvincible = false; },
    });
    enemy.destroy();

    if (p.hp <= 0) this._gameOver();
  }

  _gameOver() {
    this.scene.pause();
    showGameOverScreen(() => {
      SpaceState.resetShip();
      SpaceState.save();
      this.scene.stop();
      this.scene.start('FlightScene');
    });
  }

  _drawMinimap() {
    const mm = this.minimap;
    mm.clear();
    const W = this.scale.width, H = this.scale.height;
    const mmW = 80, mmH = 80;
    const mmX = W - mmW - 8, mmY = H - mmH - 8;
    const scale = mmW / WORLD_SIZE;

    // Background
    mm.fillStyle(0x000000, 0.5);
    mm.fillRoundedRect(mmX, mmY, mmW, mmH, 4);
    mm.lineStyle(1, 0x334455);
    mm.strokeRoundedRect(mmX, mmY, mmW, mmH, 4);

    // Planets
    this.planetSprites.forEach(p => {
      mm.fillStyle(0x44aa44);
      mm.fillCircle(mmX + p.x * scale, mmY + p.y * scale, 2);
    });

    // Station
    if (this.stationX) {
      mm.fillStyle(0xaabbcc);
      mm.fillRect(mmX + this.stationX * scale - 1, mmY + this.stationY * scale - 1, 3, 3);
    }

    // Jump gates
    this.jumpGates.forEach(g => {
      mm.fillStyle(0x4488ff);
      mm.fillCircle(mmX + g.x * scale, mmY + g.y * scale, 2);
    });

    // Enemies
    this.enemies.children.each(e => {
      if (!e.active) return;
      mm.fillStyle(0xff4444);
      mm.fillCircle(mmX + e.x * scale, mmY + e.y * scale, 1);
    });

    // Player
    mm.fillStyle(0x44ff44);
    mm.fillCircle(mmX + this.player.x * scale, mmY + this.player.y * scale, 2);
  }

  _updateHUD() {
    const p = SpaceState.player;
    document.getElementById('hp-fill').style.width = (p.hp / p.maxHp * 100) + '%';
    document.getElementById('hp-text').textContent = `${Math.floor(p.hp)}/${p.maxHp}`;
    document.getElementById('shield-fill').style.width = (Math.floor(p.shield) / p.maxShield * 100) + '%';
    document.getElementById('shield-text').textContent = `${Math.floor(p.shield)}/${p.maxShield}`;
    document.getElementById('hud-credits').textContent = `Credits: ${p.credits}`;
  }

  _domFloat(x, y, msg, color, duration) {
    duration = duration || 1200;
    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = msg;
    el.style.color = color || '#fff';
    el.style.animationDuration = duration + 'ms';
    const cam = this.cameras.main;
    const canvas = document.querySelector('canvas');
    const scaleX = canvas.clientWidth / this.scale.width;
    const scaleY = canvas.clientHeight / this.scale.height;
    el.style.left = ((x - cam.scrollX) * scaleX) + 'px';
    el.style.top = ((y - cam.scrollY) * scaleY) + 'px';
    document.getElementById('float-container').appendChild(el);
    setTimeout(() => el.remove(), duration + 50);
  }
}
