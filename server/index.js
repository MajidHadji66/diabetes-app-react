const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
// Initialize with just the API key, the SDK handles the rest
const ai = new GoogleGenAI({ apiKey });

// Add root route to verify server status
app.get('/', (req, res) => {
    res.send('DiaSync API Server is running. Access API at /api/health');
});

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

// --- Dexcom Share API Integration (Node.js) ---
const Client = require('./dexcom');

// Helper to get authenticated client
const getAuthenticatedClient = async (username, password, region) => {
    const isOUS = region === 'OUS' || region === 'ous';
    const client = new Client(isOUS);
    try {
        await client.login(username, password);
        return client;
    } catch (error) {
        throw new Error(`Dexcom Login Failed: ${error.message}`);
    }
};

// --- Credential Persistence ---
const CREDS_FILE = path.join(__dirname, '.dexcom-creds.json');

function loadCreds() {
    try {
        if (fs.existsSync(CREDS_FILE)) {
            const data = fs.readFileSync(CREDS_FILE, 'utf8');
            global.dexcomCreds = JSON.parse(data);
            console.log('Loaded Dexcom credentials from file.');
        }
    } catch (err) {
        console.error('Failed to load credentials:', err);
    }
}

function saveCreds(creds) {
    try {
        fs.writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2));
        console.log('Saved Dexcom credentials to file.');
    } catch (err) {
        console.error('Failed to save credentials:', err);
    }
}

// Load on startup
loadCreds();

// --- API Routes ---

// 1. Authenticate (Verify Credentials)
app.post('/api/dexcom/connect', async (req, res) => {
    try {
        const { username, password, region = 'US' } = req.body;
        console.log(`Attempting Dexcom connection for user: ${username} (${region})`);

        const client = await getAuthenticatedClient(username, password, region);

        console.log('Dexcom Login Successful');

        // Store credentials in memory AND file for persistence
        const newCreds = { username, password, region };
        global.dexcomCreds = newCreds;
        saveCreds(newCreds);

        res.json({
            success: true,
            sessionId: client.sessionId,
            username: username
        });
    } catch (error) {
        console.error('Dexcom Connect Error:', error);
        res.status(401).json({ success: false, error: error.message });
    }
});

// 2. Fetch Latest Readings
app.post('/api/dexcom/readings', async (req, res) => {
    try {
        // We rely on stored credentials because we need to re-authenticate 
        // to get a fresh client instance (or we could cache the client, but simple is better).
        if (!global.dexcomCreds) {
            return res.status(400).json({ error: 'Session expired. Please reconnect Dexcom.' });
        }

        const { username, password, region } = global.dexcomCreds;

        // Re-authenticate to ensure valid session
        // (In a prod app, we'd reuse the session ID until it expires, but this library is simple)
        const client = await getAuthenticatedClient(username, password, region);

        // fetchReadings(maxAge, maxCount)
        const readings = await client.fetchReadings(1440, 288);

        // Transform to App format: { id, value, timestamp, trend }
        // Library returns: { trend: { name, desc, arrow }, mgdl, mmol, time }
        const cleanData = readings.map(r => ({
            id: `g-${new Date(r.time).getTime()}`,
            value: r.mgdl,
            timestamp: r.time.toISOString(),
            trend: r.trend.desc // using description ('steady', 'rising', etc.) or arrow
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
