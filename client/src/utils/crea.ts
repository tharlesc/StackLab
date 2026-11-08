/**
 * 🏛️ Utilitário de Formatação e Validação Estrita do CREA (Conselho Regional de Engenharia e Agronomia)
 * Garante padronização e impede erros de preenchimento vinculados aos estados brasileiros (UFs).
 */

export interface BrazilState {
  uf: string;
  name: string;
}

export const BRAZILIAN_STATES: readonly BrazilState[] = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];

export const VALID_UFS = new Set(BRAZILIAN_STATES.map((s) => s.uf));

/**
 * Retorna true se o cargo/perfil for isento de registro CREA
 * (ex.: estagiários, operacionais de campo gerais, clientes).
 */
export const isCreaExempt = (role: string = '', profile?: string): boolean => {
  if (profile === 'client') return true;
  const lowerRole = role.toLowerCase().trim();
  return (
    lowerRole.includes('estagiário') ||
    lowerRole.includes('ajudante') ||
    lowerRole.includes('técnico de segurança') ||
    lowerRole.includes('auxiliar') ||
    lowerRole.includes('encarregado') ||
    lowerRole.includes('cliente') ||
    lowerRole.includes('fiscal')
  );
};

/**
 * Limpa a entrada de CREA deixando apenas números.
 */
export const sanitizeCreaNumber = (val: string): string => {
  return val.replace(/\D/g, '').slice(0, 10);
};

/**
 * Monta o registro CREA formatado estritamente com base no estado.
 * Exemplo: formatCrea('123456', 'SP') => 'CREA-SP 123456/D'
 */
export const formatCrea = (
  numberDigits: string,
  uf: string,
  suffix: string = 'D',
): string => {
  const cleanNumber = sanitizeCreaNumber(numberDigits);
  const cleanUf = uf.trim().toUpperCase();

  if (!cleanNumber) return '';
  if (!VALID_UFS.has(cleanUf)) return cleanNumber;

  return `CREA-${cleanUf} ${cleanNumber}${suffix ? `/${suffix}` : ''}`;
};

/**
 * Validação rigorosa do CREA.
 */
export const validateCrea = (
  numberDigits: string,
  uf: string,
): { isValid: boolean; error?: string } => {
  const cleanUf = uf.trim().toUpperCase();
  if (!VALID_UFS.has(cleanUf)) {
    return {
      isValid: false,
      error: 'Selecione um estado brasileiro válido para o CREA.',
    };
  }

  const cleanNumber = sanitizeCreaNumber(numberDigits);
  if (cleanNumber.length < 4 || cleanNumber.length > 10) {
    return {
      isValid: false,
      error: 'O número do CREA deve conter entre 4 e 10 dígitos.',
    };
  }

  return { isValid: true };
};

/**
 * Extrai a UF e o número de uma string de CREA formatada
 * Exemplo: 'CREA-SP 123456/D' => { uf: 'SP', number: '123456' }
 */
export const parseCrea = (formattedCrea?: string): { uf: string; number: string } => {
  if (!formattedCrea) return { uf: 'SP', number: '' };

  const match = formattedCrea.match(/CREA-([A-Z]{2})\s+(\d+)/i);
  if (match) {
    return {
      uf: match[1].toUpperCase(),
      number: match[2],
    };
  }

  // Tenta extrair dígitos gerais
  const digits = sanitizeCreaNumber(formattedCrea);
  return { uf: 'SP', number: digits };
};
