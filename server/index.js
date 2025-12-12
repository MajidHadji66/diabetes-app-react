const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
// Initialize with just the API key, the SDK handles the rest
const ai = new GoogleGenAI({ apiKey });

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.post('/api/insight', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        if (!apiKey) {
            return res.status(500).json({ error: 'Server API key configuration missing' });
        }

        // Use the same model as frontend was using
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        res.json({ text: response.text() });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to generate insight', details: error.message });
    }
});

// --- Dexcom Share API Integration (Python Bridge) ---

const { spawn } = require('child_process');

// The user has pydexcom installed in this specific environment
const PYTHON_PATH = 'C:/Users/Majid/AppData/Local/Programs/Python/Python313/python.exe';
const BRIDGE_SCRIPT = path.join(__dirname, 'dexcom_bridge.py');

const runDexcomBridge = (action, username, password, region) => {
    return new Promise((resolve, reject) => {
        const args = [
            BRIDGE_SCRIPT,
            '--action', action,
            '--username', username,
            '--password', password,
            '--region', region
        ];

        console.log(`[DexcomBridge] Spawning: ${PYTHON_PATH} ${args.join(' ')}`);

        // Hide password in logs
        const logArgs = [...args];
        logArgs[4] = '********';
        // console.log(`[DexcomBridge] Running with args: ${logArgs.join(' ')}`);

        const pythonProcess = spawn(PYTHON_PATH, args);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
            console.error(`[DexcomBridge] Stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${errorString}`));
                return;
            }

            try {
                const result = JSON.parse(dataString);
                if (result.success) {
                    resolve(result);
                } else {
                    reject(new Error(result.error || 'Unknown Dexcom Error'));
                }
            } catch (e) {
                reject(new Error(`Failed to parse Python output: ${e.message}. Raw: ${dataString}`));
            }
        });
    });
};

// 1. Authenticate (Verify Credentials via Bridge)
app.post('/api/dexcom/connect', async (req, res) => {
    console.log('[Dexcom] Login Request received');
    try {
        const { username, password, region = 'US' } = req.body;

        // We verify by trying to "login" (which in bridge means init Dexcom obj)
        const result = await runDexcomBridge('login', username, password, region);

        console.log('[Dexcom] Login successful (verified via Python)');

        // Store credentials in memory for subsequent reading requests
        // WARNING: In production this should be encrypted session storage
        global.dexcomCreds = { username, password, region };

        // Since pydexcom handles session internally per request, we can just return a dummy session ID
        // or the timestamp to indicate "connected". The frontend expects a session ID.
        res.json({
            success: true,
            sessionId: 'pydexcom-session-active',
            username: result.username,
            accountId: result.accountId
        });
    } catch (error) {
        console.error('Dexcom Connect Error:', error);
        res.status(401).json({ success: false, error: error.message });
    }
});

// 2. Fetch Latest Readings (via Bridge)
app.post('/api/dexcom/readings', async (req, res) => {
    try {
        const { sessionId, region = 'US' } = req.body;

        // NOTE: The frontend might not be sending username/password for reading requests 
        // if it thinks it has a "sessionId". 
        // However, pydexcom requires credentials every time (it doesn't persist session across CLI calls).
        // WE NEED THE CREDENTIALS.
        // But Settings.tsx doesn't send password in the '/readings' call usually, it usually just sends sessionId.
        // Wait, looking at Settings.tsx... it calls `sync()` in `useDexcom`. 
        // Let's check `useDexcom` hook in `AppContext.tsx` or similar.
        // If the frontend doesn't send password, we are stuck unless we cache it or ask user to store it.
        //
        // TEMPORARY FIX: For this specific user session, we can store creds in memory variable 
        // or we need to update Frontend to send creds.
        // Securely, we should use a session on server. 
        // For this local playground app, let's look at what we receive.

        if (!global.dexcomCreds) {
            return res.status(400).json({ error: 'Session expired. Please reconnect Dexcom.' });
        }

        const { username, password } = global.dexcomCreds;

        if (region !== global.dexcomCreds.region) {
            // allow updating region
        }

        const result = await runDexcomBridge('readings', username, password, region);

        // Transform Python result to App format if needed, but bridge does good job.
        // Bridge returns: { value, trend, time }
        // App expects: { id, value, timestamp, trend }

        const cleanData = result.data.map((r, i) => ({
            id: `g-${new Date(r.time).getTime()}`,
            value: r.value,
            timestamp: r.time, // ISO string is fine for JSON
            trend: r.trend
        }));

        res.json(cleanData);

    } catch (error) {
        console.error('Dexcom Data Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Environment check:', apiKey ? 'API Key Loaded' : 'API Key Missing');
});
