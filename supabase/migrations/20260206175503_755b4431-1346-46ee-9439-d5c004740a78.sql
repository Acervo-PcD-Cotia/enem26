
-- 1. Create subject_summaries table for caching AI-generated summaries
CREATE TABLE public.subject_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id)
);

-- Enable RLS
ALTER TABLE public.subject_summaries ENABLE ROW LEVEL SECURITY;

-- Anyone can read summaries (they're shared content)
CREATE POLICY "Anyone can view subject summaries"
ON public.subject_summaries
FOR SELECT
USING (true);

-- Only service role / edge functions insert (via service key)
-- No user INSERT/UPDATE/DELETE policies needed

-- 2. Add guided essay columns
ALTER TABLE public.essays ADD COLUMN IF NOT EXISTS thesis TEXT;
ALTER TABLE public.essays ADD COLUMN IF NOT EXISTS argument_1 TEXT;
ALTER TABLE public.essays ADD COLUMN IF NOT EXISTS argument_2 TEXT;
ALTER TABLE public.essays ADD COLUMN IF NOT EXISTS intervention_agent TEXT;
ALTER TABLE public.essays ADD COLUMN IF NOT EXISTS intervention_action TEXT;
ALTER TABLE public.essays ADD COLUMN IF NOT EXISTS intervention_means TEXT;
ALTER TABLE public.essays ADD COLUMN IF NOT EXISTS intervention_detail TEXT;
ALTER TABLE public.essays ADD COLUMN IF NOT EXISTS intervention_purpose TEXT;
