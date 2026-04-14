SpaceState.load();

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  parent: 'game-wrapper',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [FlightScene, PlanetScene],
};

const game = new Phaser.Game(config);

// Ensure HUD overlay is on top
requestAnimationFrame(() => {
  const canvas = document.querySelector('canvas');
  if (canvas) { canvas.style.position = 'relative'; canvas.style.zIndex = '1'; }
});

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

  const skills = SpaceState.skills;
  const skillList = [
    { name: 'Piloting',     key: 'piloting',    color: '#44ddff' },
    { name: 'Combat',       key: 'combat',      color: '#ff4444' },
    { name: 'Mining',       key: 'mining',      color: '#ccaa44' },
    { name: 'Engineering',  key: 'engineering',  color: '#aaaacc' },
    { name: 'Trading',      key: 'trading',     color: '#44cc88' },
    { name: 'Exploration',  key: 'exploration', color: '#ddaa44' },
  ];

  const skillHtml = skillList.map(sk => {
    const s = skills[sk.key];
    const cur = s.level > 1 ? XP_TABLE[s.level - 1] : 0;
    const next = s.level < MAX_LEVEL ? XP_TABLE[s.level] : cur;
    const range = next - cur;
    const pct = range > 0 ? ((s.totalExp - cur) / range) * 100 : 100;
    return `<div style="margin:4px 0;">
      <div style="display:flex;justify-content:space-between;font-size:12px;">
        <span style="color:${sk.color}">${sk.name}</span><span style="color:#aaa">LV ${s.level}</span>
      </div>
      <div style="width:100%;height:4px;background:#1a1a2a;border-radius:2px;margin-top:2px;">
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

function showStationScreen() {
  if (_stationOpen) return;
  _stationOpen = true;

  const el = document.createElement('div');
  el.id = 'station-screen';
  el.style.cssText = 'position:absolute;inset:0;z-index:300;pointer-events:auto;display:flex;align-items:center;justify-content:center;font-family:Segoe UI,system-ui,sans-serif;';

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

  const cargo = SpaceState.cargo;
  const cargoKeys = Object.keys(cargo);
  const discount = SpaceState.getTradeDiscount();

  // Sell buttons
  let sellHtml = '';
  if (cargoKeys.length === 0) {
    sellHtml = '<div style="color:#666;font-size:12px;">No cargo to sell</div>';
  } else {
    sellHtml = cargoKeys.map(key => {
      const def = RESOURCE_DEFS[key] || { name: key, color: '#fff', value: 0 };
      const qty = cargo[key];
      const price = def.value;
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #222;">
        <span style="color:${def.color};font-size:12px;">${def.name} x${qty}</span>
        <button onclick="sellCargo('${key}')" style="background:#2a3a2a;color:#44cc44;border:1px solid #44cc44;border-radius:4px;padding:2px 10px;cursor:pointer;font-size:11px;">Sell (${price}cr)</button>
      </div>`;
    }).join('');
  }

  const sellAllValue = cargoKeys.reduce((s, k) => s + (cargo[k] * (RESOURCE_DEFS[k]?.value || 0)), 0);

  // Upgrade buttons
  const engLevel = SpaceState.skills.engineering.level;
  const upgradeHtml = UPGRADES.map((up, i) => {
    const canAfford = SpaceState.player.credits >= up.cost;
    const hasLevel = engLevel >= up.engLevel;
    const disabled = !canAfford || !hasLevel;
    const reason = !hasLevel ? `Eng LV${up.engLevel}` : !canAfford ? 'Need credits' : '';
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #222;">
      <div>
        <div style="font-size:12px;color:#ccc;">${up.name}</div>
        <div style="font-size:10px;color:#666;">+${up.amount} ${up.stat} ${reason ? '(' + reason + ')' : ''}</div>
      </div>
      <button onclick="buyUpgrade(${i})" ${disabled ? 'disabled' : ''} style="background:${disabled ? '#222' : '#2a2a3a'};color:${disabled ? '#555' : '#6699ff'};border:1px solid ${disabled ? '#333' : '#6699ff'};border-radius:4px;padding:2px 10px;cursor:${disabled ? 'default' : 'pointer'};font-size:11px;">${up.cost}cr</button>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(0,0,0,0.7);" onclick="hideStationScreen()"></div>
    <div style="position:relative;background:#12121a;border:1px solid #2a2a3a;border-radius:10px;padding:20px;min-width:500px;max-width:600px;color:#ddd;">
      <h2 style="text-align:center;font-size:16px;color:#aabbcc;margin-bottom:12px;border-bottom:1px solid #2a2a3a;padding-bottom:8px;">OUTPOST ALPHA</h2>
      <div style="display:flex;gap:20px;">
        <div style="flex:1;">
          <div style="font-size:13px;color:#44cc88;margin-bottom:6px;">TRADE</div>
          ${sellHtml}
          ${sellAllValue > 0 ? `<button onclick="sellAllCargo()" style="margin-top:8px;width:100%;background:#2a3a2a;color:#44cc44;border:1px solid #44cc44;border-radius:4px;padding:4px;cursor:pointer;font-size:12px;">Sell All (${sellAllValue}cr)</button>` : ''}
        </div>
        <div style="flex:1;">
          <div style="font-size:13px;color:#6699ff;margin-bottom:6px;">UPGRADES</div>
          ${upgradeHtml}
        </div>
      </div>
      <div style="margin-top:12px;border-top:1px solid #2a2a3a;padding-top:8px;">
        <div style="font-size:13px;color:#ff8844;margin-bottom:6px;">WEAPONS</div>
        ${Object.entries(WEAPONS).map(([key, w]) => {
          const equipped = SpaceState.player.weapon === key;
          const canAfford = SpaceState.player.credits >= w.cost;
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #222;">
            <div>
              <span style="color:${equipped ? '#44ff44' : '#ccc'};font-size:12px;">${w.name}</span>
              <span style="color:#666;font-size:10px;"> DMG:${w.damage} SPD:${Math.round(1000/w.fireRate)}/s</span>
            </div>
            ${equipped ? '<span style="color:#44ff44;font-size:11px;">Equipped</span>' :
              w.cost === 0 ? `<button onclick="equipWeapon('${key}')" style="background:#2a2a3a;color:#aaa;border:1px solid #555;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px;">Equip</button>` :
              `<button onclick="buyWeapon('${key}')" ${!canAfford?'disabled':''} style="background:${canAfford?'#3a2a1a':'#222'};color:${canAfford?'#ff8844':'#555'};border:1px solid ${canAfford?'#ff8844':'#333'};border-radius:4px;padding:2px 8px;cursor:${canAfford?'pointer':'default'};font-size:11px;">${w.cost}cr</button>`}
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:12px;border-top:1px solid #2a2a3a;padding-top:8px;">
        <div style="font-size:13px;color:#44ddcc;margin-bottom:6px;">SHIPYARD</div>
        ${Object.entries(SHIPS).map(([key, s]) => {
          const owned = SpaceState.player.ship === key;
          const canAfford = SpaceState.player.credits >= s.cost;
          const hasLevel = SpaceState.skills.piloting.level >= s.pilotReq;
          const disabled = !canAfford || !hasLevel;
          const spd = s.speedBonus >= 0 ? '+' + s.speedBonus : '' + s.speedBonus;
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #222;">
            <div>
              <span style="color:${owned ? '#44ff44' : '#ccc'};font-size:12px;">${s.name}</span>
              <div style="font-size:10px;color:#666;">HP:${s.hp} SH:${s.shield} SPD:${spd} ${!hasLevel ? '(Pilot LV' + s.pilotReq + ')' : ''}</div>
            </div>
            ${owned ? '<span style="color:#44ff44;font-size:11px;">Current</span>' :
              s.cost === 0 ? `<button onclick="switchShip('${key}')" style="background:#2a3a3a;color:#44ddcc;border:1px solid #44ddcc;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px;">Select</button>` :
              `<button onclick="buyShip('${key}')" ${disabled?'disabled':''} style="background:${disabled?'#222':'#1a3a3a'};color:${disabled?'#555':'#44ddcc'};border:1px solid ${disabled?'#333':'#44ddcc'};border-radius:4px;padding:2px 8px;cursor:${disabled?'default':'pointer'};font-size:11px;">${s.cost}cr</button>`}
          </div>`;
        }).join('')}
      </div>
      <div style="text-align:center;color:#ddcc44;font-size:13px;margin-top:12px;">Credits: ${SpaceState.player.credits}</div>
      <div style="text-align:center;color:#445;font-size:11px;margin-top:4px;">[ESC] to undock</div>
    </div>`;
}

function sellCargo(key) {
  const def = RESOURCE_DEFS[key];
  if (!def || !SpaceState.cargo[key]) return;
  SpaceState.player.credits += def.value;
  SpaceState.cargo[key]--;
  if (SpaceState.cargo[key] <= 0) delete SpaceState.cargo[key];

  // Trading XP
  SpaceState.skills.trading.totalExp += 5;
  SpaceState.checkSkillUp('trading');

  _renderStation();
}

function sellAllCargo() {
  const keys = Object.keys(SpaceState.cargo);
  let total = 0;
  keys.forEach(key => {
    const def = RESOURCE_DEFS[key];
    if (def) total += def.value * SpaceState.cargo[key];
  });
  SpaceState.player.credits += total;

  // Trading XP for bulk sell
  SpaceState.skills.trading.totalExp += keys.length * 8;
  SpaceState.checkSkillUp('trading');

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

function buyShip(key) {
  if (SpaceState.buyShip(key)) _renderStation();
}

function switchShip(key) {
  const def = SHIPS[key];
  if (!def) return;
  SpaceState.player.ship = key;
  SpaceState.player.maxHp = def.hp;
  SpaceState.player.hp = def.hp;
  SpaceState.player.maxShield = def.shield;
  SpaceState.player.shield = def.shield;
  _renderStation();
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
