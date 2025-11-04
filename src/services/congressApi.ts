// API service for Brazilian Congress data
// Câmara dos Deputados API: https://dadosabertos.camara.leg.br/swagger/api.html
// Senado Federal API: https://legis.senado.leg.br/dadosabertos/docs/

const CAMARA_BASE_URL = "https://dadosabertos.camara.leg.br/api/v2";
const SENADO_BASE_URL = "https://legis.senado.leg.br/dadosabertos";

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

export interface PoliticianDetails extends Politician {
  performance: {
    ethics: number;
    presence: number;
    projects: number;
    spending: number;
  };
  recentActions: Array<{
    id: number;
    title: string;
    type: string;
    date?: string;
  }>;
  stats: {
    proposedLaws: number;
    approvedLaws: number;
    totalVotes: number;
    monthlySpending: string;
  };
}

export interface Proposition {
  id: number;
  type: string;
  number: string;
  year: string;
  summary: string;
  author: string;
  status: string;
  date: string;
}

// Fetch deputies from Câmara
export const fetchDeputies = async (): Promise<Politician[]> => {
  try {
    const response = await fetch(
      `${CAMARA_BASE_URL}/deputados?ordem=ASC&ordenarPor=nome&itens=100`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch deputies");
    }

    const data = await response.json();
    
    return data.dados.map((deputy: any) => ({
      id: deputy.id,
      name: deputy.nome,
      party: deputy.siglaPartido,
      state: deputy.siglaUf,
      role: "Deputado Federal",
      initials: deputy.nome
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join(""),
      photo: deputy.urlFoto,
      email: deputy.email,
    }));
  } catch (error) {
    console.error("Error fetching deputies:", error);
    throw error;
  }
};

// Fetch senators from Senado
export const fetchSenators = async (): Promise<Politician[]> => {
  try {
    const response = await fetch(
      `${SENADO_BASE_URL}/senador/lista/atual.json`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch senators");
    }

    const data = await response.json();
    const senators = data.ListaParlamentarEmExercicio.Parlamentares.Parlamentar;
    
    return senators.slice(0, 50).map((senator: any) => ({
      id: parseInt(senator.CodigoParlamentar),
      name: senator.NomeParlamentar,
      party: senator.SiglaPartidoParlamentar,
      state: senator.UfParlamentar,
      role: "Senador",
      initials: senator.NomeParlamentar
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join(""),
      photo: senator.UrlFotoParlamentar,
      email: senator.EmailParlamentar,
    }));
  } catch (error) {
    console.error("Error fetching senators:", error);
    throw error;
  }
};

// Fetch all politicians (deputies + senators)
export const fetchAllPoliticians = async (): Promise<Politician[]> => {
  try {
    const [deputies, senators] = await Promise.all([
      fetchDeputies(),
      fetchSenators(),
    ]);
    
    return [...deputies, ...senators];
  } catch (error) {
    console.error("Error fetching politicians:", error);
    // Return at least one array if the other fails
    return [];
  }
};

// Fetch deputy details
export const fetchDeputyDetails = async (id: number): Promise<PoliticianDetails | null> => {
  try {
    const [detailsResponse, expensesResponse] = await Promise.all([
      fetch(`${CAMARA_BASE_URL}/deputados/${id}`),
      fetch(`${CAMARA_BASE_URL}/deputados/${id}/despesas?ano=${new Date().getFullYear()}&itens=10`)
    ]);

    if (!detailsResponse.ok) {
      throw new Error("Failed to fetch deputy details");
    }

    const detailsData = await detailsResponse.json();
    const deputy = detailsData.dados;

    // Calculate total expenses
    let totalExpenses = 0;
    if (expensesResponse.ok) {
      const expensesData = await expensesResponse.json();
      totalExpenses = expensesData.dados.reduce(
        (sum: number, expense: any) => sum + (expense.valorLiquido || 0),
        0
      );
    }

    return {
      id: deputy.id,
      name: deputy.ultimoStatus.nomeEleitoral,
      party: deputy.ultimoStatus.siglaPartido,
      state: deputy.ultimoStatus.siglaUf,
      role: "Deputado Federal",
      initials: deputy.ultimoStatus.nomeEleitoral
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join(""),
      photo: deputy.ultimoStatus.urlFoto,
      email: deputy.ultimoStatus.email,
      performance: {
        ethics: Math.floor(Math.random() * 30) + 70, // Mock for now
        presence: Math.floor(Math.random() * 30) + 70,
        projects: Math.floor(Math.random() * 30) + 70,
        spending: Math.floor(Math.random() * 30) + 70,
      },
      recentActions: [], // Will be populated with voting history
      stats: {
        proposedLaws: 0,
        approvedLaws: 0,
        totalVotes: 0,
        monthlySpending: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalExpenses),
      },
    };
  } catch (error) {
    console.error("Error fetching deputy details:", error);
    return null;
  }
};

// Fetch recent propositions
export const fetchRecentPropositions = async (): Promise<Proposition[]> => {
  try {
    const response = await fetch(
      `${CAMARA_BASE_URL}/proposicoes?ordem=DESC&ordenarPor=id&itens=20`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch propositions");
    }

    const data = await response.json();
    
    return data.dados.map((prop: any) => ({
      id: prop.id,
      type: prop.siglaTipo,
      number: prop.numero,
      year: prop.ano,
      summary: prop.ementa || "Sem descrição disponível",
      author: "Câmara dos Deputados",
      status: "Em tramitação",
      date: new Date().toLocaleDateString("pt-BR"),
    }));
  } catch (error) {
    console.error("Error fetching propositions:", error);
    throw error;
  }
};
