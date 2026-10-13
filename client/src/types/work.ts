export interface ActiveWork {
  id: string;
  name: string;
  subtitle: string;
  statusType: '100% Em Dia' | 'Atenção';
  lastRdo: string;
  weather: string;
  team: string;
  rdoStatus: string;
  rdoDate?: string;
  rdoNumber?: number;
  actionText?: string;
}

/** Cadastro de obra (Módulo de Administração — Master). */
export interface Work {
  id: string;
  name: string;
  subtitle: string;
  client: string;
  address: string;
  active: boolean;
}
