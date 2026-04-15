# Astrova

A space exploration RPG built with [Phaser 3](https://phaser.io/). Fly between star systems, land on planets, gather resources, trade, smuggle, craft, and build your fleet.

**Play now:** [https://capy-arbs.github.io/astrova/](https://capy-arbs.github.io/astrova/)

A [CapyForge Games](https://capy-arbs.github.io/capyforge/) title.

![Phaser 3](https://img.shields.io/badge/Phaser-3.60-blue) ![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

## Controls

### Desktop
| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Fly / Walk |
| Space | Fire weapons |
| E | Interact (land, dock, jump, take off, hail traders) |
| V | Deploy / Recall drones (carrier ships) |
| C | Toggle cloak (smuggler ship) |
| Q | Scanner pulse (on planet surface) |
| Shift | Sprint (on planet surface) |
| I | Cargo & Skills screen |
| S | Save game |
| ESC | Close menus |

### Mobile
- Virtual joystick (bottom-left) for movement
- FIRE button for shooting
- E button for interactions
- INV button for cargo screen

## Features

### Exploration
- **7 star systems** across 4 layers — from safe Core to deadly Unknown space
- **Planet exploration** — land, walk as astronaut, gather resources, discover settlements
- **14 settlements** across all systems with unique NPCs, shops, and services (repair/refuel)
- **Story campaign** — 6 quests guiding you from Sol to The Void
- **16 repeatable contracts** — kill, deliver, mine, and trade missions at every station
- **Exploration bounties** — chart all planets in a system for credit rewards
- **Scanner pulse** — reveal hidden rare resources on planet surfaces
- **Neutral traders** — hail friendly ships in space to buy resources
- **Layered starfield backgrounds** — clean parallax per system with unique star tints

### Combat
- **Ranged combat** — enemies, police, and drones all shoot projectiles
- **4 weapons** — Auto Cannon, Rockets (with acceleration), Zapper, Big Space Gun
- **3 enemy factions** — Kla'ed, Pirates (red), Aliens (purple) scaling by system
- **Carrier drones** — deploy/recall with V, auto-replace from bay, destructible
- **Ship volley fire** — larger ships fire multiple projectiles in a fan spread (up to 5 for Dreadnought)

### Ships
- **19 ships** across 5 roles — combat, exploration, mining, trading, smuggling
- **5 free starter ships** — pick your playstyle from the beginning
- **Capital ships** — Dreadnought (800 HP, 5-shot volley) and Super-Carrier (6 drones) as endgame
- **Ship physics** — acceleration, turn rate, and max speed scale by ship class
- **Damage states** — starter ship visually degrades as hull drops

### Economy
- **11 trade goods** — core routes (safe margins), specialty goods, and frontier routes (high risk/reward)
- **System-specific prices** — each system has buy/sell multipliers and demand bonuses
- **Contraband** — illegal goods with huge margins, available at 5 settlement locations
- **Crafting** — 12 recipes: 8 consumables + 4 craftable trade goods feeding the trading loop
- **Mining** — hold-to-gather mechanic with progress bar, skill reduces gather time (1s to 0.3s)
- **Cargo capacity** — varies by ship, manage your hold

### Smuggling
- **Smuggler ship** — reduced police scan range (25px vs 80px)
- **Cloaking device** — press C to go invisible, 5 second duration
- **Police scanning** — takes 2 seconds with "SCANNING..." warning, giving time to cloak
- **Detection penalty** — contraband confiscated + credits fined
- **Wanted status** — 60 second timer, police attack on sight

### Planet Surfaces
- **Rich biome terrain** — layered ground, detailed trees, frost textures, lava glow, crater depth
- **Ambient particles** — spores on terran, snowflakes on ice, embers on lava, dust on barren
- **14 settlements** with detailed building visuals matching their biome
- **Hold-to-mine** — stand still near nodes, progress bar shows gather progress

### Skills
- **15 skills** with RuneScape-style XP curve (levels 1-99)
- All level by doing — combat from kills, piloting from flying, mining from gathering
- Skills affect gameplay — speed, damage, fire rate, shield regen, sell prices, scan range, mine speed

### Quality of Life
- **Save/Reset** buttons in cargo screen — no console needed
- **Quest tracker** in HUD — shows story + contract progress
- **Minimap** — planets, station, enemies, police, traders, jump gates
- **Mobile touch controls** — responsive scaling for any device
- **Passive regen** — shields and hull repair over time
- **Clean docking** — velocity zeroes on dock, no drifting during menus
- **Detailed station sprite** — solar panel arms, docking ring with rotating lights, reactor glow

## Game Guide

See the [Wiki](WIKI.md) for detailed info on all systems, ships, skills, and mechanics.

## Tech

- **Engine:** Phaser 3.60 (loaded via CDN)
- **Resolution:** 480x640, scales to fit on mobile
- **Assets:** [Void Collection by Foozle](https://foozlecc.itch.io/), [250+ Pixel Art Planets](https://helianthus-games.itch.io/pixel-art-planets), [Astronaut by Sara Spiegelberg](https://saraspiegelberg.itch.io/free-pixel-art-character-asset-astronaut)
- **No build step** — vanilla JS and a static file server

## Credits

- Ship & space art: **Void Collection** by Foozle (itch.io)
- Planet sprites: **Helianthus Games** (itch.io)
- Astronaut sprite: **Sara Spiegelberg** (itch.io)
- Built with [Claude Code](https://claude.ai/claude-code)
- A **CapyForge Games** title
