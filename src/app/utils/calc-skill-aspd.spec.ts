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

    it('should not compute precast when basicHitsPerSec is 0 or missing', () => {
      const skillData = makeSkill({
        vct: 0, fct: 0, acd: 1, cd: 0,
        precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 1, vct: 0, acd: 0, cd: 0, repeat: 1 }],
      });
      const result0 = calcSkillAspd({ skillData, totalEquipStatus: noEquip, status: baseStatus, skillLevel: 1, basicHitsPerSec: 0 });
      expect(result0.precastSteps).toBeUndefined();

      const resultUndef = calcSkillAspd({ skillData, totalEquipStatus: noEquip, status: baseStatus, skillLevel: 1 });
      expect(resultUndef.precastSteps).toBeUndefined();
    });

    it('should cap effectiveHitPerSec at 7 with precast cycle', () => {
      // Many repeats with very fast basicHitsPerSec → could exceed cap
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 0, cd: 0,
          precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 0.01, vct: 0, acd: 0, cd: 0, repeat: 7 }],
        }),
        totalEquipStatus: noEquip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 100,
      });
      expect(result.totalHitPerSec).toBeLessThanOrEqual(7);
    });

    it('should apply equipment VCT reduction to precast steps', () => {
      const equip = { ...noEquip, vct: 50 } as any; // 50% global VCT reduction
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 1, cd: 0,
          precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 0, vct: 4, acd: 0, cd: 0, repeat: 1 }],
        }),
        totalEquipStatus: equip,
        status: baseStatus,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });
      const noEquipResult = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 1, cd: 0,
          precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 0, vct: 4, acd: 0, cd: 0, repeat: 1 }],
        }),
        totalEquipStatus: noEquip,
        status: baseStatus,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });
      expect(result.precastSteps![0].reducedVct).toBeLessThan(noEquipResult.precastSteps![0].reducedVct);
    });

    it('should apply per-skill equipment reductions to precast steps', () => {
      const equip = { ...noEquip, 'fct__Memorizar': 0.5, 'acd__Memorizar': 0.3 } as any;
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 1, cd: 0,
          precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 1, vct: 0, acd: 1, cd: 0, repeat: 1 }],
        }),
        totalEquipStatus: equip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });
      // fct reduced by 0.5s → 0.5, acd: (1 - 0.3) * (1 - 0%) = 0.7
      expect(result.precastSteps![0].reducedFct).toBeCloseTo(0.5, 1);
      expect(result.precastSteps![0].reducedAcd).toBeCloseTo(0.7, 1);
    });

    it('should apply VCT stat reduction (dex/int) to precast step VCT', () => {
      const lowDex = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 1, cd: 0,
          precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 0, vct: 5, acd: 0, cd: 0, repeat: 1 }],
        }),
        totalEquipStatus: noEquip,
        status: { totalDex: 50, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });
      const highDex = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 1, cd: 0,
          precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 0, vct: 5, acd: 0, cd: 0, repeat: 1 }],
        }),
        totalEquipStatus: noEquip,
        status: { totalDex: 265, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });
      expect(highDex.precastSteps![0].reducedVct).toBeLessThan(lowDex.precastSteps![0].reducedVct);
      // At dex*2=530, vctByStat → 0
      const maxDex = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 1, cd: 0,
          precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 0, vct: 5, acd: 0, cd: 0, repeat: 1 }],
        }),
        totalEquipStatus: noEquip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });
      expect(maxDex.precastSteps![0].reducedVct).toBe(0);
    });

    it('should apply CD reduction to precast steps', () => {
      const equip = { ...noEquip, 'cd__Memorizar': 1 } as any;
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 1, cd: 0,
          precastSequence: [{ name: 'Memorizar', label: 'Memorizar', fct: 0, vct: 0, acd: 0, cd: 3, repeat: 1 }],
        }),
        totalEquipStatus: equip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });
      expect(result.precastSteps![0].reducedCd).toBeCloseTo(2, 1);
    });

    it('should compute correct effectiveHitPerSec from precast cycle', () => {
      // 3 repeats, each step takes 1s fct → precastTotalTime=3
      // releaseTime = 3/2 = 1.5, cycleTotalTime = 4.5
      // effectiveHitPerSec = floor(3 / 4.5, 1) = 0.6
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
      expect(result.totalHitPerSec).toBe(0.6);
    });
  });

  describe('releasedSkill flag', () => {
    it('should zero VCT, FCT, and CD when releasedSkill is set', () => {
      const equip = { ...noEquip, releasedSkill: true } as any;
      const result = calcSkillAspd({
        skillData: makeSkill({ vct: 5, fct: 2, acd: 1, cd: 3 }),
        totalEquipStatus: equip,
        status: baseStatus,
        skillLevel: 1,
      });
      expect(result.reducedVct).toBe(0);
      expect(result.reducedFct).toBe(0);
      expect(result.reducedCd).toBe(0);
      // ACD should still be present
      expect(result.reducedAcd).toBeGreaterThan(0);
    });

    it('should not zero VCT/FCT/CD when releasedSkill is not set', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({ vct: 5, fct: 2, acd: 1, cd: 3 }),
        totalEquipStatus: noEquip,
        status: baseStatus,
        skillLevel: 1,
      });
      expect(result.reducedVct).toBeGreaterThan(0);
      expect(result.reducedFct).toBeGreaterThan(0);
      expect(result.reducedCd).toBeGreaterThan(0);
    });
  });

  describe('function-based skill timings', () => {
    it('should evaluate function-based acd/cd/fct/vct', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: ((lv: number) => lv * 2) as any,
          fct: ((lv: number) => lv * 0.5) as any,
          acd: ((lv: number) => lv * 0.3) as any,
          cd: ((lv: number) => lv * 1) as any,
        }),
        totalEquipStatus: noEquip,
        status: baseStatus,
        skillLevel: 3,
      });
      // vct = 3*2=6, fct = 3*0.5=1.5, acd = 3*0.3=0.9, cd = 3*1=3
      expect(result.vct).toBe(6);
      expect(result.fct).toBe(1.5);
      expect(result.acd).toBeCloseTo(0.9, 1);
      expect(result.cd).toBe(3);
    });
  });
});
