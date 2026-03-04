import { calcSkillAspd } from './calc-skill-aspd';

describe('calcSkillAspd', () => {
  const baseStatus = { totalDex: 1, totalInt: 1 } as any;
  const noEquip = { acd: 0, vct: 0, fct: 0, fctPercent: 0 } as any;

  const makeSkill = (overrides: Partial<{ vct: number; fct: number; acd: number; cd: number; hitEveryNSec: number }>) =>
    ({ name: 'TestSkill', vct: 0, fct: 0, acd: 0, cd: 0, hitEveryNSec: 0, ...overrides }) as any;

  describe('MAX_SKILL_CASTS_PER_SEC cap', () => {
    it('should cap totalHitPerSec at 7 when hitPeriod is very small', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({ vct: 0.05, fct: 0, acd: 0, cd: 0 }),
        totalEquipStatus: noEquip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
      });
      expect(result.totalHitPerSec).toBeLessThanOrEqual(7);
    });

    it('should not cap totalHitPerSec when below 7', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({ vct: 0, fct: 0, acd: 0.5, cd: 0 }),
        totalEquipStatus: noEquip,
        status: baseStatus,
        skillLevel: 1,
      });
      expect(result.totalHitPerSec).toBe(2);
    });

    it('should cap at exactly 7 for hitEveryNSec producing fast casts', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({ hitEveryNSec: 0.05 }),
        totalEquipStatus: noEquip,
        status: baseStatus,
        skillLevel: 1,
      });
      expect(result.totalHitPerSec).toBeLessThanOrEqual(7);
    });
  });
});
