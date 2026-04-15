SpaceState.load();

const isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  parent: 'game-wrapper',
  pixelArt: true,
  scale: isMobile ? {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  } : {},
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
      const def = RESOURCE_DEFS[key] || CONTRABAND[key] || { name: key, color: '#fff', value: 0 };
      const isContraband = !!CONTRABAND[key];
      const isBonus = tradePrices.bonus.includes(key);
      const price = Math.floor(def.value * mult * tradePrices.sell * (isBonus ? 1.5 : 1));
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1a1a22;">
        <span style="color:${def.color};font-size:12px;">${def.name} x${cargo[key]} ${isContraband ? '<span style="color:#ff4444;font-size:9px;">CONTRABAND</span>' : isBonus ? '<span style="color:#ffcc44;font-size:9px;">HIGH DEMAND</span>' : ''}</span>
        <button onclick="sellCargo('${key}')" style="background:#1a2a1a;color:#44cc44;border:1px solid #44cc44;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px;">${price}cr</button>
      </div>`;
    }).join('');
  }

  const sellAllValue = cargoKeys.reduce((s, k) => {
    const def = RESOURCE_DEFS[k] || CONTRABAND[k]; if (!def) return s;
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
    <div style="font-size:13px;color:#6699ff;margin-bottom:6px;">UPGRADES</div>${upgradeHtml}
    <div style="font-size:13px;color:#ff8844;margin-top:10px;margin-bottom:6px;">WEAPONS</div>${weaponHtml}
    <div style="font-size:13px;color:#44ddcc;margin-top:10px;margin-bottom:6px;">SHIPYARD</div>${shipHtml}`;
}

function _stationMissionsTab() {
  const sys = SpaceState.currentSystem;
  const available = MISSIONS.filter(m => m.system === sys && !SpaceState.completedMissions.includes(m.id));
  const active = SpaceState.activeMission;

  let html = '';
  if (active) {
    const mission = MISSIONS.find(m => m.id === active.id);
    if (mission) {
      html += `<div style="background:#1a1a2a;border:1px solid #445;border-radius:6px;padding:8px;margin-bottom:10px;">
        <div style="font-size:13px;color:#ffcc44;">ACTIVE: ${mission.name}</div>
        <div style="font-size:11px;color:#aaa;margin-top:4px;">${mission.desc}</div>
        <div style="font-size:11px;color:#888;margin-top:4px;">Progress: ${active.progress || 0}/${mission.goal.count || mission.goal.amount}</div>
        <div style="font-size:11px;color:#44cc44;margin-top:2px;">Reward: ${mission.reward.credits}cr</div>
        ${(active.progress || 0) >= (mission.goal.count || mission.goal.amount) ?
          `<button onclick="completeMission()" style="margin-top:6px;width:100%;background:#1a2a1a;color:#44ff44;border:1px solid #44ff44;border-radius:4px;padding:4px;cursor:pointer;font-size:12px;">Complete Mission</button>` :
          `<button onclick="abandonMission()" style="margin-top:6px;width:100%;background:#2a1a1a;color:#aa4444;border:1px solid #aa4444;border-radius:4px;padding:3px;cursor:pointer;font-size:10px;">Abandon</button>`}
      </div>`;
    }
  }

  if (available.length === 0 && !active) {
    html += '<div style="color:#666;font-size:12px;text-align:center;padding:20px;">No missions available in this system.</div>';
  } else if (!active) {
    html += available.map(m => {
      return `<div style="padding:6px 0;border-bottom:1px solid #1a1a22;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;color:#aabbcc;">${m.name}</span>
          <button onclick="acceptMission('${m.id}')" style="background:#1a1a2a;color:#6699ff;border:1px solid #6699ff;border-radius:3px;padding:2px 8px;cursor:pointer;font-size:10px;">Accept</button>
        </div>
        <div style="font-size:10px;color:#888;margin-top:2px;">${m.desc}</div>
        <div style="font-size:10px;color:#44cc44;margin-top:2px;">Reward: ${m.reward.credits}cr</div>
      </div>`;
    }).join('');
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
  const def = RESOURCE_DEFS[key] || CONTRABAND[key];
  if (!def || !SpaceState.cargo[key]) return;
  const sys = SpaceState.currentSystem;
  const tp = TRADE_PRICES[sys] || TRADE_PRICES['sol'];
  const isBonus = tp.bonus.includes(key);
  const sellPrice = Math.floor(def.value * SpaceState.getSellMultiplier() * tp.sell * (isBonus ? 1.5 : 1));
  SpaceState.player.credits += sellPrice;
  SpaceState.cargo[key]--;
  if (SpaceState.cargo[key] <= 0) delete SpaceState.cargo[key];

  // Trading + Reputation XP
  SpaceState.skills.trading.totalExp += 5;
  SpaceState.skills.reputation.totalExp += 2;
  SpaceState.checkSkillUp('trading');
  SpaceState.checkSkillUp('reputation');

  // Mission tracking (deliver + sell types)
  if (SpaceState.activeMission) {
    const m = MISSIONS.find(mi => mi.id === SpaceState.activeMission.id);
    if (m && m.goal.type === 'deliver' && m.goal.resource === key) {
      SpaceState.activeMission.progress = (SpaceState.activeMission.progress || 0) + 1;
    }
    if (m && m.goal.type === 'sell') {
      SpaceState.activeMission.progress = (SpaceState.activeMission.progress || 0) + sellPrice;
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
    const def = RESOURCE_DEFS[key] || CONTRABAND[key];
    if (!def) return;
    const isBonus = tp.bonus.includes(key);
    total += Math.floor(def.value * mult * tp.sell * (isBonus ? 1.5 : 1)) * SpaceState.cargo[key];
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

function acceptMission(id) {
  if (SpaceState.activeMission) return;
  const mission = MISSIONS.find(m => m.id === id);
  if (!mission) return;
  SpaceState.activeMission = { id, progress: 0 };
  SpaceState.killCount = 0;
  SpaceState.totalSoldValue = 0;
  _renderStation();
}

function completeMission() {
  if (!SpaceState.activeMission) return;
  const mission = MISSIONS.find(m => m.id === SpaceState.activeMission.id);
  if (!mission) return;
  SpaceState.player.credits += mission.reward.credits;
  SpaceState.skills.reputation.totalExp += 20;
  SpaceState.checkSkillUp('reputation');
  SpaceState.completedMissions.push(mission.id);
  SpaceState.activeMission = null;
  _renderStation();
}

function abandonMission() {
  SpaceState.activeMission = null;
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
  // Add crafted item
  if (!SpaceState.items) SpaceState.items = {};
  SpaceState.items[recipe.name] = (SpaceState.items[recipe.name] || 0) + 1;
  // Crafting XP
  SpaceState.skills.crafting.totalExp += recipe.xp;
  SpaceState.checkSkillUp('crafting');
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
  } else if (recipe.effect === 'speed' || recipe.effect === 'damage') {
    SpaceState.activeBuff = { effect: recipe.effect, amount: recipe.amount, duration: recipe.duration, timer: recipe.duration };
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

  el.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.7);" onclick="hideSettlementScreen()"></div>
    <div style="position:relative;background:#12121a;border:1px solid #2a2a3a;border-radius:10px;padding:20px;min-width:350px;max-width:500px;max-height:80vh;overflow-y:auto;color:#ddd;" onclick="event.stopPropagation()">
      <h2 style="text-align:center;font-size:15px;color:#aabbcc;margin-bottom:10px;border-bottom:1px solid #2a2a3a;padding-bottom:6px;">${settlement.name}</h2>
      <div style="font-size:10px;color:#556;margin-bottom:8px;text-align:center;">${planetName}</div>
      <div style="font-size:13px;color:#aabbcc;margin-bottom:6px;">PEOPLE</div>
      ${npcHtml}
      ${shopHtml ? `<div style="font-size:13px;color:#44cc88;margin-top:10px;margin-bottom:6px;">BUY RESOURCES</div>${shopHtml}` : ''}
      <div style="text-align:center;color:#ddcc44;font-size:12px;margin-top:10px;">Credits: ${SpaceState.player.credits}</div>
      <div style="text-align:center;color:#445;font-size:11px;margin-top:4px;">[ESC] or click outside to leave</div>
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
