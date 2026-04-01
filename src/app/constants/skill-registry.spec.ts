import { SKILL_REGISTRY, aegisByEN, aegisByPTBR } from './skill-registry';

describe('SKILL_REGISTRY', () => {
  it('should have entries', () => {
    expect(Object.keys(SKILL_REGISTRY).length).toBeGreaterThan(600);
  });

  it('should have no empty en or ptbr values', () => {
    for (const [aegis, entry] of Object.entries(SKILL_REGISTRY)) {
      expect(entry.en).toBeTruthy(`${aegis} has empty en`);
      expect(entry.ptbr).toBeTruthy(`${aegis} has empty ptbr`);
    }
  });

  it('aegisByEN should reverse-map all entries', () => {
    for (const [aegis, entry] of Object.entries(SKILL_REGISTRY)) {
      expect(aegisByEN.get(entry.en)).toBe(aegis, `EN "${entry.en}" should map to ${aegis}`);
    }
  });

  it('aegisByPTBR should reverse-map all entries', () => {
    for (const [aegis, entry] of Object.entries(SKILL_REGISTRY)) {
      expect(aegisByPTBR.get(entry.ptbr)).toBeTruthy(`PT-BR "${entry.ptbr}" should map to an aegis`);
    }
  });
});
