import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const ASSETS_BASE_DIR = path.join(__dirname, '../../data/assets');

// Ensure base directory exists
if (!fs.existsSync(ASSETS_BASE_DIR)) {
    fs.mkdirSync(ASSETS_BASE_DIR, { recursive: true });
}

/**
 * Get file extension from MIME type
 */
const getExtensionFromMime = (mimeType: string): string => {
    const mimeMap: Record<string, string> = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/webp': 'webp',
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'audio/wav': 'wav',
        'audio/mpeg': 'mp3',
        'audio/mp3': 'mp3',
    };
    return mimeMap[mimeType] || 'bin';
};

/**
 * Save an asset to disk and return its URL path.
 * 
 * @param dataUrl - The full data URL (data:mime;base64,...)
 * @param userId - User ID for organization
 * @param projectId - Project ID for organization
 * @param assetType - Type prefix (storyboard, video, voiceover, music)
 * @returns The URL path to access this asset via HTTP (e.g., /api/assets/user123/proj456/video_abc.mp4)
 */
export const saveAsset = (
    dataUrl: string,
    userId: string,
    projectId: string,
    assetType: string
): string | null => {
    try {
        // Parse data URL
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) {
            console.error('Invalid data URL format');
            return null;
        }

        const mimeType = match[1];
        const base64Data = match[2];
        const extension = getExtensionFromMime(mimeType);

        // Create directory structure: assets/{userId}/{projectId}/
        const assetDir = path.join(ASSETS_BASE_DIR, userId, projectId);
        if (!fs.existsSync(assetDir)) {
            fs.mkdirSync(assetDir, { recursive: true });
        }

        // Generate unique filename
        const uniqueId = uuidv4().substring(0, 8);
        const filename = `${assetType}_${uniqueId}.${extension}`;
        const filePath = path.join(assetDir, filename);

        // Decode and write file
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);

        console.log(`Asset saved: ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);

        // Return URL path for HTTP access
        return `/api/assets/${userId}/${projectId}/${filename}`;
    } catch (error) {
        console.error('Failed to save asset:', error);
        return null;
    }
};

/**
 * Get the absolute file path for an asset given its URL path.
 * Returns null if the path seems malicious (directory traversal).
 */
export const getAssetPath = (userId: string, projectId: string, filename: string): string | null => {
    // Validate inputs to prevent directory traversal
    if (
        userId.includes('..') || userId.includes('/') ||
        projectId.includes('..') || projectId.includes('/') ||
        filename.includes('..') || filename.includes('/')
    ) {
        console.error('Invalid asset path - potential directory traversal');
        return null;
    }

    const filePath = path.join(ASSETS_BASE_DIR, userId, projectId, filename);

    // Double-check the resolved path is within ASSETS_BASE_DIR
    if (!filePath.startsWith(ASSETS_BASE_DIR)) {
        console.error('Asset path outside allowed directory');
        return null;
    }

    return filePath;
};
