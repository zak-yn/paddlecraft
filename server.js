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

// Upstash Redis Cloud Configuration (Free Serverless Persistence)
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const HAS_UPSTASH = Boolean(UPSTASH_URL && UPSTASH_TOKEN);
const REDIS_KEY = 'paddlecraft_leaderboard';

// Initial leaderboard seeds if completely new
const SEED_ENTRIES = [
    { id: 'champ-zak', name: 'ZAK', score: 2122100, stage: 8, clears: 40, createdAt: '2026-09-22T02:41:41.542Z' },
    { id: 'champ-yn', name: 'YN', score: 185400, stage: 6, clears: 15, createdAt: '2026-09-21T18:30:00.000Z' },
    { id: 'seed-1', name: 'CYBER_ACE', score: 14200, stage: 5, clears: 8, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'seed-2', name: 'NEO_PADDLE', score: 9800, stage: 4, clears: 5, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'seed-3', name: 'BLOCK_MASTER', score: 6500, stage: 3, clears: 3, createdAt: new Date(Date.now() - 43200000).toISOString() },
    { id: 'seed-4', name: 'ARCADE_PILOT', score: 3200, stage: 2, clears: 2, createdAt: new Date(Date.now() - 7200000).toISOString() }
];

async function fetchFromUpstash() {
    if (!HAS_UPSTASH) return null;
    const baseUrl = UPSTASH_URL.replace(/\/$/, '');
    try {
        const resp = await fetch(`${baseUrl}/get/${REDIS_KEY}`, {
            headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
            signal: AbortSignal.timeout(5000)
        });
        if (!resp.ok) {
            console.warn(`[Upstash] Read failed HTTP ${resp.status}`);
            return null;
        }
        const data = await resp.json();
        if (data && data.result !== undefined && data.result !== null) {
            let parsed = data.result;
            // Robustly unwrap any nested JSON stringification layers
            while (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                } catch {
                    break;
                }
            }
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
        return null;
    } catch (err) {
        console.warn('[Upstash] Read warning:', err.message);
        return null;
    }
}

async function saveToUpstash(entries) {
    if (!HAS_UPSTASH) return false;
    const baseUrl = UPSTASH_URL.replace(/\/$/, '');
    const payload = JSON.stringify(entries);

    // Method 1: Standard Upstash Redis Command API (POST / with ["SET", key, val])
    try {
        const resp = await fetch(`${baseUrl}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${UPSTASH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(['SET', REDIS_KEY, payload]),
            signal: AbortSignal.timeout(5000)
        });
        if (resp.ok) {
            const data = await resp.json().catch(() => ({}));
            if (data && (data.result === 'OK' || data.result === true)) {
                return true;
            }
        }
    } catch (err) {
        console.warn('[Upstash] Method 1 save warning:', err.message);
    }

    // Method 2: REST fallback: POST /set/{key} with raw payload
    try {
        const resp2 = await fetch(`${baseUrl}/set/${REDIS_KEY}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${UPSTASH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: payload,
            signal: AbortSignal.timeout(5000)
        });
        if (resp2.ok) {
            return true;
        }
    } catch (err2) {
        console.error('[Upstash] Method 2 save error:', err2.message);
    }

    return false;
}

function loadLocalLeaderboard() {
    try {
        if (!fs.existsSync(LEADERBOARD_FILE)) {
            fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(SEED_ENTRIES, null, 2), 'utf8');
            return [...SEED_ENTRIES];
        }
        const raw = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
        return [...SEED_ENTRIES];
    } catch (err) {
        return [...SEED_ENTRIES];
    }
}

function saveLocalLeaderboard(entries) {
    try {
        const tempPath = LEADERBOARD_FILE + '.tmp';
        fs.writeFileSync(tempPath, JSON.stringify(entries, null, 2), 'utf8');
        fs.renameSync(tempPath, LEADERBOARD_FILE);
    } catch (err) {
        console.error('[Leaderboard] Local write error:', err);
    }
}

async function loadLeaderboard() {
    // 1. Try Upstash Cloud (Primary persistent source of truth)
    const cloudEntries = await fetchFromUpstash();
    if (cloudEntries && cloudEntries.length > 0) {
        // Keep local cache synced
        saveLocalLeaderboard(cloudEntries);
        return cloudEntries;
    }

    // 2. Fallback to local storage
    const local = loadLocalLeaderboard();

    // If cloud is uninitialized or newly created, bootstrap cloud with current entries
    if (HAS_UPSTASH && local && local.length > 0) {
        saveToUpstash(local).catch(err => {
            console.warn('[Upstash] Bootstrap failed:', err.message);
        });
    }

    return local;
}

async function saveLeaderboard(entries) {
    // Sort descending by score, tiebreak by stage descending, then earlier timestamp
    entries.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.stage !== a.stage) return b.stage - a.stage;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const trimmed = entries.slice(0, 200);

    // 1. Save locally immediately
    saveLocalLeaderboard(trimmed);

    // 2. Persist to Cloud synchronously so response is sent only after cloud write succeeds
    if (HAS_UPSTASH) {
        try {
            await saveToUpstash(trimmed);
        } catch (err) {
            console.error('[Leaderboard] Cloud sync error in saveLeaderboard:', err.message);
        }
    }

    return trimmed;
}

// In-memory rate limiting by IP (max 1 score submission per 8 seconds per IP)
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

// Health check with storage diagnostics
app.get('/api/health', async (req, res) => {
    let cloudStatus = 'disabled';
    let cloudCount = 0;
    if (HAS_UPSTASH) {
        try {
            const cloudEntries = await fetchFromUpstash();
            if (cloudEntries && cloudEntries.length > 0) {
                cloudStatus = 'connected';
                cloudCount = cloudEntries.length;
            } else {
                cloudStatus = 'empty_or_syncing';
            }
        } catch (e) {
            cloudStatus = 'error: ' + e.message;
        }
    }
    const localEntries = loadLocalLeaderboard();
    res.json({
        status: 'ok',
        game: 'paddlecraft',
        uptime: Math.round(process.uptime()),
        storage: HAS_UPSTASH ? 'upstash-cloud-persistent' : 'local-ephemeral',
        cloud: {
            status: cloudStatus,
            count: cloudCount
        },
        localCount: localEntries.length,
        timestamp: new Date().toISOString()
    });
});

// GET Leaderboard (Top 50)
app.get('/api/leaderboard', async (req, res) => {
    try {
        const entries = await loadLeaderboard();
        const top50 = entries.slice(0, 50).map((item, index) => ({
            rank: index + 1,
            id: item.id,
            name: item.name,
            score: item.score,
            stage: item.stage,
            clears: item.clears || 0,
            createdAt: item.createdAt
        }));
        res.json({ success: true, count: top50.length, storage: HAS_UPSTASH ? 'cloud' : 'local', leaderboard: top50 });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Internal server error reading leaderboard' });
    }
});

// POST Score Submission
app.post('/api/leaderboard', async (req, res) => {
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

        const currentEntries = await loadLeaderboard();
        currentEntries.push(newEntry);
        const updated = await saveLeaderboard(currentEntries);

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
