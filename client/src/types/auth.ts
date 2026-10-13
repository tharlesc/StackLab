/**
 * Perfis de acesso do RDO Mobile (ver docs/ESPECIFICACAO_RDO_MOBILE.md §2).
 * - common: Técnico / Estagiário / Encarregado (Operacional de campo)
 * - master: Engenheiro / Gestor / Proprietário
 */
export type UserProfile = 'common' | 'master';

export interface User {
  id: string;
  name: string;
  email: string;
  /** Cargo exibido na interface (ex.: "Engenheiro Residente"). Não define permissões. */
  role: string;
  crea?: string;
  /** Perfil de acesso — fonte única para controle de permissões. */
  profile: UserProfile;
  /** Obras às quais o usuário está alocado (relevante para o perfil common). */
  assignedWorkIds: string[];
  active?: boolean;
}
