import { supabase } from "@/integrations/supabase/client";

export interface Politician {
  id: number;
  name: string;
  party: string;
  state: string;
  role: string;
  initials: string;
  photo?: string;
  email?: string;
}

export interface Expense {
  id: string;
  year: number;
  month: number;
  category: string;
  description: string | null;
  value: number;
  date: string;
}

export interface Vote {
  id: string;
  proposition_id: string;
  proposition_title: string;
  vote: string;
  date: string;
}

export interface PoliticianDetails extends Politician {
  expenses: Expense[];
  votes: Vote[];
  stats: {
    totalExpenses: number;
    totalVotes: number;
    proposedLaws: number;
  };
}

// Buscar todos os políticos do banco
export const fetchPoliticiansFromDB = async (): Promise<Politician[]> => {
  const { data, error } = await supabase
    .from('politicians')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;

  return (data || []).map((p) => ({
    ...p,
    initials: p.name
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join(''),
  }));
};

// Buscar detalhes de um político específico
export const fetchPoliticianDetails = async (id: number): Promise<PoliticianDetails | null> => {
  // Buscar dados do político
  const { data: politician, error: politicianError } = await supabase
    .from('politicians')
    .select('*')
    .eq('id', id)
    .single();

  if (politicianError || !politician) {
    console.error('Erro ao buscar político:', politicianError);
    return null;
  }

  // Buscar gastos
  const { data: expenses, error: expensesError } = await supabase
    .from('politician_expenses')
    .select('*')
    .eq('politician_id', id)
    .order('date', { ascending: false })
    .limit(50);

  // Buscar votações
  const { data: votes, error: votesError } = await supabase
    .from('politician_votes')
    .select('*')
    .eq('politician_id', id)
    .order('date', { ascending: false })
    .limit(50);

  const expensesList = expenses || [];
  const votesList = votes || [];

  const totalExpenses = expensesList.reduce((sum, exp) => sum + Number(exp.value), 0);

  return {
    id: politician.id,
    name: politician.name,
    party: politician.party,
    state: politician.state,
    role: politician.role,
    photo: politician.photo || undefined,
    email: politician.email || undefined,
    initials: politician.name
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join(''),
    expenses: expensesList,
    votes: votesList,
    stats: {
      totalExpenses,
      totalVotes: votesList.length,
      proposedLaws: 0, // TODO: calcular com base em proposições
    },
  };
};

// Sincronizar dados das APIs (chamar edge function)
export const syncPoliticalData = async () => {
  const { data, error } = await supabase.functions.invoke('sync-political-data');

  if (error) throw error;
  return data;
};