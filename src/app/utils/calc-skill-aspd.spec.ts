import { calcSkillAspd } from './calc-skill-aspd';

describe('calcSkillAspd', () => {
  const baseStatus = { totalDex: 1, totalInt: 1 } as any;
  const noEquip = { acd: 0, vct: 0, fct: 0, fctPercent: 0 } as any;

  const makeSkill = (overrides: Partial<{ vct: number; fct: number; acd: number; cd: number; hitEveryNSec: number; precastSequence: any[] }>) =>
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

  describe('precastSequence', () => {
    it('should compute precast fields for a single precast step with 1 repeat', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 1, cd: 0,
          precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 1, vct: 5, acd: 0, cd: 0, repeat: 1 }],
        }),
        totalEquipStatus: noEquip,
        status: baseStatus,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });
      expect(result.precastSteps?.length).toBe(1);
      expect(result.precastTotalTime).toBeGreaterThan(0);
      expect(result.cycleTotalTime).toBeGreaterThan(0);
    });

    it('should multiply step time by repeat count', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 1, cd: 0,
          precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 1, vct: 0, acd: 0, cd: 0, repeat: 3 }],
        }),
        totalEquipStatus: noEquip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });
      // vct=0 with maxed dex → reducedVct=0, fct=1 → stepTime ≈ 1*3 = 3
      expect(result.precastSteps![0].stepTime).toBeCloseTo(3, 1);
      // releaseTime = 3 repeats / 2 hitsPerSec = 1.5
      expect(result.releaseTime).toBeCloseTo(1.5, 1);
      // cycleTotalTime ≈ 3 + 1.5 = 4.5
      expect(result.cycleTotalTime).toBeCloseTo(4.5, 1);
    });

    it('should sum multiple precast steps correctly', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 1, cd: 0,
          precastSequence: [
            { name: 'Memorizar', label: 'Memorizar', fct: 1, vct: 0, acd: 0, cd: 0, repeat: 1 },
            { name: 'Esfera', label: 'Esfera', fct: 0, vct: 0, acd: 1, cd: 0, repeat: 1 },
          ],
        }),
        totalEquipStatus: noEquip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });
      // Memorizar: fct=1 → stepTime=1, Esfera: acd=1 → stepTime=1
      expect(result.precastTotalTime).toBeCloseTo(2, 1);
    });

    it('should use userRepeat.defaultRepeat when no override is provided', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 1, cd: 0,
          precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 1, vct: 0, acd: 0, cd: 0, userRepeat: { defaultRepeat: 3, maxRepeat: 7, label: 'X' } }],
        }),
        totalEquipStatus: noEquip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });
      expect(result.precastSteps![0].repeat).toBe(3);
    });

    it('should use precastRepeats override when provided', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 1, cd: 0,
          precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 1, vct: 0, acd: 0, cd: 0, userRepeat: { defaultRepeat: 3, maxRepeat: 7, label: 'X' } }],
        }),
        totalEquipStatus: noEquip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 2,
        precastRepeats: { Memorizar: 5 },
      });
      expect(result.precastSteps![0].repeat).toBe(5);
    });

    it('should not have precast fields when skill has no precastSequence', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({ vct: 1, fct: 0, acd: 0.5, cd: 0 }),
        totalEquipStatus: noEquip,
        status: baseStatus,
        skillLevel: 1,
      });
      expect(result.precastSteps).toBeUndefined();
      expect(result.precastTotalTime).toBeUndefined();
      expect(result.cycleTotalTime).toBeUndefined();
    });
  });
});
