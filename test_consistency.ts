
import { generateAdPlan } from './server/src/services/gemini';
import { ProjectSettings, ReferenceFile, ProjectMode, AspectRatio, TTSVoice } from './server/src/types';
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
} else {
    console.warn("Warning: .env file not found at " + envPath);
}

async function testCharacterConsistency() {
    console.log("Starting Character Consistency Test...");

    const mockSettings: ProjectSettings = {
        mode: 'Commercial' as ProjectMode,
        aspectRatio: AspectRatio.SixteenNine,
        useTextOverlays: 'yes',
        customScript: '',
        musicTheme: 'Upbeat',
        preferredVoice: TTSVoice.Puck
    };

    const mockPrompt = "create a funny fun ad, gen-z style 'spend a mindful morning with me'. use a beautiful woman in her mid twenties. make sure this video is perfect with perfect consistency of the charcter used.";

    try {
        const plan = await generateAdPlan(mockPrompt, mockSettings, []);

        console.log("\n--- Master Character Profile ---");
        const profile = plan.masterCharacterProfile;
        console.log(profile);

        const wordCount = profile ? profile.split(/\s+/).length : 0;
        console.log(`\nWord Count: ${wordCount}`);

        if (wordCount < 200) {
            console.error("FAIL: Character profile is too short.");
        } else {
            console.log("PASS: Character profile is sufficiently detailed.");
        }

        console.log("\n--- Checking Scenes ---");
        plan.scenes.forEach((scene: any, i: number) => {
            const sceneDesc = scene.character.description;
            if (sceneDesc !== profile) { // It might be slightly different if the model hallucinates, but we asked it to copy verbatim.
                console.log(`Scene ${i + 1} Description matches master: ${sceneDesc === profile}`);
                if (sceneDesc.length < 100) console.error(`FAIL: Scene ${i + 1} description is too short!`);
            }
        });

    } catch (e) {
        console.error("Test Failed", e);
    }
}

testCharacterConsistency();
