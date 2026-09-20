/**
 * PADDLECRAFT
 * Dynamic Modular Paddle Brick Breaker
 * Clean Modern Studio Edition - Pure JavaScript & Canvas
 */

// Field Dimension Configuration
const COLS = 12;
const ROWS = 20;
const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 720;
const CELL_W = CANVAS_WIDTH / COLS; // 40px
const CELL_H = CANVAS_HEIGHT / ROWS; // 36px

const DANGER_ROW = 8;  // Row threshold where warning triggers
const CEILING_ROW = 5; // Instant collapse if paddle expands above this

// Organic Audio Synthesizer (Web Audio API)
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.bgmEnabled = true;
        this.bgmTimer = null;
        this.bgmStep = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Gentle marimba/bell tone for ball bounce
    playBounce(isPaddle = true, combo = 1) {
        if (!this.sfxEnabled) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            
            // Warm pentatonic frequencies
            const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
            const baseFreq = isPaddle 
                ? (scale[(combo - 1) % scale.length] || 329.63)
                : 440.0;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.96, now + 0.12);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.13);
        } catch (e) {}
    }

    playBumper() {
        if (!this.sfxEnabled) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.14);
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) {}
    }

    // Pleasant wooden lock snap for tetromino docking
    playDock() {
        if (!this.sfxEnabled) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(349.23, now); // F4
            osc.frequency.exponentialRampToValueAtTime(698.46, now + 0.14); // F5
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.16);
        } catch (e) {}
    }

    // Clean resonant harmonic sweep for line clearing laser
    playLaser() {
        if (!this.sfxEnabled) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(220, now + 0.32);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {}
    }

    playExplosion() {
        if (!this.sfxEnabled) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

            gain.gain.setValueAtTime(0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);
        } catch (e) {}
    }

    playBlockDestroy() {
        if (!this.sfxEnabled) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.1);
        } catch (e) {}
    }

    playVictory() {
        if (!this.sfxEnabled) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const noteTime = now + idx * 0.11;
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, noteTime);
                gain.gain.setValueAtTime(0.001, noteTime);
                gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(noteTime);
                osc.stop(noteTime + 0.5);
            });
        } catch (e) {}
    }

    playMiss() {
        if (!this.sfxEnabled) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(293.66, now); // D4
            osc.frequency.exponentialRampToValueAtTime(146.83, now + 0.35); // D3 down
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);
        } catch (e) {}
    }

    playLaunch() {
        if (!this.sfxEnabled) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(329.63, now); // E4
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.16); // E5
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {}
    }

    startBGM() {
        if (!this.bgmEnabled) return;
        if (this.bgmTimer) return;
        this.init();

        // Relaxed ambient acoustic chords (Am7 - Fmaj7 - C - G)
        const progression = [
            220.00, 261.63, 329.63, 392.00, // A - C - E - G
            174.61, 220.00, 261.63, 329.63, // F - A - C - E
            261.63, 329.63, 392.00, 523.25, // C - E - G - C
            196.00, 246.94, 293.66, 392.00  // G - B - D - G
        ];

        this.bgmTimer = setInterval(() => {
            if (!this.bgmEnabled || !this.ctx) return;
            const freq = progression[this.bgmStep % progression.length];
            this.bgmStep++;

            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.38);
            } catch (e) {}
        }, 320);
    }

    stopBGM() {
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

// Particle System
class Particle {
    constructor(x, y, color, vx, vy, life = 1, size = 3) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = size;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
        ctx.fillStyle = this.color;
        // Clean rounded particles
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Laser Beam for Paddle Line Clears
class LaserBeam {
    constructor(colLeft, colRight, bottomY) {
        this.x1 = colLeft * CELL_W;
        this.x2 = (colRight + 1) * CELL_W;
        this.bottomY = bottomY;
        this.life = 0.4;
        this.maxLife = 0.4;
    }

    update(dt) {
        this.life -= dt;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        const progress = this.life / this.maxLife;
        const width = (this.x2 - this.x1);
        ctx.save();
        ctx.globalAlpha = progress;
        
        // Clean emerald column
        const grad = ctx.createLinearGradient(this.x1, 0, this.x2, 0);
        grad.addColorStop(0, 'rgba(16, 185, 129, 0)');
        grad.addColorStop(0.2, 'rgba(16, 185, 129, 0.7)');
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(0.8, 'rgba(16, 185, 129, 0.7)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(this.x1, 0, width, this.bottomY);
        ctx.restore();
    }
}

// Modern Minimalist Tetromino Palette
const TETROMINOES = {
    I: { shape: [[0,0], [-1,0], [1,0], [2,0]], color: '#38bdf8', name: 'I-Beam' },
    O: { shape: [[0,0], [1,0], [0,1], [1,1]], color: '#f59e0b', name: 'O-Block' },
    T: { shape: [[0,0], [-1,0], [1,0], [0,-1]], color: '#8b5cf6', name: 'T-Tee' },
    S: { shape: [[0,0], [1,0], [0,1], [-1,1]], color: '#10b981', name: 'S-Step' },
    Z: { shape: [[0,0], [-1,0], [0,1], [1,1]], color: '#f43f5e', name: 'Z-Step' },
    J: { shape: [[0,0], [-1,0], [1,0], [-1,-1]], color: '#6366f1', name: 'J-Hook' },
    L: { shape: [[0,0], [-1,0], [1,0], [1,-1]], color: '#ea580c', name: 'L-Hook' }
};

class FallingPiece {
    constructor(typeKey) {
        this.typeKey = typeKey;
        const def = TETROMINOES[typeKey];
        this.color = def.color;
        this.name = def.name;
        this.cells = def.shape.map(p => [...p]); // Relative coords
        // Spread spawn column across field
        this.gridX = Math.floor(Math.random() * (COLS - 4)) + 2;
        this.y = 0;
        this.speed = 40; // Pixels per second
        this.isHardDropping = false;
    }

    rotate() {
        // 90-degree clockwise rotation: (rx, ry) -> (-ry, rx)
        this.cells = this.cells.map(([rx, ry]) => [-ry, rx]);
    }

    update(dt) {
        const fallSpeed = this.isHardDropping ? 680 : this.speed;
        this.y += fallSpeed * dt;
    }

    getAbsoluteBlocks() {
        return this.cells.map(([rx, ry]) => ({
            gx: this.gridX + rx,
            px: (this.gridX + rx) * CELL_W,
            py: this.y + ry * CELL_H
        }));
    }
}

// Target Block in Upper Section
class TargetBlock {
    constructor(gx, gy, type = 'normal', health = 1) {
        this.gx = gx;
        this.gy = gy;
        this.type = type; // 'normal', 'bomb', 'tough'
        this.health = health;
        this.maxHealth = health;
        this.x = gx * CELL_W;
        this.y = gy * CELL_H;
        this.w = CELL_W;
        this.h = CELL_H;
        this.color = type === 'bomb' ? '#f43f5e' : (health > 1 ? '#8b5cf6' : '#38bdf8');
        this.isShielded = false;
        this.shieldPulse = 0;
    }

    draw(ctx) {
        ctx.save();
        const pad = 2.5;
        const rx = this.x + pad;
        const ry = this.y + pad;
        const rw = this.w - pad * 2;
        const rh = this.h - pad * 2;
        const radius = 5;

        // Clean squircle shape
        ctx.fillStyle = this.isShielded ? '#d97706' : this.color;
        this.drawRoundedRect(ctx, rx, ry, rw, rh, radius);
        ctx.fill();

        // Subtle matte top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        this.drawRoundedRect(ctx, rx, ry, rw, rh * 0.35, radius);
        ctx.fill();

        if (this.isShielded) {
            // Golden security shield aura
            this.shieldPulse += 0.05;
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            this.drawRoundedRect(ctx, rx - 1, ry - 1, rw + 2, rh + 2, radius + 1);
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🛡️', this.x + this.w / 2, this.y + this.h / 2);
        } else if (this.type === 'bomb') {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💣', this.x + this.w / 2, this.y + this.h / 2);
        } else if (this.maxHealth > 1) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.health, this.x + this.w / 2, this.y + this.h / 2);
        }

        ctx.restore();
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

// Ball
class Ball {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.radius = 7;
        this.vx = vx;
        this.vy = vy;
        this.baseSpeed = 340;
        this.speed = Math.hypot(vx, vy) || this.baseSpeed;
        this.recentPaddleHits = 0;
        this.hitCoolDown = 0;
        this.isSuperCharged = false;
        this.trail = [];
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.hitCoolDown > 0) {
            this.hitCoolDown -= dt;
            if (this.hitCoolDown <= 0) {
                this.recentPaddleHits = 0;
            }
        }

        this.trail.push({ x: this.x, y: this.y, charged: this.isSuperCharged });
        if (this.trail.length > 7) this.trail.shift();
    }

    draw(ctx) {
        ctx.save();
        const mainColor = this.isSuperCharged ? '#f43f5e' : '#38bdf8';
        
        // Soft minimal trail
        for (let i = 0; i < this.trail.length; i++) {
            const p = this.trail[i];
            const alpha = (i + 1) / this.trail.length * 0.28;
            ctx.beginPath();
            ctx.arc(p.x, p.y, this.radius * (0.5 + 0.5 * (i / this.trail.length)), 0, Math.PI * 2);
            ctx.fillStyle = p.charged 
                ? `rgba(244, 63, 94, ${alpha})`
                : `rgba(56, 189, 248, ${alpha})`;
            ctx.fill();
        }

        // Clean ball body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        if (this.isSuperCharged) {
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// Modular Paddle
class Paddle {
    constructor() {
        this.gridY = 18; // Base row near bottom
        this.x = (5 + 0.5) * CELL_W; // Exactly centered on column 5 (220px)
        this.vx = 0;
        this.moveDir = 0;
        this.nextPieceId = 1;

        // Clean modern initial blocks
        this.cells = [
            { rx: -1, ry: 0, color: '#38bdf8', isCore: false, pieceId: 1 },
            { rx: 0, ry: 0, color: '#f43f5e', isCore: true, pieceId: 1 },
            { rx: 1, ry: 0, color: '#38bdf8', isCore: false, pieceId: 1 }
        ];

        this.corePulse = 0;
    }

    get mass() {
        return 1.0 + (this.cells.length - 3) * 0.12;
    }

    getBounds() {
        let minRx = Infinity, maxRx = -Infinity, minRy = Infinity, maxRy = -Infinity;
        for (const c of this.cells) {
            if (c.rx < minRx) minRx = c.rx;
            if (c.rx > maxRx) maxRx = c.rx;
            if (c.ry < minRy) minRy = c.ry;
            if (c.ry > maxRy) maxRy = c.ry;
        }
        return { minRx, maxRx, minRy, maxRy };
    }

    getHighestRow() {
        const bounds = this.getBounds();
        return this.gridY + bounds.minRy;
    }

    getMaxContiguousRowLength() {
        const rowsMap = new Map();
        for (const c of this.cells) {
            if (!rowsMap.has(c.ry)) rowsMap.set(c.ry, []);
            rowsMap.get(c.ry).push(c.rx);
        }

        let maxLen = 0;
        for (const [ry, rxs] of rowsMap.entries()) {
            rxs.sort((a, b) => a - b);
            let currentStreak = 1;
            let rowMax = 1;
            for (let i = 1; i < rxs.length; i++) {
                if (rxs[i] === rxs[i - 1] + 1) {
                    currentStreak++;
                } else if (rxs[i] !== rxs[i - 1]) {
                    currentStreak = 1;
                }
                if (currentStreak > rowMax) rowMax = currentStreak;
            }
            if (rowMax > maxLen) maxLen = rowMax;
        }
        return maxLen;
    }

    applyConnectedBlockGravity() {
        let anyMoved = false;
        let iterations = 0;
        const key = (rx, ry) => `${rx},${ry}`;

        while (iterations < 25) {
            iterations++;

            // 1. Group cells by pieceId, splitting any disconnected fragments into new pieceIds
            const pieceGroups = new Map();
            for (const c of this.cells) {
                if (!c.pieceId) c.pieceId = ++this.nextPieceId;
                if (!pieceGroups.has(c.pieceId)) pieceGroups.set(c.pieceId, []);
                pieceGroups.get(c.pieceId).push(c);
            }

            // Ensure every pieceId group is actually connected. If a line clear split it, re-assign unique pieceId
            const validBlocks = [];
            for (const [pId, groupCells] of pieceGroups.entries()) {
                const groupMap = new Map();
                for (const c of groupCells) groupMap.set(key(c.rx, c.ry), c);
                const visited = new Set();

                for (const c of groupCells) {
                    const k = key(c.rx, c.ry);
                    if (visited.has(k)) continue;

                    const comp = [];
                    const queue = [c];
                    visited.add(k);

                    while (queue.length > 0) {
                        const curr = queue.shift();
                        comp.push(curr);
                        const neighbors = [
                            { rx: curr.rx + 1, ry: curr.ry },
                            { rx: curr.rx - 1, ry: curr.ry },
                            { rx: curr.rx, ry: curr.ry + 1 },
                            { rx: curr.rx, ry: curr.ry - 1 }
                        ];
                        for (const n of neighbors) {
                            const nk = key(n.rx, n.ry);
                            if (groupMap.has(nk) && !visited.has(nk)) {
                                visited.add(nk);
                                queue.push(groupMap.get(nk));
                            }
                        }
                    }

                    // If this is a split fragment, give it a new pieceId
                    if (validBlocks.some(b => b.pieceId === pId)) {
                        const newId = ++this.nextPieceId;
                        for (const cell of comp) cell.pieceId = newId;
                        validBlocks.push({ pieceId: newId, cells: comp });
                    } else {
                        validBlocks.push({ pieceId: pId, cells: comp });
                    }
                }
            }

            // 2. Build spatial map of all cells
            const cellMap = new Map();
            for (const c of this.cells) {
                cellMap.set(key(c.rx, c.ry), c);
            }

            // 3. Determine which blocks are supported (grounded)
            // A block is initially supported if it contains the paddle CORE or rests on the baseline ry >= 0
            const supported = new Set();
            for (const b of validBlocks) {
                if (b.cells.some(c => c.isCore || c.ry >= 0)) {
                    supported.add(b.pieceId);
                }
            }

            // Propagate support UPWARDS:
            // A block is supported if at least one of its cells rests DIRECTLY on top of a supported block's cell (c.ry + 1)
            let newlySupported = true;
            while (newlySupported) {
                newlySupported = false;
                for (const b of validBlocks) {
                    if (supported.has(b.pieceId)) continue;

                    const isResting = b.cells.some(c => {
                        const belowCell = cellMap.get(key(c.rx, c.ry + 1));
                        return belowCell && supported.has(belowCell.pieceId);
                    });

                    if (isResting) {
                        supported.add(b.pieceId);
                        newlySupported = true;
                    }
                }
            }

            // 4. Move all unsupported blocks down by 1 row
            let stepMoved = false;
            for (const b of validBlocks) {
                if (!supported.has(b.pieceId)) {
                    // Check if block can move down - cannot fall below baseline ry = 0
                    const canMoveDown = b.cells.every(c => {
                        if (c.ry >= 0) return false;
                        const belowCell = cellMap.get(key(c.rx, c.ry + 1));
                        if (!belowCell) return true;
                        if (belowCell.pieceId === b.pieceId) return true;
                        return !supported.has(belowCell.pieceId);
                    });

                    if (canMoveDown) {
                        for (const c of b.cells) {
                            c.ry += 1;
                        }
                        stepMoved = true;
                        anyMoved = true;
                    }
                }
            }

            if (!stepMoved) {
                break;
            }
        }

        return anyMoved;
    }

    applyCascadeGravity() {
        return this.applyConnectedBlockGravity();
    }

    update(dt) {
        this.corePulse += dt * 3;

        // Mass directly influences acceleration and maximum cruising speed
        const accel = 1800 / Math.sqrt(this.mass);
        const maxSpeed = 430 / Math.pow(this.mass, 0.35);

        if (this.moveDir !== 0) {
            this.vx += this.moveDir * accel * dt;
            if (Math.abs(this.vx) > maxSpeed) {
                this.vx = Math.sign(this.vx) * maxSpeed;
            }
        } else {
            // Natural friction
            this.vx *= Math.pow(0.08, dt);
            if (Math.abs(this.vx) < 5) this.vx = 0;

            // Soft grid magnet: smoothly snap core center to grid column center
            if (Math.abs(this.vx) < 50) {
                const halfCellW = CELL_W / 2;
                const nearestCol = Math.round((this.x - halfCellW) / CELL_W);
                const targetX = (nearestCol + 0.5) * CELL_W;
                this.x += (targetX - this.x) * Math.min(1, dt * 14);
            }
        }

        this.x += this.vx * dt;

        // Clamp paddle within screen boundaries
        const bounds = this.getBounds();
        const halfCellW = CELL_W / 2;
        const leftLimit = -bounds.minRx * CELL_W + halfCellW;
        const rightLimit = CANVAS_WIDTH - bounds.maxRx * CELL_W - halfCellW;

        if (this.x < leftLimit) {
            this.x = leftLimit;
            this.vx = 0;
        } else if (this.x > rightLimit) {
            this.x = rightLimit;
            this.vx = 0;
        }
    }

    getCellBoxes() {
        return this.cells.map(c => {
            const px = this.x + c.rx * CELL_W - CELL_W / 2;
            const py = (this.gridY + c.ry) * CELL_H;
            return {
                x: px,
                y: py,
                w: CELL_W,
                h: CELL_H,
                rx: c.rx,
                ry: c.ry,
                color: c.color,
                isCore: c.isCore
            };
        });
    }

    draw(ctx) {
        const boxes = this.getCellBoxes();
        for (const b of boxes) {
            ctx.save();
            const pad = 2;
            const rx = b.x + pad;
            const ry = b.y + pad;
            const rw = b.w - pad * 2;
            const rh = b.h - pad * 2;
            const radius = 6;

            // Matte tile
            ctx.fillStyle = b.color;
            this.drawRoundedRect(ctx, rx, ry, rw, rh, radius);
            ctx.fill();

            // Subtle border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 1;
            this.drawRoundedRect(ctx, rx, ry, rw, rh, radius);
            ctx.stroke();

            if (b.isCore) {
                // Calm glowing core indicator
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                const r = 4.5 + Math.sin(this.corePulse) * 1.5;
                ctx.arc(b.x + b.w / 2, b.y + b.h / 2, r, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        // Highlight nearly completed rows (6+ blocks)
        const rowsMap = new Map();
        for (const c of this.cells) {
            if (!rowsMap.has(c.ry)) rowsMap.set(c.ry, []);
            rowsMap.get(c.ry).push(c.rx);
        }
        for (const [ry, rxs] of rowsMap.entries()) {
            rxs.sort((a, b) => a - b);
            let streak = 1, maxStreak = 1;
            for (let i = 1; i < rxs.length; i++) {
                if (rxs[i] === rxs[i - 1] + 1) streak++;
                else if (rxs[i] !== rxs[i - 1]) streak = 1;
                if (streak > maxStreak) maxStreak = streak;
            }
            if (maxStreak >= 6) {
                ctx.save();
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                const minRx = Math.min(...rxs);
                const maxRx = Math.max(...rxs);
                const leftPx = this.x + minRx * CELL_W - CELL_W / 2;
                const rightPx = this.x + maxRx * CELL_W + CELL_W / 2;
                const topPy = (this.gridY + ry) * CELL_H;
                ctx.beginPath();
                ctx.moveTo(leftPx, topPy);
                ctx.lineTo(rightPx, topPy);
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

// Interactive Beginner Tutorial Manager
class TutorialManager {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this.step = 1;
        this.totalSteps = 4;
        this.bouncesCount = 0;
        this.targetBounces = 2;
        this.lineCleared = false;

        this.elBanner = document.getElementById('tutorial-banner');
        this.elStepTag = document.getElementById('tutorial-step-tag');
        this.elStepTitle = document.getElementById('tutorial-step-title');
        this.elInstruction = document.getElementById('tutorial-instruction');
        this.elProgress = document.getElementById('tutorial-progress');
        this.overlayComplete = document.getElementById('tutorial-complete-overlay');
    }

    start() {
        this.isActive = true;
        this.step = 1;
        this.bouncesCount = 0;
        this.lineCleared = false;
        this.game.state = 'TUTORIAL';
        this.game.score = 0;
        this.game.level = 1;
        this.game.lives = 3;
        this.game.levelLinesCleared = 0;

        // Hide main modals
        this.game.overlayStart.classList.add('hidden');
        this.game.overlayGameOver.classList.add('hidden');
        this.game.overlayStageClear.classList.add('hidden');
        if (this.overlayComplete) this.overlayComplete.classList.add('hidden');

        if (this.elBanner) this.elBanner.classList.remove('hidden');

        this.initStep1();
    }

    updateBanner() {
        if (!this.elBanner) return;
        this.elBanner.classList.remove('hidden');

        if (this.step === 1) {
            this.elStepTag.textContent = 'STEP 1/4';
            this.elStepTitle.textContent = 'Paddle Movement & Deflection';
            this.elInstruction.innerHTML = 'Catch and bounce the ball twice using <strong>← / →</strong>, <strong>A / D</strong>, or <strong>Mouse</strong>.';
            this.elProgress.textContent = `Bounces: ${this.bouncesCount} / ${this.targetBounces}`;
        } else if (this.step === 2) {
            this.elStepTag.textContent = 'STEP 2/4';
            this.elStepTitle.textContent = 'Piece Rotation & Docking';
            this.elInstruction.innerHTML = 'Rotate piece with <strong>↑ / W / Space</strong>, then dock it onto your paddle (or drop with <strong>↓ / S</strong>).';
            this.elProgress.textContent = 'Dock incoming tetromino';
        } else if (this.step === 3) {
            this.elStepTag.textContent = 'STEP 3/4';
            this.elStepTitle.textContent = 'Mega Clears (8-Block Rows)';
            this.elInstruction.innerHTML = 'Bridge pieces across your paddle to build an <strong>8-block wide row</strong>! This triggers a <strong>Mega Clear</strong>, firing a laser sweep and lightening paddle weight.';
            this.elProgress.textContent = this.lineCleared ? 'Mega Clear Fired! ✓' : 'Build 8-Block Wide Row';
        } else if (this.step === 4) {
            this.elStepTag.textContent = 'STEP 4/4';
            this.elStepTitle.textContent = 'Golden Energy Shield (🛡️)';
            this.elInstruction.innerHTML = 'Targets are shielded until you achieve the required Mega Clears. Now that your clear is done, destroy the target!';
            this.elProgress.textContent = 'Neutralize Target Block';
        }
    }

    initStep1() {
        this.step = 1;
        this.bouncesCount = 0;
        this.game.paddle = new Paddle();
        this.game.balls = [new Ball(this.game.paddle.x, (this.game.paddle.gridY - 4) * CELL_H, 60, 180)];
        this.game.targetBlocks = [];
        this.game.currentPiece = null;
        this.game.sound.startBGM();
        this.updateBanner();
        this.game.updateHUD();
    }

    onPaddleBounce() {
        if (!this.isActive) return;
        if (this.step === 1) {
            this.bouncesCount++;
            this.updateBanner();
            if (this.bouncesCount >= this.targetBounces) {
                this.elProgress.textContent = `Bounces: ${this.bouncesCount} / ${this.targetBounces} ✓`;
                setTimeout(() => this.initStep2(), 700);
            }
        }
    }

    initStep2() {
        this.step = 2;
        const p = new FallingPiece('T');
        p.y = 80;
        p.speed = 52;
        this.game.currentPiece = p;
        this.updateBanner();
    }

    onPieceMissed() {
        if (!this.isActive) return;
        if (this.step === 2) {
            // Immediately respawn piece for step 2 if missed
            setTimeout(() => {
                if (this.isActive && this.step === 2 && !this.game.currentPiece) {
                    this.initStep2();
                }
            }, 300);
        } else if (this.step === 3 && !this.lineCleared) {
            // Immediately respawn next block for step 3 if missed
            setTimeout(() => {
                if (this.isActive && this.step === 3 && !this.lineCleared && !this.game.currentPiece) {
                    this.spawnStep3Piece();
                }
            }, 300);
        }
    }

    onPieceDocked() {
        if (!this.isActive) return;
        if (this.step === 2) {
            this.elProgress.textContent = 'Piece Docked! ✓';
            setTimeout(() => this.initStep3(), 700);
        } else if (this.step === 3) {
            // If Mega Clear was not completed yet by this piece, spawn the next piece immediately!
            setTimeout(() => {
                if (this.isActive && this.step === 3 && !this.lineCleared && !this.game.currentPiece) {
                    const maxStreak = this.game.paddle.getMaxContiguousRowLength();
                    this.elProgress.textContent = `Row width: ${maxStreak} / 8 blocks. Keep building!`;
                    this.spawnStep3Piece();
                }
            }, 500);
        }
    }

    spawnStep3Piece() {
        if (!this.isActive || this.step !== 3 || this.lineCleared) return;
        // Provide O (2x2) or I (4x1) or J piece to easily bridge to 8 blocks
        const piecePool = ['O', 'I', 'O', 'J'];
        const typeKey = piecePool[Math.floor(Math.random() * piecePool.length)];
        const p = new FallingPiece(typeKey);
        const paddleCenterCol = Math.round((this.game.paddle.x - CELL_W / 2) / CELL_W);
        p.gridX = Math.max(1, Math.min(COLS - 3, paddleCenterCol + (Math.random() > 0.5 ? 2 : -2)));
        p.y = 80;
        p.speed = 50;
        this.game.currentPiece = p;
    }

    initStep3() {
        this.step = 3;
        this.lineCleared = false;
        // Pre-fill paddle with 6 contiguous cells in base row
        this.game.paddle.cells = [
            { rx: -3, ry: 0, color: '#38bdf8', isCore: false },
            { rx: -2, ry: 0, color: '#38bdf8', isCore: false },
            { rx: -1, ry: 0, color: '#38bdf8', isCore: false },
            { rx: 0, ry: 0, color: '#f43f5e', isCore: true },
            { rx: 1, ry: 0, color: '#38bdf8', isCore: false },
            { rx: 2, ry: 0, color: '#38bdf8', isCore: false }
        ];
        this.spawnStep3Piece();
        this.updateBanner();
    }

    onLineClear() {
        if (!this.isActive) return;
        if (this.step === 3) {
            this.lineCleared = true;
            this.updateBanner();
            this.elProgress.textContent = 'Mega Clear Executed! ✓';
            setTimeout(() => this.initStep4(), 1000);
        }
    }

    initStep4() {
        this.step = 4;
        // Spawn 1 single target block near top center
        const tb = new TargetBlock(5, 3, 'normal', 1);
        tb.isShielded = false; // Shield shattered!
        this.game.targetBlocks = [tb];
        this.game.currentPiece = null;
        if (this.game.balls.length === 0) {
            this.game.balls = [new Ball(this.game.paddle.x, (this.game.paddle.gridY - 2) * CELL_H, 90, -230)];
        }
        this.updateBanner();
    }

    onTargetHit() {
        if (!this.isActive) return;
        if (this.step === 4 && this.game.targetBlocks.length === 0) {
            setTimeout(() => this.completeTutorial(), 600);
        }
    }

    completeTutorial() {
        this.isActive = false;
        this.game.state = 'TUTORIAL_COMPLETE';
        if (this.elBanner) this.elBanner.classList.add('hidden');
        if (this.overlayComplete) this.overlayComplete.classList.remove('hidden');
    }

    exit() {
        this.isActive = false;
        if (this.elBanner) this.elBanner.classList.add('hidden');
        if (this.overlayComplete) this.overlayComplete.classList.add('hidden');
        this.game.startGame();
    }
}

// Master Game Controller
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');

        this.sound = new SoundEngine();

        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('paddlecraft_high') || '0', 10);
        this.lives = 3;
        this.level = 1;
        this.linesCleared = 0;
        this.combo = 1;

        this.state = 'START'; // 'START', 'PLAYING', 'TUTORIAL', 'PAUSED', 'GAMEOVER', 'CLEAR'

        this.paddle = new Paddle();
        this.balls = [];
        this.targetBlocks = [];
        this.particles = [];
        this.lasers = [];

        this.currentPiece = null;
        this.nextPieceKey = this.getRandomPieceKey();

        this.lastTime = 0;
        this.keys = {};

        this.levelLinesCleared = 0;

        // DOM elements
        this.elScore = document.getElementById('score-display');
        this.elHigh = document.getElementById('high-score-display');
        this.elLevel = document.getElementById('level-display');
        this.elTargetCount = document.getElementById('target-count');
        this.elWeightLabel = document.getElementById('weight-label');
        this.elWeightBar = document.getElementById('weight-bar');
        this.elDangerLabel = document.getElementById('danger-label');
        this.elDangerBar = document.getElementById('danger-bar');
        this.elDangerBanner = document.getElementById('danger-banner');
        this.elLinesCleared = document.getElementById('lines-cleared');
        this.elCombo = document.getElementById('combo-display');
        this.elNextPieceType = document.getElementById('next-piece-type');
        this.elLivesIcons = document.getElementById('lives-icons');
        this.elLineProgressLabel = document.getElementById('line-progress-label');
        this.elLineProgressBar = document.getElementById('line-progress-bar');
        this.elObjectiveText = document.getElementById('objective-text');
        this.elObjectiveBadge = document.getElementById('objective-badge');

        this.overlayStart = document.getElementById('start-overlay');
        this.overlayGameOver = document.getElementById('gameover-overlay');
        this.overlayStageClear = document.getElementById('stageclear-overlay');
        this.overlayPause = document.getElementById('pause-overlay');
        this.btnPause = document.getElementById('pause-btn');
        this.btnResume = document.getElementById('resume-button');

        this.elBallLostBanner = document.getElementById('ball-lost-banner');
        this.elLostRemaining = document.getElementById('lost-remaining-count');
        this.elLostPips = document.getElementById('lost-pips');
        this.elLostCountdown = document.getElementById('lost-countdown');

        this.ballLostState = false;
        this.ballLostTimer = 0;

        this.tutorial = new TutorialManager(this);

        this.initDOMEvents();
        this.updateHUD();
        this.renderNextPiece();

        requestAnimationFrame(this.loop.bind(this));
    }

    getRandomPieceKey() {
        const keys = Object.keys(TETROMINOES);
        return keys[Math.floor(Math.random() * keys.length)];
    }

    spawnPiece() {
        this.currentPiece = new FallingPiece(this.nextPieceKey);
        this.nextPieceKey = this.getRandomPieceKey();
        this.renderNextPiece();
    }

    triggerHaptic(ms = 10) {
        try {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(ms);
            }
        } catch (e) {}
    }

    initDOMEvents() {
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            if (this.state === 'PLAYING' || this.state === 'TUTORIAL') {
                if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
                    if (this.currentPiece) {
                        this.currentPiece.rotate();
                    }
                }
                if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                    if (this.currentPiece) {
                        this.currentPiece.isHardDropping = true;
                    }
                }
                if (e.code === 'KeyP' || e.code === 'Escape') {
                    this.togglePause();
                }
            } else if (this.state === 'PAUSED' && (e.code === 'KeyP' || e.code === 'Escape')) {
                this.togglePause();
            } else if (this.state === 'START' && (e.code === 'Space' || e.code === 'Enter')) {
                this.startGame();
            }
        });

        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });

        // Mouse pointer navigation with accurate canvas scaling
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.state !== 'PLAYING' && this.state !== 'TUTORIAL') return;
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = CANVAS_WIDTH / rect.width;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const diff = mouseX - this.paddle.x;
            if (Math.abs(diff) > 4) {
                this.paddle.x += diff * 0.45;
                this.paddle.vx = diff * 10;
            }
        });

        // Smooth Relative Touch Drag, Tap-to-Rotate, and Downward Swipe Drop
        let touchActive = false;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let touchTotalDist = 0;
        let isDropTriggered = false;
        let lastTapTime = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            if (this.state !== 'PLAYING' && this.state !== 'TUTORIAL') return;
            if (e.touches.length === 0) return;
            e.preventDefault();

            const now = performance.now();
            const t = e.touches[0];
            touchActive = true;
            touchStartX = t.clientX;
            touchStartY = t.clientY;
            lastTouchX = t.clientX;
            lastTouchY = t.clientY;
            touchStartTime = now;
            touchTotalDist = 0;
            isDropTriggered = false;

            // CRITICAL: NEVER MOVE PADDLE ON TOUCHSTART!
            // Touching screen to tap/rotate must NEVER cause paddle to warp or jump.
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!touchActive || (this.state !== 'PLAYING' && this.state !== 'TUTORIAL')) return;
            if (e.touches.length === 0 || isDropTriggered) return;
            e.preventDefault();

            const t = e.touches[0];
            const deltaX = t.clientX - lastTouchX;
            const deltaY = t.clientY - lastTouchY;
            const totalDx = t.clientX - touchStartX;
            const totalDy = t.clientY - touchStartY;

            lastTouchX = t.clientX;
            lastTouchY = t.clientY;
            touchTotalDist += Math.hypot(deltaX, deltaY);

            // Fast swipe-down gesture for Hard Drop
            if (totalDy > 32 && totalDy > Math.abs(totalDx) * 1.3) {
                if (this.currentPiece && !this.currentPiece.isHardDropping) {
                    this.currentPiece.isHardDropping = true;
                    this.triggerHaptic(25);
                    isDropTriggered = true;
                    return;
                }
            }

            // Smooth RELATIVE drag: paddle tracks finger translation 1:1 with natural feel
            // Paddle never warps to finger coordinate!
            if (!isDropTriggered) {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = CANVAS_WIDTH / rect.width;
                const moveAmount = deltaX * scaleX * 1.12;

                this.paddle.x += moveAmount;
                this.paddle.vx = (deltaX * scaleX) * 14;
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (!touchActive || (this.state !== 'PLAYING' && this.state !== 'TUTORIAL')) return;
            touchActive = false;

            const duration = performance.now() - touchStartTime;

            // Pure Tap: finger moved very little (< 10px) and lifted quickly (< 280ms)
            // -> Rotate tetromino with ZERO paddle displacement!
            if (!isDropTriggered && touchTotalDist < 10 && duration < 280) {
                if (this.currentPiece) {
                    this.currentPiece.rotate();
                    this.triggerHaptic(12);
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchcancel', () => {
            touchActive = false;
        });

        // Main action buttons
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('restart-button').addEventListener('click', () => this.startGame());
        document.getElementById('nextstage-button').addEventListener('click', () => this.nextLevel());

        // Pause button and modal handlers
        if (this.btnPause) {
            this.btnPause.addEventListener('click', () => {
                this.triggerHaptic(10);
                this.togglePause();
            });
        }
        if (this.btnResume) {
            this.btnResume.addEventListener('click', () => {
                this.triggerHaptic(10);
                this.togglePause();
            });
        }
        if (this.overlayPause) {
            this.overlayPause.addEventListener('click', (e) => {
                if (e.target === this.overlayPause) {
                    this.triggerHaptic(10);
                    this.togglePause();
                }
            });
        }

        // Tutorial buttons
        const startTutBtn = document.getElementById('start-tutorial-button');
        if (startTutBtn) startTutBtn.addEventListener('click', () => this.tutorial.start());

        const navTutBtn = document.getElementById('btn-tutorial-trigger');
        if (navTutBtn) navTutBtn.addEventListener('click', () => this.tutorial.start());

        const skipTutBtn = document.getElementById('btn-skip-tutorial');
        if (skipTutBtn) skipTutBtn.addEventListener('click', () => this.tutorial.exit());

        const finishTutBtn = document.getElementById('tutorial-finish-btn');
        if (finishTutBtn) finishTutBtn.addEventListener('click', () => this.tutorial.exit());

        // Touch & on-screen controls
        const touchLeft = document.getElementById('btn-touch-left');
        const touchRight = document.getElementById('btn-touch-right');
        const touchRot = document.getElementById('btn-touch-rotate');
        const touchDrop = document.getElementById('btn-touch-drop');

        const bindTouch = (el, downCode, actionCallback) => {
            if (!el) return;
            let isHolding = false;

            const startHandler = (e) => {
                e.preventDefault();
                isHolding = true;
                this.triggerHaptic(10);
                if (actionCallback) {
                    actionCallback();
                } else if (downCode) {
                    this.keys[downCode] = true;
                }
            };

            const endHandler = (e) => {
                if (!isHolding) return;
                isHolding = false;
                if (downCode) this.keys[downCode] = false;
            };

            el.addEventListener('touchstart', startHandler, { passive: false });
            el.addEventListener('touchend', endHandler, { passive: false });
            el.addEventListener('touchcancel', endHandler, { passive: false });
            el.addEventListener('mousedown', startHandler);
            el.addEventListener('mouseup', endHandler);
            el.addEventListener('mouseleave', endHandler);
        };

        bindTouch(touchLeft, 'ArrowLeft');
        bindTouch(touchRight, 'ArrowRight');
        bindTouch(touchRot, null, () => {
            if (this.currentPiece) {
                this.currentPiece.rotate();
            }
        });
        bindTouch(touchDrop, null, () => {
            if (this.currentPiece) {
                this.currentPiece.isHardDropping = true;
            }
        });

        // Audio controls
        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                this.sound.sfxEnabled = !this.sound.sfxEnabled;
                soundBtn.classList.toggle('active', this.sound.sfxEnabled);
            });
        }

        const bgmBtn = document.getElementById('bgm-toggle-btn');
        if (bgmBtn) {
            bgmBtn.addEventListener('click', () => {
                this.sound.bgmEnabled = !this.sound.bgmEnabled;
                bgmBtn.classList.toggle('active', this.sound.bgmEnabled);
                if (this.sound.bgmEnabled && (this.state === 'PLAYING' || this.state === 'TUTORIAL')) {
                    this.sound.startBGM();
                } else {
                    this.sound.stopBGM();
                }
            });
        }
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.sound.stopBGM();
            if (this.overlayPause) this.overlayPause.classList.remove('hidden');
            if (this.btnPause) {
                this.btnPause.classList.add('active');
                const pauseIcon = this.btnPause.querySelector('.pause-icon');
                const playIcon = this.btnPause.querySelector('.play-icon');
                if (pauseIcon) pauseIcon.classList.add('hidden');
                if (playIcon) playIcon.classList.remove('hidden');
            }
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.sound.startBGM();
            if (this.overlayPause) this.overlayPause.classList.add('hidden');
            if (this.btnPause) {
                this.btnPause.classList.remove('active');
                const pauseIcon = this.btnPause.querySelector('.pause-icon');
                const playIcon = this.btnPause.querySelector('.play-icon');
                if (pauseIcon) pauseIcon.classList.remove('hidden');
                if (playIcon) playIcon.classList.add('hidden');
            }
            this.lastTime = performance.now();
        }
    }

    startGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.linesCleared = 0;
        this.combo = 1;
        this.ballLostState = false;
        this.ballLostTimer = 0;
        if (this.elBallLostBanner) this.elBallLostBanner.classList.add('hidden');
        if (this.overlayPause) this.overlayPause.classList.add('hidden');
        if (this.btnPause) {
            this.btnPause.classList.remove('active');
            const pauseIcon = this.btnPause.querySelector('.pause-icon');
            const playIcon = this.btnPause.querySelector('.play-icon');
            if (pauseIcon) pauseIcon.classList.remove('hidden');
            if (playIcon) playIcon.classList.add('hidden');
        }
        this.setupStage();

        this.overlayStart.classList.add('hidden');
        this.overlayGameOver.classList.add('hidden');
        this.overlayStageClear.classList.add('hidden');
        if (this.tutorial.overlayComplete) this.tutorial.overlayComplete.classList.add('hidden');
        if (this.tutorial.elBanner) this.tutorial.elBanner.classList.add('hidden');

        this.state = 'PLAYING';
        this.sound.startBGM();
        this.updateHUD();
    }

    setupStage() {
        this.levelLinesCleared = 0;
        this.paddle = new Paddle();
        this.balls = [new Ball(this.paddle.x, (this.paddle.gridY - 1) * CELL_H - 15, 120, -280)];
        this.targetBlocks = [];
        this.particles = [];
        this.lasers = [];
        this.spawnPiece();

        // Balanced stage target layout
        const rows = Math.min(3 + this.level, 7);
        for (let r = 1; r <= rows; r++) {
            for (let c = 0; c < COLS; c++) {
                if ((r + c + this.level) % 3 === 0 && r > 2) continue;
                
                let type = 'normal';
                let health = 1;
                if ((r + c) % 7 === 0) {
                    type = 'bomb';
                } else if (r <= 2 && this.level > 1) {
                    health = 2;
                }
                this.targetBlocks.push(new TargetBlock(c, r, type, health));
            }
        }
        this.updateShields();
        this.updateHUD();
    }

    updateShields() {
        const required = this.level;
        const isObjectiveMet = this.levelLinesCleared >= required;

        for (let i = 0; i < this.targetBlocks.length; i++) {
            const block = this.targetBlocks[i];
            // If objective NOT met and blocks are down to the last remaining ones (<= 2)
            if (!isObjectiveMet && this.targetBlocks.length <= 2) {
                block.isShielded = true;
            } else {
                block.isShielded = false;
            }
        }
    }

    nextLevel() {
        this.level++;
        this.overlayStageClear.classList.add('hidden');
        this.setupStage();
        this.state = 'PLAYING';
        if (this.sound.bgmEnabled) {
            this.sound.startBGM();
        }
    }

    renderNextPiece() {
        const ctx = this.nextCtx;
        ctx.clearRect(0, 0, 130, 130);
        const def = TETROMINOES[this.nextPieceKey];
        if (!def) return;

        this.elNextPieceType.textContent = def.name;

        ctx.save();
        ctx.translate(65, 65);
        ctx.fillStyle = def.color;

        const size = 20;
        const radius = 4;
        for (const [rx, ry] of def.shape) {
            const x = rx * size - size / 2;
            const y = ry * size - size / 2;
            const w = size - 2;
            const h = size - 2;
            
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
            ctx.lineTo(x + w, y + h - radius);
            ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            ctx.lineTo(x + radius, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    updateHUD() {
        this.elScore.textContent = this.score.toLocaleString();
        this.elHigh.textContent = this.highScore.toLocaleString();
        this.elLevel.textContent = this.level;
        this.elTargetCount.textContent = this.targetBlocks.length;
        this.elLinesCleared.textContent = this.linesCleared;
        this.elCombo.textContent = `x${this.combo}`;

        // Weight Telemetry
        const count = this.paddle.cells.length;
        let weightDesc = 'Light';
        if (count > 12) weightDesc = 'Colossal';
        else if (count > 7) weightDesc = 'Heavy';
        else if (count > 4) weightDesc = 'Medium';

        if (this.elWeightLabel) this.elWeightLabel.textContent = `${count} (${weightDesc})`;
        if (this.elWeightBar) {
            const weightPct = Math.min(100, Math.round((count / 16) * 100));
            this.elWeightBar.style.width = `${weightPct}%`;
        }

        // Line Clear Requirement Telemetry (Goal: 8 contiguous blocks)
        const maxStreak = this.paddle.getMaxContiguousRowLength();
        if (this.elLineProgressLabel && this.elLineProgressBar) {
            this.elLineProgressLabel.textContent = maxStreak >= 8 
                ? '8 / 8 Blocks (READY!)'
                : `${maxStreak} / 8 Blocks`;
            const progressPct = Math.min(100, Math.round((maxStreak / 8) * 100));
            this.elLineProgressBar.style.width = `${progressPct}%`;
        }

        // Danger Telemetry
        const highestRow = this.paddle.getHighestRow();
        const dangerPct = Math.min(100, Math.max(0, ((ROWS - highestRow) / (ROWS - DANGER_ROW)) * 100));
        if (this.elDangerBar) this.elDangerBar.style.width = `${dangerPct}%`;

        if (this.elDangerLabel) {
            if (highestRow <= DANGER_ROW) {
                this.elDangerLabel.textContent = 'Critical Height';
                this.elDangerLabel.className = 'meter-status status-danger';
                if (this.elDangerBanner) this.elDangerBanner.classList.remove('hidden');
            } else if (highestRow <= DANGER_ROW + 2) {
                this.elDangerLabel.textContent = 'Warning';
                this.elDangerLabel.className = 'meter-status status-warning';
                if (this.elDangerBanner) this.elDangerBanner.classList.add('hidden');
            } else {
                this.elDangerLabel.textContent = 'Safe';
                this.elDangerLabel.className = 'meter-status status-safe';
                if (this.elDangerBanner) this.elDangerBanner.classList.add('hidden');
            }
        }

        // Lives Indicator
        const dots = this.elLivesIcons.children;
        for (let i = 0; i < dots.length; i++) {
            if (i < this.lives) {
                dots[i].classList.add('active');
            } else {
                dots[i].classList.remove('active');
            }
        }

        // Stage Victory Objective Telemetry (Required lines aligned with level)
        const reqLines = this.level;
        if (this.elObjectiveText && this.elObjectiveBadge) {
            this.elObjectiveText.textContent = `Clears: ${this.levelLinesCleared} / ${reqLines}`;
            if (this.levelLinesCleared >= reqLines) {
                this.elObjectiveBadge.textContent = 'COMPLETED ✓';
                this.elObjectiveBadge.className = 'obj-badge completed';
            } else {
                this.elObjectiveBadge.textContent = 'REQUIRED';
                this.elObjectiveBadge.className = 'obj-badge pending';
            }
        }
    }

    triggerGameOver(reason) {
        this.state = 'GAMEOVER';
        this.sound.stopBGM();
        this.sound.playExplosion();

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('paddlecraft_high', this.highScore.toString());
        }

        document.getElementById('gameover-reason').textContent = reason;
        document.getElementById('final-score').textContent = this.score.toLocaleString();
        document.getElementById('final-lines').textContent = this.linesCleared.toString();
        document.getElementById('final-combo').textContent = `x${this.combo}`;
        this.overlayGameOver.classList.remove('hidden');
        this.elDangerBanner.classList.add('hidden');
    }

    startStageClear(lastX, lastY) {
        if (this.state === 'CLEARING' || this.state === 'CLEAR') return;
        this.state = 'CLEARING';
        this.clearCelebrationTimer = 1.35;
        this.celebrationOrigin = {
            x: (lastX !== undefined && !isNaN(lastX)) ? lastX : CANVAS_WIDTH / 2,
            y: (lastY !== undefined && !isNaN(lastY)) ? lastY : 140
        };

        this.sound.playVictory();

        // Dissolve any active falling piece cleanly into sparkles
        if (this.currentPiece) {
            for (const b of this.currentPiece.getAbsoluteBlocks()) {
                for (let i = 0; i < 4; i++) {
                    this.particles.push(new Particle(
                        b.px + CELL_W / 2, b.py + CELL_H / 2,
                        this.currentPiece.color,
                        (Math.random() - 0.5) * 140, (Math.random() - 0.5) * 140,
                        0.4, 2.5
                    ));
                }
            }
            this.currentPiece = null;
        }

        // Celebratory particle explosion at last block site
        const colors = ['#10b981', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7', '#ffffff'];
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 240;
            const col = colors[Math.floor(Math.random() * colors.length)];
            this.particles.push(new Particle(
                this.celebrationOrigin.x,
                this.celebrationOrigin.y,
                col,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0.8 + Math.random() * 0.5,
                3
            ));
        }
    }

    finishStageClear() {
        this.state = 'CLEAR';
        this.sound.stopBGM();
        this.score += 2000 * this.level;
        this.updateHUD();

        const stageTitle = document.querySelector('#stageclear-overlay .modal-title');
        if (stageTitle) stageTitle.textContent = `Sector ${this.level} Cleared!`;

        const stageDesc = document.querySelector('#stageclear-overlay .modal-desc');
        if (stageDesc) stageDesc.textContent = `All target defenses destroyed. +${(2000 * this.level).toLocaleString()} bonus points awarded!`;

        this.overlayStageClear.classList.remove('hidden');
    }

    triggerStageClear(lastX, lastY) {
        this.startStageClear(lastX, lastY);
    }

    // Docking Falling Piece onto Paddle
    dockFallingPiece() {
        if (!this.currentPiece) return;
        const p = this.currentPiece;
        
        const paddleCenterGx = Math.round((this.paddle.x - CELL_W / 2) / CELL_W);
        const newPieceId = ++this.paddle.nextPieceId;

        // Calculate the visual grid row based on where the piece actually is when collided
        const currentGridY = Math.round(p.y / CELL_H);
        const desiredRy = Math.min(0, currentGridY - this.paddle.gridY);

        let maxPieceRy = -Infinity;
        for (const [rx, ry] of p.cells) {
            if (ry > maxPieceRy) maxPieceRy = ry;
        }

        // Target landing offset: allows side docking at desiredRy when alongside paddle
        let targetOffsetRy = desiredRy - maxPieceRy;

        // Ensure rigid integrity: piece can never penetrate any existing paddle cell
        let maxSafeOffsetRy = Infinity;
        for (const [rx, ry] of p.cells) {
            const targetRx = (p.gridX + rx) - paddleCenterGx;
            const colCells = this.paddle.cells.filter(c => c.rx === targetRx);
            let allowedRy = 0; // baseline floor
            if (colCells.length > 0) {
                allowedRy = Math.min(...colCells.map(c => c.ry)) - 1;
            }
            const maxForThisCell = allowedRy - ry;
            if (maxForThisCell < maxSafeOffsetRy) {
                maxSafeOffsetRy = maxForThisCell;
            }
        }

        const finalOffsetRy = Math.min(targetOffsetRy, maxSafeOffsetRy);

        for (const [rx, ry] of p.cells) {
            const pieceAbsoluteGx = p.gridX + rx;
            const newRx = pieceAbsoluteGx - paddleCenterGx;
            const newRy = finalOffsetRy + ry;

            this.paddle.cells.push({
                rx: newRx,
                ry: newRy,
                color: p.color,
                isCore: false,
                pieceId: newPieceId
            });

            // Docking spark particles
            for (let i = 0; i < 5; i++) {
                this.particles.push(new Particle(
                    pieceAbsoluteGx * CELL_W + CELL_W / 2,
                    (this.paddle.gridY + newRy) * CELL_H + CELL_H / 2,
                    p.color,
                    (Math.random() - 0.5) * 160,
                    (Math.random() - 0.5) * 160,
                    0.4,
                    3
                ));
            }
        }

        // Apply Cascade Gravity so all blocks settle rigidly toward floor/supporting blocks
        this.paddle.applyCascadeGravity();

        this.sound.playDock();
        this.triggerHaptic(12);
        this.currentPiece = null;

        // Check Danger Ceiling
        const highestRow = this.paddle.getHighestRow();
        if (highestRow <= CEILING_ROW) {
            this.triggerGameOver('Paddle expanded beyond structural ceiling limit!');
            return;
        }

        // Check for paddle line clear
        this.checkPaddleLineClears();
        if (this.tutorial && this.state === 'TUTORIAL') {
            this.tutorial.onPieceDocked();
        } else {
            this.spawnPiece();
        }
        this.updateHUD();
    }

    // Handle pieces that fall past the bottom without touching the paddle
    missFallingPiece() {
        if (!this.currentPiece) return;
        const blocks = this.currentPiece.getAbsoluteBlocks();
        // Dissolve particles at bottom of arena
        for (const b of blocks) {
            for (let i = 0; i < 4; i++) {
                this.particles.push(new Particle(
                    b.px + CELL_W / 2,
                    CANVAS_HEIGHT - 10,
                    this.currentPiece.color,
                    (Math.random() - 0.5) * 120,
                    -Math.random() * 80,
                    0.35,
                    2.5
                ));
            }
        }
        this.currentPiece = null;
        if (this.tutorial && this.state === 'TUTORIAL') {
            this.tutorial.onPieceMissed();
        } else {
            this.spawnPiece();
        }
    }

    checkPaddleLineClears() {
        let iterations = 0;
        while (iterations < 6) {
            iterations++;
            const rowsMap = new Map();
            for (const cell of this.paddle.cells) {
                if (!rowsMap.has(cell.ry)) rowsMap.set(cell.ry, []);
                rowsMap.get(cell.ry).push(cell);
            }

            const clearedRys = [];
            for (const [ry, rowCells] of rowsMap.entries()) {
                rowCells.sort((a, b) => a.rx - b.rx);
                
                // Calculate maximum contiguous streak without gaps
                let maxContiguous = 1;
                let currentStreak = 1;
                for (let i = 1; i < rowCells.length; i++) {
                    if (rowCells[i].rx === rowCells[i - 1].rx + 1) {
                        currentStreak++;
                    } else if (rowCells[i].rx !== rowCells[i - 1].rx) {
                        currentStreak = 1;
                    }
                    if (currentStreak > maxContiguous) maxContiguous = currentStreak;
                }

                let minRx = rowCells[0].rx;
                let maxRx = rowCells[rowCells.length - 1].rx;
                let span = maxRx - minRx + 1;
                const isFullSolidRow = (span === rowCells.length) && (span >= 7);

                // Trigger ONLY when there are 8+ connected blocks, or a completely solid row of 7+ blocks
                if (maxContiguous >= 8 || isFullSolidRow) {
                    clearedRys.push(ry);
                }
            }

            if (clearedRys.length > 0) {
                this.executeLineClear(clearedRys);
            } else {
                break;
            }
        }
    }

    executeLineClear(clearedRys) {
        this.sound.playLaser();
        this.triggerHaptic([18, 40, 25]);
        this.linesCleared += clearedRys.length;
        this.levelLinesCleared += clearedRys.length;
        this.combo += clearedRys.length;
        this.score += 500 * clearedRys.length * this.combo;

        this.updateShields();

        let leftCol = Infinity;
        let rightCol = -Infinity;

        // Remove cleared cells, protect core
        this.paddle.cells = this.paddle.cells.filter(c => {
            if (clearedRys.includes(c.ry)) {
                if (c.isCore) return true;

                const absCol = Math.round((this.paddle.x - CELL_W / 2) / CELL_W) + c.rx;
                if (absCol < leftCol) leftCol = absCol;
                if (absCol > rightCol) rightCol = absCol;

                for (let i = 0; i < 6; i++) {
                    this.particles.push(new Particle(
                        (absCol + 0.5) * CELL_W,
                        (this.paddle.gridY + c.ry + 0.5) * CELL_H,
                        '#10b981',
                        (Math.random() - 0.5) * 180,
                        (Math.random() - 0.5) * 180,
                        0.5,
                        3
                    ));
                }
                return false;
            }
            return true;
        });

        // Apply Cascade Gravity to settle any blocks above cleared lines down
        this.paddle.applyCascadeGravity();

        if (leftCol === Infinity) leftCol = 2;
        if (rightCol === -Infinity) rightCol = 9;
        leftCol = Math.max(0, leftCol);
        rightCol = Math.min(COLS - 1, rightCol);

        // Fire Laser Sweep
        this.lasers.push(new LaserBeam(leftCol, rightCol, (this.paddle.gridY) * CELL_H));

        // Clear target blocks hit by laser (shield drops if objective met)
        this.targetBlocks = this.targetBlocks.filter(b => {
            if (b.gx >= leftCol && b.gx <= rightCol) {
                // If block is still shielded, laser weakens or breaks shield
                this.score += 150 * this.combo;
                for (let p = 0; p < 6; p++) {
                    this.particles.push(new Particle(
                        b.x + b.w / 2, b.y + b.h / 2, b.color,
                        (Math.random() - 0.5) * 160, (Math.random() - 0.5) * 160, 0.4
                    ));
                }
                return false;
            }
            return true;
        });

        this.updateShields();

        // Split Balls perk
        if (this.balls.length < 5) {
            const b = this.balls[0] || new Ball(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 160, -250);
            this.balls.push(new Ball(b.x, b.y, -b.vx, b.vy * 0.9));
            this.balls.push(new Ball(b.x, b.y, b.vx * 1.2, -Math.abs(b.vy)));
        }

        if (this.tutorial && this.state === 'TUTORIAL') {
            this.tutorial.onLineClear();
        }

        if (this.targetBlocks.length === 0 && this.levelLinesCleared >= this.level && this.state === 'PLAYING') {
            this.startStageClear();
        }
    }

    loop(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        try {
            if (this.state === 'PLAYING' || this.state === 'TUTORIAL' || this.state === 'CLEARING') {
                this.update(dt);
            }
            this.render();
        } catch (err) {
            console.error('Game loop error:', err);
        }

        requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) {
        if (this.state === 'CLEARING') {
            this.clearCelebrationTimer -= dt;

            // Decelerate balls gracefully
            for (const ball of this.balls) {
                ball.vx *= Math.pow(0.5, dt * 2.5);
                ball.vy *= Math.pow(0.5, dt * 2.5);
                ball.update(dt);
            }

            // Paddle can still glide smoothly
            this.paddle.update(dt);

            // Update particles and lasers
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update(dt);
                if (this.particles[i].life <= 0) this.particles.splice(i, 1);
            }

            for (let i = this.lasers.length - 1; i >= 0; i--) {
                this.lasers[i].update(dt);
                if (this.lasers[i].life <= 0) this.lasers.splice(i, 1);
            }

            if (this.clearCelebrationTimer <= 0) {
                this.finishStageClear();
            }
            return;
        }

        // Paddle Controls
        let dir = 0;
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) dir -= 1;
        if (this.keys['ArrowRight'] || this.keys['KeyD']) dir += 1;
        this.paddle.moveDir = dir;
        this.paddle.update(dt);

        // Falling Piece update
        if (this.currentPiece && !this.ballLostState) {
            this.currentPiece.update(dt);

            const pieceBlocks = this.currentPiece.getAbsoluteBlocks();
            const paddleBoxes = this.paddle.getCellBoxes();

            let hasDocked = false;
            for (const pb of pieceBlocks) {
                for (const box of paddleBoxes) {
                    // Overlap checks
                    const isHorizontalOverlap = (pb.px < box.x + box.w - 4) && (pb.px + CELL_W > box.x + 4);
                    const isLateralTouch = (pb.px < box.x + box.w + 4) && (pb.px + CELL_W > box.x - 4);

                    // 1. Top landing: piece bottom is touching or crossing top surface of paddle box
                    const isTopLanding = isHorizontalOverlap && 
                                         (pb.py + CELL_H >= box.y) && 
                                         (pb.py + CELL_H <= box.y + 24) && 
                                         (pb.py < box.y + 4);

                    // 2. Side / Lateral collision: piece is at the same vertical level as paddle box and laterally contacted
                    const isSideCollision = isLateralTouch && 
                                            (pb.py + CELL_H > box.y + 12) && 
                                            (pb.py < box.y + box.h);

                    if (isTopLanding || isSideCollision) {
                        hasDocked = true;
                        break;
                    }
                }
                if (hasDocked) break;
            }

            if (hasDocked) {
                this.dockFallingPiece();
            } else if (this.currentPiece.y >= CANVAS_HEIGHT) {
                // Piece missed the paddle completely - dissolve into particles
                this.missFallingPiece();
            }
        }

        // Balls update and collision physics
        const paddleBoxes = this.paddle.getCellBoxes();

        for (let bi = this.balls.length - 1; bi >= 0; bi--) {
            const ball = this.balls[bi];
            ball.update(dt);

            // Wall collisions
            if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.vx = Math.abs(ball.vx);
                this.sound.playBounce(false);
            } else if (ball.x + ball.radius > CANVAS_WIDTH) {
                ball.x = CANVAS_WIDTH - ball.radius;
                ball.vx = -Math.abs(ball.vx);
                this.sound.playBounce(false);
            }

            if (ball.y - ball.radius < 0) {
                ball.y = ball.radius;
                ball.vy = Math.abs(ball.vy);
                this.sound.playBounce(false);
            } else if (ball.y + ball.radius > CANVAS_HEIGHT) {
                this.balls.splice(bi, 1);
                continue;
            }

            // Paddle Cells Collisions
            for (const box of paddleBoxes) {
                const closestX = Math.max(box.x, Math.min(ball.x, box.x + box.w));
                const closestY = Math.max(box.y, Math.min(ball.y, box.y + box.h));
                const dx = ball.x - closestX;
                const dy = ball.y - closestY;
                const distSq = dx * dx + dy * dy;

                if (distSq < ball.radius * ball.radius) {
                    let nx = dx;
                    let ny = dy;
                    const dist = Math.sqrt(distSq);

                    if (dist > 0.001) {
                        nx /= dist;
                        ny /= dist;
                    } else {
                        ny = -1;
                    }

                    // Top surface hit
                    if (ball.y < box.y + 4) {
                        ball.y = box.y - ball.radius;
                        ball.vy = -Math.abs(ball.vy);

                        // Core hit supercharges ball
                        if (box.isCore) {
                            ball.isSuperCharged = true;
                            this.sound.playLaser();
                            for (let p = 0; p < 10; p++) {
                                this.particles.push(new Particle(
                                    ball.x, ball.y, '#f43f5e',
                                    (Math.random() - 0.5) * 220,
                                    -Math.random() * 180 - 40,
                                    0.45, 3
                                ));
                            }
                        }

                        // Impart paddle momentum
                        const paddleInfluence = this.paddle.vx * 0.45;
                        ball.vx += paddleInfluence;

                        const speed = Math.hypot(ball.vx, ball.vy);
                        if (speed > 550) {
                            ball.vx = (ball.vx / speed) * 550;
                            ball.vy = (ball.vy / speed) * 550;
                        }
                    } else {
                        // Side or corner bounce
                        ball.x += nx * 2;
                        ball.y += ny * 2;
                        const dot = ball.vx * nx + ball.vy * ny;
                        ball.vx = ball.vx - 2 * dot * nx;
                        ball.vy = ball.vy - 2 * dot * ny;

                        ball.recentPaddleHits++;
                        ball.hitCoolDown = 0.5;

                        if (ball.recentPaddleHits >= 3) {
                            this.sound.playBumper();
                            ball.vx *= 1.08;
                            ball.vy *= 1.08;
                            this.score += 50 * this.combo;
                        }
                    }

                    this.sound.playBounce(true, this.combo);
                    if (this.tutorial && this.state === 'TUTORIAL') {
                        this.tutorial.onPaddleBounce();
                    }

                    for (let s = 0; s < 4; s++) {
                        this.particles.push(new Particle(
                            ball.x, ball.y, box.color,
                            (Math.random() - 0.5) * 120 + this.paddle.vx * 0.2,
                            (Math.random() - 0.5) * 120 - 40,
                            0.3, 2
                        ));
                    }
                    break;
                }
            }

            // Target Block Collisions
            for (let ti = this.targetBlocks.length - 1; ti >= 0; ti--) {
                const tb = this.targetBlocks[ti];
                const closestX = Math.max(tb.x, Math.min(ball.x, tb.x + tb.w));
                const closestY = Math.max(tb.y, Math.min(ball.y, tb.y + tb.h));
                const dx = ball.x - closestX;
                const dy = ball.y - closestY;

                if (dx * dx + dy * dy < ball.radius * ball.radius) {
                    if (Math.abs(dx) > Math.abs(dy)) {
                        ball.vx = -ball.vx;
                    } else {
                        ball.vy = -ball.vy;
                    }

                    // If block is shielded because level line clear objective is still pending
                    if (tb.isShielded) {
                        this.sound.playBounce(false);
                        // Golden shield deflection spark
                        for (let p = 0; p < 6; p++) {
                            this.particles.push(new Particle(
                                tb.x + tb.w / 2, tb.y + tb.h / 2, '#fbbf24',
                                (Math.random() - 0.5) * 160, (Math.random() - 0.5) * 160, 0.35, 2.5
                            ));
                        }
                        break;
                    }

                    const damage = ball.isSuperCharged ? 2 : 1;
                    tb.health -= damage;
                    this.sound.playBlockDestroy();

                    if (ball.isSuperCharged) {
                        ball.isSuperCharged = false;
                        for (let p = 0; p < 8; p++) {
                            this.particles.push(new Particle(
                                tb.x + tb.w / 2, tb.y + tb.h / 2, '#f43f5e',
                                (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 200, 0.4, 3
                            ));
                        }
                    }

                    if (tb.health <= 0) {
                        const hitX = tb.x + tb.w / 2;
                        const hitY = tb.y + tb.h / 2;
                        this.targetBlocks.splice(ti, 1);
                        this.score += 100 * this.combo;
                        this.updateShields();

                        if (this.tutorial && this.state === 'TUTORIAL') {
                            this.tutorial.onTargetHit();
                        }

                        if (tb.type === 'bomb') {
                            this.sound.playExplosion();
                            this.detonateBomb(tb.gx, tb.gy);
                        }

                        for (let p = 0; p < 8; p++) {
                            this.particles.push(new Particle(
                                hitX, hitY, tb.color,
                                (Math.random() - 0.5) * 160, (Math.random() - 0.5) * 160, 0.4
                            ));
                        }

                        if (this.targetBlocks.length === 0 && this.levelLinesCleared >= this.level && this.state === 'PLAYING') {
                            this.startStageClear(hitX, hitY);
                            break;
                        }
                    }
                    break;
                }
            }
        }

        // Loss condition & countdown intermission
        if (this.balls.length === 0) {
            if (this.ballLostState) {
                this.ballLostTimer -= dt;
                if (this.elLostCountdown) {
                    this.elLostCountdown.textContent = Math.max(1, Math.ceil(this.ballLostTimer));
                }

                if (this.ballLostTimer <= 0) {
                    this.ballLostState = false;
                    if (this.elBallLostBanner) this.elBallLostBanner.classList.add('hidden');
                    this.balls.push(new Ball(this.paddle.x, (this.paddle.gridY - 1) * CELL_H - 15, 120, -300));
                    this.sound.playLaunch();
                    this.triggerHaptic(15);
                }
            } else {
                if (this.state === 'TUTORIAL') {
                    // In tutorial mode, gently respawn ball after a brief pause
                    this.ballLostState = true;
                    this.ballLostTimer = 1.0;
                    if (this.elBallLostBanner) {
                        if (this.elLostRemaining) this.elLostRemaining.textContent = '∞';
                        if (this.elLostPips) this.elLostPips.innerHTML = '<span class="lost-pip active"></span>';
                        if (this.elLostCountdown) this.elLostCountdown.textContent = '1';
                        this.elBallLostBanner.classList.remove('hidden');
                    }
                } else {
                    this.lives--;
                    this.combo = 1;
                    this.updateHUD();

                    if (this.lives <= 0) {
                        this.triggerGameOver('All balls lost. Mission terminated.');
                        return;
                    } else {
                        this.ballLostState = true;
                        this.ballLostTimer = 2.0;
                        this.sound.playMiss();
                        this.triggerHaptic([30, 80, 40]);

                        if (this.elBallLostBanner) {
                            if (this.elLostRemaining) this.elLostRemaining.textContent = this.lives;
                            if (this.elLostPips) {
                                this.elLostPips.innerHTML = '';
                                for (let i = 0; i < 3; i++) {
                                    const pip = document.createElement('span');
                                    pip.className = 'lost-pip' + (i < this.lives ? ' active' : '');
                                    this.elLostPips.appendChild(pip);
                                }
                            }
                            if (this.elLostCountdown) this.elLostCountdown.textContent = '2';
                            this.elBallLostBanner.classList.remove('hidden');
                        }
                    }
                }
            }
        }

        if (this.targetBlocks.length === 0 && this.levelLinesCleared >= this.level && this.state === 'PLAYING') {
            this.startStageClear();
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }

        for (let i = this.lasers.length - 1; i >= 0; i--) {
            this.lasers[i].update(dt);
            if (this.lasers[i].life <= 0) this.lasers.splice(i, 1);
        }

        this.updateHUD();
    }

    detonateBomb(bgx, bgy) {
        let lastX = CANVAS_WIDTH / 2;
        let lastY = 140;
        this.targetBlocks = this.targetBlocks.filter(b => {
            if (Math.abs(b.gx - bgx) <= 1 && Math.abs(b.gy - bgy) <= 1 && !b.isShielded) {
                this.score += 150 * this.combo;
                lastX = b.x + b.w / 2;
                lastY = b.y + b.h / 2;
                for (let p = 0; p < 6; p++) {
                    this.particles.push(new Particle(
                        lastX, lastY, '#f43f5e',
                        (Math.random() - 0.5) * 180, (Math.random() - 0.5) * 180, 0.45
                    ));
                }
                return false;
            }
            return true;
        });
        this.updateShields();

        if (this.targetBlocks.length === 0 && this.levelLinesCleared >= this.level && this.state === 'PLAYING') {
            this.startStageClear(lastX, lastY);
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Clean subtle background grid
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;
        for (let c = 0; c <= COLS; c++) {
            ctx.beginPath();
            ctx.moveTo(c * CELL_W, 0);
            ctx.lineTo(c * CELL_W, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let r = 0; r <= ROWS; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * CELL_H);
            ctx.lineTo(CANVAS_WIDTH, r * CELL_H);
            ctx.stroke();
        }

        // Danger Threshold Line (Clean dashed line)
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, DANGER_ROW * CELL_H);
        ctx.lineTo(CANVAS_WIDTH, DANGER_ROW * CELL_H);
        ctx.stroke();

        ctx.fillStyle = 'rgba(244, 63, 94, 0.6)';
        ctx.font = '600 9px sans-serif';
        ctx.fillText('COLLAPSE THRESHOLD', 12, DANGER_ROW * CELL_H - 5);
        ctx.restore();

        // Target Blocks
        for (const tb of this.targetBlocks) {
            tb.draw(ctx);
        }

        // Lasers
        for (const laser of this.lasers) {
            laser.draw(ctx);
        }

        // Falling Tetromino Piece & Unified Rigid Projection
        if (this.currentPiece) {
            const blocks = this.currentPiece.getAbsoluteBlocks();
            const paddleBoxes = this.paddle.getCellBoxes();

            // Calculate unified rigid landing drop distance for the ENTIRE tetromino
            let minDropDistance = CANVAS_HEIGHT;
            let hasPaddleObstacle = false;

            for (const b of blocks) {
                for (const box of paddleBoxes) {
                    // Check if box is directly beneath block b with horizontal overlap (6px tolerance)
                    if (b.px < box.x + box.w - 6 && b.px + CELL_W > box.x + 6) {
                        if (box.y >= b.py + CELL_H) {
                            const dist = box.y - (b.py + CELL_H);
                            if (dist < minDropDistance) {
                                minDropDistance = dist;
                                hasPaddleObstacle = true;
                            }
                        }
                    }
                }
            }

            // If no paddle block below, project drop to screen floor
            if (!hasPaddleObstacle) {
                let maxBottom = 0;
                for (const b of blocks) {
                    if (b.py + CELL_H > maxBottom) maxBottom = b.py + CELL_H;
                }
                minDropDistance = CANVAS_HEIGHT - maxBottom;
            }

            ctx.save();
            // Subtle vertical drop guidelines from piece to ghost landing
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.setLineDash([2, 4]);
            ctx.lineWidth = 1;

            for (const b of blocks) {
                const landingTop = b.py + minDropDistance;
                ctx.beginPath();
                ctx.moveTo(b.px + CELL_W / 2, b.py + CELL_H);
                ctx.lineTo(b.px + CELL_W / 2, landingTop);
                ctx.stroke();
            }

            // Unified rigid ghost outline (never split or broken)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.strokeStyle = this.currentPiece.color;
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1.5;

            const pad = 2.5;
            const radius = 5;
            for (const b of blocks) {
                const rx = b.px + pad;
                const ry = b.py + minDropDistance + pad;
                const rw = CELL_W - pad * 2;
                const rh = CELL_H - pad * 2;

                ctx.beginPath();
                ctx.moveTo(rx + radius, ry);
                ctx.lineTo(rx + rw - radius, ry);
                ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
                ctx.lineTo(rx + rw, ry + rh - radius);
                ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
                ctx.lineTo(rx + radius, ry + rh);
                ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
                ctx.lineTo(rx, ry + radius);
                ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();

            // Falling piece blocks
            for (const b of blocks) {
                ctx.save();
                ctx.fillStyle = this.currentPiece.color;
                const pad = 2;
                const rx = b.px + pad;
                const ry = b.py + pad;
                const rw = CELL_W - pad * 2;
                const rh = CELL_H - pad * 2;
                const radius = 5;

                ctx.beginPath();
                ctx.moveTo(rx + radius, ry);
                ctx.lineTo(rx + rw - radius, ry);
                ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radius);
                ctx.lineTo(rx + rw, ry + rh - radius);
                ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radius, ry + rh);
                ctx.lineTo(rx + radius, ry + rh);
                ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radius);
                ctx.lineTo(rx, ry + radius);
                ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }
        }

        // Paddle
        this.paddle.draw(ctx);

        // Ready ball attached to paddle during ball respawn intermission
        if (this.ballLostState) {
            ctx.save();
            const launchX = this.paddle.x;
            const launchY = (this.paddle.gridY - 1) * CELL_H - 15;
            const pulse = Math.sin(performance.now() * 0.012) * 2;

            // Soft cyan aura
            ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
            ctx.beginPath();
            ctx.arc(launchX, launchY, 14 + pulse, 0, Math.PI * 2);
            ctx.fill();

            // Ball body
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(launchX, launchY, 7, 0, Math.PI * 2);
            ctx.fill();

            // Ring outline
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        }

        // Balls
        for (const ball of this.balls) {
            ball.draw(ctx);
        }

        // Particles
        for (const p of this.particles) {
            p.draw(ctx);
        }

        // In-Arena Stage Cleared Celebratory Accolade Banner
        if (this.state === 'CLEARING') {
            ctx.save();
            const elapsed = Math.max(0, 1.35 - this.clearCelebrationTimer);
            const progress = Math.min(1, elapsed / 0.22);
            const alpha = Math.min(1, progress * 1.2);
            const scale = 0.88 + 0.12 * Math.min(1, progress);

            ctx.translate(CANVAS_WIDTH / 2, 170);
            ctx.scale(scale, scale);

            const cardW = 280;
            const cardH = 74;
            ctx.fillStyle = `rgba(15, 23, 42, ${0.92 * alpha})`;
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.85 * alpha})`;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = 'rgba(16, 185, 129, 0.45)';
            ctx.shadowBlur = 18;

            if (ctx.roundRect) {
                ctx.beginPath();
                ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
                ctx.strokeRect(-cardW / 2, -cardH / 2, cardW, cardH);
            }

            ctx.shadowBlur = 0;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.fillText('SECTOR CLEARED!', 0, -12);

            ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * alpha})`;
            ctx.fillText(`+${(2000 * this.level).toLocaleString()} BONUS POINTS`, 0, 14);

            ctx.restore();
        }

        // Paused Overlay
        if (this.state === 'PAUSED') {
            ctx.save();
            ctx.fillStyle = 'rgba(11, 15, 25, 0.75)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);

            ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('Press P or ESC to Resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 22);
            ctx.restore();
        }
    }
}

// Start on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});
