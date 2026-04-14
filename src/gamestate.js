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
  },

  skills: {
    piloting:    { level: 1, totalExp: 0 },
    combat:      { level: 1, totalExp: 0 },
    mining:      { level: 1, totalExp: 0 },
    engineering: { level: 1, totalExp: 0 },
    trading:     { level: 1, totalExp: 0 },
    exploration: { level: 1, totalExp: 0 },
  },

  currentSystem: 'sol',
  currentLocation: 'deep-space',
  spaceReturn: null,
  cargo: {},
  discoveredPlanets: [],

  checkSkillUp(skillName) {
    const skill = this.skills[skillName];
    const newLevel = Math.min(MAX_LEVEL, xpToLevel(skill.totalExp));
    const gained = newLevel - skill.level;
    if (gained > 0) skill.level = newLevel;
    return gained;
  },

  getShipSpeed()    { return 150 + (this.skills.piloting.level - 1) * 2; },
  getBulletDamage() {
    const wep = WEAPONS[this.player.weapon] || WEAPONS['auto-cannon'];
    return wep.damage + this.player.baseDamage - 1 + Math.floor((this.skills.combat.level - 1) * 0.3);
  },
  getFireRate()     { return (WEAPONS[this.player.weapon] || WEAPONS['auto-cannon']).fireRate; },
  getMiningBonus()  { return 1 + Math.floor(this.skills.mining.level / 10); },
  getTradeDiscount(){ return Math.min(0.3, (this.skills.trading.level - 1) * 0.006); },

  // Ship damage state: full, slight, damaged, very-damaged
  getShipDamageKey() {
    const pct = this.player.hp / this.player.maxHp;
    if (pct > 0.75) return 'ship-full';
    if (pct > 0.50) return 'ship-slight';
    if (pct > 0.25) return 'ship-damaged';
    return 'ship-very-damaged';
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
