-- Criar tabela de cache para scores de ranking
CREATE TABLE IF NOT EXISTS public.politician_scores (
  politician_id INTEGER PRIMARY KEY REFERENCES public.politicians(id) ON DELETE CASCADE,
  score_total NUMERIC NOT NULL,
  votacoes NUMERIC NOT NULL DEFAULT 0,
  gastos NUMERIC NOT NULL DEFAULT 0,
  processos NUMERIC NOT NULL DEFAULT 0,
  outros NUMERIC NOT NULL DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.politician_scores ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "Scores são visíveis para todos"
  ON public.politician_scores
  FOR SELECT
  USING (true);

-- Índice para otimizar consultas por data
CREATE INDEX IF NOT EXISTS idx_politician_scores_calculated_at 
  ON public.politician_scores(calculated_at DESC);

-- Comentários
COMMENT ON TABLE public.politician_scores IS 'Cache de 24h dos scores calculados do ranking de políticos';
COMMENT ON COLUMN public.politician_scores.score_total IS 'Score final calculado pela fórmula: ((V × 3) + G) / 4 + P + OT';
COMMENT ON COLUMN public.politician_scores.votacoes IS 'Componente V: pontuação de votações favoráveis';
COMMENT ON COLUMN public.politician_scores.gastos IS 'Componente G: eficiência nos gastos';
COMMENT ON COLUMN public.politician_scores.processos IS 'Componente P: dedução por processos judiciais';
COMMENT ON COLUMN public.politician_scores.outros IS 'Componente OT: pontos adicionais por ações significativas';