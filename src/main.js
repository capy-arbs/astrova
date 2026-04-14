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
