# 🕹️ PaddleCraft

> **Minimalist Modular Brick Breaker & Tetris Action**  
> Catch balls, dock falling tetrominoes to sculpt your paddle, and build 8-block wide rows to trigger devastating **Mega Clears**!

---

## 🌟 Features

- **🎮 Dual Mechanics**: Classic block breaker action combined with falling tetromino paddle building.
- **🧱 Rigid Block Gravity (剛体落下)**: Tetrominoes retain their rigid connected shapes upon landing. Split blocks fall independently as new rigid clusters!
- **⚡ Mega Clears**: Form an 8-block wide row to trigger piercing screen-clearing lasers that shatter enemy shields (`🛡️`).
- **📱 Mobile & Tablet Touch First**:
  - Direct 1:1 finger tracking on canvas
  - Quick-tap to rotate pieces
  - Swipe-down to hard drop
  - Bottom touch thumb-bar (`◀`, `↻ ROTATE`, `⚡ DROP`, `▶`)
  - Micro-haptic feedback on piece docking & line clears
- **⏸️ Full Game Controls**:
  - Pause button & modal with <kbd>P</kbd> / <kbd>Esc</kbd> support
  - 2.0s ball loss countdown with remaining balls telemetry and glowing paddle ready-ball indicator
- **🏆 Global Public Leaderboard (Hall of Fame)**:
  - Real-time ranking with Top 50 high scores across all sectors
  - Callsign submission modal upon Game Over
  - Gold, silver, and bronze podium ranking indicators
- **🔊 Web Audio Synthesizer**: Pure procedural sound effects with zero external audio assets or load delay.

---

## 🎮 Controls

### PC (Keyboard & Mouse)
| Action | Key / Input |
| :--- | :--- |
| Move Paddle | <kbd>←</kbd> <kbd>→</kbd> or Mouse Drag |
| Rotate Piece | <kbd>↑</kbd> or <kbd>Space</kbd> |
| Hard Drop | <kbd>↓</kbd> |
| Pause / Resume | <kbd>P</kbd> or <kbd>Esc</kbd> |
| Leaderboard | Click `🏆 Leaderboard` in top bar |
| Toggle Audio | Mute icon in top bar |

### Mobile & Tablet (Touch)
| Action | Touch Gesture |
| :--- | :--- |
| Move Paddle | Drag finger anywhere on screen or touch bar `◀` / `▶` |
| Rotate Piece | Tap canvas or touch bar `↻ ROTATE` |
| Hard Drop | Swipe down or touch bar `⚡ DROP` |
| Pause / Resume | Tap `⏸` in top navigation |
| Leaderboard | Tap `🏆 Leaderboard` in top navigation |

---

## 🚀 Deployment (Render Blueprint)

This project includes a built-in Node.js / Express backend with JSON file persistence and rate limiting for the global leaderboard.

### Deploying to Render
1. Push this repository to GitHub.
2. Go to **[Render Dashboard](https://dashboard.render.com/)**.
3. Create a **New +** → **Web Service** (or apply the included `render.yaml` Blueprint).
4. Connect the repository with:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Your game and live leaderboard will run at `https://paddlecraft.onrender.com`!

---

## 📄 License
MIT License. Free for non-commercial and educational use.
