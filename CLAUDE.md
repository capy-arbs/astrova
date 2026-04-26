# Astrova

## What This Is
A space exploration RPG built with Phaser 3. Fly between star systems, land on planets, gather resources, trade, smuggle, craft, and build your fleet. Vanilla JS, no build step. A CapyForge Games title.

## Architecture
- **Engine:** Phaser 3.60 (CDN)
- **Resolution:** 480x640, responsive scaling for mobile
- **No build step** — vanilla JS, static file server

## File Layout
| File | Purpose |
|------|---------|
| `index.html` | Entry point, loads Phaser + game |
| `src/main.js` | Phaser config, boot/preload/menu scenes |
| `src/gamestate.js` | Save/load, all game state (ships, skills, economy, quests) |
| `src/scenes/FlightScene.js` | Space flight, combat, docking, jump gates |
| `src/scenes/PlanetScene.js` | Planet surface exploration, mining, settlements |
| `assets/sprites/` | Ship, planet, astronaut, UI sprites |

## Game Systems
- **7 star systems** across 4 layers (Core → Unknown)
- **19 ships** across 5 roles (combat, exploration, mining, trading, smuggling)
- **15 skills** with RuneScape-style XP curve (1-99)
- **11 trade goods** with system-specific pricing
- **12 crafting recipes** (8 consumables + 4 trade goods)
- **14 settlements** with NPCs, shops, repair/refuel
- **6 story quests** + 16 repeatable contracts
- **3 enemy factions** scaling by system
- **Carrier drones**, cloaking, smuggling, police scanning

## Important Commands
- Serve locally: `python -m http.server 8000` then open `localhost:8000`
- Deploy: GitHub Pages at `capy-arbs.github.io/astrova/`

## When Working on This Codebase
- No build step — edit JS directly, refresh browser
- Game state is in `gamestate.js` — all save/load logic lives there
- Phaser scenes are in `src/scenes/` — FlightScene for space, PlanetScene for ground
- Assets from Foozle, Helianthus Games, Sara Spiegelberg (itch.io) — respect licenses
- Mobile touch controls must stay working alongside desktop keyboard

## License
CapyForge Games — capy-arbs
