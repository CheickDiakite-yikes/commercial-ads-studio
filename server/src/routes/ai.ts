import { Router } from 'express';
import { generateAdPlan, generateStoryboardImage, generateVideoClip, generateVoiceover, sendChatMessage, generateMusic } from '../services/gemini';
import { saveAsset } from '../services/storage';

const router = Router();

router.post('/chat', async (req, res) => {
    try {
        const { history, message, attachments, project } = req.body;
        const response = await sendChatMessage(history, message, attachments, project);
        res.json({ text: response });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Chat failed' });
    }
});

router.post('/generate/plan', async (req, res) => {
    try {
        const { prompt, settings, referenceFiles } = req.body;
        const plan = await generateAdPlan(prompt, settings, referenceFiles);
        res.json(plan);
    } catch (error) {
        console.error('Plan generation error:', error);
        res.status(500).json({ error: 'Plan generation failed' });
    }
});

router.post('/generate/storyboard', async (req, res) => {
    try {
        const { scene, aspectRatio, visualAnchorDataUrl, userId, projectId } = req.body;
        const dataUrl = await generateStoryboardImage(scene, aspectRatio, visualAnchorDataUrl);

        if (!dataUrl) {
            return res.status(500).json({ error: 'Storyboard generation failed' });
        }

        // Save to disk if userId and projectId provided
        if (userId && projectId) {
            const fileUrl = saveAsset(dataUrl, userId, projectId, 'storyboard');
            if (fileUrl) {
                return res.json({ url: fileUrl });
            }
        }

        // Fallback to data URL if no userId/projectId
        res.json({ url: dataUrl });
    } catch (error) {
        console.error('Storyboard error:', error);
        res.status(500).json({ error: 'Storyboard generation failed' });
    }
});

router.post('/generate/video', async (req, res) => {
    try {
        const { scene, aspectRatio, sourceImageDataUrl, userId, projectId } = req.body;
        const dataUrl = await generateVideoClip(scene, aspectRatio, sourceImageDataUrl);

        if (!dataUrl) {
            return res.status(500).json({ error: 'Video generation failed' });
        }

        // Save to disk if userId and projectId provided
        if (userId && projectId) {
            const fileUrl = saveAsset(dataUrl, userId, projectId, 'video');
            if (fileUrl) {
                return res.json({ url: fileUrl });
            }
        }

        // Fallback to data URL
        res.json({ url: dataUrl });
    } catch (error) {
        console.error('Video error:', error);
        res.status(500).json({ error: 'Video generation failed' });
    }
});

router.post('/generate/voiceover', async (req, res) => {
    try {
        const { text, voice, dialogue, userId, projectId } = req.body;
        const dataUrl = await generateVoiceover(text, voice, dialogue);

        if (!dataUrl) {
            return res.status(500).json({ error: 'Voiceover generation failed' });
        }

        // Save to disk if userId and projectId provided
        if (userId && projectId) {
            const fileUrl = saveAsset(dataUrl, userId, projectId, 'voiceover');
            if (fileUrl) {
                return res.json({ url: fileUrl });
            }
        }

        // Fallback to data URL
        res.json({ url: dataUrl });
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: 'Voiceover generation failed' });
    }
});

router.post('/generate/music', async (req, res) => {
    try {
        const { mood, duration, userId, projectId } = req.body;
        const dataUrl = await generateMusic(mood, duration);

        if (!dataUrl) {
            return res.status(500).json({ error: 'Music generation failed' });
        }

        // Save to disk if userId and projectId provided
        if (userId && projectId) {
            const fileUrl = saveAsset(dataUrl, userId, projectId, 'music');
            if (fileUrl) {
                return res.json({ url: fileUrl });
            }
        }

        // Fallback to data URL
        res.json({ url: dataUrl });
    } catch (error) {
        console.error('Music error:', error);
        res.status(500).json({ error: 'Music generation failed' });
    }
});

export default router;
