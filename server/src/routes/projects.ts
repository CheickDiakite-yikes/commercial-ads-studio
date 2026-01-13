import { Router } from 'express';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET all projects
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
        const projects = stmt.all();
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// GET project by ID (with scenes)
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;

        const projectStmt = db.prepare('SELECT * FROM projects WHERE id = ?');
        const project = projectStmt.get(id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const scenesStmt = db.prepare('SELECT * FROM scenes WHERE project_id = ? ORDER BY order_index ASC');
        const scenes = scenesStmt.all(id);

        // Parse JSON fields and build full project
        const fullProject = {
            ...(project as any),
            settings: JSON.parse((project as any).settings || '{}'),
            scenes: scenes.map((scene: any) => ({
                ...scene,
                character: JSON.parse(scene.character || '{}'),
                environment: JSON.parse(scene.environment || '{}'),
                camera: JSON.parse(scene.camera || '{}'),
                action_blocking: JSON.parse(scene.action_blocking || '[]'),
                overlayConfig: JSON.parse(scene.overlay_config || '{}')
            }))
        };

        res.json(fullProject);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// POST create/update project
router.post('/', (req, res) => {
    try {
        const project = req.body;

        // Generate ID if not present
        const projectId = project.id || uuidv4();

        // Upsert Project using INSERT OR REPLACE
        const upsertStmt = db.prepare(`
      INSERT OR REPLACE INTO projects (
        id, title, concept, settings, current_phase, 
        music_url, voiceover_url, full_script, music_mood, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

        upsertStmt.run(
            projectId,
            project.title || 'Untitled',
            project.concept || '',
            JSON.stringify(project.settings || {}),
            project.currentPhase || 'planning',
            project.musicUrl || null,
            project.voiceoverUrl || null,
            project.fullScript || '',
            project.musicMood || ''
        );

        // Delete existing scenes and re-insert
        const deleteStmt = db.prepare('DELETE FROM scenes WHERE project_id = ?');
        deleteStmt.run(projectId);

        const insertSceneStmt = db.prepare(`
      INSERT INTO scenes (
        id, project_id, order_index, duration, 
        character, environment, camera, action_blocking,
        visual_summary_prompt, text_overlay, overlay_config,
        storyboard_url, video_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        for (const scene of project.scenes || []) {
            insertSceneStmt.run(
                scene.id || uuidv4(),
                projectId,
                scene.order || 0,
                scene.duration || 4,
                JSON.stringify(scene.character || {}),
                JSON.stringify(scene.environment || {}),
                JSON.stringify(scene.camera || {}),
                JSON.stringify(scene.action_blocking || []),
                scene.visual_summary_prompt || '',
                scene.textOverlay || '',
                JSON.stringify(scene.overlayConfig || {}),
                scene.storyboardUrl || null,
                scene.videoUrl || null,
                scene.status || 'pending'
            );
        }

        res.json({ id: projectId, message: 'Project saved' });
    } catch (error) {
        console.error('Error saving project:', error);
        res.status(500).json({ error: 'Failed to save project' });
    }
});

// DELETE project
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const deleteStmt = db.prepare('DELETE FROM projects WHERE id = ?');
        deleteStmt.run(id);
        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

export default router;
