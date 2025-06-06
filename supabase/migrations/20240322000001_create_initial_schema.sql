CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
  questions JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  distribution_channels JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  respondent_email TEXT,
  respondent_name TEXT,
  responses JSONB NOT NULL,
  sentiment_score NUMERIC(3,1),
  completion_rate NUMERIC(5,2) DEFAULT 100.00,
  ip_address INET,
  user_agent TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  total_responses INTEGER DEFAULT 0,
  average_sentiment NUMERIC(3,1),
  completion_rate NUMERIC(5,2),
  response_trend JSONB DEFAULT '[]'::jsonb,
  sentiment_distribution JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('response_received', 'survey_completed', 'sentiment_threshold', 'time_based')),
  trigger_conditions JSONB DEFAULT '{}'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('webhook', 'email', 'slack', 'zapier', 'crm', 'analytics')),
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID REFERENCES public.automations(id) ON DELETE CASCADE NOT NULL,
  survey_response_id UUID REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.survey_distributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES public.surveys(id) ON DELETE CASCADE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'link', 'qr_code', 'widget')),
  recipient_list JSONB DEFAULT '[]'::jsonb,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Realtime publication setup is handled automatically by Supabase
-- Removing explicit publication statements to avoid conflicts

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION update_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.analytics (survey_id, total_responses, average_sentiment, completion_rate)
  VALUES (
    NEW.survey_id,
    1,
    COALESCE(NEW.sentiment_score, 0),
    COALESCE(NEW.completion_rate, 100)
  )
  ON CONFLICT (survey_id) DO UPDATE SET
    total_responses = EXCLUDED.total_responses + analytics.total_responses,
    average_sentiment = CASE 
      WHEN NEW.sentiment_score IS NOT NULL THEN
        (COALESCE(analytics.average_sentiment, 0) * analytics.total_responses + NEW.sentiment_score) / (analytics.total_responses + 1)
      ELSE analytics.average_sentiment
    END,
    completion_rate = CASE 
      WHEN NEW.completion_rate IS NOT NULL THEN
        (COALESCE(analytics.completion_rate, 0) * analytics.total_responses + NEW.completion_rate) / (analytics.total_responses + 1)
      ELSE analytics.completion_rate
    END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint for analytics
ALTER TABLE public.analytics ADD CONSTRAINT analytics_survey_id_unique UNIQUE (survey_id);

-- Realtime is enabled by default for new tables in Supabase
-- Removing explicit publication statements to avoid conflicts

CREATE OR REPLACE TRIGGER on_survey_response_created
  AFTER INSERT ON public.survey_responses
  FOR EACH ROW EXECUTE FUNCTION update_analytics();