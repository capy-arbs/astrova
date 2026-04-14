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

  currentLocation: 'deep-space',
  spaceReturn: null,
  cargo: {},
  discoveredPlanets: [], // planet names already visited

  // Check and apply skill level-ups. Returns levels gained.
  checkSkillUp(skillName) {
    const skill = this.skills[skillName];
    const newLevel = Math.min(MAX_LEVEL, xpToLevel(skill.totalExp));
    const gained = newLevel - skill.level;
    if (gained > 0) skill.level = newLevel;
    return gained;
  },

  // Derived stats from skills
  getShipSpeed()   { return 150 + (this.skills.piloting.level - 1) * 2; },
  getBulletDamage(){ return this.player.baseDamage + Math.floor((this.skills.combat.level - 1) * 0.3); },
  getMiningBonus() { return 1 + Math.floor(this.skills.mining.level / 10); }, // extra resources
  getTradeDiscount() { return Math.min(0.3, (this.skills.trading.level - 1) * 0.006); }, // up to 30% discount

  // Add cargo
  addCargo(key, amount) {
    this.cargo[key] = (this.cargo[key] || 0) + amount;
  },

  // Remove cargo, returns true if enough
  removeCargo(key, amount) {
    if ((this.cargo[key] || 0) < amount) return false;
    this.cargo[key] -= amount;
    if (this.cargo[key] <= 0) delete this.cargo[key];
    return true;
  },

  // Save / Load
  save() {
    try {
      localStorage.setItem('astrova-save', JSON.stringify({
        player: { ...this.player },
        skills: JSON.parse(JSON.stringify(this.skills)),
        currentLocation: this.currentLocation,
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
      this.currentLocation = data.currentLocation || 'deep-space';
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
  { name: 'Reinforced Hull',     stat: 'maxHp',     amount: 25,  cost: 100, engLevel: 1  },
  { name: 'Hull Plating II',     stat: 'maxHp',     amount: 50,  cost: 300, engLevel: 10 },
  { name: 'Shield Booster',      stat: 'maxShield', amount: 25,  cost: 120, engLevel: 1  },
  { name: 'Shield Booster II',   stat: 'maxShield', amount: 50,  cost: 350, engLevel: 10 },
  { name: 'Weapon Calibration',  stat: 'baseDamage',amount: 1,   cost: 150, engLevel: 5  },
  { name: 'Weapon Calibration II',stat:'baseDamage',amount: 1,   cost: 400, engLevel: 15 },
  { name: 'Weapon Calibration III',stat:'baseDamage',amount: 2,  cost: 800, engLevel: 25 },
];
