import { Router } from 'express';
import * as fs from 'fs';
import { getAssetPath } from '../services/storage';

const router = Router();

/**
 * Serve static asset files
 * GET /api/assets/:userId/:projectId/:filename
 */
router.get('/:userId/:projectId/:filename', (req, res) => {
    try {
        const { userId, projectId, filename } = req.params;

        const filePath = getAssetPath(userId, projectId, filename);
        if (!filePath) {
            return res.status(400).json({ error: 'Invalid asset path' });
        }

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        // Determine content type from extension
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'webp': 'image/webp',
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg',
        };

        const contentType = mimeTypes[ext || ''] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        // Stream the file
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    } catch (error) {
        console.error('Error serving asset:', error);
        res.status(500).json({ error: 'Failed to serve asset' });
    }
});

export default router;
