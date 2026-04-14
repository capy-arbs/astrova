# Astrova Wiki

## Table of Contents

- [Star Systems](#star-systems)
- [Skills](#skills)
- [Ships](#ships)
- [Weapons](#weapons)
- [Resources](#resources)
- [Planet Types](#planet-types)
- [Enemies](#enemies)
- [Station Services](#station-services)
- [Mechanics](#mechanics)

---

## Star Systems

### Sol System (Starter)
- **Planets:** Terra Nova, Glacius, Inferno, Dust Rock, New Eden
- **Enemies:** 20
- **Jump Gates:** Alpha Centauri Gate (east edge)

### Alpha Centauri
- **Planets:** Frostheim, Ashfall, Pyroclast, Haven, Cryo-9, Void Scar
- **Enemies:** 30
- **Jump Gates:** Sol Gate (west), Kepler Gate (north)

### Kepler Expanse
- **Planets:** Hellion, Crucible, Graveyard, Deep Freeze, Oasis
- **Enemies:** 40
- **Jump Gates:** Alpha Centauri Gate (south)

Each system has a station at the center for trading, repairs, and upgrades.

---

## Skills

All 15 skills use the RuneScape XP formula (levels 1-99). Every skill levels by performing its related activity.

### Combat Skills

| Skill | How to Level | Effect Per Level |
|-------|-------------|-----------------|
| **Combat** | Kill enemies (+15 XP/kill) | +0.3 base damage |
| **Gunnery** | Land shots on enemies (+5 XP/hit) | -1% fire rate (up to 40% faster) |
| **Drone Command** | Drone hits/kills (+4 XP/hit) | +1 drone at LV 15, 30, 45; increased drone damage |
| **Targeting** | Hit enemies from >150px range (+3 XP) | Minimap enemy detection range |

### Ship Skills

| Skill | How to Level | Effect Per Level |
|-------|-------------|-----------------|
| **Piloting** | Fly around, drifting counts (+8 XP/sec) | +2 ship speed |
| **Shields** | Shields absorb damage (+8 XP/hit) or regen (+3 XP/2s) | +0.1/s regen rate, +2 max shield |
| **Hull Integrity** | Hull takes damage (+10 XP/hit) or repairs (+3 XP/3s) | +0.08/s repair rate, +3 max HP |
| **Warp Drive** | Use jump gates (+30 XP/jump) | Faster transitions |

### Economy Skills

| Skill | How to Level | Effect Per Level |
|-------|-------------|-----------------|
| **Mining** | Gather planet resources (+12 XP/gather) | +1 bonus resource per 10 levels |
| **Engineering** | Buy station upgrades (+30 XP/purchase) | Unlocks upgrade tiers |
| **Trading** | Sell cargo (+5 XP/sale, +8 bulk) | +0.6% sell price (up to 30%) |
| **Crafting** | Craft items | Unlock recipe tiers |

### Exploration Skills

| Skill | How to Level | Effect Per Level |
|-------|-------------|-----------------|
| **Exploration** | Discover new planets (+50 XP each) | +2px planet detection range |
| **Scanning** | Time spent near planets (+5 XP/2s) | +5px minimap reveal range |
| **Reputation** | Selling cargo (+2-3 XP/sale) | +0.4% sell price (up to 20%, stacks with Trading) |

---

## Ships

Purchase ships at any station's Shipyard. Requires Piloting level + credits.

| Ship | HP | Shield | Speed | Cost | Pilot Req | Special |
|------|----|--------|-------|------|-----------|---------|
| Starter Ship | 100 | 50 | +0 | Free | 1 | Damage state visuals |
| Nairan Scout | 80 | 75 | +15 | 300 | 5 | Fast, light |
| Nairan Fighter | 120 | 80 | +5 | 500 | 8 | Balanced |
| Nautolan Fighter | 140 | 100 | +0 | 800 | 12 | Tanky medium |
| Nairan Frigate | 180 | 120 | -5 | 1,200 | 18 | Heavy |
| Nautolan Frigate | 200 | 150 | -10 | 2,000 | 25 | Very tanky |
| Battlecruiser | 300 | 200 | -20 | 5,000 | 35 | Slow fortress |
| Battleship | 500 | 300 | -35 | 10,000 | 45 | Maximum tank |
| Carrier | 350 | 250 | -30 | 15,000 | 50 | **Spawns combat drones** |

### Carrier Drones
- Base 4 drones, +1 at Drone Command LV 15, 30, 45 (max 7)
- Orbit carrier when no enemies nearby
- Auto-attack enemies within 250px range
- Shoot blue-tinted bullets + deal contact damage
- Damage scales with Drone Command skill
- Earn you combat XP and credits for kills

---

## Weapons

Purchase at station. Each has unique characteristics.

| Weapon | Damage | Fire Rate | Spread | Cost |
|--------|--------|-----------|--------|------|
| Auto Cannon | 1 | Fast (180ms) | None | Free |
| Rockets | 3 | Slow (500ms) | None | 200 |
| Zapper | 1 | Very fast (100ms) | Slight | 350 |
| Big Space Gun | 5 | Very slow (800ms) | None | 600 |

Fire rate improves with Gunnery skill (up to 40% faster at high levels).
Damage scales with Combat skill + baseDamage upgrades.

---

## Resources

Gathered from planet surfaces. Sold at stations for credits.

| Resource | Base Value | Found On |
|----------|-----------|----------|
| Plant Fiber | 5 cr | Terran planets |
| Water Sample | 8 cr | Terran, Ice planets |
| Bio Matter | 10 cr | Terran planets |
| Ice Crystal | 12 cr | Ice planets |
| Cryo Compound | 18 cr | Ice planets |
| Magma Ore | 20 cr | Lava planets |
| Obsidian Shard | 25 cr | Lava planets |
| Thermal Core | 35 cr | Lava planets |
| Scrap Metal | 6 cr | Barren planets |
| Dust Crystal | 15 cr | Barren planets |
| Ancient Relic | 50 cr | Barren planets |

Sell prices scale with Trading + Reputation skills (up to +50% bonus).
Mining skill gives bonus resources (+1 per 10 Mining levels).

---

## Planet Types

| Type | Ground Color | Resources |
|------|-------------|-----------|
| **Terran** | Green | Plant Fiber, Water Sample, Bio Matter |
| **Ice** | Blue-white | Ice Crystal, Cryo Compound, Water Sample |
| **Lava** | Red-brown | Magma Ore, Obsidian Shard, Thermal Core |
| **Barren** | Grey-brown | Scrap Metal, Dust Crystal, Ancient Relic |

Each planet has 12 resource nodes scattered across an 800x800 surface. Walk over glowing nodes to collect.

---

## Enemies

3 enemy types from the Kla'ed faction. Enemies respawn 15 seconds after being killed.

| Enemy | HP | Speed | Aggro Range | Scale |
|-------|----|-------|-------------|-------|
| Fighter | 2 | 70 | 350px | Medium |
| Scout | 1 | 100 | 450px | Small, fast |
| Bomber | 4 | 40 | 300px | Large, slow |

Kills award: +10 credits, +15 Combat XP, +5 Gunnery XP per hit.

Enemy count scales by system: Sol (20), Alpha Centauri (30), Kepler (40).

---

## Station Services

Every system has a station at the center. Dock with E.

### Trade
- Sell individual resources or sell all cargo
- Prices scale with Trading + Reputation skills

### Upgrades
| Upgrade | Stat | Amount | Cost | Eng Level |
|---------|------|--------|------|-----------|
| Reinforced Hull | Max HP | +25 | 100 | 1 |
| Hull Plating II | Max HP | +50 | 300 | 10 |
| Shield Booster | Max Shield | +25 | 120 | 1 |
| Shield Booster II | Max Shield | +50 | 350 | 10 |
| Weapon Calibration | Damage | +1 | 150 | 5 |
| Weapon Calibration II | Damage | +1 | 400 | 15 |
| Weapon Calibration III | Damage | +2 | 800 | 25 |

### Weapons
Buy and equip different weapon types.

### Shipyard
Buy and switch between ship classes.

---

## Mechanics

### Combat
- Fire with SPACE (or FIRE button on mobile)
- Bullets fire in the direction your ship faces
- Ship rotates smoothly to face movement direction
- Enemies chase when you enter their aggro range

### Shield Regen
- Shields regenerate after 3 seconds out of combat
- Base rate: 2/s + 0.1/s per Shields skill level
- Awards Shields XP while regenerating

### Hull Repair
- Hull auto-repairs after 6 seconds out of combat
- Base rate: 0.5/s + 0.08/s per Hull Integrity level
- Awards Hull Integrity XP while repairing

### Skill Bonuses
- Shields skill: +2 max shield per level
- Hull Integrity: +3 max HP per level
- These bonuses stack with ship base stats and station upgrades

### Hyperspace
- Fly to a blue pulsing jump gate
- Press E to jump to the connected system
- White flash transition, awards Warp Drive XP

### Planet Landing
- Fly near a planet (detection range scales with Exploration skill)
- Press E to land
- Walk around as astronaut, collect glowing resource nodes
- Return to ship and press E to take off

### Death
- Ship destroyed when hull reaches 0
- **Lost:** Cargo, ship upgrades, current ship (reset to starter)
- **Kept:** All skills, credits, discovered planets
- Respawn in Sol system

### Saving
- **S key:** Manual save
- **Auto-save:** On system jumps
- **Auto-load:** Game restores on page refresh
- Uses localStorage (per-browser, per-device)

### Mobile
- Touch controls auto-detect on mobile/tablet devices
- Virtual joystick for movement
- Dedicated buttons for fire, interact, and inventory
- Game scales to fit any screen size
