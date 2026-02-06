-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Enum para status de assunto
CREATE TYPE public.subject_status AS ENUM ('not_started', 'studying', 'reviewing', 'consolidated');

-- Enum para tipo de tarefa
CREATE TYPE public.task_type AS ENUM ('study', 'rpa_review', 'questions', 'essay');

-- Enum para status de tarefa
CREATE TYPE public.task_status AS ENUM ('pending', 'completed', 'postponed', 'difficulty');

-- Enum para motivo de erro
CREATE TYPE public.error_reason AS ENUM ('content', 'interpretation', 'attention', 'time');

-- Enum para intervalos RPA
CREATE TYPE public.rpa_interval AS ENUM ('24h', '7d', '15d', '30d', '60d', '120d', '180d');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  target_course TEXT,
  target_university TEXT,
  target_score INTEGER,
  current_level TEXT CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
  available_days_per_week INTEGER DEFAULT 5,
  hours_per_day NUMERIC(3,1) DEFAULT 4,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  streak_count INTEGER DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de roles de usuário
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Tabela de disciplinas (áreas do conhecimento)
CREATE TABLE public.disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de assuntos dentro de cada disciplina
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discipline_id UUID REFERENCES public.disciplines(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  estimated_hours NUMERIC(4,1) DEFAULT 2,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (discipline_id, name)
);

-- Tabela de progresso do usuário em cada assunto
CREATE TABLE public.user_subject_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  status subject_status DEFAULT 'not_started' NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, subject_id)
);

-- Tabela de autoavaliação por área
CREATE TABLE public.user_area_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  discipline_id UUID REFERENCES public.disciplines(id) ON DELETE CASCADE NOT NULL,
  self_rating INTEGER CHECK (self_rating >= 1 AND self_rating <= 10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, discipline_id)
);

-- Tabela de sessões de estudo
CREATE TABLE public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  task_type task_type NOT NULL,
  status task_status DEFAULT 'pending' NOT NULL,
  scheduled_date DATE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de revisões RPA
CREATE TABLE public.rpa_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  study_session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE,
  interval rpa_interval NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status task_status DEFAULT 'pending' NOT NULL,
  review_type TEXT CHECK (review_type IN ('flashcard', 'quiz', 'summary')) DEFAULT 'flashcard',
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de questões
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option INTEGER NOT NULL,
  explanation TEXT,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5) DEFAULT 3,
  source TEXT,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de respostas de questões
CREATE TABLE public.question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  selected_option INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER,
  error_reason error_reason,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de flashcards
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  front_content TEXT NOT NULL,
  back_content TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN ('manual', 'error', 'auto')) DEFAULT 'manual',
  source_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de redações
CREATE TABLE public.essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme TEXT NOT NULL,
  content TEXT,
  scheduled_date DATE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE,
  competency_1 INTEGER CHECK (competency_1 >= 0 AND competency_1 <= 200),
  competency_2 INTEGER CHECK (competency_2 >= 0 AND competency_2 <= 200),
  competency_3 INTEGER CHECK (competency_3 >= 0 AND competency_3 <= 200),
  competency_4 INTEGER CHECK (competency_4 >= 0 AND competency_4 <= 200),
  competency_5 INTEGER CHECK (competency_5 >= 0 AND competency_5 <= 200),
  total_score INTEGER CHECK (total_score >= 0 AND total_score <= 1000),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de simulados
CREATE TABLE public.mock_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_name TEXT NOT NULL,
  exam_date DATE NOT NULL,
  score_math NUMERIC(5,1),
  score_nature NUMERIC(5,1),
  score_humanities NUMERIC(5,1),
  score_languages NUMERIC(5,1),
  score_essay INTEGER CHECK (score_essay >= 0 AND score_essay <= 1000),
  total_score NUMERIC(6,1),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de check-ins semanais
CREATE TABLE public.weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  focus_rating INTEGER CHECK (focus_rating >= 1 AND focus_rating <= 10),
  discipline_rating INTEGER CHECK (discipline_rating >= 1 AND discipline_rating <= 10),
  sleep_rating INTEGER CHECK (sleep_rating >= 1 AND sleep_rating <= 10),
  energy_rating INTEGER CHECK (energy_rating >= 1 AND energy_rating <= 10),
  motivation_rating INTEGER CHECK (motivation_rating >= 1 AND motivation_rating <= 10),
  consistency_rating INTEGER CHECK (consistency_rating >= 1 AND consistency_rating <= 10),
  ai_recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, week_start)
);

-- Tabela de conquistas
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  points INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de conquistas do usuário
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, achievement_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subject_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_area_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpa_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Function to check user role (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for disciplines (public read)
CREATE POLICY "Anyone can view disciplines" ON public.disciplines
  FOR SELECT USING (true);

-- RLS Policies for subjects (public read)
CREATE POLICY "Anyone can view subjects" ON public.subjects
  FOR SELECT USING (true);

-- RLS Policies for user_subject_progress
CREATE POLICY "Users can view their own progress" ON public.user_subject_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_subject_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_subject_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_area_assessment
CREATE POLICY "Users can view their own assessment" ON public.user_area_assessment
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment" ON public.user_area_assessment
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment" ON public.user_area_assessment
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for study_sessions
CREATE POLICY "Users can view their own sessions" ON public.study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.study_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for rpa_reviews
CREATE POLICY "Users can view their own reviews" ON public.rpa_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews" ON public.rpa_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.rpa_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for questions (public read)
CREATE POLICY "Anyone can view questions" ON public.questions
  FOR SELECT USING (true);

-- RLS Policies for question_responses
CREATE POLICY "Users can view their own responses" ON public.question_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses" ON public.question_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for flashcards
CREATE POLICY "Users can view their own flashcards" ON public.flashcards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcards" ON public.flashcards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards" ON public.flashcards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards" ON public.flashcards
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for essays
CREATE POLICY "Users can view their own essays" ON public.essays
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own essays" ON public.essays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own essays" ON public.essays
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for mock_exams
CREATE POLICY "Users can view their own exams" ON public.mock_exams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exams" ON public.mock_exams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams" ON public.mock_exams
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for weekly_checkins
CREATE POLICY "Users can view their own checkins" ON public.weekly_checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkins" ON public.weekly_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins" ON public.weekly_checkins
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subject_progress_updated_at
  BEFORE UPDATE ON public.user_subject_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_sessions_updated_at
  BEFORE UPDATE ON public.study_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rpa_reviews_updated_at
  BEFORE UPDATE ON public.rpa_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_essays_updated_at
  BEFORE UPDATE ON public.essays
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial disciplines
INSERT INTO public.disciplines (name, code, color, icon, display_order) VALUES
  ('Matemática', 'MAT', '#8B5CF6', 'calculator', 1),
  ('Ciências da Natureza', 'NAT', '#10B981', 'flask', 2),
  ('Ciências Humanas', 'HUM', '#F97316', 'globe', 3),
  ('Linguagens', 'LIN', '#3B82F6', 'book-open', 4),
  ('Redação', 'RED', '#EC4899', 'pencil', 5);

-- Insert initial achievements
INSERT INTO public.achievements (code, name, description, icon, points) VALUES
  ('first_study', 'Primeiro Passo', 'Complete sua primeira sessão de estudo', 'rocket', 10),
  ('streak_7', '7 Dias Firme', 'Estude por 7 dias consecutivos', 'fire', 50),
  ('streak_30', 'Mês de Foco', 'Estude por 30 dias consecutivos', 'trophy', 200),
  ('questions_100', 'Centurião', 'Responda 100 questões', 'target', 100),
  ('questions_500', 'Veterano', 'Responda 500 questões', 'medal', 250),
  ('rpa_master', 'Mestre das Revisões', 'Complete 50 revisões RPA', 'brain', 150),
  ('essay_10', 'Redator Dedicado', 'Escreva 10 redações', 'pen-tool', 100),
  ('perfect_day', 'Dia Perfeito', 'Complete todas as tarefas do dia', 'star', 25),
  ('consolidate_10', 'Consolidador', 'Consolide 10 assuntos', 'check-circle', 100);