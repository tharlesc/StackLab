import { pluralize, normalize, matchesQuery, getInitials } from '@/utils/text';

describe('utils/text', () => {
  it('pluralizes singular and plural strings in Portuguese', () => {
    expect(pluralize(1, 'item', 'itens')).toBe('1 item');
    expect(pluralize(3, 'item', 'itens')).toBe('3 itens');
    expect(pluralize(2, 'obra')).toBe('2 obras');
  });

  it('normalizes strings removing accents, casing, and outer whitespace', () => {
    expect(normalize('  Fundação São Paulo  ')).toBe('fundacao sao paulo');
    expect(normalize('Edição Auditável')).toBe('edicao auditavel');
  });

  it('matches queries ignoring accents and case across multiple fields', () => {
    expect(matchesQuery('', 'Qualquer')).toBe(true);
    expect(matchesQuery('sao paulo', 'Obra 1', 'São Paulo - SP')).toBe(true);
    expect(matchesQuery('185', 185, 'Sede')).toBe(true);
    expect(matchesQuery('inexistente', 'Obra 1', undefined)).toBe(false);
  });

  it('extracts up to two uppercase initials from a full name', () => {
    expect(getInitials('Davi Hudson')).toBe('DH');
    expect(getInitials('Tharles Souza Silva')).toBe('TS');
    expect(getInitials('Engenheiro')).toBe('E');
  });
});
