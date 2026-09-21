const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial leaderboard seeds if completely new
const SEED_ENTRIES = [
    { id: 'seed-1', name: 'CYBER_ACE', score: 14200, stage: 5, clears: 8, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'seed-2', name: 'NEO_PADDLE', score: 9800, stage: 4, clears: 5, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'seed-3', name: 'BLOCK_MASTER', score: 6500, stage: 3, clears: 3, createdAt: new Date(Date.now() - 43200000).toISOString() },
    { id: 'seed-4', name: 'ARCADE_PILOT', score: 3200, stage: 2, clears: 2, createdAt: new Date(Date.now() - 7200000).toISOString() }
];

function loadLeaderboard() {
    try {
        if (!fs.existsSync(LEADERBOARD_FILE)) {
            fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(SEED_ENTRIES, null, 2), 'utf8');
            return [...SEED_ENTRIES];
        }
        const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [...SEED_ENTRIES];
    } catch (err) {
        console.error('[Leaderboard] Error loading file:', err);
        return [...SEED_ENTRIES];
    }
}

function saveLeaderboard(entries) {
    try {
        // Sort descending by score, tiebreak by stage descending, then earlier timestamp
        entries.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.stage !== a.stage) return b.stage - a.stage;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        // Retain top 200 entries
        const trimmed = entries.slice(0, 200);

        // Atomic write
        const tempPath = LEADERBOARD_FILE + '.tmp';
        fs.writeFileSync(tempPath, JSON.stringify(trimmed, null, 2), 'utf8');
        fs.renameSync(tempPath, LEADERBOARD_FILE);
        return trimmed;
    } catch (err) {
        console.error('[Leaderboard] Error saving file:', err);
        return entries;
    }
}

// In-memory rate limiting by IP (max 1 score submission per 10 seconds per IP)
const ipRateMap = new Map();
setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamp] of ipRateMap.entries()) {
        if (now - timestamp > 60000) {
            ipRateMap.delete(ip);
        }
    }
}, 30000);

app.use(cors());
app.use(express.json({ limit: '64kb' }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        game: 'paddlecraft',
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

// GET Leaderboard (Top 50)
app.get('/api/leaderboard', (req, res) => {
    try {
        const entries = loadLeaderboard();
        const top50 = entries.slice(0, 50).map((item, index) => ({
            rank: index + 1,
            id: item.id,
            name: item.name,
            score: item.score,
            stage: item.stage,
            clears: item.clears || 0,
            createdAt: item.createdAt
        }));
        res.json({ success: true, count: top50.length, leaderboard: top50 });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Internal server error reading leaderboard' });
    }
});

// POST Score Submission
app.post('/api/leaderboard', (req, res) => {
    try {
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
        const now = Date.now();

        // Rate limit check
        const lastSubmit = ipRateMap.get(clientIp);
        if (lastSubmit && now - lastSubmit < 8000) {
            return res.status(429).json({
                success: false,
                error: 'Please wait a few seconds before submitting another score.'
            });
        }

        const { name, score, stage, clears } = req.body || {};

        // Validation: Call sign / Name
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ success: false, error: 'Callsign / Nickname is required.' });
        }

        // Sanitize name: alphanumeric, spaces, hyphens, underscores, 2-15 chars
        const sanitizedName = name
            .replace(/[<>'"]/g, '')
            .trim()
            .slice(0, 15);

        if (sanitizedName.length < 2) {
            return res.status(400).json({ success: false, error: 'Callsign must be at least 2 characters.' });
        }

        // Validation: Score
        const parsedScore = parseInt(score, 10);
        if (isNaN(parsedScore) || parsedScore <= 0 || parsedScore > 5000000) {
            return res.status(400).json({ success: false, error: 'Invalid game score.' });
        }

        // Validation: Stage
        const parsedStage = parseInt(stage, 10);
        const validStage = (!isNaN(parsedStage) && parsedStage >= 1 && parsedStage <= 100) ? parsedStage : 1;

        // Validation: Clears
        const parsedClears = parseInt(clears, 10);
        const validClears = (!isNaN(parsedClears) && parsedClears >= 0 && parsedClears <= 1000) ? parsedClears : 0;

        // Update rate limiter
        ipRateMap.set(clientIp, now);

        const newEntry = {
            id: 'pc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            name: sanitizedName,
            score: parsedScore,
            stage: validStage,
            clears: validClears,
            createdAt: new Date().toISOString()
        };

        const currentEntries = loadLeaderboard();
        currentEntries.push(newEntry);
        const updated = saveLeaderboard(currentEntries);

        // Find rank of the newly added item
        const rankIndex = updated.findIndex(e => e.id === newEntry.id);
        const userRank = rankIndex !== -1 ? rankIndex + 1 : null;

        const top50 = updated.slice(0, 50).map((item, index) => ({
            rank: index + 1,
            id: item.id,
            name: item.name,
            score: item.score,
            stage: item.stage,
            clears: item.clears || 0,
            createdAt: item.createdAt
        }));

        res.json({
            success: true,
            rank: userRank,
            entry: newEntry,
            leaderboard: top50
        });
    } catch (err) {
        console.error('[Leaderboard] Submission error:', err);
        res.status(500).json({ success: false, error: 'Failed to process score submission.' });
    }
});

// Serve static frontend assets
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for root / unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`[PaddleCraft] Server running on port ${PORT}`);
    console.log(`[PaddleCraft] Leaderboard API ready at http://localhost:${PORT}/api/leaderboard`);
});
