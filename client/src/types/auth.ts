/**
 * Perfis de acesso do RDO Mobile (ver constants/permissions.ts e roadmap_desenvolvimento_client.md):
 * - common: Técnico / Estagiário / Encarregado (Operacional de campo)
 * - master: Engenheiro / Gestor / Proprietário
 * - client: Cliente / Contratante / Fiscal Externo
 */
export type UserProfile = 'common' | 'master' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  /** Cargo exibido na interface (ex.: "Engenheiro Residente"). Não define permissões. */
  role: string;
  crea?: string;
  /** Perfil de acesso — fonte única para controle de permissões. */
  profile: UserProfile;
  /** Obras às quais o usuário está alocado (relevante para o perfil common e client). */
  assignedWorkIds: string[];
  active?: boolean;
  /** Indicador se o usuário está online no momento */
  isOnline?: boolean;
  /** Timestamp ISO da última sincronização */
  lastSyncAt?: string;
  /** Senha provisória gerada de 6 dígitos no cadastro */
  tempPassword?: string;
  /** Flag que indica se o usuário ainda não realizou o primeiro acesso */
  isFirstAccess?: boolean;
}
