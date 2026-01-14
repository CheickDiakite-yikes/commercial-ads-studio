
import { generateCharacterPortrait } from './server/src/services/gemini';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env parsing
const envPath = path.resolve(__dirname, 'server/.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

async function testReferenceFlow() {
    console.log("Testing Character Portrait Generation...");
    const description = "A rugged astronaut with a scar on his cheek, 40s, intense blue eyes, wearing weathered space gear.";

    try {
        const portrait = await generateCharacterPortrait(description);
        if (portrait && portrait.length > 100) {
            console.log("PASS: Portrait Generated successfully.");
            console.log("Portrait Data Length:", portrait.length);
        } else {
            console.error("FAIL: Portrait generation failed or empty.");
        }
    } catch (e) {
        console.error("Test Error:", e);
    }
}

testReferenceFlow();
