import { Router } from 'express';
import { generateAdPlan, generateStoryboardImage, generateVideoClip, generateVoiceover, sendChatMessage } from '../services/gemini';

const router = Router();

router.post('/chat', async (req, res) => {
    try {
        const { history, message, attachments } = req.body;
        const response = await sendChatMessage(history, message, attachments);
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
        const { scene, aspectRatio, visualAnchorDataUrl } = req.body;
        const imageUrl = await generateStoryboardImage(scene, aspectRatio, visualAnchorDataUrl);
        res.json({ url: imageUrl });
    } catch (error) {
        console.error('Storyboard error:', error);
        res.status(500).json({ error: 'Storyboard generation failed' });
    }
});

router.post('/generate/video', async (req, res) => {
    try {
        const { scene, aspectRatio, sourceImageDataUrl } = req.body;
        const videoUrl = await generateVideoClip(scene, aspectRatio, sourceImageDataUrl);
        res.json({ url: videoUrl });
    } catch (error) {
        console.error('Video error:', error);
        res.status(500).json({ error: 'Video generation failed' });
    }
});

router.post('/generate/voiceover', async (req, res) => {
    try {
        const { text, voice, dialogue } = req.body;
        const audioUrl = await generateVoiceover(text, voice, dialogue);
        res.json({ url: audioUrl });
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: 'Voiceover generation failed' });
    }
});

export default router;
