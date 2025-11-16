import { supabase } from "@/integrations/supabase/client";

export interface ExpensesByCategory {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface TopSpender {
  politician_id: number;
  politician_name: string;
  party: string;
  state: string;
  total: number;
  photo?: string;
  initials: string;
}

export interface ExpensesByParty {
  party: string;
  total: number;
  politician_count: number;
  percentage: number;
}

export interface PeriodFilter {
  month?: number;
  year?: number;
}

// Buscar gastos agrupados por categoria
export const fetchExpensesByCategory = async (periodFilter?: PeriodFilter): Promise<ExpensesByCategory[]> => {
  let query = supabase
    .from('politician_expenses')
    .select('category, value, month, year');

  if (periodFilter?.month) {
    query = query.eq('month', periodFilter.month);
  }
  if (periodFilter?.year) {
    query = query.eq('year', periodFilter.year);
  }

  const { data: expenses, error } = await query;

  if (error) throw error;

  // Agrupar por categoria
  const categoryMap = new Map<string, { total: number; count: number }>();
  
  expenses?.forEach((exp) => {
    const current = categoryMap.get(exp.category) || { total: 0, count: 0 };
    categoryMap.set(exp.category, {
      total: current.total + Number(exp.value),
      count: current.count + 1,
    });
  });

  const totalSpending = Array.from(categoryMap.values()).reduce(
    (sum, cat) => sum + cat.total, 
    0
  );

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalSpending > 0 ? (data.total / totalSpending) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

// Buscar top políticos por gasto
export const fetchTopSpenders = async (limit: number = 10, periodFilter?: PeriodFilter): Promise<TopSpender[]> => {
  let query = supabase
    .from('politician_expenses')
    .select('politician_id, value, month, year');

  if (periodFilter?.month) {
    query = query.eq('month', periodFilter.month);
  }
  if (periodFilter?.year) {
    query = query.eq('year', periodFilter.year);
  }

  const { data: expenses, error: expensesError } = await query;

  if (expensesError) throw expensesError;

  // Agrupar por político
  const politicianMap = new Map<number, number>();
  
  expenses?.forEach((exp) => {
    if (exp.politician_id) {
      const current = politicianMap.get(exp.politician_id) || 0;
      politicianMap.set(exp.politician_id, current + Number(exp.value));
    }
  });

  // Pegar top IDs
  const topIds = Array.from(politicianMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topIds.length === 0) return [];

  // Buscar dados dos políticos
  const { data: politicians, error: politiciansError } = await supabase
    .from('politicians')
    .select('id, name, party, state, photo')
    .in('id', topIds);

  if (politiciansError) throw politiciansError;

  return topIds
    .map((id) => {
      const politician = politicians?.find((p) => p.id === id);
      if (!politician) return null;

      return {
        politician_id: id,
        politician_name: politician.name,
        party: politician.party,
        state: politician.state,
        total: politicianMap.get(id) || 0,
        photo: politician.photo || undefined,
        initials: politician.name
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join(''),
      };
    })
    .filter((item) => item !== null) as TopSpender[];
};

// Buscar gastos por partido
export const fetchExpensesByParty = async (periodFilter?: PeriodFilter): Promise<ExpensesByParty[]> => {
  let query = supabase
    .from('politician_expenses')
    .select('politician_id, value, month, year');

  if (periodFilter?.month) {
    query = query.eq('month', periodFilter.month);
  }
  if (periodFilter?.year) {
    query = query.eq('year', periodFilter.year);
  }

  const { data: expenses, error: expensesError } = await query;

  if (expensesError) throw expensesError;

  // Buscar políticos
  const { data: politicians, error: politiciansError } = await supabase
    .from('politicians')
    .select('id, party');

  if (politiciansError) throw politiciansError;

  // Criar mapa de político -> partido
  const politicianPartyMap = new Map(
    politicians?.map((p) => [p.id, p.party]) || []
  );

  // Agrupar por partido
  const partyMap = new Map<string, { total: number; politicians: Set<number> }>();

  expenses?.forEach((exp) => {
    if (exp.politician_id) {
      const party = politicianPartyMap.get(exp.politician_id);
      if (party) {
        const current = partyMap.get(party) || { total: 0, politicians: new Set() };
        current.total += Number(exp.value);
        current.politicians.add(exp.politician_id);
        partyMap.set(party, current);
      }
    }
  });

  const totalSpending = Array.from(partyMap.values()).reduce(
    (sum, party) => sum + party.total,
    0
  );

  return Array.from(partyMap.entries())
    .map(([party, data]) => ({
      party,
      total: data.total,
      politician_count: data.politicians.size,
      percentage: totalSpending > 0 ? (data.total / totalSpending) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

// Verificar se há dados no banco
export const checkHasData = async (): Promise<boolean> => {
  const { data, error } = await supabase
    .from('politicians')
    .select('id', { count: 'exact', head: true });

  if (error) return false;
  return (data?.length || 0) > 0;
};
