-- Add tour_completed column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT false;

-- Create storage bucket for study materials
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for study-materials bucket
CREATE POLICY "Anyone can view study materials" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'study-materials');

CREATE POLICY "Authenticated users can upload materials" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own materials" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own materials" 
ON storage.objects FOR DELETE 
TO authenticated
USING (bucket_id = 'study-materials' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create subject_materials table
CREATE TABLE public.subject_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL CHECK (material_type IN ('audio', 'video', 'mindmap', 'flashcard', 'presentation')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  external_url TEXT,
  source TEXT CHECK (source IN ('upload', 'youtube', 'gdrive', 'notebooklm')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subject_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own materials"
  ON public.subject_materials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own materials"
  ON public.subject_materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials"
  ON public.subject_materials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials"
  ON public.subject_materials FOR DELETE
  USING (auth.uid() = user_id);

-- Create community_posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('question', 'help', 'resource', 'discussion')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all posts"
  ON public.community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create community_comments table
CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all comments"
  ON public.community_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.community_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.community_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.community_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create community_resources table
CREATE TABLE public.community_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'live', 'study_group')),
  url TEXT NOT NULL,
  source TEXT CHECK (source IN ('upload', 'youtube', 'gdrive', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all resources"
  ON public.community_resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create resources"
  ON public.community_resources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resources"
  ON public.community_resources FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resources"
  ON public.community_resources FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at trigger to new tables
CREATE TRIGGER update_subject_materials_updated_at
BEFORE UPDATE ON public.subject_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();