import { SkillNamePipe } from './skill-name.pipe';

describe('SkillNamePipe', () => {
  const pipe = new SkillNamePipe();

  it('should translate aegis to PT-BR', () => {
    expect(pipe.transform('AB_ADORAMUS')).toBe('Adoramus');
  });

  it('should return aegis as-is if not in registry', () => {
    expect(pipe.transform('UNKNOWN_SKILL')).toBe('UNKNOWN_SKILL');
  });

  it('should handle empty/null gracefully', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null as any)).toBe('');
  });
});
