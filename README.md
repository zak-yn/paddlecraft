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
| Toggle Audio | Mute icon in top bar |

### Mobile & Tablet (Touch)
| Action | Touch Gesture |
| :--- | :--- |
| Move Paddle | Drag finger anywhere on screen or touch bar `◀` / `▶` |
| Rotate Piece | Tap canvas or touch bar `↻ ROTATE` |
| Hard Drop | Swipe down, double-tap canvas, or touch bar `⚡ DROP` |
| Pause / Resume | Tap `⏸` in top navigation |

---

## 🚀 Live Demo & Deployment

This project is built with vanilla HTML5, CSS3, and modern ES6 JavaScript. No build tools or package managers (`npm`) are required.

### Deploying to GitHub Pages
1. Push this repository to GitHub.
2. Go to **Settings** > **Pages**.
3. Under **Branch**, select `main` and root `/`.
4. Click **Save**. Your game will be live at `https://<username>.github.io/<repo-name>/`!

---

## 📄 License
MIT License. Free for non-commercial and educational use.
