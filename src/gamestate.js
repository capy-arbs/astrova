const SpaceState = {
  player: {
    hp: 100,
    maxHp: 100,
    shield: 50,
    maxShield: 50,
    speed: 150,
    credits: 0,
    weapon: 'auto-cannon',
  },
  currentLocation: 'deep-space',
  spaceReturn: null, // { x, y } position to return to after landing
  cargo: {},         // resource key → quantity

  save() {
    try {
      localStorage.setItem('void-drifter-save', JSON.stringify({
        player: { ...this.player },
        currentLocation: this.currentLocation,
      }));
    } catch (e) {}
  },

  load() {
    try {
      const raw = localStorage.getItem('void-drifter-save');
      if (!raw) return false;
      const data = JSON.parse(raw);
      Object.assign(this.player, data.player);
      this.currentLocation = data.currentLocation;
      return true;
    } catch (e) { return false; }
  },
};
