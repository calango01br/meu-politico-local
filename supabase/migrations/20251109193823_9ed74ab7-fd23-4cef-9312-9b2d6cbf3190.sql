-- Tabela de políticos (cache local dos dados das APIs)
CREATE TABLE IF NOT EXISTS public.politicians (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  party TEXT NOT NULL,
  state TEXT NOT NULL,
  role TEXT NOT NULL, -- "Deputado Federal" ou "Senador"
  photo TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de gastos de políticos
CREATE TABLE IF NOT EXISTS public.politician_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id INTEGER REFERENCES public.politicians(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  value DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de votações
CREATE TABLE IF NOT EXISTS public.politician_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  politician_id INTEGER REFERENCES public.politicians(id) ON DELETE CASCADE,
  proposition_id TEXT NOT NULL,
  proposition_title TEXT NOT NULL,
  vote TEXT NOT NULL, -- "Sim", "Não", "Abstenção", "Obstrução", "Ausente"
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leis/proposições
CREATE TABLE IF NOT EXISTS public.propositions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  number TEXT NOT NULL,
  year TEXT NOT NULL,
  summary TEXT NOT NULL,
  author TEXT,
  status TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de alertas do usuário
CREATE TABLE IF NOT EXISTS public.user_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- "new_law", "high_expense", "important_vote"
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  related_id TEXT, -- ID do político, lei ou gasto relacionado
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de preferências de alerta do usuário
CREATE TABLE IF NOT EXISTS public.user_alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  politician_id INTEGER,
  state TEXT,
  alert_new_laws BOOLEAN DEFAULT TRUE,
  alert_high_expenses BOOLEAN DEFAULT TRUE,
  alert_important_votes BOOLEAN DEFAULT TRUE,
  expense_threshold DECIMAL(12, 2) DEFAULT 10000.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_politician_expenses_politician ON public.politician_expenses(politician_id);
CREATE INDEX IF NOT EXISTS idx_politician_votes_politician ON public.politician_votes(politician_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_user ON public.user_alerts(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_politicians_state ON public.politicians(state);

-- RLS Policies
ALTER TABLE public.politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politician_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alert_preferences ENABLE ROW LEVEL SECURITY;

-- Políticos, gastos, votações e proposições são públicos (leitura para todos)
CREATE POLICY "Politicians are viewable by everyone" ON public.politicians FOR SELECT USING (true);
CREATE POLICY "Expenses are viewable by everyone" ON public.politician_expenses FOR SELECT USING (true);
CREATE POLICY "Votes are viewable by everyone" ON public.politician_votes FOR SELECT USING (true);
CREATE POLICY "Propositions are viewable by everyone" ON public.propositions FOR SELECT USING (true);

-- Alertas: usuários veem apenas os seus
CREATE POLICY "Users can view their own alerts" ON public.user_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own alerts" ON public.user_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alerts" ON public.user_alerts FOR DELETE USING (auth.uid() = user_id);

-- Preferências: usuários gerenciam apenas as suas
CREATE POLICY "Users can view their own preferences" ON public.user_alert_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON public.user_alert_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_alert_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_politicians_updated_at BEFORE UPDATE ON public.politicians
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_propositions_updated_at BEFORE UPDATE ON public.propositions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();