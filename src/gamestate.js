// ── RS-style XP table ────────────────────────────────────────────────────────
const MAX_LEVEL = 99;
const XP_TABLE = [0];
(function() {
  let cum = 0;
  for (let l = 1; l < MAX_LEVEL; l++) {
    cum += Math.floor(l + 300 * Math.pow(2, l / 7));
    XP_TABLE.push(Math.floor(cum / 4));
  }
})();

function xpToLevel(totalXP) {
  for (let l = MAX_LEVEL - 1; l >= 1; l--) {
    if (totalXP >= XP_TABLE[l]) return l + 1;
  }
  return 1;
}

// ── Weapon definitions ───────────────────────────────────────────────────────
const WEAPONS = {
  'auto-cannon':  { name: 'Auto Cannon',  fireRate: 180, damage: 1, bulletKey: 'bullet-auto',  bulletSpeed: 400, spread: 0, cost: 0     },
  'rockets':      { name: 'Rockets',      fireRate: 500, damage: 3, bulletKey: 'bullet-rocket', bulletSpeed: 300, spread: 0, cost: 200   },
  'zapper':       { name: 'Zapper',       fireRate: 100, damage: 1, bulletKey: 'bullet-zapper', bulletSpeed: 500, spread: 0.1, cost: 350 },
  'big-space-gun':{ name: 'Big Space Gun',fireRate: 800, damage: 5, bulletKey: 'bullet-bsg',    bulletSpeed: 250, spread: 0, cost: 600   },
};

// ── Star system definitions ──────────────────────────────────────────────────
const STAR_SYSTEMS = {
  // ── LAYER 1: Core ────────────────────────────────
  'sol': {
    name: 'Sol System', layer: 1,
    planets: [
      { key: 'planet-terran', x: 500,  y: 500,  name: 'Terra Nova',  scale: 2.0 },
      { key: 'planet-ice',    x: 2400, y: 600,  name: 'Glacius',     scale: 1.8 },
      { key: 'planet-lava',   x: 1500, y: 2400, name: 'Inferno',     scale: 2.2 },
      { key: 'planet-barren', x: 400,  y: 2200, name: 'Dust Rock',   scale: 1.5 },
      { key: 'planet-terran', x: 2600, y: 2000, name: 'New Eden',    scale: 1.6 },
    ],
    station: { x: 1500, y: 1500 },
    enemyCount: 20,
    jumpGates: [
      { x: 2900, y: 1500, target: 'alpha-centauri', name: 'Alpha Centauri Gate' },
    ],
    traders: 3,
  },
  // ── LAYER 2: Settled ──────────────────────────────
  'alpha-centauri': {
    name: 'Alpha Centauri', layer: 2,
    planets: [
      { key: 'planet-ice',    x: 600,  y: 800,  name: 'Frostheim',   scale: 2.5 },
      { key: 'planet-barren', x: 2200, y: 400,  name: 'Ashfall',     scale: 1.8 },
      { key: 'planet-lava',   x: 1800, y: 2200, name: 'Pyroclast',   scale: 2.0 },
      { key: 'planet-terran', x: 500,  y: 2400, name: 'Haven',       scale: 1.7 },
      { key: 'planet-ice',    x: 2600, y: 1800, name: 'Cryo-9',      scale: 1.4 },
      { key: 'planet-barren', x: 1200, y: 1000, name: 'Void Scar',   scale: 1.9 },
    ],
    station: { x: 1400, y: 1400 },
    enemyCount: 30,
    jumpGates: [
      { x: 100, y: 1500, target: 'sol', name: 'Sol Gate' },
      { x: 1500, y: 100, target: 'kepler', name: 'Kepler Gate' },
      { x: 2900, y: 1500, target: 'outerrim', name: 'Outer Rim Gate' },
    ],
    traders: 4,
  },
  'kepler': {
    name: 'Kepler Expanse', layer: 2,
    planets: [
      { key: 'planet-lava',   x: 800,  y: 600,  name: 'Hellion',     scale: 2.8 },
      { key: 'planet-lava',   x: 2000, y: 800,  name: 'Crucible',    scale: 2.0 },
      { key: 'planet-barren', x: 2500, y: 2200, name: 'Graveyard',   scale: 2.2 },
      { key: 'planet-ice',    x: 400,  y: 2000, name: 'Deep Freeze', scale: 1.6 },
      { key: 'planet-terran', x: 1500, y: 1800, name: 'Oasis',       scale: 1.5 },
    ],
    station: { x: 1500, y: 1200 },
    enemyCount: 40,
    jumpGates: [
      { x: 1500, y: 2900, target: 'alpha-centauri', name: 'Alpha Centauri Gate' },
      { x: 100,  y: 1500, target: 'deadzone',       name: 'Dead Zone Gate' },
    ],
    traders: 2,
  },

  // ── LAYER 3: Frontier ────────────────────────────
  'deadzone': {
    name: 'The Dead Zone', layer: 3,
    planets: [
      { key: 'planet-barren', x: 400,  y: 600,  name: 'Wreckage Field', scale: 1.8 },
      { key: 'planet-barren', x: 2200, y: 1800, name: 'Scrap Heap',     scale: 2.0 },
      { key: 'planet-lava',   x: 1800, y: 400,  name: 'Ember',          scale: 1.5 },
    ],
    station: null, // no station — lawless
    enemyCount: 35,
    jumpGates: [
      { x: 2900, y: 1500, target: 'kepler',    name: 'Kepler Gate' },
      { x: 1500, y: 100,  target: 'nebula',    name: 'Nebula Rift Gate' },
    ],
    traders: 1,
  },
  'outerrim': {
    name: 'Outer Rim', layer: 3,
    planets: [
      { key: 'planet-ice',    x: 600,  y: 500,  name: 'Exile',        scale: 2.2 },
      { key: 'planet-barren', x: 2400, y: 800,  name: 'Rustworld',    scale: 1.6 },
      { key: 'planet-lava',   x: 1200, y: 2200, name: 'Slagforge',    scale: 1.9 },
      { key: 'planet-barren', x: 500,  y: 2000, name: 'Desolation',   scale: 1.4 },
    ],
    station: { x: 1500, y: 1400 },
    enemyCount: 40,
    jumpGates: [
      { x: 100,  y: 1500, target: 'alpha-centauri', name: 'Alpha Centauri Gate' },
      { x: 1500, y: 2900, target: 'void',           name: 'Void Gate' },
    ],
    traders: 1,
  },

  // ── LAYER 4: Unknown ─────────────────────────────
  'nebula': {
    name: 'Xenith Nebula', layer: 4,
    planets: [
      { key: 'planet-lava',   x: 800,  y: 800,  name: 'Anomaly Prime',  scale: 2.5 },
      { key: 'planet-ice',    x: 2200, y: 600,  name: 'Frozen Signal',  scale: 2.0 },
      { key: 'planet-terran', x: 1400, y: 2200, name: 'Genesis',        scale: 2.8 },
      { key: 'planet-barren', x: 500,  y: 1800, name: 'The Monolith',   scale: 1.5 },
    ],
    station: null,
    enemyCount: 50,
    jumpGates: [
      { x: 1500, y: 2900, target: 'deadzone', name: 'Dead Zone Gate' },
      { x: 2900, y: 1500, target: 'void',     name: 'Void Breach' },
    ],
    traders: 0,
  },
  'void': {
    name: 'The Void', layer: 4,
    planets: [
      { key: 'planet-lava',   x: 1500, y: 1500, name: 'The Eye',        scale: 3.0 },
      { key: 'planet-ice',    x: 400,  y: 400,  name: 'Whisper',        scale: 1.8 },
      { key: 'planet-barren', x: 2600, y: 400,  name: 'Terminus',       scale: 2.0 },
      { key: 'planet-terran', x: 600,  y: 2400, name: 'Last Garden',    scale: 2.2 },
      { key: 'planet-lava',   x: 2400, y: 2200, name: 'Oblivion',       scale: 2.5 },
    ],
    station: null,
    enemyCount: 60,
    jumpGates: [
      { x: 100,  y: 1500, target: 'nebula',    name: 'Nebula Gate' },
      { x: 1500, y: 100,  target: 'outerrim',  name: 'Outer Rim Gate' },
    ],
    traders: 0,
  },
};

// ── Ship definitions ─────────────────────────────────────────────────────────
const _SP = 'assets/sprites/';
const _VM = _SP + 'Foozle_2DS0011_Void_MainShip/';
const _F1 = _SP + "Foozle_2DS0012_Void_EnemyFleet_1/Kla'ed/Base/PNGs/";
const _F2 = _SP + 'Foozle_2DS0013_Void_EnemyFleet_2/Nairan/Designs - Base/PNGs/';
const _F3 = _SP + 'Foozle_2DS0014_Void_EnemyFleet_3/Nautolan/Designs - Base/PNGs/';

const SHIPS = {
  'starter': {
    name: 'Starter Ship',    spriteKey: 'ship-starter',   size: 48,
    hp: 100, shield: 50, speedBonus: 0, cost: 0, pilotReq: 1,
    cargo: 25, role: 'combat',
    path: _VM + 'Main Ship/Main Ship - Bases/PNGs/Main Ship - Base - Full health.png',
  },
  'starter-explorer': {
    name: 'Scout Pod',       spriteKey: 'ship-starter-explorer', size: 64,
    hp: 60, shield: 30, speedBonus: 25, cost: 0, pilotReq: 1,
    cargo: 20, role: 'exploration',
    path: _F3 + 'Nautolan Ship - Scout - Base.png',
  },
  'starter-miner': {
    name: 'Prospector',      spriteKey: 'ship-starter-miner', size: 64,
    hp: 120, shield: 40, speedBonus: -10, cost: 0, pilotReq: 1,
    cargo: 35, miningBonus: 1, role: 'mining',
    path: _F3 + 'Nautolan Ship - Bomber - Base.png',
  },
  'starter-trader': {
    name: 'Merchant Shuttle', spriteKey: 'ship-starter-trader', size: 64,
    hp: 80, shield: 60, speedBonus: 0, cost: 0, pilotReq: 1,
    cargo: 40, tradeBonus: 0.05, role: 'trading',
    path: _F2 + 'Nairan - Support Ship - Base.png',
  },
  'starter-smuggler': {
    name: 'Shadow Runner',   spriteKey: 'ship-starter-smuggler', size: 64,
    hp: 70, shield: 35, speedBonus: 15, cost: 0, pilotReq: 1,
    cargo: 15, scanRange: 45, role: 'smuggling',
    path: _F2 + 'Nairan - Torpedo Ship - Base.png',
  },
  'nairan-scout': {
    name: 'Nairan Scout',    spriteKey: 'ship-nairan-scout', size: 64,
    hp: 80, shield: 75, speedBonus: 15, cost: 300, pilotReq: 5,
    path: _F2 + 'Nairan - Scout - Base.png',
  },
  'nairan-fighter': {
    name: 'Nairan Fighter',  spriteKey: 'ship-nairan-fighter', size: 64,
    hp: 120, shield: 80, speedBonus: 5, cost: 500, pilotReq: 8,
    path: _F2 + 'Nairan - Fighter - Base.png',
  },
  'nautolan-fighter': {
    name: 'Nautolan Fighter', spriteKey: 'ship-nautolan-fighter', size: 64,
    hp: 140, shield: 100, speedBonus: 0, cost: 800, pilotReq: 12,
    path: _F3 + 'Nautolan Ship - Fighter - Base.png',
  },
  'nairan-frigate': {
    name: 'Nairan Frigate',  spriteKey: 'ship-nairan-frigate', size: 64,
    hp: 180, shield: 120, speedBonus: -5, cost: 1200, pilotReq: 18,
    path: _F2 + 'Nairan - Frigate - Base.png',
  },
  'nautolan-frigate': {
    name: 'Nautolan Frigate', spriteKey: 'ship-nautolan-frigate', size: 64,
    hp: 200, shield: 150, speedBonus: -10, cost: 2000, pilotReq: 25,
    path: _F3 + 'Nautolan Ship - Frigate - Base.png',
  },
  'nairan-battlecruiser': {
    name: 'Battlecruiser',   spriteKey: 'ship-nairan-bc', size: 128,
    hp: 300, shield: 200, speedBonus: -60, cost: 5000, pilotReq: 35,
    path: _F2 + 'Nairan - Battlecruiser - Base.png',
  },
  'nairan-smuggler': {
    name: 'Smuggler',        spriteKey: 'ship-nairan-torpedo', size: 64,
    hp: 90, shield: 60, speedBonus: 20, cost: 1500, pilotReq: 15,
    scanRange: 25, cloak: true, cargo: 20,
    path: _F2 + 'Nairan - Torpedo Ship - Base.png',
  },
  'nautolan-miner': {
    name: 'Mining Barge',    spriteKey: 'ship-nautolan-bomber', size: 64,
    hp: 160, shield: 80, speedBonus: -15, cost: 2000, pilotReq: 10,
    miningBonus: 3, cargo: 40,
    path: _F3 + 'Nautolan Ship - Bomber - Base.png',
  },
  'nairan-hauler': {
    name: 'Trade Hauler',    spriteKey: 'ship-nairan-support', size: 64,
    hp: 140, shield: 100, speedBonus: -10, cost: 3000, pilotReq: 12,
    cargo: 60, tradeBonus: 0.15,
    path: _F2 + 'Nairan - Support Ship - Base.png',
  },
  'nairan-interceptor': {
    name: 'Interceptor',     spriteKey: 'ship-nairan-interceptor', size: 64,
    hp: 60, shield: 40, speedBonus: 40, cost: 4000, pilotReq: 20,
    cargo: 10,
    path: _F2 + 'Nairan - Scout - Base.png',
  },
  'nairan-dreadnought': {
    name: 'Battleship',      spriteKey: 'ship-nairan-dn', size: 128,
    hp: 500, shield: 300, speedBonus: -110, cost: 10000, pilotReq: 45,
    path: _F2 + 'Nairan - Dreadnought - Base.png',
  },
  'nautolan-carrier': {
    name: 'Carrier',         spriteKey: 'ship-nautolan-carrier', size: 128,
    hp: 350, shield: 250, speedBonus: -115, cost: 15000, pilotReq: 50,
    droneMax: 8, droneDeployed: 4, droneRange: 250, cargo: 30,
    path: _F3 + 'Nautolan Ship - Dreadnought - Base.png',
  },
  // ── Endgame capitals ─────────────
  'klaed-dreadnought': {
    name: 'Dreadnought',    spriteKey: 'ship-klaed-dn', size: 128,
    hp: 800, shield: 400, speedBonus: -135, cost: 30000, pilotReq: 60,
    cargo: 30,
    path: _F1 + "Kla'ed - Dreadnought - Base.png",
  },
  'klaed-supercarrier': {
    name: 'Super-Carrier',  spriteKey: 'ship-klaed-bc', size: 128,
    hp: 500, shield: 350, speedBonus: -130, cost: 50000, pilotReq: 70,
    droneMax: 16, droneDeployed: 6, droneRange: 350, cargo: 40,
    path: _F1 + "Kla'ed - Battlecruiser - Base.png",
  },
};

// ── Game State ───────────────────────────────────────────────────────────────
const SpaceState = {
  player: {
    hp: 100,
    maxHp: 100,
    shield: 50,
    maxShield: 50,
    baseDamage: 1,
    credits: 0,
    weapon: 'auto-cannon',
    ship: 'starter',
  },

  skills: {
    // Combat
    combat:        { level: 1, totalExp: 0 },
    gunnery:       { level: 1, totalExp: 0 },
    droneCommand:  { level: 1, totalExp: 0 },
    targeting:     { level: 1, totalExp: 0 },
    // Ship
    piloting:      { level: 1, totalExp: 0 },
    shields:       { level: 1, totalExp: 0 },
    hullIntegrity: { level: 1, totalExp: 0 },
    warpDrive:     { level: 1, totalExp: 0 },
    // Economy
    mining:        { level: 1, totalExp: 0 },
    engineering:   { level: 1, totalExp: 0 },
    trading:       { level: 1, totalExp: 0 },
    crafting:      { level: 1, totalExp: 0 },
    // Exploration
    exploration:   { level: 1, totalExp: 0 },
    scanning:      { level: 1, totalExp: 0 },
    reputation:    { level: 1, totalExp: 0 },
  },

  currentSystem: 'sol',
  currentLocation: 'deep-space',
  spaceReturn: null,
  cargo: {},
  items: {},  // crafted consumables: key → qty
  discoveredPlanets: [],
  activeBuff: null, // { effect, amount, duration, timer }
  activeStoryQuest: null,  // { id, progress }
  activeContract: null,    // { id, progress }
  completedMissions: [],
  storyProgress: 0,
  totalSoldValue: 0,
  killCount: 0,
  wanted: false,
  wantedTimer: 0,
  dronesInBay: 0,     // reserve drones not yet deployed
  cloaked: false,
  cloakEnergy: 100,     // 0-100, drains while cloaked, recharges when not
  cloakMax: 100,

  checkSkillUp(skillName) {
    const skill = this.skills[skillName];
    const newLevel = Math.min(MAX_LEVEL, xpToLevel(skill.totalExp));
    const gained = newLevel - skill.level;
    if (gained > 0) skill.level = newLevel;
    return gained;
  },

  // ── Derived stats from skills ────────────────────────────────────
  getShipSpeed() {
    const shipDef = SHIPS[this.player.ship] || SHIPS['starter'];
    const buffSpeed = (this.activeBuff && this.activeBuff.effect === 'speed') ? this.activeBuff.amount : 0;
    return 150 + (this.skills.piloting.level - 1) * 2 + shipDef.speedBonus + buffSpeed;
  },
  getBulletDamage() {
    const wep = WEAPONS[this.player.weapon] || WEAPONS['auto-cannon'];
    const buffDmg = (this.activeBuff && this.activeBuff.effect === 'damage') ? this.activeBuff.amount : 0;
    return wep.damage + this.player.baseDamage - 1 + Math.floor((this.skills.combat.level - 1) * 0.3) + buffDmg;
  },
  getFireRate() {
    const wep = WEAPONS[this.player.weapon] || WEAPONS['auto-cannon'];
    const gunneryBonus = 1 - Math.min(0.4, (this.skills.gunnery.level - 1) * 0.01); // up to 40% faster
    return Math.floor(wep.fireRate * gunneryBonus);
  },
  getShieldRegen() {
    return 2 + (this.skills.shields.level - 1) * 0.1; // base 2 + 0.1 per level
  },
  getMaxShieldBonus() {
    return (this.skills.shields.level - 1) * 2; // +2 max shield per level
  },
  getMaxHpBonus() {
    return (this.skills.hullIntegrity.level - 1) * 3; // +3 max HP per level
  },
  getDroneDeployLimit() {
    const shipDef = SHIPS[this.player.ship];
    if (!shipDef || !shipDef.droneDeployed) return 0;
    const bonusDrones = Math.floor(this.skills.droneCommand.level / 15);
    return shipDef.droneDeployed + bonusDrones;
  },
  getDroneMax() {
    const shipDef = SHIPS[this.player.ship];
    return (shipDef && shipDef.droneMax) || 0;
  },
  getDroneDamage() {
    return 1 + Math.floor((this.skills.droneCommand.level - 1) * 0.2);
  },
  getMiningBonus() {
    const shipDef = SHIPS[this.player.ship] || SHIPS['starter'];
    const shipBonus = shipDef.miningBonus || 0;
    return 1 + Math.floor(this.skills.mining.level / 10) + shipBonus;
  },
  getCargoCapacity() {
    const shipDef = SHIPS[this.player.ship] || SHIPS['starter'];
    return shipDef.cargo || 25; // default 25
  },
  getCargoUsed() {
    let total = 0;
    for (const k of Object.keys(this.cargo)) total += this.cargo[k];
    return total;
  },
  isCargoFull() {
    return this.getCargoUsed() >= this.getCargoCapacity();
  },
  getSellMultiplier() {
    const tradeBonus = Math.min(0.3, (this.skills.trading.level - 1) * 0.006);
    const repBonus = Math.min(0.2, (this.skills.reputation.level - 1) * 0.004);
    const shipDef = SHIPS[this.player.ship] || SHIPS['starter'];
    const shipBonus = shipDef.tradeBonus || 0;
    return 1 + tradeBonus + repBonus + shipBonus;
  },
  getPlanetDetectRange() {
    return 80 + (this.skills.exploration.level - 1) * 2;
  },
  getMinimapRevealRange() {
    return 200 + (this.skills.scanning.level - 1) * 8; // reveals more of minimap
  },
  getTargetingRange() {
    return 150 + (this.skills.targeting.level - 1) * 3; // gunnery XP from further hits
  },
  getRareResourceChance() {
    return Math.min(0.5, (this.skills.scanning.level - 1) * 0.008); // bonus rare spawn chance
  },

  // Larger ships fire more projectiles per volley
  getFireCount() {
    const shipDef = SHIPS[this.player.ship] || SHIPS['starter'];
    if (shipDef === SHIPS['klaed-dreadnought']) return 5;
    if (shipDef === SHIPS['klaed-supercarrier']) return 3;
    if (shipDef === SHIPS['nairan-dreadnought']) return 4;
    if (shipDef === SHIPS['nautolan-carrier']) return 2;
    if (shipDef === SHIPS['nairan-battlecruiser']) return 3;
    if (shipDef.size === 128) return 3;
    if (shipDef.size === 64) return 2;
    return 1; // starter/small ships fire single shots
  },

  getShipSpriteKey() {
    const shipDef = SHIPS[this.player.ship] || SHIPS['starter'];
    // Only starter ship has damage state sprites
    if (this.player.ship === 'starter') {
      const maxHp = this.player.maxHp + this.getMaxHpBonus();
      const pct = this.player.hp / maxHp;
      if (pct > 0.75) return 'ship-full';
      if (pct > 0.50) return 'ship-slight';
      if (pct > 0.25) return 'ship-damaged';
      return 'ship-very-damaged';
    }
    return shipDef.spriteKey;
  },

  getAcceleration() {
    const shipDef = SHIPS[this.player.ship] || SHIPS['starter'];
    if (shipDef === SHIPS['klaed-dreadnought']) return 60;
    if (shipDef === SHIPS['klaed-supercarrier']) return 80;
    if (shipDef === SHIPS['nairan-dreadnought']) return 100;
    if (shipDef === SHIPS['nautolan-carrier']) return 100;
    if (shipDef === SHIPS['nairan-battlecruiser']) return 150;
    if (shipDef === SHIPS['nairan-interceptor'] || shipDef === SHIPS['starter-explorer']) return 600;
    if (shipDef.size === 128) return 150;
    if (shipDef.size === 64) return 400;
    return 500;
  },

  getTurnRate() {
    const shipDef = SHIPS[this.player.ship] || SHIPS['starter'];
    // Smaller ships turn fast, capitals turn like trucks
    if (shipDef === SHIPS['klaed-dreadnought']) return 0.012;
    if (shipDef === SHIPS['klaed-supercarrier']) return 0.015;
    if (shipDef === SHIPS['nairan-dreadnought']) return 0.02;
    if (shipDef === SHIPS['nautolan-carrier']) return 0.02;
    if (shipDef === SHIPS['nairan-battlecruiser']) return 0.03;
    if (shipDef.size === 128) return 0.05;
    if (shipDef === SHIPS['nairan-interceptor'] || shipDef === SHIPS['starter-explorer']) return 0.18;
    if (shipDef.size === 64) return 0.10;
    return 0.12; // starter default
  },

  getShipScale() {
    const shipDef = SHIPS[this.player.ship] || SHIPS['starter'];
    // Endgame capitals — massive presence
    if (shipDef === SHIPS['klaed-dreadnought']) return 0.9;
    if (shipDef === SHIPS['klaed-supercarrier']) return 0.85;
    // Large ships
    if (shipDef === SHIPS['nairan-dreadnought'] || shipDef === SHIPS['nautolan-carrier']) return 0.7;
    if (shipDef.size === 128) return 0.6;
    // Medium ships
    if (shipDef.size === 64) return 0.55;
    // Starter (48px)
    return 0.5;
  },

  // Buy a new ship — applies its base stats
  buyShip(shipKey) {
    const def = SHIPS[shipKey];
    if (!def) return false;
    if (this.player.credits < def.cost) return false;
    if (this.skills.piloting.level < def.pilotReq) return false;
    this.player.credits -= def.cost;
    this.player.ship = shipKey;
    this.player.maxHp = def.hp;
    this.player.hp = def.hp;
    this.player.maxShield = def.shield;
    this.player.shield = def.shield;
    return true;
  },

  hasContraband() {
    return Object.keys(this.cargo).some(k => CONTRABAND[k]);
  },

  getScanRange() {
    const shipDef = SHIPS[this.player.ship] || SHIPS['starter'];
    return shipDef.scanRange || 80; // default 80px, smuggler is 25px
  },

  addCargo(key, amount) { this.cargo[key] = (this.cargo[key] || 0) + amount; },
  removeCargo(key, amount) {
    if ((this.cargo[key] || 0) < amount) return false;
    this.cargo[key] -= amount;
    if (this.cargo[key] <= 0) delete this.cargo[key];
    return true;
  },

  // Death: keep skills, lose ship (reset to starter)
  resetShip() {
    this.player.ship = 'starter';
    this.player.hp = 100;
    this.player.maxHp = 100;
    this.player.shield = 50;
    this.player.maxShield = 50;
    this.player.baseDamage = 1;
    this.player.weapon = 'auto-cannon';
    this.cargo = {};
    this.items = {};
    this.currentSystem = 'sol';
    this.cloaked = false;
    this.cloakEnergy = 100;
    this.wanted = false;
    this.wantedTimer = 0;

    // Death penalty: reset each skill's XP to the start of its current level
    // You keep your level but lose all progress toward the next one
    for (const key of Object.keys(this.skills)) {
      const skill = this.skills[key];
      if (skill.level > 1) {
        skill.totalExp = XP_TABLE[skill.level - 1]; // floor of current level
      } else {
        skill.totalExp = 0;
      }
    }
    // Keep: credits, discoveredPlanets, completedMissions
  },

  save() {
    try {
      localStorage.setItem('astrova-save', JSON.stringify({
        player: { ...this.player },
        skills: JSON.parse(JSON.stringify(this.skills)),
        currentSystem: this.currentSystem,
        cargo: { ...this.cargo },
        items: { ...this.items },
        discoveredPlanets: [...this.discoveredPlanets],
        storyProgress: this.storyProgress,
        activeStoryQuest: this.activeStoryQuest,
        activeContract: this.activeContract,
        dronesInBay: this.dronesInBay,
        completedMissions: [...this.completedMissions],
      }));
    } catch (e) {}
  },

  load() {
    try {
      const raw = localStorage.getItem('astrova-save');
      if (!raw) return false;
      const data = JSON.parse(raw);
      Object.assign(this.player, data.player);
      this.currentSystem = data.currentSystem || 'sol';
      this.cargo = data.cargo || {};
      this.items = data.items || {};
      this.discoveredPlanets = data.discoveredPlanets || [];
      this.storyProgress = data.storyProgress || 0;
      this.activeStoryQuest = data.activeStoryQuest || data.activeMission || null;
      this.activeContract = data.activeContract || null;
      this.dronesInBay = data.dronesInBay || 0;
      this.completedMissions = data.completedMissions || [];
      if (data.skills) {
        for (const key of Object.keys(data.skills)) {
          if (this.skills[key]) this.skills[key] = data.skills[key];
        }
      }
      return true;
    } catch (e) { return false; }
  },

  clearSave() { localStorage.removeItem('astrova-save'); },
};

// ── Resource definitions ─────────────────────────────────────────────────────
const RESOURCE_DEFS = {
  'plant-fiber':    { name: 'Plant Fiber',    color: '#44cc44', value: 5  },
  'water-sample':   { name: 'Water Sample',   color: '#4488ff', value: 8  },
  'bio-matter':     { name: 'Bio Matter',     color: '#88cc44', value: 10 },
  'ice-crystal':    { name: 'Ice Crystal',    color: '#88ddff', value: 12 },
  'cryo-compound':  { name: 'Cryo Compound',  color: '#44aadd', value: 18 },
  'magma-ore':      { name: 'Magma Ore',      color: '#ff6622', value: 20 },
  'obsidian-shard': { name: 'Obsidian Shard', color: '#aa6688', value: 25 },
  'thermal-core':   { name: 'Thermal Core',   color: '#ff4400', value: 35 },
  'scrap-metal':    { name: 'Scrap Metal',    color: '#aaaaaa', value: 6  },
  'dust-crystal':   { name: 'Dust Crystal',   color: '#ccbb88', value: 15 },
  'ancient-relic':  { name: 'Ancient Relic',  color: '#ddaa44', value: 50 },
  // Craftable trade goods
  'refined-alloy':  { name: 'Refined Alloy',  color: '#bbbbcc', value: 60  },
  'bio-catalyst':   { name: 'Bio Catalyst',   color: '#66dd88', value: 80  },
  'cryo-lens':      { name: 'Cryo Lens',      color: '#88ccff', value: 120 },
  'void-capacitor': { name: 'Void Capacitor', color: '#aa66ff', value: 200 },
};

// ── Crafting recipes ─────────────────────────────────────────────────────────
const CRAFT_RECIPES = [
  // ── Consumables ──────────────────────────────────
  { name: 'Repair Kit',     ingredients: { 'scrap-metal': 3 },                    craftLevel: 1,  xp: 15,
    type: 'consumable', effect: 'heal', amount: 50, desc: 'Restores 50 hull' },
  { name: 'Shield Cell',    ingredients: { 'ice-crystal': 2 },                    craftLevel: 5,  xp: 20,
    type: 'consumable', effect: 'shield', amount: 40, desc: 'Restores 40 shield' },
  { name: 'Fuel Booster',   ingredients: { 'magma-ore': 2, 'bio-matter': 1 },    craftLevel: 10, xp: 30,
    type: 'consumable', effect: 'speed', amount: 50, duration: 30, desc: '+50 speed for 30s' },
  { name: 'Damage Amp',     ingredients: { 'thermal-core': 1, 'obsidian-shard': 2 }, craftLevel: 15, xp: 40,
    type: 'consumable', effect: 'damage', amount: 3, duration: 30, desc: '+3 damage for 30s' },
  { name: 'Scanner Probe',  ingredients: { 'dust-crystal': 2, 'cryo-compound': 1 }, craftLevel: 8, xp: 25,
    type: 'consumable', effect: 'scan', desc: 'Reveals all enemies on minimap for 60s' },
  { name: 'Ancient Drive',  ingredients: { 'ancient-relic': 2, 'thermal-core': 2 }, craftLevel: 25, xp: 60,
    type: 'consumable', effect: 'warp', desc: 'Instant warp to station' },
  // ── Craftable trade goods (craft + sell for profit) ──
  { name: 'Refined Alloy',  ingredients: { 'scrap-metal': 5, 'magma-ore': 2 },   craftLevel: 8,  xp: 25,
    type: 'trade', tradeKey: 'refined-alloy', desc: 'Craftable trade good — sells for 60cr base' },
  { name: 'Bio Catalyst',   ingredients: { 'bio-matter': 3, 'water-sample': 2 }, craftLevel: 12, xp: 35,
    type: 'trade', tradeKey: 'bio-catalyst', desc: 'Craftable trade good — sells for 80cr base' },
  { name: 'Cryo Lens',      ingredients: { 'cryo-compound': 3, 'dust-crystal': 2 }, craftLevel: 18, xp: 45,
    type: 'trade', tradeKey: 'cryo-lens', desc: 'Craftable trade good — sells for 120cr base' },
  { name: 'Void Capacitor', ingredients: { 'thermal-core': 2, 'ancient-relic': 1, 'obsidian-shard': 3 }, craftLevel: 30, xp: 70,
    type: 'trade', tradeKey: 'void-capacitor', desc: 'Craftable trade good — sells for 200cr base' },
  // ── Mining / Exploration tools ────────────────────
  { name: 'Mining Charge',  ingredients: { 'magma-ore': 3, 'dust-crystal': 1 },  craftLevel: 5,  xp: 20,
    type: 'consumable', effect: 'mining-boost', amount: 2, duration: 60, desc: '+2 mining yield for 60s' },
  { name: 'Deep Scanner',   ingredients: { 'cryo-compound': 2, 'ancient-relic': 1 }, craftLevel: 15, xp: 40,
    type: 'consumable', effect: 'deep-scan', desc: 'Reveals all rare resources on current planet' },
];

// ── Discoverable space objects ───────────────────────────────────────────────
const SPACE_OBJECTS = {
  'sol': [
    { type: 'derelict',  x: 800,  y: 1800, name: 'Abandoned Freighter', loot: { 'scrap-metal': 5, 'ancient-relic': 1 } },
    { type: 'asteroids', x: 2200, y: 1200, name: 'Asteroid Field',      loot: { 'magma-ore': 3, 'dust-crystal': 2 } },
  ],
  'alpha-centauri': [
    { type: 'derelict',  x: 1000, y: 2000, name: 'Wrecked Battleship',  loot: { 'scrap-metal': 8, 'ancient-relic': 2 } },
    { type: 'asteroids', x: 2500, y: 1000, name: 'Ice Asteroid Belt',   loot: { 'ice-crystal': 5, 'cryo-compound': 3 } },
    { type: 'derelict',  x: 600,  y: 600,  name: 'Ghost Station',       loot: { 'ancient-relic': 3, 'thermal-core': 2 } },
  ],
  'kepler': [
    { type: 'asteroids', x: 800,  y: 1400, name: 'Magma Asteroids',     loot: { 'magma-ore': 6, 'obsidian-shard': 4 } },
    { type: 'derelict',  x: 2200, y: 600,  name: 'Ancient Vessel',      loot: { 'ancient-relic': 5, 'thermal-core': 3 } },
    { type: 'asteroids', x: 1800, y: 2600, name: 'Crystal Fields',      loot: { 'dust-crystal': 6, 'ice-crystal': 4 } },
  ],
  'deadzone': [
    { type: 'derelict',  x: 1200, y: 1000, name: 'Pirate Wreck',        loot: { 'scrap-metal': 10, 'stolen-tech': 2 } },
    { type: 'derelict',  x: 800,  y: 2000, name: 'Colony Ship Debris',   loot: { 'ancient-relic': 3, 'scrap-metal': 8 } },
    { type: 'asteroids', x: 2200, y: 600,  name: 'Jagged Asteroids',     loot: { 'obsidian-shard': 6, 'magma-ore': 4 } },
  ],
  'outerrim': [
    { type: 'derelict',  x: 1800, y: 1200, name: 'Abandoned Station',    loot: { 'scrap-metal': 12, 'restricted-data': 1 } },
    { type: 'derelict',  x: 600,  y: 1600, name: 'Military Wreck',       loot: { 'black-market-arms': 3, 'stolen-tech': 2 } },
    { type: 'asteroids', x: 2000, y: 2000, name: 'Rich Ore Belt',        loot: { 'magma-ore': 8, 'thermal-core': 4 } },
  ],
  'nebula': [
    { type: 'derelict',  x: 1000, y: 1400, name: 'Alien Hulk',           loot: { 'ancient-relic': 5, 'restricted-data': 3 } },
    { type: 'derelict',  x: 2400, y: 1000, name: 'Research Station X',    loot: { 'stolen-tech': 4, 'cryo-compound': 6 } },
    { type: 'asteroids', x: 600,  y: 600,  name: 'Nebula Crystals',       loot: { 'ice-crystal': 10, 'dust-crystal': 8 } },
    { type: 'derelict',  x: 1800, y: 2600, name: 'Signal Source',         loot: { 'restricted-data': 4, 'ancient-relic': 4 } },
  ],
  'void': [
    { type: 'derelict',  x: 800,  y: 1200, name: 'Void Wraith',          loot: { 'ancient-relic': 8, 'restricted-data': 5 } },
    { type: 'derelict',  x: 2200, y: 1800, name: 'Unknown Structure',     loot: { 'stolen-tech': 6, 'thermal-core': 6 } },
    { type: 'asteroids', x: 1200, y: 2400, name: 'Dark Matter Cluster',   loot: { 'obsidian-shard': 10, 'magma-ore': 8 } },
    { type: 'derelict',  x: 2600, y: 600,  name: 'The Archive',           loot: { 'restricted-data': 8, 'ancient-relic': 6 } },
  ],
};

// ── Station NPCs & dialog ────────────────────────────────────────────────────
const STATION_NPCS = {
  'sol': [
    { name: 'Commander Reyes', role: 'Station Commander',
      dialog: [
        "Welcome to Outpost Alpha, pilot.",
        "We're the last line of defense in the Sol system.",
        "The Kla'ed have been pushing further into our territory.",
        "If you're looking for work, check the mission board.",
      ]},
    { name: 'Dr. Kira Patel', role: 'Scientist',
      dialog: [
        "Fascinating... the readings from the outer planets are anomalous.",
        "If you find any Ancient Relics, bring them to me.",
        "They may hold the key to understanding the Kla'ed incursion.",
      ]},
    { name: 'Jax', role: 'Mechanic',
      dialog: [
        "Need your ship patched up? You've come to the right place.",
        "I've seen every kind of damage the Kla'ed can dish out.",
        "Upgrade your hull plating — trust me, you'll thank me later.",
      ]},
  ],
  'alpha-centauri': [
    { name: 'Admiral Zhao', role: 'Fleet Commander',
      dialog: [
        "Alpha Centauri is contested space. Watch yourself out there.",
        "We've lost contact with several outposts in the Kepler Expanse.",
        "Any intel you can bring back would be invaluable.",
      ]},
    { name: 'Zara Okafor', role: 'Trader',
      dialog: [
        "The markets here pay premium for Thermal Cores.",
        "If you can make it to Kepler and back, there's profit to be made.",
        "Cryo Compounds from the ice worlds sell well in Sol.",
      ]},
  ],
  'outerrim': [
    { name: 'Patch', role: 'Scavenger Boss',
      dialog: [
        "Welcome to the edge of civilization, friend.",
        "Out here, we don't ask where things came from.",
        "Need something? Everything's for sale. Everything.",
      ]},
    { name: 'Specter', role: 'Intel Broker',
      dialog: [
        "The Void... I've been there. Once.",
        "The ships out there aren't like anything we've built.",
        "They don't follow our rules. They don't communicate.",
        "Whatever you do, don't go to The Eye.",
      ]},
  ],
  'kepler': [
    { name: 'Ghost', role: 'Mysterious Figure',
      dialog: [
        "You made it this far? Impressive.",
        "The Kla'ed don't want us here. Something in these ruins...",
        "The Ancient Relics... they're not just artifacts. They're warnings.",
        "Be careful what you uncover, pilot.",
      ]},
    { name: 'Ren Takahashi', role: 'Salvage Expert',
      dialog: [
        "Kepler is a goldmine for salvage — if you survive long enough.",
        "The wrecks out here are ancient. Pre-war, maybe older.",
        "Bring me Obsidian Shards and I'll make it worth your while.",
      ]},
  ],
};

// ── Trade prices per system (multipliers — buy/sell differently per system) ──
const TRADE_PRICES = {
  'sol':             { buy: 1.0,  sell: 1.0,  bonus: ['plant-fiber', 'water-sample', 'bio-matter'] },
  'alpha-centauri':  { buy: 1.1,  sell: 1.2,  bonus: ['ice-crystal', 'cryo-compound', 'thermal-core'] },
  'kepler':          { buy: 1.3,  sell: 1.5,  bonus: ['ancient-relic', 'obsidian-shard', 'magma-ore'] },
  'deadzone':        { buy: 0.8,  sell: 1.8,  bonus: ['scrap-metal', 'fuel-cells', 'medical-supply'] },
  'outerrim':        { buy: 1.2,  sell: 1.6,  bonus: ['magma-ore', 'thermal-core', 'obsidian-shard'] },
  'nebula':          { buy: 1.5,  sell: 2.0,  bonus: ['ancient-relic', 'bio-matter', 'cryo-compound'] },
  'void':            { buy: 2.0,  sell: 2.5,  bonus: ['ancient-relic', 'thermal-core', 'dust-crystal'] },
};

// ── Mission board ────────────────────────────────────────────────────────────
// Story quests — one-time, sequential, drive the narrative
const STORY_QUESTS = [
  { id: 's0', name: 'First Steps',
    desc: 'Land on Terra Nova and gather 3 resources.',
    goal: { type: 'deliver', resource: 'plant-fiber', count: 3 },
    reward: { credits: 100 },
    dialog: {
      start: ["Commander Reyes here.", "We need supplies. Land on Terra Nova and bring back some Plant Fiber.", "Consider it your first assignment, pilot."],
      end: ["Good work. You're not completely useless.", "There's been unusual activity near Alpha Centauri. When you're ready, head through the gate."],
    }},
  { id: 's1', name: 'The Centauri Signal',
    desc: 'Travel to Alpha Centauri and discover 3 planets.',
    goal: { type: 'discover', count: 3 },
    reward: { credits: 300 },
    dialog: {
      start: ["We've detected an anomalous signal from Alpha Centauri.", "Chart at least 3 planets there. We need to know what we're dealing with."],
      end: ["Interesting data. The signal seems to originate from beyond Kepler space.", "Dr. Patel wants to analyze what you've found."],
    }},
  { id: 's2', name: 'Into the Expanse',
    desc: 'Reach Kepler and salvage the Ancient Vessel derelict.',
    goal: { type: 'salvage', target: 'Ancient Vessel' },
    reward: { credits: 500 },
    dialog: {
      start: ["The Ancient Vessel in Kepler may hold answers about the signal.", "It's dangerous out there. Make sure your ship is ready."],
      end: ["These relics... they're not human-made. They're a warning.", "Something is out there, beyond the frontier."],
    }},
  { id: 's3', name: 'The Dead Zone',
    desc: 'Navigate through the Dead Zone. Survive and reach the Nebula gate.',
    goal: { type: 'reach', system: 'nebula' },
    reward: { credits: 800 },
    dialog: {
      start: ["The Dead Zone is pirate territory. No law, no backup.", "But the gate to the Nebula is on the other side.", "Whatever sent that signal... it's in there somewhere."],
      end: ["You made it. But the Nebula... it's not what we expected.", "The ships here — they're not human. They're not Kla'ed either."],
    }},
  { id: 's4', name: 'First Contact',
    desc: 'Discover all 4 planets in the Xenith Nebula.',
    goal: { type: 'discover', count: 4 },
    reward: { credits: 1500 },
    dialog: {
      start: ["These alien vessels... they're ancient. Far older than us.", "Chart every planet in this nebula. We need to understand them."],
      end: ["Genesis... a planet teeming with life. They were here long before us.", "The signal is coming from deeper still. From The Void."],
    }},
  { id: 's5', name: 'Into the Void',
    desc: 'Enter The Void and land on The Eye.',
    goal: { type: 'land', planet: 'The Eye' },
    reward: { credits: 3000 },
    dialog: {
      start: ["This is it. The Void.", "Whatever sent that signal is here. At The Eye.", "Be careful, pilot. No one has returned from this place."],
      end: ["...the signal. It wasn't a warning. It was an invitation.", "They've been waiting. Watching. For millions of years.", "Welcome to the next chapter, pilot. This is just the beginning."],
    }},
];

// Repeatable missions — refresh each time you dock
const MISSIONS = [
  // Sol
  { id: 'r1', name: 'Patrol Duty',       system: 'sol',       repeatable: true,
    desc: 'Destroy 5 hostiles.', goal: { type: 'kill', count: 5 }, reward: { credits: 80 } },
  { id: 'r2', name: 'Resource Run',      system: 'sol',       repeatable: true,
    desc: 'Deliver 5 Plant Fiber.', goal: { type: 'deliver', resource: 'plant-fiber', count: 5 }, reward: { credits: 60 } },
  { id: 'r3', name: 'Trade Route',       system: 'sol',       repeatable: true,
    desc: 'Sell 200cr worth of cargo.', goal: { type: 'sell', amount: 200 }, reward: { credits: 100 } },
  // Alpha Centauri
  { id: 'r4', name: 'Ice Harvest',       system: 'alpha-centauri', repeatable: true,
    desc: 'Deliver 3 Ice Crystals.', goal: { type: 'deliver', resource: 'ice-crystal', count: 3 }, reward: { credits: 120 } },
  { id: 'r5', name: 'Deep Patrol',       system: 'alpha-centauri', repeatable: true,
    desc: 'Eliminate 8 hostiles.', goal: { type: 'kill', count: 8 }, reward: { credits: 150 } },
  // Kepler
  { id: 'r6', name: 'Relic Recovery',    system: 'kepler',    repeatable: true,
    desc: 'Deliver 2 Ancient Relics.', goal: { type: 'deliver', resource: 'ancient-relic', count: 2 }, reward: { credits: 300 } },
  { id: 'r7', name: 'Frontier Sweep',    system: 'kepler',    repeatable: true,
    desc: 'Destroy 12 hostiles.', goal: { type: 'kill', count: 12 }, reward: { credits: 400 } },
  // Outer Rim
  { id: 'r8', name: 'Pirate Bounty',     system: 'outerrim',  repeatable: true,
    desc: 'Destroy 10 pirates.', goal: { type: 'kill', count: 10 }, reward: { credits: 500 } },
  { id: 'r9', name: 'Scrap Collection',  system: 'outerrim',  repeatable: true,
    desc: 'Deliver 8 Scrap Metal.', goal: { type: 'deliver', resource: 'scrap-metal', count: 8 }, reward: { credits: 350 } },
  { id: 'r10', name: 'Thermal Harvest',  system: 'outerrim',  repeatable: true,
    desc: 'Deliver 4 Thermal Cores.', goal: { type: 'deliver', resource: 'thermal-core', count: 4 }, reward: { credits: 600 } },
  // Trade-focused missions
  { id: 'r11', name: 'Supply Run',       system: 'sol',       repeatable: true,
    desc: 'Sell 500cr worth of cargo.', goal: { type: 'sell', amount: 500 }, reward: { credits: 200 } },
  { id: 'r12', name: 'Big Haul',         system: 'alpha-centauri', repeatable: true,
    desc: 'Sell 1000cr worth of cargo.', goal: { type: 'sell', amount: 1000 }, reward: { credits: 400 } },
  { id: 'r13', name: 'Cryo Delivery',    system: 'kepler',    repeatable: true,
    desc: 'Deliver 5 Cryo Compounds.', goal: { type: 'deliver', resource: 'cryo-compound', count: 5 }, reward: { credits: 350 } },
  { id: 'r14', name: 'Frontier Trade',   system: 'outerrim',  repeatable: true,
    desc: 'Sell 2000cr worth of cargo.', goal: { type: 'sell', amount: 2000 }, reward: { credits: 800 } },
  // Mining-focused missions
  { id: 'r15', name: 'Crystal Survey',   system: 'alpha-centauri', repeatable: true,
    desc: 'Deliver 6 Ice Crystals and 3 Dust Crystals.', goal: { type: 'deliver', resource: 'ice-crystal', count: 6 }, reward: { credits: 200 } },
  { id: 'r16', name: 'Obsidian Order',   system: 'kepler',    repeatable: true,
    desc: 'Deliver 4 Obsidian Shards.', goal: { type: 'deliver', resource: 'obsidian-shard', count: 4 }, reward: { credits: 350 } },
];

// ── Planet settlement data ───────────────────────────────────────────────────
const PLANET_SETTLEMENTS = {
  // ── SOL ───────────────────────────────────────────
  'Terra Nova': {
    hasSettlement: true,
    name: 'New Hope Colony',
    npcs: [
      { name: 'Mayor Chen', dialog: [
        "Welcome to New Hope, the first human colony outside Earth.",
        "We're always in need of supplies. Water Samples and Bio Matter especially.",
        "If you find any, the colony will pay well.",
      ]},
      { name: 'Farmer Eli', dialog: [
        "Growing food in alien soil isn't easy, but we manage.",
        "The plant life here is remarkable — so much to study.",
        "Tip: Bio Matter sells great in Alpha Centauri.",
      ]},
    ],
    shop: [
      { resource: 'plant-fiber', price: 3 },
      { resource: 'water-sample', price: 5 },
      { resource: 'bio-matter', price: 8 },
    ],
    services: ['repair'],
  },
  'Dust Rock': {
    hasSettlement: true,
    name: 'Dusty\'s Salvage Yard',
    npcs: [
      { name: 'Dusty Morgan', dialog: [
        "One man's wreck is another man's fortune.",
        "Scrap Metal ain't glamorous, but it keeps the lights on.",
        "I can patch up your hull if you need it. Cheap, too.",
      ]},
    ],
    shop: [
      { resource: 'scrap-metal', price: 4 },
      { resource: 'dust-crystal', price: 10 },
    ],
    services: ['repair'],
  },
  // ── ALPHA CENTAURI ────────────────────────────────
  'Glacius': {
    hasSettlement: true,
    name: 'Cryo Station Omega',
    npcs: [
      { name: 'Dr. Frost', dialog: [
        "The ice here contains compounds we've never seen before.",
        "Cryo Compounds could revolutionize our shield technology.",
        "Be careful on the surface — temperatures drop fast.",
      ]},
      { name: 'Technician Yuri', dialog: [
        "We refine Cryo Compounds into Shield Cells here.",
        "Bring me the raw materials and I'll sell you the good stuff.",
        "Kepler stations pay double for anything cryo-based.",
      ]},
    ],
    shop: [
      { resource: 'ice-crystal', price: 8 },
      { resource: 'cryo-compound', price: 14 },
      { resource: 'water-sample', price: 4 },
    ],
    services: ['repair', 'refuel'],
  },
  'Haven': {
    hasSettlement: true,
    name: 'Free Port Haven',
    npcs: [
      { name: 'Smuggler Quinn', dialog: [
        "You didn't see me here, and I didn't see you.",
        "I deal in... hard to find items. The kind patrols don't like.",
        "Get yourself a Smuggler-class ship — smaller scan signature.",
        "Everything's got a price in Haven.",
      ]},
      { name: 'Fence Marlo', dialog: [
        "Stolen Tech moves fast in the Outer Rim. Huge margins.",
        "Restricted Data? That's endgame money. Void stations pay top credit.",
        "Just don't get scanned by police. They confiscate everything.",
      ]},
    ],
    shop: [
      { resource: 'ancient-relic', price: 35 },
      { resource: 'thermal-core', price: 25 },
      { resource: 'stolen-tech', price: 40, contraband: true },
      { resource: 'black-market-arms', price: 60, contraband: true },
      { resource: 'smuggled-relics', price: 80, contraband: true },
      { resource: 'restricted-data', price: 100, contraband: true },
    ],
  },
  'Frostheim': {
    hasSettlement: true,
    name: 'Frostheim Mining Camp',
    npcs: [
      { name: 'Foreman Kira', dialog: [
        "We run a tight operation here. Ice mining, dawn to dusk.",
        "Higher Mining skill means you pull more per node. Worth leveling.",
        "The deep ice has Cryo Compounds — valuable stuff.",
      ]},
    ],
    shop: [
      { resource: 'ice-crystal', price: 6 },
      { resource: 'cryo-compound', price: 12 },
    ],
    services: ['repair'],
  },
  // ── KEPLER ────────────────────────────────────────
  'Oasis': {
    hasSettlement: true,
    name: 'Oasis Trading Post',
    npcs: [
      { name: 'Merchant Sana', dialog: [
        "Welcome to the only green spot in Kepler. Drink's on me.",
        "We trade in everything out here. Resources, information, favors.",
        "Exotic Matter from the station sells for a killing back in Sol.",
      ]},
      { name: 'Old Voss', dialog: [
        "I've been here since before the Kla'ed showed up.",
        "The Ancient Relics aren't just valuable — they're a map.",
        "Every relic points somewhere deeper. Into the unknown.",
      ]},
    ],
    shop: [
      { resource: 'bio-matter', price: 6 },
      { resource: 'plant-fiber', price: 2 },
      { resource: 'water-sample', price: 4 },
      { resource: 'ancient-relic', price: 40 },
    ],
    services: ['repair', 'refuel'],
  },
  'Hellion': {
    hasSettlement: true,
    name: 'Hellion Smeltery',
    npcs: [
      { name: 'Smelter Kade', dialog: [
        "Hottest forge this side of the core. Magma Ore practically refines itself.",
        "Obsidian Shards make the best weapon components. Crafters love 'em.",
        "Don't stay too long on the surface. The vents are unpredictable.",
      ]},
    ],
    shop: [
      { resource: 'magma-ore', price: 14 },
      { resource: 'obsidian-shard', price: 18 },
      { resource: 'thermal-core', price: 28 },
    ],
    services: ['repair'],
  },
  // ── DEAD ZONE ─────────────────────────────────────
  'Wreckage Field': {
    hasSettlement: true,
    name: 'The Scrapheap',
    npcs: [
      { name: 'Rat', dialog: [
        "No laws out here. No stations either. Just us and the wrecks.",
        "I pull what I can from the debris. Good scrap if you know where to look.",
        "Watch for pirates. They don't take kindly to competition.",
      ]},
      { name: 'Whisper', dialog: [
        "I hear things. Transmissions from beyond the Nebula gate.",
        "Something's out there. Something old.",
        "The pirates are scared of it too. That should tell you something.",
      ]},
    ],
    shop: [
      { resource: 'scrap-metal', price: 3 },
      { resource: 'dust-crystal', price: 8 },
      { resource: 'stolen-tech', price: 35, contraband: true },
    ],
  },
  // ── OUTER RIM ─────────────────────────────────────
  'Exile': {
    hasSettlement: true,
    name: 'Exile Station',
    npcs: [
      { name: 'Warden Lux', dialog: [
        "This used to be a prison colony. Now we're all just... here.",
        "People come to the Rim when they've got nowhere else to go.",
        "We trade fair though. Fairer than the Core, anyway.",
      ]},
      { name: 'Doc Abara', dialog: [
        "Medical supplies are worth their weight in gold out here.",
        "I can patch your hull up, but it won't be pretty.",
        "If you're heading to the Void... bring everything you can carry.",
      ]},
    ],
    shop: [
      { resource: 'ice-crystal', price: 10 },
      { resource: 'scrap-metal', price: 4 },
      { resource: 'black-market-arms', price: 55, contraband: true },
      { resource: 'smuggled-relics', price: 70, contraband: true },
    ],
    services: ['repair', 'refuel'],
  },
  'Slagforge': {
    hasSettlement: true,
    name: 'Slagforge Foundry',
    npcs: [
      { name: 'Ironhand', dialog: [
        "We forge tools, weapons, hull plating. Whatever you need.",
        "Magma Ore and Thermal Cores — that's what keeps this place alive.",
        "Crafting skill 15 or higher? I've got recipes you haven't seen.",
      ]},
    ],
    shop: [
      { resource: 'magma-ore', price: 12 },
      { resource: 'thermal-core', price: 22 },
      { resource: 'obsidian-shard', price: 16 },
    ],
    services: ['repair'],
  },
  // ── NEBULA ────────────────────────────────────────
  'Genesis': {
    hasSettlement: true,
    name: 'Genesis Research Base',
    npcs: [
      { name: 'Dr. Yuki Tanaka', dialog: [
        "This planet... it's alive in ways we don't understand.",
        "The bio-readings are off the charts. Pre-human ecosystems.",
        "Whatever built the relics — they seeded life here. Deliberately.",
      ]},
      { name: 'Pilot Vega', dialog: [
        "I'm stranded here. My ship couldn't handle the Nebula radiation.",
        "If you've got spare Fuel Cells, I'd pay well for them.",
        "The Void gate is close. I've seen ships go in. None come back.",
      ]},
    ],
    shop: [
      { resource: 'bio-matter', price: 5 },
      { resource: 'plant-fiber', price: 2 },
      { resource: 'water-sample', price: 3 },
      { resource: 'ancient-relic', price: 30 },
    ],
    services: ['repair'],
  },
  'Anomaly Prime': {
    hasSettlement: true,
    name: 'Anomaly Outpost',
    npcs: [
      { name: 'The Watcher', dialog: [
        "You feel it too, don't you? The pull.",
        "This planet shouldn't exist. A lava world inside a nebula.",
        "The readings here break every model we have.",
        "I've been studying the thermal signatures. They're... organized.",
      ]},
    ],
    shop: [
      { resource: 'magma-ore', price: 10 },
      { resource: 'thermal-core', price: 18 },
      { resource: 'restricted-data', price: 85, contraband: true },
    ],
  },
  // ── VOID ──────────────────────────────────────────
  'Last Garden': {
    hasSettlement: true,
    name: 'The Last Garden',
    npcs: [
      { name: 'The Gardener', dialog: [
        "You made it. Not many do.",
        "This garden... it was planted by something ancient. A gift, maybe.",
        "Or a test. I can never decide.",
        "Take what you need. The garden always grows back.",
      ]},
      { name: 'Echo', dialog: [
        "I've been here so long I forgot what system I came from.",
        "The Eye watches everything. You'll see.",
        "There's a signal beneath the surface. On every planet here.",
        "Don't try to decode it. Just... listen.",
      ]},
    ],
    shop: [
      { resource: 'bio-matter', price: 3 },
      { resource: 'plant-fiber', price: 1 },
      { resource: 'water-sample', price: 2 },
      { resource: 'ancient-relic', price: 20 },
    ],
    services: ['repair', 'refuel'],
  },
  'Terminus': {
    hasSettlement: true,
    name: 'Terminus Station',
    npcs: [
      { name: 'Commander Null', dialog: [
        "This is the end of charted space. Beyond here, there's nothing.",
        "Or everything. Depends who you ask.",
        "We've catalogued 47 alien signal types from The Eye alone.",
        "None of them match any known language. Including Kla'ed.",
      ]},
    ],
    shop: [
      { resource: 'scrap-metal', price: 2 },
      { resource: 'dust-crystal', price: 6 },
      { resource: 'restricted-data', price: 75, contraband: true },
      { resource: 'ancient-relic', price: 25 },
    ],
    services: ['repair'],
  },
};

// ── Contraband ───────────────────────────────────────────────────────────────
const CONTRABAND = {
  'stolen-tech':       { name: 'Stolen Tech',       color: '#ff4466', value: 80  },
  'black-market-arms': { name: 'Black Market Arms', color: '#ff6644', value: 120 },
  'smuggled-relics':   { name: 'Smuggled Relics',   color: '#ffaa44', value: 150 },
  'restricted-data':   { name: 'Restricted Data',   color: '#cc44ff', value: 200 },
};

// ── Trade goods (buy at stations, sell at other stations) ────────────────────
const TRADE_GOODS = {
  // Core routes (Sol ↔ Alpha Centauri ↔ Kepler)
  'electronics':    { name: 'Electronics',    color: '#44aaff', buyAt: 'sol',            buyPrice: 40,  sellBonus: { 'alpha-centauri': 1.8, 'kepler': 2.2, 'outerrim': 2.5 } },
  'medical-supply': { name: 'Medical Supply', color: '#44ff88', buyAt: 'sol',            buyPrice: 30,  sellBonus: { 'alpha-centauri': 1.5, 'kepler': 2.0, 'outerrim': 2.8, 'deadzone': 3.0 } },
  'luxury-goods':   { name: 'Luxury Goods',   color: '#ffaa44', buyAt: 'alpha-centauri', buyPrice: 60,  sellBonus: { 'sol': 1.6, 'kepler': 1.4, 'outerrim': 2.0 } },
  'exotic-matter':  { name: 'Exotic Matter',  color: '#cc44ff', buyAt: 'kepler',         buyPrice: 100, sellBonus: { 'sol': 2.5, 'alpha-centauri': 2.0, 'nebula': 1.8 } },
  'fuel-cells':     { name: 'Fuel Cells',     color: '#ffcc22', buyAt: 'alpha-centauri', buyPrice: 25,  sellBonus: { 'sol': 1.3, 'kepler': 1.7, 'deadzone': 2.5, 'nebula': 3.0 } },
  // Frontier routes (risk/reward — buy in dangerous space, sell in safe space)
  'salvaged-tech':  { name: 'Salvaged Tech',  color: '#88aacc', buyAt: 'deadzone',       buyPrice: 45,  sellBonus: { 'sol': 2.8, 'alpha-centauri': 2.2, 'kepler': 1.8 } },
  'pirate-bounty':  { name: 'Pirate Bounty',  color: '#cc6644', buyAt: 'outerrim',       buyPrice: 70,  sellBonus: { 'sol': 2.5, 'alpha-centauri': 2.0 } },
  'alien-samples':  { name: 'Alien Samples',  color: '#aa44ff', buyAt: 'nebula',         buyPrice: 120, sellBonus: { 'sol': 3.0, 'alpha-centauri': 2.5, 'kepler': 2.0 } },
  'void-essence':   { name: 'Void Essence',   color: '#6644cc', buyAt: 'void',           buyPrice: 200, sellBonus: { 'sol': 3.5, 'alpha-centauri': 3.0, 'kepler': 2.5 } },
  // Mid-tier specialty goods
  'refined-cryo':   { name: 'Refined Cryo',   color: '#66ddff', buyAt: 'alpha-centauri', buyPrice: 50,  sellBonus: { 'kepler': 2.0, 'outerrim': 1.8, 'nebula': 2.2 } },
  'magma-ingots':   { name: 'Magma Ingots',   color: '#ff8844', buyAt: 'kepler',         buyPrice: 65,  sellBonus: { 'sol': 1.8, 'alpha-centauri': 1.6, 'outerrim': 2.0 } },
};

// ── Rare resources (chance to spawn on planets) ──────────────────────────────
const RARE_RESOURCES = {
  'quantum-crystal':   { name: 'Quantum Crystal',   color: '#ff44ff', value: 100, spawnChance: 0.15 },
  'void-fragment':     { name: 'Void Fragment',      color: '#4444ff', value: 150, spawnChance: 0.10 },
  'stellar-ember':     { name: 'Stellar Ember',      color: '#ffaa00', value: 200, spawnChance: 0.05 },
};

// ── Exploration bounties ─────────────────────────────────────────────────────
const EXPLORATION_BOUNTIES = {
  'sol':            { name: 'Chart Sol System',       reward: 200, required: ['Terra Nova', 'Glacius', 'Inferno', 'Dust Rock', 'New Eden'] },
  'alpha-centauri': { name: 'Chart Alpha Centauri',   reward: 400, required: ['Frostheim', 'Ashfall', 'Pyroclast', 'Haven', 'Cryo-9', 'Void Scar'] },
  'kepler':         { name: 'Chart Kepler Expanse',   reward: 600,  required: ['Hellion', 'Crucible', 'Graveyard', 'Deep Freeze', 'Oasis'] },
  'deadzone':       { name: 'Chart The Dead Zone',   reward: 800,  required: ['Wreckage Field', 'Scrap Heap', 'Ember'] },
  'outerrim':       { name: 'Chart Outer Rim',       reward: 1000, required: ['Exile', 'Rustworld', 'Slagforge', 'Desolation'] },
  'nebula':         { name: 'Chart Xenith Nebula',   reward: 1500, required: ['Anomaly Prime', 'Frozen Signal', 'Genesis', 'The Monolith'] },
  'void':           { name: 'Chart The Void',        reward: 2500, required: ['The Eye', 'Whisper', 'Terminus', 'Last Garden', 'Oblivion'] },
};

// ── Ship upgrade definitions ─────────────────────────────────────────────────
const UPGRADES = [
  { name: 'Reinforced Hull',       stat: 'maxHp',     amount: 25, cost: 100, engLevel: 1  },
  { name: 'Hull Plating II',       stat: 'maxHp',     amount: 50, cost: 300, engLevel: 10 },
  { name: 'Shield Booster',        stat: 'maxShield', amount: 25, cost: 120, engLevel: 1  },
  { name: 'Shield Booster II',     stat: 'maxShield', amount: 50, cost: 350, engLevel: 10 },
  { name: 'Weapon Calibration',    stat: 'baseDamage',amount: 1,  cost: 150, engLevel: 5  },
  { name: 'Weapon Calibration II', stat: 'baseDamage',amount: 1,  cost: 400, engLevel: 15 },
  { name: 'Weapon Calibration III',stat: 'baseDamage',amount: 2,  cost: 800, engLevel: 25 },
];
