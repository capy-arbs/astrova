# Astrova

A space exploration RPG built with [Phaser 3](https://phaser.io/). Fly between star systems, land on planets, gather resources, fight pirates, and upgrade your ship.

**Play now:** [https://capy-arbs.github.io/astrova/](https://capy-arbs.github.io/astrova/)

A [CapyForge Games](https://capy-arbs.github.io/capyforge/) title.

![Phaser 3](https://img.shields.io/badge/Phaser-3.60-blue) ![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

## Controls

### Desktop
| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Fly / Walk |
| Space | Fire weapons |
| E | Interact (land, dock, jump, take off) |
| I | Cargo & Skills screen |
| S | Save game |
| ESC | Close menus |

### Mobile
- Virtual joystick (bottom-left) for movement
- FIRE button for shooting
- E button for interactions
- INV button for cargo screen

## Features

- **Open-world space flight** — 3000x3000 maps with physics-based ship movement
- **3 star systems** — Sol, Alpha Centauri, Kepler Expanse — connected by hyperspace jump gates
- **Planet exploration** — land on planets, walk around as an astronaut, gather resources
- **15 skills** with RuneScape-style XP curve — all level by doing
- **9 ships** — from starter to Carrier with autonomous combat drones
- **4 weapons** — Auto Cannon, Rockets, Zapper, Big Space Gun
- **Space stations** — trade resources, buy upgrades, purchase ships and weapons
- **Passive regen** — shields and hull repair over time, scaling with skill levels
- **Enemy AI** — 3 enemy types with aggro ranges, respawning
- **Minimap** — shows planets, station, enemies, jump gates
- **Mobile touch controls** — virtual joystick + action buttons
- **Save system** — localStorage, auto-saves on system jumps

## Game Guide

See the [Wiki](WIKI.md) for detailed info on skills, ships, weapons, resources, and systems.

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
