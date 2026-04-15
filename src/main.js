SpaceState.load();

const isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// Responsive resolution — desktop sees more, mobile stays compact
let gameWidth, gameHeight;
if (isMobile) {
  gameWidth = 480;
  gameHeight = 640;
} else {
  // Use window size but cap and keep a reasonable aspect ratio
  const maxW = Math.min(window.innerWidth - 20, 1200);
  const maxH = Math.min(window.innerHeight - 20, 900);
  // Scale down to pixel-art friendly sizes (divisible by 2)
  gameWidth = Math.floor(maxW / 2) * 2;
  gameHeight = Math.floor(maxH / 2) * 2;
  // Minimum size
  if (gameWidth < 480) gameWidth = 480;
  if (gameHeight < 400) gameHeight = 400;
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  parent: 'game-wrapper',
  pixelArt: true,
  scale: isMobile ? {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  } : {
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [FlightScene, PlanetScene],
};

const game = new Phaser.Game(config);

// Sync HUD overlay to canvas size/position
function syncOverlay() {
  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  canvas.style.position = 'relative';
  canvas.style.zIndex = '1';

  const overlay = document.getElementById('hud-overlay');
  const touch = document.getElementById('touch-controls');
  // Match overlay to canvas dimensions
  overlay.style.width = canvas.style.width || canvas.width + 'px';
  overlay.style.height = canvas.style.height || canvas.height + 'px';
  if (touch) {
    touch.style.width = overlay.style.width;
    touch.style.height = overlay.style.height;
  }
}

// Sync on start and whenever window resizes
requestAnimationFrame(syncOverlay);
window.addEventListener('resize', () => requestAnimationFrame(syncOverlay));
game.scale.on('resize', () => requestAnimationFrame(syncOverlay));

// ── Mobile touch controls ────────────────────────────────────────────────────
const touchState = { ax: 0, ay: 0, fire: false, action: false, inv: false };
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

if (isTouchDevice) {
  document.getElementById('touch-controls').style.display = 'block';

  // Joystick
  const jZone = document.getElementById('joystick-zone');
  const jThumb = document.getElementById('joystick-thumb');
  const jBase = document.getElementById('joystick-base');
  let jActive = false, jTouchId = null;
  const jCenterX = 70, jCenterY = 70; // center of joystick zone
  const jMaxDist = 45;

  jZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    jActive = true;
    jTouchId = t.identifier;
    _updateJoystick(t);
  });

  jZone.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      if (t.identifier === jTouchId) _updateJoystick(t);
    }
  });

  jZone.addEventListener('touchend', (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === jTouchId) {
        jActive = false; jTouchId = null;
        touchState.ax = 0; touchState.ay = 0;
        jThumb.style.left = '48px'; jThumb.style.bottom = '48px';
      }
    }
  });

  function _updateJoystick(touch) {
    const rect = jZone.getBoundingClientRect();
    const dx = (touch.clientX - rect.left) - jCenterX;
    const dy = (touch.clientY - rect.top) - jCenterY;
    const dist = Math.min(jMaxDist, Math.sqrt(dx*dx + dy*dy));
    const angle = Math.atan2(dy, dx);
    const nx = Math.cos(angle) * dist;
    const ny = Math.sin(angle) * dist;

    jThumb.style.left = (jCenterX + nx - 22) + 'px';
    jThumb.style.bottom = (jCenterY - ny - 22) + 'px';

    // Deadzone
    if (dist > 10) {
      touchState.ax = nx / jMaxDist;
      touchState.ay = ny / jMaxDist;
    } else {
      touchState.ax = 0; touchState.ay = 0;
    }
  }

  // Fire button
  const fireBtn = document.getElementById('btn-fire');
  fireBtn.addEventListener('touchstart', (e) => { e.preventDefault(); touchState.fire = true; });
  fireBtn.addEventListener('touchend', (e) => { touchState.fire = false; });

  // Action button (E key equivalent)
  const actBtn = document.getElementById('btn-action');
  actBtn.addEventListener('touchstart', (e) => { e.preventDefault(); touchState.action = true; });
  actBtn.addEventListener('touchend', (e) => { touchState.action = false; });

  // Inventory button
  const invBtn = document.getElementById('btn-inv');
  invBtn.addEventListener('touchstart', (e) => { e.preventDefault(); touchState.inv = true; });
  invBtn.addEventListener('touchend', (e) => { touchState.inv = false; });
}

// ── Cargo / Skills Screen (DOM) ──────────────────────────────────────────────
let _cargoOpen = false;

function showCargoScreen() {
  if (_cargoOpen) { hideCargoScreen(); return; }
  _cargoOpen = true;

  const el = document.createElement('div');
  el.id = 'cargo-screen';
  el.style.cssText = 'position:absolute;inset:0;z-index:300;pointer-events:auto;display:flex;align-items:center;justify-content:center;font-family:Segoe UI,system-ui,sans-serif;';

  const cargo = SpaceState.cargo;
  const cargoKeys = Object.keys(cargo);

  let cargoHtml = '';
  if (cargoKeys.length === 0) {
    cargoHtml = '<div style="color:#666;font-size:13px;">Cargo hold is empty</div>';
  } else {
    cargoHtml = cargoKeys.map(key => {
      const def = RESOURCE_DEFS[key] || { name: key, color: '#fff', value: 0 };
      return `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #222;">
        <span style="color:${def.color}">${def.name}</span>
        <span style="color:#aaa">${cargo[key]} <span style="color:#666;font-size:11px;">(${def.value}cr ea)</span></span>
      </div>`;
    }).join('');
  }

  const totalValue = cargoKeys.reduce((s, k) => s + (cargo[k] * (RESOURCE_DEFS[k]?.value || 0)), 0);

  // Crafted items
  const items = SpaceState.items || {};
  const itemKeys = Object.keys(items).filter(k => items[k] > 0);
  let itemsHtml = '';
  if (itemKeys.length > 0) {
    itemsHtml = '<div style="margin-top:8px;border-top:1px solid #333;padding-top:4px;font-size:11px;color:#666;">ITEMS</div>';
    itemsHtml += itemKeys.map(name => {
      const recipe = CRAFT_RECIPES.find(r => r.name === name);
      return `<div style="display:flex;justify-content:space-between;padding:2px 0;">
        <span style="color:#ddaa66">${name} x${items[name]}</span>
        <button onclick="useItem('${name}')" style="background:#2a2a1a;color:#ddaa66;border:1px solid #886622;border-radius:3px;padding:1px 6px;cursor:pointer;font-size:10px;">Use</button>
      </div>`;
    }).join('');
  }

  const skills = SpaceState.skills;
  const skillList = [
    { name: 'Combat',        key: 'combat',        color: '#ff4444', cat: 'COMBAT' },
    { name: 'Gunnery',       key: 'gunnery',       color: '#ff8844' },
    { name: 'Drone Command', key: 'droneCommand',  color: '#88ccff' },
    { name: 'Targeting',     key: 'targeting',     color: '#ff6688' },
    { name: 'Piloting',      key: 'piloting',      color: '#44ddff', cat: 'SHIP' },
    { name: 'Shields',       key: 'shields',       color: '#4488ff' },
    { name: 'Hull Integrity',key: 'hullIntegrity', color: '#cc8844' },
    { name: 'Warp Drive',    key: 'warpDrive',     color: '#aa66ff' },
    { name: 'Mining',        key: 'mining',        color: '#ccaa44', cat: 'ECONOMY' },
    { name: 'Engineering',   key: 'engineering',   color: '#aaaacc' },
    { name: 'Trading',       key: 'trading',       color: '#44cc88' },
    { name: 'Crafting',      key: 'crafting',      color: '#ddaa66' },
    { name: 'Exploration',   key: 'exploration',   color: '#ddaa44', cat: 'EXPLORE' },
    { name: 'Scanning',      key: 'scanning',      color: '#66ddaa' },
    { name: 'Reputation',    key: 'reputation',    color: '#ffcc44' },
  ];

  const skillHtml = skillList.map(sk => {
    const s = skills[sk.key];
    const cur = s.level > 1 ? XP_TABLE[s.level - 1] : 0;
    const next = s.level < MAX_LEVEL ? XP_TABLE[s.level] : cur;
    const range = next - cur;
    const pct = range > 0 ? ((s.totalExp - cur) / range) * 100 : 100;
    const catHeader = sk.cat ? `<div style="font-size:10px;color:#555;margin-top:6px;border-top:1px solid #222;padding-top:4px;">${sk.cat}</div>` : '';
    return `${catHeader}<div style="margin:2px 0;">
      <div style="display:flex;justify-content:space-between;font-size:11px;">
        <span style="color:${sk.color}">${sk.name}</span><span style="color:#aaa">LV ${s.level}</span>
      </div>
      <div style="width:100%;height:3px;background:#1a1a2a;border-radius:2px;margin-top:1px;">
        <div style="width:${pct}%;height:100%;background:#445;border-radius:2px;"></div>
      </div>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.7);" onclick="hideCargoScreen()"></div>
    <div style="position:relative;background:#12121a;border:1px solid #2a2a3a;border-radius:10px;padding:20px;min-width:400px;max-width:500px;color:#ddd;">
      <h2 style="text-align:center;font-size:16px;color:#aabbcc;margin-bottom:12px;border-bottom:1px solid #2a2a3a;padding-bottom:8px;">SHIP STATUS</h2>
      <div style="display:flex;gap:20px;">
        <div style="flex:1;">
          <div style="font-size:13px;color:#666;margin-bottom:6px;">CARGO HOLD</div>
          ${cargoHtml}
          <div style="margin-top:6px;font-size:12px;color:#666;">Total value: <span style="color:#ddcc44">${totalValue} cr</span></div>
          ${itemsHtml}
        </div>
        <div style="flex:1;">
          <div style="font-size:13px;color:#666;margin-bottom:6px;">SKILLS</div>
          ${skillHtml}
        </div>
      </div>
      <div style="text-align:center;color:#445;font-size:12px;margin-top:12px;">[I] to close &nbsp; Credits: ${SpaceState.player.credits}</div>
      <button onclick="hideCargoScreen()" style="display:block;margin:8px auto 0;background:#1a1a2a;color:#aaa;border:1px solid #555;border-radius:4px;padding:6px 24px;cursor:pointer;font-size:12px;">Close</button>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">
        <button onclick="manualSave()" style="background:#1a2a1a;color:#44cc44;border:1px solid #44cc44;border-radius:4px;padding:4px 12px;cursor:pointer;font-size:11px;">Save Game</button>
        <button onclick="confirmReset()" style="background:#2a1a1a;color:#aa4444;border:1px solid #aa4444;border-radius:4px;padding:4px 12px;cursor:pointer;font-size:11px;">Reset Save</button>
      </div>
    </div>`;

  document.getElementById('hud-overlay').appendChild(el);

  // Close on I or ESC
  const closeHandler = (e) => {
    if (e.key === 'i' || e.key === 'I' || e.key === 'Escape') {
      hideCargoScreen();
      document.removeEventListener('keydown', closeHandler);
    }
  };
  document.addEventListener('keydown', closeHandler);
}

function manualSave() {
  SpaceState.save();
  // Brief flash on the save button
  const el = document.getElementById('cargo-screen');
  if (el) {
    const btn = el.querySelector('button');
    if (btn) { btn.textContent = 'Saved!'; setTimeout(() => { btn.textContent = 'Save Game'; }, 1000); }
  }
}

function confirmReset() {
  // Show confirmation dialog
  const el = document.createElement('div');
  el.id = 'reset-confirm';
  el.style.cssText = 'position:absolute;inset:0;z-index:500;pointer-events:auto;display:flex;align-items:center;justify-content:center;font-family:Segoe UI,system-ui,sans-serif;';
  el.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.8);"></div>
    <div style="position:relative;background:#1a1010;border:2px solid #aa4444;border-radius:10px;padding:24px;text-align:center;color:#ddd;max-width:350px;">
      <div style="font-size:16px;font-weight:700;color:#ff4444;margin-bottom:10px;">Reset All Progress?</div>
      <div style="font-size:12px;color:#999;margin-bottom:16px;">This will delete your save and start a new game. All skills, credits, ships, and quest progress will be lost.</div>
      <div style="display:flex;gap:12px;justify-content:center;">
        <button onclick="doReset()" style="background:#2a1a1a;color:#ff4444;border:1px solid #ff4444;border-radius:4px;padding:6px 20px;cursor:pointer;font-size:13px;font-weight:700;">Yes, Reset</button>
        <button onclick="cancelReset()" style="background:#1a1a2a;color:#aaa;border:1px solid #555;border-radius:4px;padding:6px 20px;cursor:pointer;font-size:13px;">Cancel</button>
      </div>
    </div>`;
  document.getElementById('hud-overlay').appendChild(el);
}

function doReset() {
  SpaceState.clearSave();
  location.reload();
}

function cancelReset() {
  const el = document.getElementById('reset-confirm');
  if (el) el.remove();
}

function hideCargoScreen() {
  _cargoOpen = false;
  const el = document.getElementById('cargo-screen');
  if (el) el.remove();
}

// ── Station Screen (DOM) ─────────────────────────────────────────────────────
let _stationOpen = false;
let _stationTab = 'Trade';

function switchStationTab(tab) {
  _stationTab = tab;
  _renderStation();
}

function showStationScreen() {
  // Clean up stale state
  if (_stationOpen) {
    const existing = document.getElementById('station-screen');
    if (!existing) _stationOpen = false;
    else return;
  }
  _stationOpen = true;

  const el = document.createElement('div');
  el.id = 'station-screen';
  el.style.cssText = 'position:absolute;inset:0;z-index:300;pointer-events:auto;display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px 0;font-family:Segoe UI,system-ui,sans-serif;';

  _renderStation(el);
  document.getElementById('hud-overlay').appendChild(el);

  const closeHandler = (e) => {
    if (e.key === 'Escape') { hideStationScreen(); document.removeEventListener('keydown', closeHandler); }
  };
  document.addEventListener('keydown', closeHandler);
}

function _renderStation(el) {
  if (!el) el = document.getElementById('station-screen');
  if (!el) return;

  const sys = SpaceState.currentSystem;
  const tabs = ['Trade', 'Equip', 'Missions', 'NPCs'];
  const tabBtns = tabs.map(t =>
    `<button onclick="switchStationTab('${t}')" style="flex:1;background:${_stationTab===t?'#2a2a3a':'transparent'};color:${_stationTab===t?'#aabbcc':'#556'};border:1px solid ${_stationTab===t?'#445':'transparent'};border-bottom:none;border-radius:4px 4px 0 0;padding:5px;cursor:pointer;font-size:11px;font-weight:${_stationTab===t?'700':'400'}">${t}</button>`
  ).join('');

  let content = '';
  if (_stationTab === 'Trade') content = _stationTradeTab();
  else if (_stationTab === 'Equip') content = _stationEquipTab();
  else if (_stationTab === 'Missions') content = _stationMissionsTab();
  else if (_stationTab === 'NPCs') content = _stationNPCsTab();

  el.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.7);" onclick="hideStationScreen()"></div>
    <div style="position:relative;background:#12121a;border:1px solid #2a2a3a;border-radius:10px;padding:20px;min-width:420px;max-width:600px;color:#ddd;" onclick="event.stopPropagation()">
      <h2 style="text-align:center;font-size:15px;color:#aabbcc;margin-bottom:8px;">OUTPOST — ${STAR_SYSTEMS[sys].name}</h2>
      <div style="display:flex;gap:2px;margin-bottom:0;">${tabBtns}</div>
      <div style="border:1px solid #2a2a3a;border-radius:0 0 6px 6px;padding:12px;max-height:400px;overflow-y:auto;background:#0e0e14;">
        ${content}
      </div>
      <div style="text-align:center;color:#ddcc44;font-size:13px;margin-top:8px;">Credits: ${SpaceState.player.credits}</div>
      <div style="text-align:center;color:#445;font-size:11px;margin-top:2px;">[ESC] to undock</div>
      <button onclick="hideStationScreen()" style="display:block;margin:8px auto 0;background:#2a1a1a;color:#aa6666;border:1px solid #aa4444;border-radius:4px;padding:6px 24px;cursor:pointer;font-size:12px;">Undock</button>
    </div>`;
}

function _stationTradeTab() {
  const cargo = SpaceState.cargo;
  const cargoKeys = Object.keys(cargo);
  const mult = SpaceState.getSellMultiplier();
  const sys = SpaceState.currentSystem;
  const tradePrices = TRADE_PRICES[sys] || TRADE_PRICES['sol'];

  let sellHtml = '';
  if (cargoKeys.length === 0) {
    sellHtml = '<div style="color:#666;font-size:12px;">Cargo hold empty</div>';
  } else {
    sellHtml = cargoKeys.map(key => {
      const def = RESOURCE_DEFS[key] || CONTRABAND[key];
      const tradeGood = TRADE_GOODS[key];
      const displayDef = def || tradeGood || { name: key, color: '#fff', value: 0 };
      const isContraband = !!CONTRABAND[key];
      const isBonus = tradePrices.bonus.includes(key);
      const isTradeGood = !!tradeGood;
      let price;
      if (tradeGood) {
        const sysM = tradeGood.sellBonus[sys] || 1.0;
        price = Math.floor(tradeGood.buyPrice * sysM * mult);
      } else {
        price = Math.floor((displayDef.value || 0) * mult * tradePrices.sell * (isBonus ? 1.5 : 1));
      }
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1a1a22;">
        <span style="color:${displayDef.color};font-size:12px;">${displayDef.name} x${cargo[key]} ${isContraband ? '<span style="color:#ff4444;font-size:9px;">CONTRABAND</span>' : isTradeGood ? '<span style="color:#4488ff;font-size:9px;">TRADE GOOD</span>' : isBonus ? '<span style="color:#ffcc44;font-size:9px;">HIGH DEMAND</span>' : ''}</span>
        <button onclick="sellCargo('${key}')" style="background:#1a2a1a;color:#44cc44;border:1px solid #44cc44;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px;">${price}cr</button>
      </div>`;
    }).join('');
  }

  const sellAllValue = cargoKeys.reduce((s, k) => {
    const def = RESOURCE_DEFS[k] || CONTRABAND[k] || RARE_RESOURCES[k];
    const tg = TRADE_GOODS[k];
    if (!def && !tg) return s;
    if (tg) {
      const sysM = tg.sellBonus[sys] || 1.0;
      return s + cargo[k] * Math.floor(tg.buyPrice * sysM * mult);
    }
    const isBonus = tradePrices.bonus.includes(k);
    return s + cargo[k] * Math.floor(def.value * mult * tradePrices.sell * (isBonus ? 1.5 : 1));
  }, 0);

  // Crafting section
  const craftHtml = CRAFT_RECIPES.map((r, i) => {
    const hasLevel = SpaceState.skills.crafting.level >= r.craftLevel;
    const hasIng = Object.entries(r.ingredients).every(([k, q]) => (SpaceState.cargo[k]||0) >= q);
    const canCraft = hasLevel && hasIng;
    const ingText = Object.entries(r.ingredients).map(([k, q]) => `${RESOURCE_DEFS[k]?.name||k} ${SpaceState.cargo[k]||0}/${q}`).join(', ');
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1a1a22;">
      <div><div style="font-size:11px;color:${canCraft?'#ddaa66':'#555'}">${r.name}</div><div style="font-size:9px;color:#444">${r.desc}</div></div>
      <button onclick="craftItem(${i})" ${!canCraft?'disabled':''} style="background:${canCraft?'#2a2a1a':'#181818'};color:${canCraft?'#ddaa66':'#444'};border:1px solid ${canCraft?'#886622':'#222'};border-radius:3px;padding:2px 6px;cursor:${canCraft?'pointer':'default'};font-size:10px;">Craft</button>
    </div>`;
  }).join('');

  return `
    <div style="font-size:13px;color:#44cc88;margin-bottom:6px;">SELL CARGO</div>
    ${sellHtml}
    ${sellAllValue > 0 ? `<button onclick="sellAllCargo()" style="margin-top:6px;width:100%;background:#1a2a1a;color:#44cc44;border:1px solid #44cc44;border-radius:4px;padding:4px;cursor:pointer;font-size:11px;">Sell All (${sellAllValue}cr)</button>` : ''}
    <div style="font-size:13px;color:#4488ff;margin-top:10px;margin-bottom:6px;">BUY TRADE GOODS</div>
    ${Object.entries(TRADE_GOODS).filter(([k, g]) => g.buyAt === sys).map(([key, g]) => {
      const canAfford = SpaceState.player.credits >= g.buyPrice;
      const hasRoom = !SpaceState.isCargoFull();
      const disabled = !canAfford || !hasRoom;
      const bestSell = Object.entries(g.sellBonus).sort((a,b) => b[1]-a[1])[0];
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1a1a22;">
        <div><span style="color:${g.color};font-size:12px;">${g.name}</span>
        <div style="font-size:9px;color:#556;">Best sell: ${bestSell[0]} (${bestSell[1]}x)</div></div>
        <button onclick="buyTradeGood('${key}')" ${disabled?'disabled':''} style="background:${disabled?'#181818':'#1a1a2a'};color:${disabled?'#444':'#4488ff'};border:1px solid ${disabled?'#222':'#4488ff'};border-radius:3px;padding:2px 8px;cursor:${disabled?'default':'pointer'};font-size:11px;">${g.buyPrice}cr</button>
      </div>`;
    }).join('') || '<div style="color:#555;font-size:11px;">No trade goods available here</div>'}
    <div style="font-size:10px;color:#445;margin-top:4px;">Cargo: ${SpaceState.getCargoUsed()}/${SpaceState.getCargoCapacity()}</div>
    <div style="font-size:13px;color:#ddaa66;margin-top:10px;margin-bottom:6px;">CRAFTING</div>
    ${craftHtml}`;
}

function _stationEquipTab() {
  // Upgrades
  const engLevel = SpaceState.skills.engineering.level;
  const upgradeHtml = UPGRADES.map((up, i) => {
    const canAfford = SpaceState.player.credits >= up.cost;
    const hasLevel = engLevel >= up.engLevel;
    const disabled = !canAfford || !hasLevel;
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1a1a22;">
      <div><div style="font-size:11px;color:#ccc;">${up.name}</div><div style="font-size:9px;color:#555;">+${up.amount} ${up.stat} ${!hasLevel?'(Eng LV'+up.engLevel+')':''}</div></div>
      <button onclick="buyUpgrade(${i})" ${disabled?'disabled':''} style="background:${disabled?'#181818':'#1a1a2a'};color:${disabled?'#444':'#6699ff'};border:1px solid ${disabled?'#222':'#6699ff'};border-radius:3px;padding:2px 6px;cursor:${disabled?'default':'pointer'};font-size:10px;">${up.cost}cr</button>
    </div>`;
  }).join('');

  // Weapons
  const weaponHtml = Object.entries(WEAPONS).map(([key, w]) => {
    const eq = SpaceState.player.weapon === key;
    const canAfford = SpaceState.player.credits >= w.cost;
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1a1a22;">
      <div><span style="color:${eq?'#44ff44':'#ccc'};font-size:11px;">${w.name}</span> <span style="color:#555;font-size:9px;">DMG:${w.damage} SPD:${Math.round(1000/w.fireRate)}/s</span></div>
      ${eq ? '<span style="color:#44ff44;font-size:10px;">Equipped</span>' :
        w.cost===0 ? `<button onclick="equipWeapon('${key}')" style="background:#1a1a2a;color:#aaa;border:1px solid #555;border-radius:3px;padding:2px 6px;cursor:pointer;font-size:10px;">Equip</button>` :
        `<button onclick="buyWeapon('${key}')" ${!canAfford?'disabled':''} style="background:${canAfford?'#2a1a1a':'#181818'};color:${canAfford?'#ff8844':'#444'};border:1px solid ${canAfford?'#ff8844':'#222'};border-radius:3px;padding:2px 6px;cursor:${canAfford?'pointer':'default'};font-size:10px;">${w.cost}cr</button>`}
    </div>`;
  }).join('');

  // Ships
  const shipHtml = Object.entries(SHIPS).map(([key, s]) => {
    const owned = SpaceState.player.ship === key;
    const canAfford = SpaceState.player.credits >= s.cost;
    const hasLevel = SpaceState.skills.piloting.level >= s.pilotReq;
    const disabled = !canAfford || !hasLevel;
    const spd = s.speedBonus >= 0 ? '+'+s.speedBonus : ''+s.speedBonus;
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1a1a22;">
      <div><span style="color:${owned?'#44ff44':'#ccc'};font-size:11px;">${s.name}</span><div style="font-size:9px;color:#555;">HP:${s.hp} SH:${s.shield} SPD:${spd} ${s.drones?'Drones:'+s.drones:''} ${!hasLevel?'(Pilot LV'+s.pilotReq+')':''}</div></div>
      ${owned ? '<span style="color:#44ff44;font-size:10px;">Current</span>' :
        s.cost===0 ? `<button onclick="switchShip('${key}')" style="background:#1a2a2a;color:#44ddcc;border:1px solid #44ddcc;border-radius:3px;padding:2px 6px;cursor:pointer;font-size:10px;">Select</button>` :
        `<button onclick="buyShip('${key}')" ${disabled?'disabled':''} style="background:${disabled?'#181818':'#1a2a2a'};color:${disabled?'#444':'#44ddcc'};border:1px solid ${disabled?'#222':'#44ddcc'};border-radius:3px;padding:2px 6px;cursor:${disabled?'default':'pointer'};font-size:10px;">${s.cost}cr</button>`}
    </div>`;
  }).join('');

  return `
    ${SpaceState.getDroneMax() > 0 ? `<div style="font-size:13px;color:#88ccff;margin-bottom:6px;">DRONE BAY</div>
    <div style="font-size:11px;color:#aaa;margin-bottom:4px;">Active: ${_getDroneCount()} | Bay: ${SpaceState.dronesInBay} | Max: ${SpaceState.getDroneMax()}</div>
    ${SpaceState.dronesInBay + _getDroneCount() < SpaceState.getDroneMax() ?
      `<button onclick="buyDrones()" ${SpaceState.player.credits < 50 ? 'disabled' : ''} style="width:100%;background:${SpaceState.player.credits >= 50 ? '#1a1a2a' : '#181818'};color:${SpaceState.player.credits >= 50 ? '#88ccff' : '#444'};border:1px solid ${SpaceState.player.credits >= 50 ? '#88ccff' : '#222'};border-radius:4px;padding:3px;cursor:${SpaceState.player.credits >= 50 ? 'pointer' : 'default'};font-size:11px;margin-bottom:8px;">Buy Drone (50cr)</button>` :
      '<div style="font-size:10px;color:#556;margin-bottom:8px;">Bay full</div>'}` : ''}
    <div style="font-size:13px;color:#6699ff;margin-bottom:6px;">UPGRADES</div>${upgradeHtml}
    <div style="font-size:13px;color:#ff8844;margin-top:10px;margin-bottom:6px;">WEAPONS</div>${weaponHtml}
    <div style="font-size:13px;color:#44ddcc;margin-top:10px;margin-bottom:6px;">SHIPYARD</div>${shipHtml}`;
}

function _stationMissionsTab() {
  const sys = SpaceState.currentSystem;
  let html = '';

  // ── Story Quest ────────────────────────────────
  const storyIdx = SpaceState.storyProgress;
  if (storyIdx < STORY_QUESTS.length) {
    const sq = STORY_QUESTS[storyIdx];
    const isStoryActive = !!SpaceState.activeStoryQuest;

    html += `<div style="font-size:13px;color:#ffcc44;margin-bottom:6px;">STORY</div>`;
    if (isStoryActive) {
      const prog = SpaceState.activeStoryQuest.progress || 0;
      const goal = sq.goal.count || 1;
      html += `<div style="background:#1a1a1a;border:1px solid #554422;border-radius:6px;padding:8px;margin-bottom:10px;">
        <div style="font-size:12px;color:#ffcc44;">${sq.name}</div>
        <div style="font-size:10px;color:#aaa;margin-top:3px;">${sq.desc}</div>
        <div style="font-size:10px;color:#888;margin-top:3px;">Progress: ${prog}/${goal}</div>
        <div style="font-size:10px;color:#44cc44;margin-top:2px;">Reward: ${sq.reward.credits}cr</div>
        ${prog >= goal ?
          `<button onclick="completeStoryQuest()" style="margin-top:6px;width:100%;background:#1a2a1a;color:#ffcc44;border:1px solid #ffcc44;border-radius:4px;padding:4px;cursor:pointer;font-size:11px;">Complete Story Quest</button>` : ''}
      </div>`;
    } else if (!SpaceState.activeStoryQuest) {
      html += `<div style="background:#1a1a1a;border:1px solid #333;border-radius:6px;padding:8px;margin-bottom:10px;">
        <div style="font-size:12px;color:#ffcc44;">${sq.name}</div>
        <div style="font-size:10px;color:#aaa;margin-top:3px;">${sq.desc}</div>
        <div style="font-size:10px;color:#44cc44;margin-top:2px;">Reward: ${sq.reward.credits}cr</div>
        <button onclick="acceptStoryQuest()" style="margin-top:6px;width:100%;background:#1a1a2a;color:#ffcc44;border:1px solid #886622;border-radius:4px;padding:4px;cursor:pointer;font-size:11px;">Accept</button>
      </div>`;
    }
  } else {
    html += `<div style="color:#554422;font-size:11px;margin-bottom:10px;text-align:center;">Story complete — for now...</div>`;
  }

  // ── Active Contract ────────────────────────────
  if (SpaceState.activeContract) {
    const mission = MISSIONS.find(m => m.id === SpaceState.activeContract.id);
    if (mission) {
      const prog = SpaceState.activeContract.progress || 0;
      const goal = mission.goal.count || mission.goal.amount;
      html += `<div style="background:#1a1a2a;border:1px solid #445;border-radius:6px;padding:8px;margin-bottom:10px;">
        <div style="font-size:12px;color:#6699ff;">ACTIVE: ${mission.name}</div>
        <div style="font-size:10px;color:#aaa;margin-top:3px;">${mission.desc}</div>
        <div style="font-size:10px;color:#888;margin-top:3px;">Progress: ${prog}/${goal}</div>
        ${prog >= goal ?
          `<button onclick="completeMission()" style="margin-top:6px;width:100%;background:#1a2a1a;color:#44ff44;border:1px solid #44ff44;border-radius:4px;padding:4px;cursor:pointer;font-size:11px;">Complete</button>` :
          `<button onclick="abandonMission()" style="margin-top:6px;width:100%;background:#2a1a1a;color:#aa4444;border:1px solid #aa4444;border-radius:4px;padding:3px;cursor:pointer;font-size:10px;">Abandon</button>`}
      </div>`;
    }
  }

  // ── Repeatable Missions ────────────────────────
  const available = MISSIONS.filter(m => m.system === sys);
  html += `<div style="font-size:13px;color:#6699ff;margin-bottom:6px;margin-top:4px;">CONTRACTS</div>`;
  if (available.length === 0) {
    html += '<div style="color:#555;font-size:11px;">No contracts in this system.</div>';
  } else {
    const canAccept = !SpaceState.activeContract;
    html += available.map(m => `<div style="padding:4px 0;border-bottom:1px solid #1a1a22;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:11px;color:#aabbcc;">${m.name}</span>
        <button onclick="acceptMission('${m.id}')" ${!canAccept?'disabled':''} style="background:${canAccept?'#1a1a2a':'#181818'};color:${canAccept?'#6699ff':'#444'};border:1px solid ${canAccept?'#6699ff':'#222'};border-radius:3px;padding:2px 6px;cursor:${canAccept?'pointer':'default'};font-size:10px;">Accept</button>
      </div>
      <div style="font-size:9px;color:#666;">${m.desc} — ${m.reward.credits}cr</div>
    </div>`).join('');
  }

  return html;
}

function _stationNPCsTab() {
  const npcs = STATION_NPCS[SpaceState.currentSystem] || [];
  if (npcs.length === 0) return '<div style="color:#666;font-size:12px;text-align:center;padding:20px;">No one here to talk to.</div>';

  return npcs.map(npc => `
    <div style="padding:8px 0;border-bottom:1px solid #1a1a22;">
      <div style="font-size:13px;color:#aabbcc;font-weight:600;">${npc.name}</div>
      <div style="font-size:10px;color:#556;margin-bottom:4px;">${npc.role}</div>
      ${npc.dialog.map(line => `<div style="font-size:11px;color:#999;margin:3px 0;padding-left:8px;border-left:2px solid #333;">"${line}"</div>`).join('')}
    </div>
  `).join('');
}

function sellCargo(key) {
  const def = RESOURCE_DEFS[key] || CONTRABAND[key] || RARE_RESOURCES[key];
  const tradeGood = TRADE_GOODS[key];
  if (!def && !tradeGood) return;
  if (!SpaceState.cargo[key]) return;

  const sys = SpaceState.currentSystem;
  const tp = TRADE_PRICES[sys] || TRADE_PRICES['sol'];
  let sellPrice;
  if (tradeGood) {
    // Trade goods use their own sell multiplier per system
    const sysMultiplier = tradeGood.sellBonus[sys] || 1.0;
    sellPrice = Math.floor(tradeGood.buyPrice * sysMultiplier * SpaceState.getSellMultiplier());
  } else {
    const isBonus = tp.bonus.includes(key);
    sellPrice = Math.floor(def.value * SpaceState.getSellMultiplier() * tp.sell * (isBonus ? 1.5 : 1));
  }
  SpaceState.player.credits += sellPrice;
  SpaceState.cargo[key]--;
  if (SpaceState.cargo[key] <= 0) delete SpaceState.cargo[key];

  // Trading + Reputation XP
  SpaceState.skills.trading.totalExp += 5;
  SpaceState.skills.reputation.totalExp += 2;
  SpaceState.checkSkillUp('trading');
  SpaceState.checkSkillUp('reputation');

  // Contract tracking (deliver + sell types)
  if (SpaceState.activeContract) {
    const m = MISSIONS.find(mi => mi.id === SpaceState.activeContract.id);
    if (m && m.goal.type === 'deliver' && m.goal.resource === key) {
      SpaceState.activeContract.progress = (SpaceState.activeContract.progress || 0) + 1;
    }
    if (m && m.goal.type === 'sell') {
      SpaceState.activeContract.progress = (SpaceState.activeContract.progress || 0) + sellPrice;
    }
  }
  // Story quest tracking (deliver type at station)
  if (SpaceState.activeStoryQuest) {
    const sq = STORY_QUESTS[SpaceState.storyProgress];
    if (sq && sq.goal.type === 'deliver' && sq.goal.resource === key) {
      SpaceState.activeStoryQuest.progress = (SpaceState.activeStoryQuest.progress || 0) + 1;
    }
  }

  _renderStation();
}

function sellAllCargo() {
  const keys = Object.keys(SpaceState.cargo);
  let total = 0;
  const mult = SpaceState.getSellMultiplier();
  const sys = SpaceState.currentSystem;
  const tp = TRADE_PRICES[sys] || TRADE_PRICES['sol'];
  keys.forEach(key => {
    const def = RESOURCE_DEFS[key] || CONTRABAND[key] || RARE_RESOURCES[key];
    const tg = TRADE_GOODS[key];
    if (!def && !tg) return;
    if (tg) {
      const sysM = tg.sellBonus[SpaceState.currentSystem] || 1.0;
      total += Math.floor(tg.buyPrice * sysM * mult) * SpaceState.cargo[key];
    } else {
      const isBonus = tp.bonus.includes(key);
      total += Math.floor(def.value * mult * tp.sell * (isBonus ? 1.5 : 1)) * SpaceState.cargo[key];
    }
  });
  SpaceState.player.credits += total;

  // Trading + Reputation XP for bulk sell
  SpaceState.skills.trading.totalExp += keys.length * 8;
  SpaceState.skills.reputation.totalExp += keys.length * 3;
  SpaceState.checkSkillUp('trading');
  SpaceState.checkSkillUp('reputation');

  SpaceState.cargo = {};
  _renderStation();
}

function _getDroneCount() {
  const scene = game.scene.getScenes(true)[0];
  return scene && scene.drones ? scene.drones.length : 0;
}

function buyDrones() {
  if (SpaceState.player.credits < 50) return;
  const total = SpaceState.dronesInBay + _getDroneCount();
  if (total >= SpaceState.getDroneMax()) return;
  SpaceState.player.credits -= 50;
  SpaceState.dronesInBay++;
  _renderStation();
}

function buyUpgrade(idx) {
  const up = UPGRADES[idx];
  if (!up) return;
  if (SpaceState.player.credits < up.cost) return;
  if (SpaceState.skills.engineering.level < up.engLevel) return;

  SpaceState.player.credits -= up.cost;
  SpaceState.player[up.stat] += up.amount;

  // Engineering XP
  SpaceState.skills.engineering.totalExp += 30;
  SpaceState.checkSkillUp('engineering');

  // If maxHp/maxShield increased, also heal
  if (up.stat === 'maxHp') SpaceState.player.hp = SpaceState.player.maxHp;
  if (up.stat === 'maxShield') SpaceState.player.shield = SpaceState.player.maxShield;

  _renderStation();
}

function acceptStoryQuest() {
  const sq = STORY_QUESTS[SpaceState.storyProgress];
  if (!sq) return;
  SpaceState.activeStoryQuest = { id: sq.id, progress: 0 };
  _renderStation();
}

function completeStoryQuest() {
  const sq = STORY_QUESTS[SpaceState.storyProgress];
  if (!sq) return;
  SpaceState.player.credits += sq.reward.credits;
  SpaceState.skills.reputation.totalExp += 30;
  SpaceState.checkSkillUp('reputation');
  SpaceState.storyProgress++;
  SpaceState.activeStoryQuest = null;
  _renderStation();
}

function acceptMission(id) {
  if (SpaceState.activeContract) return;
  const mission = MISSIONS.find(m => m.id === id);
  if (!mission) return;
  SpaceState.activeContract = { id, progress: 0 };
  _renderStation();
}

function completeMission() {
  if (!SpaceState.activeContract) return;
  const mission = MISSIONS.find(m => m.id === SpaceState.activeContract.id);
  if (!mission) return;
  SpaceState.player.credits += mission.reward.credits;
  SpaceState.skills.reputation.totalExp += 20;
  SpaceState.checkSkillUp('reputation');
  SpaceState.completedMissions.push(mission.id);
  SpaceState.activeContract = null;
  _renderStation();
}

function abandonMission() {
  SpaceState.activeContract = null;
  _renderStation();
}

function buyTradeGood(key) {
  const good = TRADE_GOODS[key];
  if (!good || SpaceState.player.credits < good.buyPrice || SpaceState.isCargoFull()) return;
  SpaceState.player.credits -= good.buyPrice;
  SpaceState.addCargo(key, 1);
  SpaceState.skills.trading.totalExp += 5;
  SpaceState.checkSkillUp('trading');
  _renderStation();
}

function craftItem(idx) {
  const recipe = CRAFT_RECIPES[idx];
  if (!recipe) return;
  if (SpaceState.skills.crafting.level < recipe.craftLevel) return;
  // Check ingredients
  for (const [key, qty] of Object.entries(recipe.ingredients)) {
    if ((SpaceState.cargo[key] || 0) < qty) return;
  }
  // Consume ingredients
  for (const [key, qty] of Object.entries(recipe.ingredients)) {
    SpaceState.removeCargo(key, qty);
  }
  // Trade-type recipes produce cargo, consumables go to items
  if (recipe.type === 'trade' && recipe.tradeKey) {
    if (SpaceState.isCargoFull()) return; // need cargo space
    SpaceState.addCargo(recipe.tradeKey, 1);
  } else {
    if (!SpaceState.items) SpaceState.items = {};
    SpaceState.items[recipe.name] = (SpaceState.items[recipe.name] || 0) + 1;
  }
  // Crafting XP
  SpaceState.skills.crafting.totalExp += recipe.xp;
  SpaceState.checkSkillUp('crafting');
  // Trading XP for crafted trade goods
  if (recipe.type === 'trade') {
    SpaceState.skills.trading.totalExp += 8;
    SpaceState.checkSkillUp('trading');
  }
  _renderStation();
}

function useItem(name) {
  if (!SpaceState.items[name] || SpaceState.items[name] <= 0) return;
  const recipe = CRAFT_RECIPES.find(r => r.name === name);
  if (!recipe) return;

  SpaceState.items[name]--;
  if (SpaceState.items[name] <= 0) delete SpaceState.items[name];

  const p = SpaceState.player;
  if (recipe.effect === 'heal') {
    p.hp = Math.min(p.maxHp + SpaceState.getMaxHpBonus(), p.hp + recipe.amount);
  } else if (recipe.effect === 'shield') {
    p.shield = Math.min(p.maxShield + SpaceState.getMaxShieldBonus(), p.shield + recipe.amount);
  } else if (recipe.effect === 'speed' || recipe.effect === 'damage' || recipe.effect === 'mining-boost') {
    SpaceState.activeBuff = { effect: recipe.effect, amount: recipe.amount, duration: recipe.duration, timer: recipe.duration };
  } else if (recipe.effect === 'deep-scan') {
    // Reveal all rare resources on current planet (handled by PlanetScene)
    SpaceState._deepScanPending = true;
  }
  // Re-render whichever screen is open
  if (_cargoOpen) { hideCargoScreen(); showCargoScreen(); }
}

function _repairBtn(type, current, max, color) {
  const missing = max - current;
  if (missing <= 0) return `<div style="flex:1;text-align:center;font-size:11px;color:#555;padding:6px;background:#111;border-radius:4px;">${type === 'hull' ? 'Hull' : 'Shields'}: Full</div>`;
  const costPer = type === 'hull' ? 2 : 1; // hull costs more to repair
  const cost = Math.ceil(missing * costPer);
  const canAfford = SpaceState.player.credits >= cost;
  return `<div style="flex:1;">
    <div style="font-size:11px;color:${color};margin-bottom:3px;">${type === 'hull' ? 'Hull' : 'Shields'}: ${current}/${max}</div>
    <button onclick="repair('${type}')" ${!canAfford ? 'disabled' : ''} style="width:100%;background:${canAfford ? '#1a2a1a' : '#222'};color:${canAfford ? color : '#555'};border:1px solid ${canAfford ? color : '#333'};border-radius:4px;padding:4px;cursor:${canAfford ? 'pointer' : 'default'};font-size:11px;">Repair Full (${cost}cr)</button>
  </div>`;
}

function repair(type) {
  const p = SpaceState.player;
  if (type === 'hull') {
    const max = p.maxHp + SpaceState.getMaxHpBonus();
    const missing = max - p.hp;
    if (missing <= 0) return;
    const cost = Math.ceil(missing * 2);
    if (p.credits < cost) return;
    p.credits -= cost;
    p.hp = max;
    // Hull Integrity XP from repairing
    SpaceState.skills.hullIntegrity.totalExp += Math.floor(missing * 0.5);
    SpaceState.checkSkillUp('hullIntegrity');
  } else {
    const max = p.maxShield + SpaceState.getMaxShieldBonus();
    const missing = max - p.shield;
    if (missing <= 0) return;
    const cost = Math.ceil(missing * 1);
    if (p.credits < cost) return;
    p.credits -= cost;
    p.shield = max;
    // Shields XP from repairing
    SpaceState.skills.shields.totalExp += Math.floor(missing * 0.3);
    SpaceState.checkSkillUp('shields');
  }
  _renderStation();
}


function buyShip(key) {
  if (SpaceState.buyShip(key)) {
    // Close station and restart scene with new ship
    _stationOpen = false;
    const el = document.getElementById('station-screen');
    if (el) el.remove();
    const scene = game.scene.getScenes(true)[0];
    if (scene && scene.scene.key === 'FlightScene') {
      SpaceState.spaceReturn = { x: scene.player.x, y: scene.player.y };
      scene.scene.restart();
    }
  }
}

function switchShip(key) {
  const def = SHIPS[key];
  if (!def) return;
  SpaceState.player.ship = key;
  SpaceState.player.maxHp = def.hp;
  SpaceState.player.hp = def.hp;
  SpaceState.player.maxShield = def.shield;
  SpaceState.player.shield = def.shield;
  // Close station and restart scene with new ship
  _stationOpen = false;
  const el = document.getElementById('station-screen');
  if (el) el.remove();
  const scene = game.scene.getScenes(true)[0];
  if (scene && scene.scene.key === 'FlightScene') {
    SpaceState.spaceReturn = { x: scene.player.x, y: scene.player.y };
    scene.scene.restart();
  }
}

function buyWeapon(key) {
  const w = WEAPONS[key];
  if (!w || SpaceState.player.credits < w.cost) return;
  SpaceState.player.credits -= w.cost;
  SpaceState.player.weapon = key;
  _renderStation();
}

function equipWeapon(key) {
  SpaceState.player.weapon = key;
  _renderStation();
}

function hideStationScreen() {
  _stationOpen = false;
  const el = document.getElementById('station-screen');
  if (el) el.remove();
}

// ── Game Over Screen (DOM) ───────────────────────────────────────────────────
function showGameOverScreen(onRestart) {
  const el = document.createElement('div');
  el.id = 'gameover-screen';
  el.style.cssText = 'position:absolute;inset:0;z-index:400;pointer-events:auto;display:flex;align-items:center;justify-content:center;font-family:Segoe UI,system-ui,sans-serif;';
  el.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.8);"></div>
    <div style="position:relative;text-align:center;color:#ddd;">
      <div style="font-size:36px;font-weight:700;color:#cc2222;margin-bottom:8px;">SHIP DESTROYED</div>
      <div style="font-size:14px;color:#aa6666;margin-bottom:4px;">Your cargo and ship upgrades have been lost.</div>
      <div style="font-size:13px;color:#888;margin-bottom:20px;">Skills and credits preserved.</div>
      <div style="font-size:16px;color:#aaa;">Press R to respawn</div>
    </div>`;
  document.getElementById('hud-overlay').appendChild(el);

  const handler = (e) => {
    if (e.key === 'r' || e.key === 'R') {
      el.remove();
      document.removeEventListener('keydown', handler);
      if (onRestart) onRestart();
    }
  };
  document.addEventListener('keydown', handler);
}

// ── Trader Screen (DOM) — hail traders in space ─────────────────────────────
function showTraderScreen(trader) {
  const goods = trader.getData('goods');
  const el = document.createElement('div');
  el.id = 'trader-screen';
  el.style.cssText = 'position:absolute;inset:0;z-index:300;pointer-events:auto;display:flex;align-items:center;justify-content:center;font-family:Segoe UI,system-ui,sans-serif;';

  const cargoLeft = SpaceState.getCargoCapacity() - SpaceState.getCargoUsed();

  const goodsHtml = goods.map((g, i) => {
    if (g.qty <= 0) return `<div style="color:#555;font-size:11px;padding:3px 0;">Sold out</div>`;
    const canAfford = SpaceState.player.credits >= g.price;
    const hasRoom = cargoLeft > 0;
    const disabled = !canAfford || !hasRoom;
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1a1a22;">
      <span style="color:${g.color};font-size:12px;">${g.name} (x${g.qty})</span>
      <button onclick="buyFromTrader(${i})" ${disabled?'disabled':''} style="background:${disabled?'#181818':'#1a2a1a'};color:${disabled?'#444':'#44cc44'};border:1px solid ${disabled?'#222':'#44cc44'};border-radius:3px;padding:2px 8px;cursor:${disabled?'default':'pointer'};font-size:11px;">${g.price}cr</button>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);" onclick="hideTraderScreen()"></div>
    <div style="position:relative;background:#12121a;border:1px solid #2a3a2a;border-radius:10px;padding:20px;min-width:300px;color:#ddd;" onclick="event.stopPropagation()">
      <h2 style="text-align:center;font-size:14px;color:#44cc44;margin-bottom:10px;">Trader Ship</h2>
      <div style="font-size:11px;color:#888;margin-bottom:8px;text-align:center;">"Looking to buy? I've got good prices."</div>
      <div style="font-size:11px;color:#556;margin-bottom:6px;">Cargo: ${SpaceState.getCargoUsed()}/${SpaceState.getCargoCapacity()}</div>
      ${goodsHtml}
      <div style="text-align:center;color:#ddcc44;font-size:12px;margin-top:10px;">Credits: ${SpaceState.player.credits}</div>
      <div style="text-align:center;color:#445;font-size:10px;margin-top:4px;">[ESC] or click outside</div>
      <button onclick="hideTraderScreen()" style="display:block;margin:8px auto 0;background:#1a2a1a;color:#aaa;border:1px solid #555;border-radius:4px;padding:6px 24px;cursor:pointer;font-size:12px;">Leave</button>
    </div>`;

  // Store trader ref for buying
  window._activeTrader = trader;
  document.getElementById('hud-overlay').appendChild(el);
  const handler = (e) => { if (e.key === 'Escape') { hideTraderScreen(); document.removeEventListener('keydown', handler); } };
  document.addEventListener('keydown', handler);
}

function buyFromTrader(idx) {
  const trader = window._activeTrader;
  if (!trader) return;
  const goods = trader.getData('goods');
  const g = goods[idx];
  if (!g || g.qty <= 0 || SpaceState.player.credits < g.price || SpaceState.isCargoFull()) return;
  SpaceState.player.credits -= g.price;
  SpaceState.addCargo(g.key, 1);
  g.qty--;
  SpaceState.skills.trading.totalExp += 3;
  SpaceState.checkSkillUp('trading');
  hideTraderScreen();
  showTraderScreen(trader);
}

function hideTraderScreen() {
  const el = document.getElementById('trader-screen');
  if (el) el.remove();
  window._activeTrader = null;
}

// ── Settlement Screen (DOM) ──────────────────────────────────────────────────
let _settlementOpen = false;

function showSettlementScreen(settlement, planetName) {
  if (_settlementOpen) return;
  _settlementOpen = true;

  const el = document.createElement('div');
  el.id = 'settlement-screen';
  el.style.cssText = 'position:absolute;inset:0;z-index:300;pointer-events:auto;display:flex;align-items:center;justify-content:center;font-family:Segoe UI,system-ui,sans-serif;';

  const npcHtml = settlement.npcs.map(npc => `
    <div style="padding:6px 0;border-bottom:1px solid #1a1a22;">
      <div style="font-size:13px;color:#aabbcc;font-weight:600;">${npc.name}</div>
      ${npc.dialog.map(line => `<div style="font-size:11px;color:#999;margin:2px 0;padding-left:8px;border-left:2px solid #333;">"${line}"</div>`).join('')}
    </div>
  `).join('');

  const shopHtml = (settlement.shop || []).map(si => {
    const def = RESOURCE_DEFS[si.resource] || CONTRABAND[si.resource];
    if (!def) return '';
    const isContraband = !!CONTRABAND[si.resource];
    const canAfford = SpaceState.player.credits >= si.price;
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1a1a22;">
      <span style="color:${def.color};font-size:12px;">${def.name} ${isContraband ? '<span style="color:#ff4444;font-size:9px;">ILLEGAL</span>' : ''}</span>
      <button onclick="buySettlementItem('${si.resource}',${si.price})" ${!canAfford?'disabled':''} style="background:${canAfford?(isContraband?'#2a1a1a':'#1a2a1a'):'#181818'};color:${canAfford?(isContraband?'#ff6644':'#44cc44'):'#444'};border:1px solid ${canAfford?(isContraband?'#ff4444':'#44cc44'):'#222'};border-radius:3px;padding:2px 8px;cursor:${canAfford?'pointer':'default'};font-size:11px;">${si.price}cr</button>
    </div>`;
  }).join('');

  // Services section (repair, refuel)
  let servicesHtml = '';
  if (settlement.services && settlement.services.length > 0) {
    const p = SpaceState.player;
    const maxHp = p.maxHp + SpaceState.getMaxHpBonus();
    const maxSh = p.maxShield + SpaceState.getMaxShieldBonus();
    const svcBtns = [];
    if (settlement.services.includes('repair') && p.hp < maxHp) {
      const cost = Math.ceil((maxHp - p.hp) * 1.5); // cheaper than station
      const canAfford = p.credits >= cost;
      svcBtns.push(`<button onclick="settlementRepair()" ${!canAfford?'disabled':''} style="background:${canAfford?'#1a2a1a':'#181818'};color:${canAfford?'#44cc44':'#444'};border:1px solid ${canAfford?'#44cc44':'#222'};border-radius:3px;padding:4px 10px;cursor:${canAfford?'pointer':'default'};font-size:11px;">Repair Hull (${cost}cr)</button>`);
    }
    if (settlement.services.includes('refuel') && p.shield < maxSh) {
      const cost = Math.ceil((maxSh - p.shield) * 1);
      const canAfford = p.credits >= cost;
      svcBtns.push(`<button onclick="settlementRefuel()" ${!canAfford?'disabled':''} style="background:${canAfford?'#1a1a2a':'#181818'};color:${canAfford?'#4488ff':'#444'};border:1px solid ${canAfford?'#4488ff':'#222'};border-radius:3px;padding:4px 10px;cursor:${canAfford?'pointer':'default'};font-size:11px;">Recharge Shields (${cost}cr)</button>`);
    }
    if (svcBtns.length > 0) {
      servicesHtml = `<div style="font-size:13px;color:#88aacc;margin-top:10px;margin-bottom:6px;">SERVICES</div><div style="display:flex;gap:8px;flex-wrap:wrap;">${svcBtns.join('')}</div>`;
    }
  }

  el.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.7);" onclick="hideSettlementScreen()"></div>
    <div style="position:relative;background:#12121a;border:1px solid #2a2a3a;border-radius:10px;padding:20px;min-width:350px;max-width:500px;max-height:80vh;overflow-y:auto;color:#ddd;" onclick="event.stopPropagation()">
      <h2 style="text-align:center;font-size:15px;color:#aabbcc;margin-bottom:10px;border-bottom:1px solid #2a2a3a;padding-bottom:6px;">${settlement.name}</h2>
      <div style="font-size:10px;color:#556;margin-bottom:8px;text-align:center;">${planetName}</div>
      <div style="font-size:13px;color:#aabbcc;margin-bottom:6px;">PEOPLE</div>
      ${npcHtml}
      ${shopHtml ? `<div style="font-size:13px;color:#44cc88;margin-top:10px;margin-bottom:6px;">BUY RESOURCES</div>${shopHtml}` : ''}
      ${servicesHtml}
      <div style="text-align:center;color:#ddcc44;font-size:12px;margin-top:10px;">Credits: ${SpaceState.player.credits} | Cargo: ${SpaceState.getCargoUsed()}/${SpaceState.getCargoCapacity()}</div>
      <div style="text-align:center;color:#445;font-size:11px;margin-top:4px;">[ESC] or click outside to leave</div>
      <button onclick="hideSettlementScreen()" style="display:block;margin:8px auto 0;background:#1a1a2a;color:#aaa;border:1px solid #555;border-radius:4px;padding:6px 24px;cursor:pointer;font-size:12px;">Leave</button>
    </div>`;

  document.getElementById('hud-overlay').appendChild(el);
  const handler = (e) => { if (e.key === 'Escape') { hideSettlementScreen(); document.removeEventListener('keydown', handler); } };
  document.addEventListener('keydown', handler);
}

function buySettlementItem(resource, price) {
  if (SpaceState.player.credits < price) return;
  SpaceState.player.credits -= price;
  SpaceState.addCargo(resource, 1);
  // Re-render
  hideSettlementScreen();
  const settlement = PLANET_SETTLEMENTS[Object.keys(PLANET_SETTLEMENTS).find(k => {
    const s = PLANET_SETTLEMENTS[k];
    return s.shop && s.shop.some(si => si.resource === resource && si.price === price);
  })];
  if (settlement) showSettlementScreen(settlement, '');
}

function settlementRepair() {
  const p = SpaceState.player;
  const maxHp = p.maxHp + SpaceState.getMaxHpBonus();
  const missing = maxHp - p.hp;
  if (missing <= 0) return;
  const cost = Math.ceil(missing * 1.5);
  if (p.credits < cost) return;
  p.credits -= cost;
  p.hp = maxHp;
  // Re-render settlement
  hideSettlementScreen();
  const key = Object.keys(PLANET_SETTLEMENTS).find(k => PLANET_SETTLEMENTS[k].services && PLANET_SETTLEMENTS[k].services.includes('repair'));
  // Just re-find the current settlement and reopen
  _reopenSettlement();
}

function settlementRefuel() {
  const p = SpaceState.player;
  const maxSh = p.maxShield + SpaceState.getMaxShieldBonus();
  const missing = maxSh - p.shield;
  if (missing <= 0) return;
  const cost = Math.ceil(missing * 1);
  if (p.credits < cost) return;
  p.credits -= cost;
  p.shield = maxSh;
  hideSettlementScreen();
  _reopenSettlement();
}

function _reopenSettlement() {
  // Find and reopen the last settlement (bit hacky but works)
  const scene = game.scene.getScenes(true)[0];
  if (scene && scene.settlement) {
    showSettlementScreen(scene.settlement, scene.planetInfo ? scene.planetInfo.name : '');
  }
}

function hideSettlementScreen() {
  _settlementOpen = false;
  const el = document.getElementById('settlement-screen');
  if (el) el.remove();
}

// ── World prompt helpers (DOM) ───────────────────────────────────────────────
const _prompts = {};

function showWorldPrompt(id, gameX, gameY, text) {
  let el = _prompts[id];
  if (!el) {
    el = document.createElement('div');
    el.style.cssText = 'position:absolute;font-size:13px;font-weight:600;color:#fff;background:rgba(0,0,0,0.6);padding:2px 8px;border-radius:4px;white-space:nowrap;transform:translate(-50%,-100%);text-shadow:1px 1px 1px #000;pointer-events:none;z-index:200;';
    document.getElementById('float-container').appendChild(el);
    _prompts[id] = el;
  }
  el.textContent = text;
  const canvas = document.querySelector('canvas');
  const scene = game.scene.getScenes(true)[0];
  const cam = scene ? scene.cameras.main : null;
  const sx = cam ? cam.scrollX : 0;
  const sy = cam ? cam.scrollY : 0;
  const scaleX = canvas.clientWidth / game.config.width;
  const scaleY = canvas.clientHeight / game.config.height;
  el.style.left = ((gameX - sx) * scaleX) + 'px';
  el.style.top = ((gameY - sy) * scaleY) + 'px';
  el.style.display = 'block';
}

function hideWorldPrompt(id) {
  const el = _prompts[id];
  if (el) el.style.display = 'none';
}
