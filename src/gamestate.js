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
  'sol': {
    name: 'Sol System',
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
  },
  'alpha-centauri': {
    name: 'Alpha Centauri',
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
    ],
  },
  'kepler': {
    name: 'Kepler Expanse',
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
    ],
  },
};

// ── Ship definitions ─────────────────────────────────────────────────────────
const _SP = 'assets/sprites/';
const _VM = _SP + 'Foozle_2DS0011_Void_MainShip/';
const _F2 = _SP + 'Foozle_2DS0013_Void_EnemyFleet_2/Nairan/Designs - Base/PNGs/';
const _F3 = _SP + 'Foozle_2DS0014_Void_EnemyFleet_3/Nautolan/Designs - Base/PNGs/';

const SHIPS = {
  'starter': {
    name: 'Starter Ship',    spriteKey: 'ship-starter',   size: 48,
    hp: 100, shield: 50, speedBonus: 0, cost: 0, pilotReq: 1,
    path: _VM + 'Main Ship/Main Ship - Bases/PNGs/Main Ship - Base - Full health.png',
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
    hp: 300, shield: 200, speedBonus: -20, cost: 5000, pilotReq: 35,
    path: _F2 + 'Nairan - Battlecruiser - Base.png',
  },
  'nairan-dreadnought': {
    name: 'Battleship',      spriteKey: 'ship-nairan-dn', size: 128,
    hp: 500, shield: 300, speedBonus: -35, cost: 10000, pilotReq: 45,
    path: _F2 + 'Nairan - Dreadnought - Base.png',
  },
  'nautolan-carrier': {
    name: 'Carrier',         spriteKey: 'ship-nautolan-carrier', size: 128,
    hp: 350, shield: 250, speedBonus: -30, cost: 15000, pilotReq: 50,
    drones: 4, droneRange: 250,
    path: _F3 + 'Nautolan Ship - Dreadnought - Base.png',
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
  activeMission: null,  // { id, progress }
  completedMissions: [],
  totalSoldValue: 0,    // tracks sell amount for sell-type missions
  killCount: 0,         // tracks kills for kill-type missions

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
  getDroneCount() {
    const shipDef = SHIPS[this.player.ship];
    if (!shipDef || !shipDef.drones) return 0;
    const baseDrones = shipDef.drones;
    const bonusDrones = Math.floor(this.skills.droneCommand.level / 15); // +1 at 15, 30, 45
    return baseDrones + bonusDrones;
  },
  getDroneDamage() {
    return 1 + Math.floor((this.skills.droneCommand.level - 1) * 0.2);
  },
  getMiningBonus() {
    return 1 + Math.floor(this.skills.mining.level / 10);
  },
  getSellMultiplier() {
    const tradeBonus = Math.min(0.3, (this.skills.trading.level - 1) * 0.006);
    const repBonus = Math.min(0.2, (this.skills.reputation.level - 1) * 0.004);
    return 1 + tradeBonus + repBonus; // up to 1.5x sell price
  },
  getPlanetDetectRange() {
    return 80 + (this.skills.exploration.level - 1) * 2; // base 80, grows with level
  },
  getMinimapRevealRange() {
    return 200 + (this.skills.scanning.level - 1) * 5; // how far minimap shows detail
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

  getShipScale() {
    const shipDef = SHIPS[this.player.ship] || SHIPS['starter'];
    // Battleship/carrier are the biggest
    if (shipDef === SHIPS['nairan-dreadnought'] || shipDef === SHIPS['nautolan-carrier']) return 0.7;
    if (shipDef.size === 128) return 0.6;
    if (shipDef.size === 64) return 0.55;
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
    this.currentSystem = 'sol';
    // Keep: skills, credits, discoveredPlanets
  },

  save() {
    try {
      localStorage.setItem('astrova-save', JSON.stringify({
        player: { ...this.player },
        skills: JSON.parse(JSON.stringify(this.skills)),
        currentSystem: this.currentSystem,
        cargo: { ...this.cargo },
        discoveredPlanets: [...this.discoveredPlanets],
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
      this.discoveredPlanets = data.discoveredPlanets || [];
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
};

// ── Crafting recipes ─────────────────────────────────────────────────────────
const CRAFT_RECIPES = [
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
  'sol':             { buy: 1.0,  sell: 1.0,  bonus: ['plant-fiber', 'water-sample'] },
  'alpha-centauri':  { buy: 1.1,  sell: 1.2,  bonus: ['ice-crystal', 'cryo-compound', 'thermal-core'] },
  'kepler':          { buy: 1.3,  sell: 1.5,  bonus: ['ancient-relic', 'obsidian-shard', 'magma-ore'] },
};

// ── Mission board ────────────────────────────────────────────────────────────
const MISSIONS = [
  { id: 'm1', name: 'Patrol Duty',       system: 'sol',
    desc: 'Destroy 5 hostiles in Sol system.',
    goal: { type: 'kill', count: 5 }, reward: { credits: 80 }, minCombat: 1 },
  { id: 'm2', name: 'Resource Run',      system: 'sol',
    desc: 'Deliver 5 Plant Fiber to the station.',
    goal: { type: 'deliver', resource: 'plant-fiber', count: 5 }, reward: { credits: 60 }, minTrading: 1 },
  { id: 'm3', name: 'Ice Harvest',       system: 'alpha-centauri',
    desc: 'Collect 3 Ice Crystals from Frostheim or Cryo-9.',
    goal: { type: 'deliver', resource: 'ice-crystal', count: 3 }, reward: { credits: 120 }, minMining: 5 },
  { id: 'm4', name: 'Deep Space Patrol',  system: 'alpha-centauri',
    desc: 'Eliminate 8 hostiles in Alpha Centauri.',
    goal: { type: 'kill', count: 8 }, reward: { credits: 150 }, minCombat: 5 },
  { id: 'm5', name: 'Relic Recovery',    system: 'kepler',
    desc: 'Recover 2 Ancient Relics from Kepler planets.',
    goal: { type: 'deliver', resource: 'ancient-relic', count: 2 }, reward: { credits: 300 }, minExploration: 10 },
  { id: 'm6', name: 'Kepler Cleansing',  system: 'kepler',
    desc: 'Destroy 12 hostiles in the Kepler Expanse.',
    goal: { type: 'kill', count: 12 }, reward: { credits: 400 }, minCombat: 10 },
  { id: 'm7', name: 'Trade Route',       system: 'sol',
    desc: 'Sell 200 credits worth of cargo at any station.',
    goal: { type: 'sell', amount: 200 }, reward: { credits: 100 }, minTrading: 3 },
  { id: 'm8', name: 'Thermal Extraction', system: 'kepler',
    desc: 'Deliver 3 Thermal Cores.',
    goal: { type: 'deliver', resource: 'thermal-core', count: 3 }, reward: { credits: 250 }, minMining: 10 },
];

// ── Planet settlement data ───────────────────────────────────────────────────
const PLANET_SETTLEMENTS = {
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
      ]},
    ],
    shop: [
      { resource: 'plant-fiber', price: 3 },
      { resource: 'water-sample', price: 5 },
      { resource: 'bio-matter', price: 8 },
    ],
  },
  'Glacius': {
    hasSettlement: true,
    name: 'Cryo Station Omega',
    npcs: [
      { name: 'Dr. Frost', dialog: [
        "The ice here contains compounds we've never seen before.",
        "Cryo Compounds could revolutionize our shield technology.",
        "Be careful on the surface — temperatures drop fast.",
      ]},
    ],
    shop: [
      { resource: 'ice-crystal', price: 8 },
      { resource: 'cryo-compound', price: 14 },
    ],
  },
  'Haven': {
    hasSettlement: true,
    name: 'Free Port Haven',
    npcs: [
      { name: 'Smuggler Quinn', dialog: [
        "You didn't see me here, and I didn't see you.",
        "I deal in... hard to find items. Relics, cores, the good stuff.",
        "Everything's got a price in Haven.",
      ]},
    ],
    shop: [
      { resource: 'ancient-relic', price: 35 },
      { resource: 'thermal-core', price: 25 },
    ],
  },
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
