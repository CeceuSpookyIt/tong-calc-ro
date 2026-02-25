-- shared_builds table
CREATE TABLE shared_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_id INTEGER NOT NULL,
  model JSONB NOT NULL,
  monster_id INTEGER,
  monster_name TEXT,
  skill_name TEXT,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_shared_builds_class_id ON shared_builds(class_id);
CREATE INDEX idx_shared_builds_created_at ON shared_builds(created_at DESC);
CREATE INDEX idx_shared_builds_user_id ON shared_builds(user_id);

-- RLS
ALTER TABLE shared_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shared builds"
  ON shared_builds FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert"
  ON shared_builds FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authors can update own builds"
  ON shared_builds FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete own builds"
  ON shared_builds FOR DELETE
  USING (auth.uid() = user_id);

-- shared_build_likes table
CREATE TABLE shared_build_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES shared_builds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(build_id, user_id)
);

CREATE INDEX idx_shared_build_likes_build_id ON shared_build_likes(build_id);

-- RLS
ALTER TABLE shared_build_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read likes"
  ON shared_build_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON shared_build_likes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can unlike own likes"
  ON shared_build_likes FOR DELETE
  USING (auth.uid() = user_id);
