import { Router } from 'express';
import { query } from '../db';
import { AdProject } from '../types';

const router = Router();

// GET all projects
router.get('/', async (req, res) => {
    try {
        const result = await query('SELECT * FROM projects ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// GET project by ID (with scenes)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const projectResult = await query('SELECT * FROM projects WHERE id = $1', [id]);

        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = projectResult.rows[0];
        const scenesResult = await query('SELECT * FROM scenes WHERE project_id = $1 ORDER BY order_index ASC', [id]);

        // Combine scenes back into project object
        const fullProject = {
            ...project,
            scenes: scenesResult.rows.map(scene => ({
                ...scene,
                // Ensure JSON fields are parsed if pg returns them as strings (usually auto-parsed)
                character: scene.character,
                environment: scene.environment,
                camera: scene.camera,
                action_blocking: scene.action_blocking,
                overlayConfig: scene.overlay_config
            }))
        };

        res.json(fullProject);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// POST create/update project
router.post('/', async (req, res) => {
    try {
        const project: AdProject = req.body;

        // Upsert Project
        let projectId = project.id;
        // Check if UUID is valid or temporary
        const isValidUUID = projectId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(projectId) : false;

        let result;
        if (isValidUUID) {
            // Try Update
            result = await query(
                `INSERT INTO projects (id, title, concept, settings, current_phase, music_url, voiceover_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            concept = EXCLUDED.concept,
            settings = EXCLUDED.settings,
            current_phase = EXCLUDED.current_phase,
            music_url = EXCLUDED.music_url,
            voiceover_url = EXCLUDED.voiceover_url,
            updated_at = NOW()
          RETURNING id`,
                [project.id, project.title, project.concept, project.settings, project.currentPhase, project.musicUrl, project.voiceoverUrl]
            );
        } else {
            // Insert New (ignore client ID if not UUID)
            result = await query(
                `INSERT INTO projects (title, concept, settings, current_phase, music_url, voiceover_url)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id`,
                [project.title, project.concept, project.settings, project.currentPhase, project.musicUrl, project.voiceoverUrl]
            );
        }

        projectId = result.rows[0].id;

        // Delete existing scenes and re-insert (simplest strategy for now)
        await query('DELETE FROM scenes WHERE project_id = $1', [projectId]);

        for (const scene of project.scenes) {
            await query(
                `INSERT INTO scenes (
           project_id, order_index, duration, 
           character, environment, camera, action_blocking,
           visual_summary_prompt, text_overlay, overlay_config,
           storyboard_url, video_url, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [
                    projectId, scene.order, scene.duration,
                    scene.character, scene.environment, scene.camera, JSON.stringify(scene.action_blocking),
                    scene.visual_summary_prompt, scene.textOverlay, scene.overlayConfig,
                    scene.storyboardUrl, scene.videoUrl, scene.status
                ]
            );
        }

        res.json({ id: projectId, message: 'Project saved' });
    } catch (error) {
        console.error('Error saving project:', error);
        res.status(500).json({ error: 'Failed to save project' });
    }
});

export default router;
