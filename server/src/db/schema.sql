-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  concept TEXT,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_phase TEXT DEFAULT 'planning',
  music_url TEXT,
  voiceover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scenes Table
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  
  -- Director's Breakdown (Stored as JSON for flexibility or specific columns)
  character JSONB,
  environment JSONB,
  camera JSONB,
  action_blocking JSONB,
  
  visual_summary_prompt TEXT,
  text_overlay TEXT,
  overlay_config JSONB,
  
  -- Assets
  storyboard_url TEXT,
  video_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, generating, complete
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets/Reference Files Table (Optional, for uploaded files)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- image, pdf, link
  url TEXT NOT NULL, -- Storage URL or external link
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
