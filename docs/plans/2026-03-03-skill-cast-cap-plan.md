# Skill Cast Cap (7 skills/s) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cap skill casts per second at 7 to prevent unrealistic DPS values caused by extreme cast time reductions.

**Architecture:** Add a `MAX_SKILL_CASTS_PER_SEC` constant in `calc-skill-aspd.ts` and apply it via `Math.min` to `totalHitPerSec`. Only skill DPS is affected; basic attack DPS remains unchanged.

**Tech Stack:** Angular 16, TypeScript, Karma/Jasmine

---

### Task 1: Write failing test for skill cast cap

**Files:**
- Create: `src/app/utils/calc-skill-aspd.spec.ts`

**Step 1: Write the test file**

Use the existing test style from `format-battle-time.spec.ts`. The test needs to call `calcSkillAspd` with parameters that produce a very small `hitPeriod` (fast casts), and verify that `totalHitPerSec` is capped at 7.

To produce a small hitPeriod, use a skill with small base cast times and no equipment reductions needed — just a skill with tiny VCT/FCT/ACD/CD so hitPeriod < 1/7 ≈ 0.1428s.

```typescript
import { calcSkillAspd } from './calc-skill-aspd';

describe('calcSkillAspd', () => {
  const baseStatus = { totalDex: 1, totalInt: 1 } as any;
  const noEquip = {} as any;

  const makeSkill = (overrides: Partial<{ vct: number; fct: number; acd: number; cd: number; hitEveryNSec: number }>) =>
    ({ name: 'TestSkill', vct: 0, fct: 0, acd: 0, cd: 0, hitEveryNSec: 0, ...overrides }) as any;

  describe('MAX_SKILL_CASTS_PER_SEC cap', () => {
    it('should cap totalHitPerSec at 7 when hitPeriod is very small', () => {
      // All cast times near zero → hitPeriod ≈ 0.05s → uncapped would be 20/s
      const result = calcSkillAspd({
        skillData: makeSkill({ vct: 0.05, fct: 0, acd: 0, cd: 0 }),
        totalEquipStatus: noEquip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
      });
      expect(result.totalHitPerSec).toBeLessThanOrEqual(7);
    });

    it('should not cap totalHitPerSec when below 7', () => {
      // acd=0.5s → hitPeriod ≈ 0.5s → 2/s, well under cap
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
```

**Step 2: Run test to verify it fails**

Run: `npx ng test --include=src/app/utils/calc-skill-aspd.spec.ts --watch=false`
Expected: FAIL — first and third tests fail because `totalHitPerSec` exceeds 7.

---

### Task 2: Implement the cap

**Files:**
- Modify: `src/app/utils/calc-skill-aspd.ts:73`

**Step 1: Add constant and apply cap**

At the top of the file (after imports, before the export):

```typescript
export const MAX_SKILL_CASTS_PER_SEC = 7;
```

On line 73, change:

```typescript
// Before:
totalHitPerSec: floor(1 / hitPeriod, 1),

// After:
totalHitPerSec: Math.min(floor(1 / hitPeriod, 1), MAX_SKILL_CASTS_PER_SEC),
```

**Step 2: Run tests to verify they pass**

Run: `npx ng test --include=src/app/utils/calc-skill-aspd.spec.ts --watch=false`
Expected: All 3 tests PASS.

**Step 3: Run full test suite**

Run: `npm test`
Expected: All existing tests still pass (no regressions).

---

### Task 3: Commit

**Step 1: Commit all changes**

```bash
git add src/app/utils/calc-skill-aspd.ts src/app/utils/calc-skill-aspd.spec.ts
git commit -m "feat: cap skill casts per second at 7 to prevent unrealistic DPS"
```
