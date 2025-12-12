const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const APP_IDS = [
    { name: 'Default (G6/G7)', id: 'd89443d2-327c-4a6f-89e5-496bbb0317db' },
    { name: 'Alternative (ONE)', id: 'd8665bf2-6648-436f-b4cb-0da765e64887' }
];

const ENDPOINTS = [
    { name: 'US (share2)', host: 'share2.dexcom.com' },
    { name: 'US (share1)', host: 'share1.dexcom.com' },
    { name: 'OUS (Outside US)', host: 'shareous1.dexcom.com' }
];

const PAYLOAD_VARIANTS = [
    { name: 'camelCase', keys: { user: 'accountName', pass: 'password', app: 'applicationId' } },
    { name: 'PascalCase', keys: { user: 'AccountName', pass: 'Password', app: 'ApplicationId' } }
];

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function testLogin(regionName, hostname, appIdName, appId, username, password, variantName, variantKeys) {
    return new Promise((resolve) => {
        console.log(`[${regionName}] Testing ${appIdName} on ${hostname} (${variantName})...`);

        const payload = {};
        payload[variantKeys.user] = username;
        payload[variantKeys.pass] = password;
        payload[variantKeys.app] = appId;

        const data = JSON.stringify(payload);

        const options = {
            hostname: hostname,
            port: 443,
            path: '/ShareWebServices/Services/General/LoginPublisherAccountByName',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'Accept': 'application/json',
                'User-Agent': 'Dexcom Share/3.0.4.11 CFNetwork/1121.2.2 Darwin/19.6.0'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                // Remove quotes from UUID string
                const rawBody = body;
                const sessionId = body.replace(/"/g, '');

                if (res.statusCode !== 200) {
                    // Try to parse error message if possible
                    console.log(`   -> Failed: HTTP ${res.statusCode} (Body: ${rawBody.substring(0, 50)})`);
                    resolve(null);
                    return;
                }

                if (sessionId === '00000000-0000-0000-0000-000000000000') {
                    console.log(`   -> Failed: Zeroed Session (Invalid Credentials specific to this App ID)`);
                    resolve(null);
                } else {
                    console.log(`   -> SUCCESS! Session ID: ${sessionId.substring(0, 8)}...`);
                    resolve(sessionId);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`   -> Network Error: ${e.message}`);
            resolve(null);
        });

        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('--- Dexcom Share Connection Diagnoser v2 ---');
    console.log('This script will test your credentials against US/OUS servers AND alternative App IDs.\n');

    const username = await question('Dexcom Username: ');
    const password = await question('Dexcom Password: ');

    console.log('\n----------------------------------------');

    let success = false;
    let validConfig = null;

    for (const region of ENDPOINTS) {
        for (const appId of APP_IDS) {
            for (const variant of PAYLOAD_VARIANTS) {
                const sid = await testLogin(region.name, region.host, appId.name, appId.id, username, password, variant.name, variant.keys);
                if (sid) {
                    success = true;
                    validConfig = { region: region.name, appId: appId.name, sid, variant: variant.name };
                    break;
                }
            }
            if (success) break;
        }
        if (success) break;
    }

    console.log('\n----------------------------------------');
    console.log('SUMMARY:');

    if (success) {
        console.log(`✅ CONNECTED SUCCESSFULLY!`);
        console.log(`Region: ${validConfig.region}`);
        console.log(`App ID: ${validConfig.appId}`);
        console.log(`Payload Style: ${validConfig.variant}`);
        console.log(`\nNOTE: You may need to update the server code if it uses a different payload style.`);
    } else {
        console.log(`❌ FAILED on all combinations.`);
        console.log(`\nTROUBLESHOOTING STEPS:`);
        console.log(`1. **CRITICAL**: Log in to the Dexcom app on your phone.`);
        console.log(`2. Go to the "Share" tab (triangle icon).`);
        console.log(`3. Ensure "Share" is turned ON and you have at least ONE follower (even if it's yourself on another email).`);
        console.log(`   - The Dexcom Share API often BLOCKS logins if the Share feature is not active/setup.`);
        console.log(`4. If you have a separate "Username" (set in profile) vs "Email", try BOTH.`);
        console.log(`5. If you use "Dexcom ONE", this API might not work as it uses a different backend.`);
        console.log(`6. Verify your password on https://clarity.dexcom.com to be 100% sure.`);
    }

    rl.close();
}

main();
