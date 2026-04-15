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

    // Ship damage states (starter ship)
    this.load.image('ship-full',         VOID_MAIN + 'Main Ship/Main Ship - Bases/PNGs/Main Ship - Base - Full health.png');
    this.load.image('ship-slight',       VOID_MAIN + 'Main Ship/Main Ship - Bases/PNGs/Main Ship - Base - Slight damage.png');
    this.load.image('ship-damaged',      VOID_MAIN + 'Main Ship/Main Ship - Bases/PNGs/Main Ship - Base - Damaged.png');
    this.load.image('ship-very-damaged', VOID_MAIN + 'Main Ship/Main Ship - Bases/PNGs/Main Ship - Base - Very damaged.png');

    // All buyable ships
    Object.values(SHIPS).forEach(s => {
      if (!this.textures.exists(s.spriteKey)) {
        this.load.image(s.spriteKey, s.path);
      }
    });

    // Drone sprite (for carrier)
    this.load.image('drone', _SP + 'Foozle_2DS0013_Void_EnemyFleet_2/Nairan/Designs - Base/PNGs/Nairan - Support Ship - Base.png');

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

    // Police ships
    this.load.image('police', _SP + 'Foozle_2DS0014_Void_EnemyFleet_3/Nautolan/Designs - Base/PNGs/Nautolan Ship - Support - Base.png');

    // Frontier enemies (Nairan - pirates)
    this.load.image('pirate-frigate',   _SP + 'Foozle_2DS0013_Void_EnemyFleet_2/Nairan/Designs - Base/PNGs/Nairan - Frigate - Base.png');
    this.load.image('pirate-torpedo',   _SP + 'Foozle_2DS0013_Void_EnemyFleet_2/Nairan/Designs - Base/PNGs/Nairan - Torpedo Ship - Base.png');
    this.load.image('pirate-cruiser',   _SP + 'Foozle_2DS0013_Void_EnemyFleet_2/Nairan/Designs - Base/PNGs/Nairan - Battlecruiser - Base.png');

    // Alien enemies (Nautolan - unknown species)
    this.load.image('alien-scout',      _SP + 'Foozle_2DS0014_Void_EnemyFleet_3/Nautolan/Designs - Base/PNGs/Nautolan Ship - Scout - Base.png');
    this.load.image('alien-fighter',    _SP + 'Foozle_2DS0014_Void_EnemyFleet_3/Nautolan/Designs - Base/PNGs/Nautolan Ship - Fighter - Base.png');
    this.load.image('alien-battleship', _SP + 'Foozle_2DS0014_Void_EnemyFleet_3/Nautolan/Designs - Base/PNGs/Nautolan Ship - Battlecruiser - Base.png');
    this.load.image('alien-leviathan',  _SP + 'Foozle_2DS0014_Void_EnemyFleet_3/Nautolan/Designs - Base/PNGs/Nautolan Ship - Dreadnought - Base.png');

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

    // Tint backgrounds by system for visual variety
    const bgTints = {
      'sol': null,
      'alpha-centauri': 0xaabbff,
      'kepler': 0xffccaa,
      'deadzone': 0x998877,
      'outerrim': 0xcc9966,
      'nebula': 0xbb88ff,
      'void': 0x664488,
    };
    const tint = bgTints[SpaceState.currentSystem];
    if (tint) {
      this.bgStars.setTint(tint);
      this.bgStars2.setTint(tint);
    }

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

    // ── Space objects (derelicts, asteroid fields) ─────────────────
    this.spaceObjects = (SPACE_OBJECTS[SpaceState.currentSystem] || []).map(obj => {
      const gfx = this.add.graphics();
      if (obj.type === 'derelict') {
        gfx.fillStyle(0x666677); gfx.fillRect(obj.x - 10, obj.y - 6, 20, 12);
        gfx.fillStyle(0x555566); gfx.fillRect(obj.x - 6, obj.y - 10, 12, 20);
        gfx.fillStyle(0x444455); gfx.fillCircle(obj.x, obj.y, 4);
      } else {
        // Asteroid field — scatter small rocks
        for (let i = 0; i < 8; i++) {
          const ax = obj.x + Phaser.Math.Between(-30, 30);
          const ay = obj.y + Phaser.Math.Between(-30, 30);
          const size = Phaser.Math.Between(3, 7);
          gfx.fillStyle(Phaser.Math.Between(0, 1) ? 0x887766 : 0x776655);
          gfx.fillCircle(ax, ay, size);
        }
      }
      gfx.setDepth(0.5);
      return { ...obj, collected: false };
    });

    // ── Player ship ──────────────────────────────────────────────────
    const spawnX = SpaceState.spaceReturn ? SpaceState.spaceReturn.x : WORLD_SIZE / 2;
    const spawnY = SpaceState.spaceReturn ? SpaceState.spaceReturn.y : WORLD_SIZE / 2;
    SpaceState.spaceReturn = null;

    this.player = this.physics.add.sprite(spawnX, spawnY, SpaceState.getShipSpriteKey());
    this.player.setScale(SpaceState.getShipScale());
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

    // ── Neutral trader ships ────────────────────────────────────────
    this.traders = this.physics.add.group();
    this._spawnTraders(sys.traders || 0);

    // ── Police patrols ─────────────────────────────────────────────
    this.police = this.physics.add.group();
    this._spawnPolice();

    // ── Collisions ───────────────────────────────────────────────────
    this.physics.add.overlap(this.bullets, this.enemies, this._bulletHitEnemy, null, this);
    this.physics.add.overlap(this.player, this.enemies, this._enemyHitPlayer, null, this);
    this.physics.add.overlap(this.bullets, this.police, this._bulletHitPolice, null, this);
    this.physics.add.overlap(this.player, this.police, this._policeContactPlayer, null, this);

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
    this.cKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.pilotingTimer = 0;
    this.lastHitTime = 0;
    this.nearPlanet = null;

    // ── Carrier drones ───────────────────────────────────────────────
    this.drones = [];
    const droneCount = SpaceState.getDroneCount();
    if (droneCount > 0) {
      for (let i = 0; i < droneCount; i++) {
        const angle = (i / droneCount) * Math.PI * 2;
        const dx = this.player.x + Math.cos(angle) * 40;
        const dy = this.player.y + Math.sin(angle) * 40;
        const drone = this.physics.add.sprite(dx, dy, 'drone');
        drone.setScale(0.25).setDepth(9).setTint(0x88ccff);
        drone.setData('orbitAngle', angle);
        drone.setData('state', 'orbit'); // orbit | attack
        drone.setData('target', null);
        drone.setData('fireTimer', 0);
        this.drones.push(drone);

        // Drones can also hit enemies
        this.physics.add.overlap(drone, this.enemies, (d, e) => this._droneHitEnemy(d, e));
      }
    }

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
    const effectiveMaxShield = p.maxShield + SpaceState.getMaxShieldBonus();
    const effectiveMaxHp = p.maxHp + SpaceState.getMaxHpBonus();

    if (p.shield < effectiveMaxShield && (time - this.lastHitTime) > SHIELD_REGEN_DELAY) {
      const regenAmt = SpaceState.getShieldRegen() * (delta / 1000);
      p.shield = Math.min(effectiveMaxShield, p.shield + regenAmt);

      // Shields XP from regen
      this._shieldRegenXpTimer = (this._shieldRegenXpTimer || 0) + delta;
      if (this._shieldRegenXpTimer >= 2000) {
        this._shieldRegenXpTimer -= 2000;
        SpaceState.skills.shields.totalExp += 3;
        SpaceState.checkSkillUp('shields');
      }
    }

    // ── Hull repair (passive, slower than shields) ────────────────────
    if (p.hp < effectiveMaxHp && (time - this.lastHitTime) > SHIELD_REGEN_DELAY * 2) {
      const hullRegenRate = 0.5 + (SpaceState.skills.hullIntegrity.level - 1) * 0.08; // slow base, scales with skill
      const repairAmt = hullRegenRate * (delta / 1000);
      p.hp = Math.min(effectiveMaxHp, p.hp + repairAmt);

      // Hull Integrity XP from repair
      this._hullRepairXpTimer = (this._hullRepairXpTimer || 0) + delta;
      if (this._hullRepairXpTimer >= 3000) {
        this._hullRepairXpTimer -= 3000;
        SpaceState.skills.hullIntegrity.totalExp += 3;
        SpaceState.checkSkillUp('hullIntegrity');
      }
    }

    // ── Ship damage visual ───────────────────────────────────────────
    this.player.setTexture(SpaceState.getShipSpriteKey());
    this.player.setScale(SpaceState.getShipScale());

    // ── Movement ─────────────────────────────────────────────────────
    const up    = this.cursors.up.isDown    || this.wasd.W.isDown;
    const down  = this.cursors.down.isDown  || this.wasd.S.isDown;
    const left  = this.cursors.left.isDown  || this.wasd.A.isDown;
    const right = this.cursors.right.isDown || this.wasd.D.isDown;

    const shipSpeed = SpaceState.getShipSpeed();
    this.player.setMaxVelocity(shipSpeed);

    let ax = touchState.ax, ay = touchState.ay;
    if (up) ay = -1; if (down) ay = 1;
    if (left) ax = -1; if (right) ax = 1;

    if (ax !== 0 || ay !== 0) {
      const len = Math.sqrt(ax*ax + ay*ay);
      this.player.setAcceleration((ax/len) * 500, (ay/len) * 500);
      this.facingAngle = Math.atan2(ay/len, ax/len);
    } else {
      this.player.setAcceleration(0, 0);
    }

    // Piloting XP from any movement (including drifting)
    const shipVel = this.player.body.velocity.length();
    if (shipVel > 10) {
      this.pilotingTimer += delta;
      if (this.pilotingTimer >= 1000) {
        this.pilotingTimer -= 1000;
        SpaceState.skills.piloting.totalExp += 4;
        const g = SpaceState.checkSkillUp('piloting');
        if (g > 0) this._domFloat(this.player.x, this.player.y - 30, `Piloting LV${SpaceState.skills.piloting.level}!`, '#44ddff');
      }
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
    if ((this.spaceKey.isDown || touchState.fire) && time > this.lastFired + fireRate) {
      this._fireBullet();
      this.lastFired = time;
    }

    // Update and clean up bullets
    this.bullets.children.each(b => {
      if (!b.active) return;
      if (Phaser.Math.Distance.Between(b.x, b.y, this.player.x, this.player.y) > 600) { b.destroy(); return; }

      // Rocket acceleration
      if (b.getData('accelerating')) {
        const angle = b.getData('angle');
        const maxSpd = b.getData('maxSpeed');
        const curSpd = b.body.velocity.length();
        if (curSpd < maxSpd) {
          const newSpd = Math.min(maxSpd, curSpd + 600 * (delta / 1000)); // ramps up fast
          b.setVelocity(Math.cos(angle) * newSpd, Math.sin(angle) * newSpd);
        }
      }
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
    const planetRange = SpaceState.getPlanetDetectRange();
    for (let i = 0; i < this.planetSprites.length; i++) {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.planetSprites[i].x, this.planetSprites[i].y) < planetRange) {
        this.nearPlanet = this.planetData[i]; break;
      }
    }

    // Scanning XP passively while exploring (near planets or moving through new areas)
    if (this.nearPlanet) {
      this._scanTimer = (this._scanTimer || 0) + delta;
      if (this._scanTimer >= 2000) {
        this._scanTimer -= 2000;
        SpaceState.skills.scanning.totalExp += 5;
        SpaceState.checkSkillUp('scanning');
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

    // ── E key / touch action interactions ───────────────────────────
    const ePressed = Phaser.Input.Keyboard.JustDown(this.eKey) || (touchState.action && !this._lastTouchAction);
    this._lastTouchAction = touchState.action;
    if (ePressed) {
      if (nearGate) {
        this._jumpToSystem(nearGate.target);
      } else if (this.nearPlanet) {
        if (!SpaceState.discoveredPlanets.includes(this.nearPlanet.name)) {
          SpaceState.discoveredPlanets.push(this.nearPlanet.name);
          SpaceState.skills.exploration.totalExp += 50;
          const g = SpaceState.checkSkillUp('exploration');
          this._domFloat(this.player.x, this.player.y - 30, `Discovered ${this.nearPlanet.name}! +50 XP`, '#ddaa44');
          if (g > 0) this._domFloat(this.player.x, this.player.y - 50, `Exploration LV${SpaceState.skills.exploration.level}!`, '#ffee44');

          // Story quest: discover planets
          if (SpaceState.activeStoryQuest) {
            const sq = STORY_QUESTS[SpaceState.storyProgress];
            if (sq && sq.goal.type === 'discover') {
              SpaceState.activeStoryQuest.progress = (SpaceState.activeMission.progress || 0) + 1;
            }
          }

          // Check exploration bounty
          const bounty = EXPLORATION_BOUNTIES[SpaceState.currentSystem];
          if (bounty && bounty.required.every(p => SpaceState.discoveredPlanets.includes(p))) {
            if (!SpaceState.completedMissions.includes('bounty-' + SpaceState.currentSystem)) {
              SpaceState.completedMissions.push('bounty-' + SpaceState.currentSystem);
              SpaceState.player.credits += bounty.reward;
              this._domFloat(this.player.x, this.player.y - 70, `${bounty.name} complete! +${bounty.reward}cr`, '#ffcc44', 3000);
            }
          }
        }
        this._landOnPlanet(this.nearPlanet);
      } else if (this.stationX && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.stationX, this.stationY) < 50) {
        showStationScreen();
      }
    }

    // ── Cargo / Save ─────────────────────────────────────────────────
    const iPressed = Phaser.Input.Keyboard.JustDown(this.iKey) || (touchState.inv && !this._lastTouchInv);
    this._lastTouchInv = touchState.inv;
    if (iPressed) showCargoScreen();
    if (Phaser.Input.Keyboard.JustDown(this.sKey)) {
      SpaceState.save();
      this._domFloat(this.player.x, this.player.y - 30, 'Game Saved', '#88ff88');
    }

    // ── Space object proximity ─────────────────────────────────────
    this.spaceObjects.forEach(obj => {
      if (obj.collected) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (d < 40) {
        if (!obj._prompted) {
          document.getElementById('hud-location').textContent = obj.name + ' — [E] to salvage';
          obj._prompted = true;
        }
        if (ePressed) {
          obj.collected = true;
          for (const [key, qty] of Object.entries(obj.loot)) {
            SpaceState.addCargo(key, qty);
            this._domFloat(obj.x, obj.y - 20, `+${qty} ${RESOURCE_DEFS[key]?.name || key}`, RESOURCE_DEFS[key]?.color || '#fff');
          }
          SpaceState.skills.exploration.totalExp += 30;
          SpaceState.skills.scanning.totalExp += 20;
          SpaceState.checkSkillUp('exploration');
          SpaceState.checkSkillUp('scanning');
          this._domFloat(obj.x, obj.y - 40, 'Salvaged!', '#ddaa44');

          // Story quest: salvage specific derelict
          if (SpaceState.activeStoryQuest) {
            const sq = STORY_QUESTS[SpaceState.storyProgress];
            if (sq && sq.goal.type === 'salvage' && sq.goal.target === obj.name) {
              SpaceState.activeStoryQuest.progress = 1;
              this._domFloat(obj.x, obj.y - 60, 'Story objective complete!', '#ffcc44', 2000);
            }
          }
        }
      } else {
        obj._prompted = false;
      }
    });

    // ── Active buff ticking ──────────────────────────────────────────
    if (SpaceState.activeBuff) {
      SpaceState.activeBuff.timer -= delta / 1000;
      if (SpaceState.activeBuff.timer <= 0) {
        SpaceState.activeBuff = null;
      }
    }

    // ── Cloak system ─────────────────────────────────────────────────
    const shipDef = SHIPS[SpaceState.player.ship] || SHIPS['starter'];
    const canCloak = shipDef.cloak || false;

    if (canCloak && Phaser.Input.Keyboard.JustDown(this.cKey)) {
      if (!SpaceState.cloaked && SpaceState.cloakEnergy > 10) {
        SpaceState.cloaked = true;
        this._domFloat(this.player.x, this.player.y - 30, 'Cloak engaged', '#88aaff');
      } else if (SpaceState.cloaked) {
        SpaceState.cloaked = false;
        this._domFloat(this.player.x, this.player.y - 30, 'Cloak disengaged', '#aaaaaa');
      }
    }

    if (SpaceState.cloaked) {
      SpaceState.cloakEnergy -= 20 * (delta / 1000); // drains ~20/sec = 5 seconds of cloak
      if (SpaceState.cloakEnergy <= 0) {
        SpaceState.cloakEnergy = 0;
        SpaceState.cloaked = false;
        this._domFloat(this.player.x, this.player.y - 30, 'Cloak depleted!', '#ff6644');
      }
      // Visual: ship goes translucent
      this.player.setAlpha(0.25);
      this.engine.setAlpha(0.15);
    } else {
      // Recharge when not cloaked
      if (SpaceState.cloakEnergy < SpaceState.cloakMax) {
        SpaceState.cloakEnergy = Math.min(SpaceState.cloakMax, SpaceState.cloakEnergy + 8 * (delta / 1000)); // recharges ~8/sec = 12.5s full recharge
      }
      if (!this.isInvincible) {
        this.player.setAlpha(1);
        this.engine.setAlpha(1);
      }
    }

    // ── Trader AI (peaceful, fly between planets) ──────────────────
    this.traders.children.each(t => {
      if (!t.active) return;
      const target = t.getData('target');
      if (target) {
        const dist = Phaser.Math.Distance.Between(t.x, t.y, target.x, target.y);
        if (dist < 30) {
          // Reached destination, pick new one
          t.setData('target', this._randomPlanetPos());
          t.setData('waitTimer', Phaser.Math.Between(3000, 8000));
        } else if (t.getData('waitTimer') > 0) {
          t.setData('waitTimer', t.getData('waitTimer') - delta);
          t.setVelocity(0, 0);
        } else {
          const angle = Phaser.Math.Angle.Between(t.x, t.y, target.x, target.y);
          t.setVelocity(Math.cos(angle) * 40, Math.sin(angle) * 40);
          t.setAngle(Phaser.Math.RadToDeg(angle) + 90);
        }
      }

      // Hail trader when close
      const playerDist = Phaser.Math.Distance.Between(t.x, t.y, this.player.x, this.player.y);
      if (playerDist < 50 && !t.getData('hailed')) {
        document.getElementById('hud-location').textContent = 'Trader — [E] to hail';
        if (ePressed) {
          t.setData('hailed', true);
          this.time.delayedCall(5000, () => t.setData('hailed', false));
          showTraderScreen(t);
        }
      }
    });

    // ── Police AI + scanning ─────────────────────────────────────────
    if (SpaceState.wanted && SpaceState.wantedTimer > 0) {
      SpaceState.wantedTimer -= delta / 1000;
      if (SpaceState.wantedTimer <= 0) {
        SpaceState.wanted = false;
        SpaceState.wantedTimer = 0;
        this._domFloat(this.player.x, this.player.y - 30, 'Wanted status cleared', '#44ff44');
      }
    }

    this.police.children.each(p => {
      if (!p.active) return;
      const dist = Phaser.Math.Distance.Between(p.x, p.y, this.player.x, this.player.y);

      if (SpaceState.wanted && !SpaceState.cloaked) {
        // Chase player when wanted (and visible)
        if (dist < 400) {
          const angle = Phaser.Math.Angle.Between(p.x, p.y, this.player.x, this.player.y);
          p.setVelocity(Math.cos(angle) * 85, Math.sin(angle) * 85);
          p.setAngle(Phaser.Math.RadToDeg(angle) + 90);
        } else {
          p.setVelocity(p.body.velocity.x * 0.98, p.body.velocity.y * 0.98);
        }
      } else {
        // Patrol — wander randomly
        if (!p.getData('patrolTimer') || p.getData('patrolTimer') <= 0) {
          const angle = Math.random() * Math.PI * 2;
          p.setVelocity(Math.cos(angle) * 30, Math.sin(angle) * 30);
          p.setAngle(Phaser.Math.RadToDeg(angle) + 90);
          p.setData('patrolTimer', Phaser.Math.Between(2000, 5000));
        } else {
          p.setData('patrolTimer', p.getData('patrolTimer') - delta);
        }

        // Scan player if within scan range and carrying contraband (not cloaked)
        const scanRange = SpaceState.getScanRange();
        if (dist < scanRange && SpaceState.hasContraband() && !SpaceState.cloaked) {
          if (!p.getData('scanCooldown') || p.getData('scanCooldown') <= 0) {
            p.setData('scanCooldown', 10000);
            // Always detected within range — no RNG
            SpaceState.wanted = true;
            SpaceState.wantedTimer = 60;
            this._domFloat(this.player.x, this.player.y - 30, 'CONTRABAND DETECTED! WANTED!', '#ff4444', 2000);
          }
        }
        // Warning when police getting close with contraband
        if (dist < scanRange + 40 && dist >= scanRange && SpaceState.hasContraband()) {
          if (!p.getData('warnCooldown') || p.getData('warnCooldown') <= 0) {
            p.setData('warnCooldown', 3000);
            this._domFloat(this.player.x, this.player.y - 20, 'Police scanning nearby...', '#ffcc44');
          }
        }
        if (p.getData('scanCooldown') > 0) p.setData('scanCooldown', p.getData('scanCooldown') - delta);
        if (p.getData('warnCooldown') > 0) p.setData('warnCooldown', p.getData('warnCooldown') - delta);
      }
    });

    // ── Drone AI ──────────────────────────────────────────────────────
    this._updateDrones(time, delta);

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
    bullet.setAngle(this.player.angle);
    bullet.setDepth(8).setScale(0.8);
    bullet.setData('angle', angle);

    if (wep === WEAPONS['rockets']) {
      // Rockets: start slow, accelerate over time
      bullet.setVelocity(Math.cos(angle) * 80, Math.sin(angle) * 80);
      bullet.setData('accelerating', true);
      bullet.setData('maxSpeed', wep.bulletSpeed);
    } else {
      bullet.setVelocity(Math.cos(angle) * wep.bulletSpeed, Math.sin(angle) * wep.bulletSpeed);
    }
  }

  _landOnPlanet(planet) {
    SpaceState.spaceReturn = { x: this.player.x, y: this.player.y };
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('PlanetScene', { planet }));
  }

  _jumpToSystem(targetSystem) {
    SpaceState.currentSystem = targetSystem;
    SpaceState.spaceReturn = null;

    // Warp Drive XP
    SpaceState.skills.warpDrive.totalExp += 30;
    SpaceState.checkSkillUp('warpDrive');

    // Story quest: reach system
    if (SpaceState.activeStoryQuest) {
      const sq = STORY_QUESTS[SpaceState.storyProgress];
      if (sq && sq.goal.type === 'reach' && sq.goal.system === targetSystem) {
        SpaceState.activeStoryQuest.progress = 1;
        this._domFloat(this.player.x, this.player.y - 30, 'Story objective reached!', '#ffcc44', 2000);
      }
    }

    SpaceState.save();
    this.cameras.main.fadeOut(800, 255, 255, 255); // white flash for hyperspace
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart());
  }

  _spawnEnemies(count) {
    const sys = SpaceState.currentSystem;
    const sysData = STAR_SYSTEMS[sys];
    const layer = sysData.layer || 1;

    // Different enemy pools per layer
    let types, tint;
    if (layer <= 2) {
      // Core/Settled — Kla'ed
      types = [
        { key: 'enemy-fighter', hp: 2, speed: 70,  aggro: 350, scale: 0.5 },
        { key: 'enemy-scout',   hp: 1, speed: 100, aggro: 450, scale: 0.45 },
        { key: 'enemy-bomber',  hp: 4, speed: 40,  aggro: 300, scale: 0.6 },
      ];
      tint = null;
    } else if (layer === 3) {
      // Frontier — Pirates (red-tinted Nairan)
      types = [
        { key: 'pirate-frigate', hp: 5,  speed: 60,  aggro: 400, scale: 0.5 },
        { key: 'pirate-torpedo', hp: 3,  speed: 90,  aggro: 450, scale: 0.45 },
        { key: 'pirate-cruiser', hp: 10, speed: 35,  aggro: 350, scale: 0.4 },
      ];
      tint = 0xff6644;
    } else {
      // Unknown — Aliens (purple/green-tinted Nautolan)
      types = [
        { key: 'alien-scout',      hp: 4,  speed: 110, aggro: 500, scale: 0.45 },
        { key: 'alien-fighter',    hp: 8,  speed: 80,  aggro: 450, scale: 0.5 },
        { key: 'alien-battleship', hp: 15, speed: 50,  aggro: 400, scale: 0.4 },
        { key: 'alien-leviathan',  hp: 25, speed: 30,  aggro: 350, scale: 0.45 },
      ];
      tint = 0xaa44ff;
    }
    for (let i = 0; i < count; i++) {
      const type = types[Phaser.Math.Between(0, types.length - 1)];
      let x, y;
      do {
        x = Phaser.Math.Between(100, WORLD_SIZE - 100);
        y = Phaser.Math.Between(100, WORLD_SIZE - 100);
      } while (Phaser.Math.Distance.Between(x, y, WORLD_SIZE/2, WORLD_SIZE/2) < 300);

      const e = this.enemies.create(x, y, type.key);
      e.setScale(type.scale).setDepth(5);
      if (tint) e.setTint(tint);
      e.setData('hp', type.hp).setData('maxHp', type.hp).setData('speed', type.speed);
      e.setData('aggro', type.aggro).setData('spawnX', x).setData('spawnY', y).setData('type', type);
      e.setData('tint', tint);
      e.setData('layer', layer);
    }
  }

  _bulletHitEnemy(bullet, enemy) {
    bullet.destroy();
    const dmg = SpaceState.getBulletDamage();
    let hp = enemy.getData('hp') - dmg;
    enemy.setData('hp', hp);
    enemy.setTint(0xff4444);
    this.time.delayedCall(80, () => { if (enemy.active) enemy.clearTint(); });

    // Gunnery XP per hit
    SpaceState.skills.gunnery.totalExp += 3;
    const gunneryGain = SpaceState.checkSkillUp('gunnery');
    if (gunneryGain > 0) this._domFloat(this.player.x, this.player.y - 40, `Gunnery LV${SpaceState.skills.gunnery.level}!`, '#ff8844');

    // Targeting XP for longer range hits
    const hitDist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
    if (hitDist > 150) {
      SpaceState.skills.targeting.totalExp += 3;
      SpaceState.checkSkillUp('targeting');
    }

    if (hp <= 0) {
      const layer = enemy.getData('layer') || 1;
      const creditReward = 10 * layer;
      const xpReward = 8 * layer;
      SpaceState.player.credits += creditReward;
      SpaceState.skills.combat.totalExp += xpReward;
      const g = SpaceState.checkSkillUp('combat');
      this._domFloat(enemy.x, enemy.y, `+${creditReward} cr`, '#ddcc44');
      if (g > 0) this._domFloat(enemy.x, enemy.y - 20, `Combat LV${SpaceState.skills.combat.level}!`, '#ffee44');

      // Contract kill tracking
      if (SpaceState.activeContract) {
        const m = MISSIONS.find(mi => mi.id === SpaceState.activeContract.id);
        if (m && m.goal.type === 'kill') {
          SpaceState.activeContract.progress = (SpaceState.activeContract.progress || 0) + 1;
          if (SpaceState.activeContract.progress >= m.goal.count) {
            this._domFloat(this.player.x, this.player.y - 40, 'Contract complete! Return to station.', '#44ff44', 2000);
          }
        }
      }

      const sx = enemy.getData('spawnX'), sy = enemy.getData('spawnY'), type = enemy.getData('type');
      this.tweens.add({
        targets: enemy, alpha: 0, scale: 0.1, duration: 200,
        onComplete: () => {
          const eTint = enemy.getData('tint');
          const eLayer = enemy.getData('layer');
          enemy.destroy();
          this.time.delayedCall(15000, () => {
            const e = this.enemies.create(sx, sy, type.key);
            e.setScale(type.scale).setDepth(5).setAlpha(0);
            if (eTint) e.setTint(eTint);
            e.setData('hp', type.hp).setData('maxHp', type.hp).setData('speed', type.speed);
            e.setData('aggro', type.aggro).setData('spawnX', sx).setData('spawnY', sy).setData('type', type);
            e.setData('tint', eTint).setData('layer', eLayer);
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
      // Shields XP from absorbing damage
      SpaceState.skills.shields.totalExp += 8;
      const sg = SpaceState.checkSkillUp('shields');
      if (sg > 0) this._domFloat(player.x, player.y - 20, `Shields LV${SpaceState.skills.shields.level}!`, '#4488ff');
    } else {
      p.hp = Math.max(0, p.hp - 20);
      this._domFloat(player.x, player.y, '-20 hull', '#ff4444');
      // Hull Integrity XP from taking hull damage
      SpaceState.skills.hullIntegrity.totalExp += 10;
      const hg = SpaceState.checkSkillUp('hullIntegrity');
      if (hg > 0) this._domFloat(player.x, player.y - 20, `Hull Integrity LV${SpaceState.skills.hullIntegrity.level}!`, '#cc8844');
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

  _updateDrones(time, delta) {
    if (this.drones.length === 0) return;
    const shipDef = SHIPS[SpaceState.player.ship];
    const droneRange = (shipDef && shipDef.droneRange) || 250;

    this.drones.forEach(drone => {
      // Find nearest enemy in range
      let nearestEnemy = null;
      let nearestDist = droneRange;
      this.enemies.children.each(e => {
        if (!e.active) return;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearestEnemy = e;
        }
      });

      if (nearestEnemy) {
        // Attack mode — fly toward enemy
        drone.setData('state', 'attack');
        const angle = Phaser.Math.Angle.Between(drone.x, drone.y, nearestEnemy.x, nearestEnemy.y);
        const speed = 130;
        drone.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        drone.setAngle(Phaser.Math.RadToDeg(angle) + 90);

        // Drone shoots at enemy
        let ft = drone.getData('fireTimer') + delta;
        if (ft >= 600) { // fire every 600ms
          ft = 0;
          const dist = Phaser.Math.Distance.Between(drone.x, drone.y, nearestEnemy.x, nearestEnemy.y);
          if (dist < 120) {
            const bullet = this.bullets.create(drone.x, drone.y, 'bullet-auto', 0);
            if (bullet) {
              bullet.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350);
              bullet.setAngle(Phaser.Math.RadToDeg(angle) + 90);
              bullet.setDepth(8).setScale(0.5).setTint(0x88ccff);
            }
          }
        }
        drone.setData('fireTimer', ft);
      } else {
        // Orbit mode — circle around player
        drone.setData('state', 'orbit');
        let orbitAngle = drone.getData('orbitAngle') + delta * 0.002;
        drone.setData('orbitAngle', orbitAngle);
        const orbitDist = 35;
        const tx = this.player.x + Math.cos(orbitAngle) * orbitDist;
        const ty = this.player.y + Math.sin(orbitAngle) * orbitDist;

        // Smooth follow
        drone.setVelocity((tx - drone.x) * 4, (ty - drone.y) * 4);
        drone.setAngle(this.player.angle);
      }

      // Leash — don't let drones wander too far from player
      const dFromPlayer = Phaser.Math.Distance.Between(drone.x, drone.y, this.player.x, this.player.y);
      if (dFromPlayer > droneRange + 50) {
        const angle = Phaser.Math.Angle.Between(drone.x, drone.y, this.player.x, this.player.y);
        drone.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
      }
    });
  }

  _droneHitEnemy(drone, enemy) {
    // Contact damage from drones (scales with Drone Command)
    const droneDmg = SpaceState.getDroneDamage();
    let hp = enemy.getData('hp') - droneDmg;

    // Drone Command XP
    SpaceState.skills.droneCommand.totalExp += 4;
    SpaceState.checkSkillUp('droneCommand');
    enemy.setData('hp', hp);
    enemy.setTint(0x8888ff);
    this.time.delayedCall(80, () => { if (enemy.active) enemy.clearTint(); });

    // Knockback the drone away
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, drone.x, drone.y);
    drone.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);

    if (hp <= 0) {
      SpaceState.player.credits += 10;
      SpaceState.skills.combat.totalExp += 15;
      SpaceState.checkSkillUp('combat');
      this._domFloat(enemy.x, enemy.y, '+10 cr', '#ddcc44');

      const sx = enemy.getData('spawnX'), sy = enemy.getData('spawnY'), type = enemy.getData('type');
      this.tweens.add({
        targets: enemy, alpha: 0, scale: 0.1, duration: 200,
        onComplete: () => {
          const eTint = enemy.getData('tint');
          const eLayer = enemy.getData('layer');
          enemy.destroy();
          this.time.delayedCall(15000, () => {
            const e = this.enemies.create(sx, sy, type.key);
            e.setScale(type.scale).setDepth(5).setAlpha(0);
            if (eTint) e.setTint(eTint);
            e.setData('hp', type.hp).setData('maxHp', type.hp).setData('speed', type.speed);
            e.setData('aggro', type.aggro).setData('spawnX', sx).setData('spawnY', sy).setData('type', type);
            e.setData('tint', eTint).setData('layer', eLayer);
            this.tweens.add({ targets: e, alpha: 1, duration: 500 });
          });
        },
      });
    }
  }

  _spawnTraders(count) {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(300, WORLD_SIZE - 300);
      const y = Phaser.Math.Between(300, WORLD_SIZE - 300);
      const t = this.traders.create(x, y, 'police'); // reuse ship sprite with different tint
      t.setScale(0.4).setDepth(4).setTint(0x44cc44); // green tint = friendly
      t.setData('target', this._randomPlanetPos());
      t.setData('waitTimer', 0);
      t.setData('hailed', false);
      t.setData('goods', this._randomTraderGoods());
    }
  }

  _randomPlanetPos() {
    const planets = STAR_SYSTEMS[SpaceState.currentSystem].planets;
    const p = planets[Phaser.Math.Between(0, planets.length - 1)];
    return { x: p.x, y: p.y };
  }

  _randomTraderGoods() {
    const keys = Object.keys(RESOURCE_DEFS);
    const goods = [];
    for (let i = 0; i < 3; i++) {
      const key = keys[Phaser.Math.Between(0, keys.length - 1)];
      const def = RESOURCE_DEFS[key];
      goods.push({ key, name: def.name, color: def.color, price: Math.floor(def.value * 0.8), qty: Phaser.Math.Between(2, 6) });
    }
    return goods;
  }

  _spawnPolice() {
    const count = SpaceState.currentSystem === 'sol' ? 4 : SpaceState.currentSystem === 'alpha-centauri' ? 3 : 2;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(200, WORLD_SIZE - 200);
      const y = Phaser.Math.Between(200, WORLD_SIZE - 200);
      const p = this.police.create(x, y, 'police');
      p.setScale(0.4).setDepth(5).setTint(0x4488ff);
      p.setData('hp', 3);
      p.setData('patrolTimer', Phaser.Math.Between(1000, 4000));
      p.setData('scanCooldown', 0);
    }
  }

  _bulletHitPolice(bullet, police) {
    bullet.destroy();

    // Shooting police makes you wanted!
    if (!SpaceState.wanted) {
      SpaceState.wanted = true;
      SpaceState.wantedTimer = 90;
      this._domFloat(this.player.x, this.player.y - 30, 'HOSTILE ACTION! WANTED!', '#ff4444', 2000);
    }

    let hp = police.getData('hp') - SpaceState.getBulletDamage();
    police.setData('hp', hp);
    police.setTint(0xff4444);
    this.time.delayedCall(80, () => { if (police.active) police.setTint(0x4488ff); });

    if (hp <= 0) {
      SpaceState.player.credits += 5;
      this._domFloat(police.x, police.y, '+5 cr', '#ddcc44');
      this.tweens.add({
        targets: police, alpha: 0, scale: 0.1, duration: 200,
        onComplete: () => police.destroy(),
      });
    }
  }

  _policeContactPlayer(player, police) {
    if (!SpaceState.wanted || this.isInvincible) return;

    const p = SpaceState.player;
    if (p.shield > 0) {
      p.shield = Math.max(0, p.shield - 20);
      this._domFloat(player.x, player.y, '-20 shield', '#6699ff');
    } else {
      p.hp = Math.max(0, p.hp - 25);
      this._domFloat(player.x, player.y, '-25 hull', '#ff4444');
    }
    SpaceState.skills.shields.totalExp += 8;
    SpaceState.checkSkillUp('shields');

    this.isInvincible = true;
    this.lastHitTime = this.time.now;
    this.tweens.add({
      targets: player, alpha: 0.3, duration: 80, yoyo: true, repeat: 4,
      onComplete: () => { player.setAlpha(1); this.isInvincible = false; },
    });

    if (p.hp <= 0) this._gameOver();
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

    // Traders (green)
    this.traders.children.each(t => {
      if (!t.active) return;
      mm.fillStyle(0x44cc44);
      mm.fillCircle(mmX + t.x * scale, mmY + t.y * scale, 1.5);
    });

    // Police
    this.police.children.each(p => {
      if (!p.active) return;
      mm.fillStyle(SpaceState.wanted ? 0xff4444 : 0x4488ff);
      mm.fillCircle(mmX + p.x * scale, mmY + p.y * scale, 1.5);
    });

    // Player
    mm.fillStyle(SpaceState.wanted ? 0xff4444 : 0x44ff44);
    mm.fillCircle(mmX + this.player.x * scale, mmY + this.player.y * scale, 2);

    // Wanted indicator
    if (SpaceState.wanted) {
      mm.fillStyle(0xff4444);
      mm.fillRect(mmX, mmY - 8, mmW, 6);
      // Can't draw text with graphics, so use the HUD
    }
  }

  _updateHUD() {
    const p = SpaceState.player;
    const maxHp = p.maxHp + SpaceState.getMaxHpBonus();
    const maxSh = p.maxShield + SpaceState.getMaxShieldBonus();
    document.getElementById('hp-fill').style.width = (p.hp / maxHp * 100) + '%';
    document.getElementById('hp-text').textContent = `${Math.floor(p.hp)}/${maxHp}`;
    document.getElementById('shield-fill').style.width = (Math.floor(p.shield) / maxSh * 100) + '%';
    document.getElementById('shield-text').textContent = `${Math.floor(p.shield)}/${maxSh}`;
    document.getElementById('hud-credits').textContent = `Credits: ${p.credits} | Cargo: ${SpaceState.getCargoUsed()}/${SpaceState.getCargoCapacity()}`;

    // Cloak bar (only for smuggler)
    let cloakEl = document.getElementById('hud-cloak');
    const curShipDef = SHIPS[p.ship] || SHIPS['starter'];
    if (curShipDef.cloak) {
      if (!cloakEl) {
        cloakEl = document.createElement('div');
        cloakEl.id = 'hud-cloak';
        cloakEl.innerHTML = `<div class="hud-bar"><span class="hud-bar-label" style="color:#88aaff">CLOAK</span><div class="hud-bar-bg" style="background:rgba(60,60,120,0.3)"><div class="hud-bar-fill" id="cloak-fill" style="background:#4466aa;width:100%"></div><div class="hud-bar-text" id="cloak-text" style="color:#8899cc">100/100</div></div></div>`;
        document.getElementById('hud-top-left').appendChild(cloakEl);
      }
      document.getElementById('cloak-fill').style.width = (SpaceState.cloakEnergy / SpaceState.cloakMax * 100) + '%';
      document.getElementById('cloak-text').textContent = `${Math.floor(SpaceState.cloakEnergy)}/${SpaceState.cloakMax}` + (SpaceState.cloaked ? ' [C] ON' : ' [C]');
    } else if (cloakEl) {
      cloakEl.remove();
    }

    // Quest tracker
    const questEl = document.getElementById('hud-quest');
    if (questEl) {
      let qt = '';
      if (SpaceState.activeStoryQuest) {
        const sq = STORY_QUESTS[SpaceState.storyProgress];
        if (sq) {
          const p = SpaceState.activeStoryQuest.progress || 0;
          const g = sq.goal.count || sq.goal.amount || 1;
          qt += `★ ${sq.name}: ${p}/${g}`;
          questEl.style.color = p >= g ? '#44ff44' : '#ffcc44';
        }
      }
      if (SpaceState.activeContract) {
        const m = MISSIONS.find(mi => mi.id === SpaceState.activeContract.id);
        if (m) {
          const p = SpaceState.activeContract.progress || 0;
          const g = m.goal.count || m.goal.amount || 1;
          if (qt) qt += '  |  ';
          qt += `• ${m.name}: ${p}/${g}`;
        }
      }
      questEl.textContent = qt;
    }

    // Wanted status
    const locEl = document.getElementById('hud-location');
    if (SpaceState.wanted && locEl && !locEl.textContent.includes('WANTED')) {
      locEl.textContent = `⚠ WANTED (${Math.ceil(SpaceState.wantedTimer)}s) — ` + locEl.textContent;
    }
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
