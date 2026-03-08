# Skill Sequence (Precast) System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a generic precast sequence system so skills like Warlock's Released spells (Memorizar → Release) calculate DPS using the full rotation time.

**Architecture:** New `PrecastStep` interface on `AtkSkillModel`. `calcSkillAspd` gains a helper to sum precast times into cycle time. Warlock gets separate "(Released)" skill entries with `precastSequence`. UI shows precast details and repeat dropdown in the Skill ASPD panel.

**Tech Stack:** Angular 16, TypeScript, PrimeNG 16 (p-dropdown), Karma/Jasmine tests

---

### Task 1: Add PrecastStep interface and extend AtkSkillModel

**Files:**
- Modify: `src/app/jobs/_character-base.abstract.ts` (add interface + property)

**Step 1: Add PrecastStep interface and property**

Add the `PrecastStep` interface right before the `AtkSkillModel` interface (around line 29), and add `precastSequence?` to `AtkSkillModel`:

```ts
export interface PrecastStep {
  name: string;
  label: string;
  fct: number;
  vct: number;
  acd: number;
  cd: number;
  repeat?: number;
  userRepeat?: {
    defaultRepeat: number;
    maxRepeat: number;
    label: string;
  };
}
```

Inside `AtkSkillModel`, add after the `autoSpellChance?` line:

```ts
  precastSequence?: PrecastStep[];
```

**Step 2: Build to verify no type errors**

Run: `npx ng build --configuration=development 2>&1 | head -5`
Expected: Build succeeds (no type errors)

**Step 3: Commit**

```bash
git add src/app/jobs/_character-base.abstract.ts
git commit -m "feat: add PrecastStep interface to AtkSkillModel"
```

---

### Task 2: Extend SkillAspdModel for precast data

**Files:**
- Modify: `src/app/models/damage-summary.model.ts` (extend SkillAspdModel)

**Step 1: Add precast fields to SkillAspdModel**

Add these optional fields at the end of the `SkillAspdModel` interface (after `totalHitPerSec`):

```ts
  precastSteps?: {
    label: string;
    repeat: number;
    reducedVct: number;
    reducedFct: number;
    reducedAcd: number;
    reducedCd: number;
    stepTime: number;
  }[];
  precastTotalTime?: number;
  releaseTime?: number;
  cycleTotalTime?: number;
```

**Step 2: Build to verify**

Run: `npx ng build --configuration=development 2>&1 | head -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/models/damage-summary.model.ts
git commit -m "feat: add precast fields to SkillAspdModel"
```

---

### Task 3: Write failing tests for precast cycle time calculation

**Files:**
- Modify: `src/app/utils/calc-skill-aspd.spec.ts`

**Step 1: Write failing tests**

Add the following test suite to `calc-skill-aspd.spec.ts` after the existing `MAX_SKILL_CASTS_PER_SEC cap` describe block:

```ts
  describe('precastSequence', () => {
    it('should calculate cycle time with single precast step (1 repeat)', () => {
      // Memorizar (fct:1, vct:5) × 1 + Release (ASPD-based)
      // With low DEX/INT, vctByStat ≈ 1, so reducedVct ≈ 5
      // stepTime = (5 + 1 + max(0,0)) × 1 = 6
      // release = 1 hit from basicAspd (passed externally, default assumption)
      // We test that precastTotalTime is calculated and used
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 0, cd: 0,
          precastSequence: [
            { name: 'Memorizar', label: 'Memorizar', fct: 1, vct: 5, acd: 0, cd: 0, repeat: 1 },
          ],
        }),
        totalEquipStatus: noEquip,
        status: baseStatus,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });

      expect(result.precastTotalTime).toBeGreaterThan(0);
      expect(result.cycleTotalTime).toBeGreaterThan(0);
      expect(result.precastSteps.length).toBe(1);
    });

    it('should multiply step time by repeat count', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 0, cd: 0,
          precastSequence: [
            { name: 'Memorizar', label: 'Memorizar', fct: 1, vct: 0, acd: 0, cd: 0, repeat: 3 },
          ],
        }),
        totalEquipStatus: noEquip,
        status: { totalDex: 530, totalInt: 0 } as any, // maxed DEX → vctByStat ≈ 0
        skillLevel: 1,
        basicHitsPerSec: 2,
      });

      // fct=1, vct reduced to ~0, acd=0, cd=0 → stepTime ≈ 1 × 3 = 3
      // releaseTime = 3 × (1/2) = 1.5
      // cycleTotalTime ≈ 3 + 1.5 = 4.5
      expect(result.precastSteps[0].repeat).toBe(3);
      expect(result.precastTotalTime).toBeCloseTo(3, 0);
      expect(result.cycleTotalTime).toBeCloseTo(4.5, 0);
    });

    it('should sum multiple precast steps', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 0, cd: 0,
          precastSequence: [
            { name: 'Memorizar', label: 'Memorizar', fct: 1, vct: 0, acd: 0, cd: 0, repeat: 1 },
            { name: 'Summon Ball', label: 'Esfera', fct: 0, vct: 0, acd: 1, cd: 0, repeat: 1 },
          ],
        }),
        totalEquipStatus: noEquip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });

      expect(result.precastSteps.length).toBe(2);
      // Step 1: fct=1 × 1 = 1, Step 2: acd=1 × 1 = 1 → total precast = 2
      // 1 release at 1/2 = 0.5 → cycle = 2.5
      expect(result.precastTotalTime).toBeCloseTo(2, 0);
      expect(result.cycleTotalTime).toBeCloseTo(2.5, 0);
    });

    it('should use userRepeat.defaultRepeat when no override', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 0, cd: 0,
          precastSequence: [
            {
              name: 'Memorizar', label: 'Memorizar', fct: 1, vct: 0, acd: 0, cd: 0,
              userRepeat: { defaultRepeat: 3, maxRepeat: 7, label: 'Repetições' },
            },
          ],
        }),
        totalEquipStatus: noEquip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 2,
      });

      expect(result.precastSteps[0].repeat).toBe(3);
    });

    it('should use precastRepeats override when provided', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({
          vct: 0, fct: 0, acd: 0, cd: 0,
          precastSequence: [
            {
              name: 'Memorizar', label: 'Memorizar', fct: 1, vct: 0, acd: 0, cd: 0,
              userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
            },
          ],
        }),
        totalEquipStatus: noEquip,
        status: { totalDex: 530, totalInt: 0 } as any,
        skillLevel: 1,
        basicHitsPerSec: 2,
        precastRepeats: { 'Memorizar': 5 },
      });

      expect(result.precastSteps[0].repeat).toBe(5);
    });

    it('should not add precast fields when skill has no precastSequence', () => {
      const result = calcSkillAspd({
        skillData: makeSkill({ vct: 2, fct: 1, acd: 0.5, cd: 3 }),
        totalEquipStatus: noEquip,
        status: baseStatus,
        skillLevel: 1,
      });

      expect(result.precastSteps).toBeUndefined();
      expect(result.precastTotalTime).toBeUndefined();
    });
  });
```

**Step 2: Run tests to verify they fail**

Run: `npx ng test --watch=false 2>&1 | tail -20`
Expected: FAIL — `precastSequence` not recognized in makeSkill, `basicHitsPerSec`/`precastRepeats` not valid params

**Step 3: Commit**

```bash
git add src/app/utils/calc-skill-aspd.spec.ts
git commit -m "test: add failing tests for precast cycle time"
```

---

### Task 4: Implement precast cycle time in calcSkillAspd

**Files:**
- Modify: `src/app/utils/calc-skill-aspd.ts`

**Step 1: Update function signature and add precast logic**

Update `calcSkillAspd` to accept optional `basicHitsPerSec` and `precastRepeats`, and compute precast cycle time when `precastSequence` exists.

Updated `calc-skill-aspd.ts`:

```ts
import { AtkSkillModel, PrecastStep } from '../jobs/_character-base.abstract';
import { SkillAspdModel } from '../models/damage-summary.model';
import { EquipmentSummaryModel } from '../models/equipment-summary.model';
import { StatusSummary } from '../models/status-summary.model';
import { floor } from './floor';
import { round, roundUp } from './round';

export const MAX_SKILL_CASTS_PER_SEC = 7;

const calcPrecastStepTime = (
  step: PrecastStep,
  repeat: number,
  totalEquipStatus: EquipmentSummaryModel,
  vctByStat: number,
  precision: number,
): { label: string; repeat: number; reducedVct: number; reducedFct: number; reducedAcd: number; reducedCd: number; stepTime: number } => {
  const { acd, vct, vct_inc = 0, fct, fctPercent } = totalEquipStatus;

  const reduceSkillVct = totalEquipStatus[`vct__${step.name}`] || 0;
  const reduceSkillVctFix = totalEquipStatus[`fix_vct__${step.name}`] || 0;
  const reduceSkillFct = totalEquipStatus[`fct__${step.name}`] || 0;
  const reduceSkillFctPercent = totalEquipStatus[`fctPercent__${step.name}`] || 0;
  const reduceSkillAcd = totalEquipStatus[`acd__${step.name}`] || 0;
  const reduceSkillCd = totalEquipStatus[`cd__${step.name}`] || 0;

  const vctGlobal = Math.max(0, 1 - (vct - vct_inc) / 100);
  const vctSkill = Math.max(0, 1 - reduceSkillVct / 100);

  const reducedVct = Math.max(0, roundUp((step.vct - reduceSkillVctFix) * vctByStat * vctGlobal * vctSkill, precision));
  const reducedFct = Math.max(0, roundUp((step.fct - reduceSkillFct - fct) * (1 - fctPercent * 0.01) * (1 - reduceSkillFctPercent * 0.01), precision));
  const reducedAcd = Math.max(0, round((step.acd - reduceSkillAcd) * (1 - acd * 0.01), precision));
  const reducedCd = Math.max(0, round(step.cd - reduceSkillCd, precision));

  const oneStepTime = reducedVct + reducedFct + Math.max(reducedCd, reducedAcd);
  const stepTime = round(oneStepTime * repeat, precision);

  return { label: step.label, repeat, reducedVct, reducedFct, reducedAcd, reducedCd, stepTime };
};

export const calcSkillAspd = (params: {
  skillData: AtkSkillModel;
  totalEquipStatus: EquipmentSummaryModel;
  status: StatusSummary;
  skillLevel: number;
  basicHitsPerSec?: number;
  precastRepeats?: Record<string, number>;
}): SkillAspdModel => {
  const { skillData, totalEquipStatus, status, skillLevel, basicHitsPerSec, precastRepeats } = params;
  const { name, acd: baseSkillAcd, hitEveryNSec } = skillData;
  const { cd: baseSkillCd, fct: baseSkillFct, vct: baseSkillVct } = skillData;

  const skillAcd = typeof baseSkillAcd === 'function' ? baseSkillAcd(skillLevel) : baseSkillAcd;
  let skillCd = typeof baseSkillCd === 'function' ? baseSkillCd(skillLevel) : baseSkillCd;
  let skillFct = typeof baseSkillFct === 'function' ? baseSkillFct(skillLevel) : baseSkillFct;
  let skillVct = typeof baseSkillVct === 'function' ? baseSkillVct(skillLevel) : baseSkillVct;
  skillCd = floor(skillCd, 3)
  skillFct = floor(skillFct, 3)
  skillVct = floor(skillVct, 3)
  if (totalEquipStatus['releasedSkill']) {
    skillCd = 0;
    skillFct = 0;
    skillVct = 0;
  }

  const reduceSkillCd = totalEquipStatus[`cd__${name}`] || 0;
  const reduceSkillVct = totalEquipStatus[`vct__${name}`] || 0;
  const reduceSkillVctFix = totalEquipStatus[`fix_vct__${name}`] || 0;
  const reduceSkillFct = totalEquipStatus[`fct__${name}`] || 0;
  const reduceSkillFctPercent = totalEquipStatus[`fctPercent__${name}`] || 0;
  const reduceSkillAcd = totalEquipStatus[`acd__${name}`] || 0;

  const { acd, vct, vct_inc = 0, fct, fctPercent, vctBySkill = 0 } = totalEquipStatus;
  const { totalDex, totalInt } = status;

  const precision = 4;
  const dex2Int1 = totalDex * 2 + totalInt;
  const vctByStat = Math.max(0, 1 - Math.sqrt(floor(dex2Int1 / 530, 5)));
  const vctGlobal = Math.max(0, 1 - (vct - vct_inc) / 100);
  const vctSkill = Math.max(0, 1 - reduceSkillVct / 100);
  const vctBySkill_ = (100 - vctBySkill) / 100;

  const reducedVct = Math.max(0, roundUp((skillVct - reduceSkillVctFix) * vctByStat * vctGlobal * vctSkill * vctBySkill_, precision));
  const reducedCd = Math.max(0, round(skillCd - reduceSkillCd, precision));
  const reducedAcd = Math.max(0, round((skillAcd - reduceSkillAcd) * (1 - acd * 0.01), precision));

  const reducedFct = Math.max(0, roundUp((skillFct - reduceSkillFct - fct) * (1 - fctPercent * 0.01) * (1 - reduceSkillFctPercent * 0.01), precision));

  const blockPeriod = hitEveryNSec > 0 ? 0 : Math.max(reducedCd, reducedAcd);
  const castPeriod = hitEveryNSec > 0 ? round(hitEveryNSec, 2) : roundUp(reducedVct + reducedFct, precision);
  const hitPeriod = round(blockPeriod + castPeriod, 5);

  // Precast sequence handling
  const { precastSequence } = skillData;
  let precastResult: Pick<SkillAspdModel, 'precastSteps' | 'precastTotalTime' | 'releaseTime' | 'cycleTotalTime'> = {};

  if (precastSequence?.length > 0 && basicHitsPerSec > 0) {
    const precastSteps = precastSequence.map((step) => {
      const repeat = precastRepeats?.[step.name]
        ?? step.repeat
        ?? step.userRepeat?.defaultRepeat
        ?? 1;
      return calcPrecastStepTime(step, repeat, totalEquipStatus, vctByStat, precision);
    });

    const precastTotalTime = round(precastSteps.reduce((sum, s) => sum + s.stepTime, 0), precision);
    const totalReleases = precastSteps.reduce((sum, s) => sum + s.repeat, 0);
    const releaseTime = round(totalReleases / basicHitsPerSec, precision);
    const cycleTotalTime = round(precastTotalTime + releaseTime, precision);

    precastResult = { precastSteps, precastTotalTime, releaseTime, cycleTotalTime };
  }

  const effectiveHitPerSec = precastResult.cycleTotalTime > 0
    ? Math.min(
        floor(precastResult.precastSteps.reduce((sum, s) => sum + s.repeat, 0) / precastResult.cycleTotalTime, 1),
        MAX_SKILL_CASTS_PER_SEC,
      )
    : Math.min(floor(1 / hitPeriod, 1), MAX_SKILL_CASTS_PER_SEC);

  return {
    cd: skillCd,
    reducedCd,
    vct: skillVct,
    sumDex2Int1: dex2Int1,
    vctByStat,
    vctSkill,
    reducedVct,
    fct: skillFct,
    reducedFct,
    acd: skillAcd,
    reducedAcd,
    castPeriod: castPeriod,
    hitPeriod,
    totalHitPerSec: effectiveHitPerSec,
    ...precastResult,
  };
};
```

**Step 2: Run tests to verify they pass**

Run: `npx ng test --watch=false 2>&1 | tail -20`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add src/app/utils/calc-skill-aspd.ts
git commit -m "feat: implement precast cycle time in calcSkillAspd"
```

---

### Task 5: Pass basicHitsPerSec from damage-calculator to calcSkillAspd

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/damage-calculator.ts` (~line 1356)

**Step 1: Update the calcSkillAspd call**

Find the existing call at line 1356:

```ts
const skillAspd = calcSkillAspd({ skillData, status: this.status, totalEquipStatus: this.totalBonus, skillLevel });
```

Replace with:

```ts
const skillAspd = calcSkillAspd({
  skillData,
  status: this.status,
  totalEquipStatus: this.totalBonus,
  skillLevel,
  basicHitsPerSec: basicAspd.hitsPerSec,
  precastRepeats: this.precastRepeats,
});
```

Also add a `precastRepeats` property to the `DamageCalculator` class. Find the class declaration and add:

```ts
precastRepeats: Record<string, number> = {};
```

And add a setter method:

```ts
setPrecastRepeats(repeats: Record<string, number>) {
  this.precastRepeats = repeats;
  return this;
}
```

**Step 2: Build to verify**

Run: `npx ng build --configuration=development 2>&1 | head -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/layout/pages/ro-calculator/damage-calculator.ts
git commit -m "feat: pass basicHitsPerSec and precastRepeats to calcSkillAspd"
```

---

### Task 6: Add precastRepeats state to Calculator and wire through

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/calculator.ts`
- Modify: `src/app/models/main.model.ts`

**Step 1: Add precastRepeats to MainModel**

In `src/app/models/main.model.ts`, add after `aspdPotions`:

```ts
  precastRepeats?: Record<string, number>;
```

**Step 2: Wire precastRepeats through Calculator**

In `calculator.ts`, find where `this.dmgCalculator` is used before `calculateAllDamages`. In the `calculateAllDamages` method (around line 1444), add before the call:

```ts
  calculateAllDamages(skillValue: string) {
    const { basicDmg, misc, skillDmg, skillAspd, basicAspd } = this.dmgCalculator
      .setExtraBonus([])
      .setPrecastRepeats(this.model.precastRepeats || {})
      .calculateAllDamages({ skillValue, propertyAtk: this.propertyBasicAtk, maxHp: this.maxHp, maxSp: this.maxSp });
```

Do the same in `recalcExtraBonus` (around line 1597 where the second `calculateAllDamages` call is):

```ts
    const { basicDmg, skillDmg, basicAspd, skillAspd } = calc
      .setPrecastRepeats(this.model.precastRepeats || {})
      .calculateAllDamages({ skillValue, propertyAtk: this.propertyBasicAtk, maxHp, maxSp });
```

**Step 3: Build to verify**

Run: `npx ng build --configuration=development 2>&1 | head -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/models/main.model.ts src/app/layout/pages/ro-calculator/calculator.ts
git commit -m "feat: wire precastRepeats from model through calculator"
```

---

### Task 7: Add Released skill entries to Warlock

**Files:**
- Modify: `src/app/jobs/Warlock.ts`

**Step 1: Add Released variants of existing skills**

Add new entries to `atkSkillList3rd` for each skill that can be Released. Each Released entry has `acd: 0, fct: 0, vct: 0, cd: 0` (the Release itself is ASPD-based) and a `precastSequence` with Memorizar.

Add these entries after the existing skills in `atkSkillList3rd`:

```ts
    {
      name: 'Crimson Rock',
      label: 'Crimson Rock Lv5 (Released)',
      value: 'Crimson Rock Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      hit: 7,
      element: ElementType.Fire,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        return (700 + skillLevel * 600) * (baseLevel / 100);
      },
    },
    {
      name: 'Comet',
      label: 'Comet Lv5 (Released)',
      value: 'Comet Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      hit: 10,
      element: ElementType.Neutral,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        return (2500 + skillLevel * 700) * (baseLevel / 100);
      },
    },
    {
      name: 'Jack Frost',
      label: 'Jack Frost Lv5 (Released)',
      value: 'Jack Frost Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      totalHit: 4,
      isMatk: true,
      element: ElementType.Water,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        return (1000 + skillLevel * 300) * (baseLevel / 100);
      },
    },
    {
      name: 'Soul Expansion',
      label: 'Soul Expansion Lv5 (Released)',
      value: 'Soul Expansion Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      element: ElementType.Ghost,
      hit: 2,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel, status } = input;
        const baseLevel = model.level;
        return (1000 + skillLevel * 200 + status.totalInt) * (baseLevel / 100);
      },
    },
    {
      name: 'Chain Lightning',
      label: 'Chain Lightning Lv5 (Released)',
      value: 'Chain Lightning Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      element: ElementType.Wind,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        const chainBonus = 900;
        return (500 + skillLevel * 100) * (baseLevel / 100) + chainBonus;
      },
    },
    {
      name: 'Earth Strain',
      label: 'Earth Strain Lv5 (Released)',
      value: 'Earth Strain Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      hit: 10,
      element: ElementType.Earth,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        return (1000 + skillLevel * 600) * (baseLevel / 100);
      },
    },
    {
      name: 'Hell Inferno',
      label: 'Hell Inferno Lv5 (Released)',
      value: 'Hell Inferno Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      element: ElementType.Fire,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        return skillLevel * 400 * (baseLevel / 100);
      },
      part2: {
        label: 'Shadow Dmg',
        isIncludeMain: true,
        element: ElementType.Dark,
        isMatk: true,
        isMelee: false,
        hit: 3,
        formula: (input: AtkSkillFormulaInput): number => {
          const { model, skillLevel } = input;
          const baseLevel = model.level;
          return skillLevel * 600 * (baseLevel / 100);
        },
      },
    },
    {
      name: 'Drain Life',
      label: 'Drain Life Lv5 (Released)',
      value: 'Drain Life Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      element: ElementType.Neutral,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel, status } = input;
        const baseLevel = model.level;
        return (skillLevel * 200 + status.totalInt) * (baseLevel / 100);
      },
    },
    {
      name: 'Frost Misty',
      label: 'Frost Misty Lv5 (Released)',
      value: 'Frost Misty Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      hit: 5,
      element: ElementType.Water,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        return (200 + skillLevel * 100) * (baseLevel / 100);
      },
    },
```

Also uncomment and add Tetra Vortex (Released) with its sphere precast:

```ts
    {
      name: 'Tetra Vortex',
      label: 'Tetra Vortex Lv10 (Released)',
      value: 'Tetra Vortex Released==10',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      totalHit: 4,
      element: ElementType.Neutral,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          repeat: 1,
        },
        {
          name: 'Summon Element Ball', label: 'Invocar Esfera',
          fct: 0, vct: 2, acd: 1, cd: 0,
          repeat: 1,
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel } = input;
        return 800 + skillLevel * 400;
      },
    },
```

**Step 2: Build to verify**

Run: `npx ng build --configuration=development 2>&1 | head -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/jobs/Warlock.ts
git commit -m "feat: add Released skill variants to Warlock with precastSequence"
```

---

### Task 8: Add precast repeat dropdown and cycle summary to UI

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/battle-dmg-summary/battle-dmg-summary.component.html`
- Modify: `src/app/layout/pages/ro-calculator/battle-dmg-summary/battle-dmg-summary.component.ts`
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.component.ts`
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.component.html`

**Step 1: Add Output event and precastRepeats Input to BattleDmgSummaryComponent**

In `battle-dmg-summary.component.ts`, add:

```ts
import { Component, EventEmitter, Input, Output } from '@angular/core';

// Add to the class:
@Output() precastRepeatChange = new EventEmitter<{ stepName: string; repeat: number }>();
```

**Step 2: Add precast UI section to battle-dmg-summary template**

In `battle-dmg-summary.component.html`, after the "Skill/s:" `app-calc-value` (line 208) and before the closing `</div>` of the grid (line 210), add the precast section:

```html
      <!-- Precast Cycle Summary -->
      <ng-container *ngIf="totalSummary?.calcSkill?.precastSteps?.length > 0">
        <div class="col-12 mt-2" style="border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 0.5rem;">
          <small style="color: #94a3b8; font-weight: 600;">Ciclo de Rotação</small>
        </div>
        <ng-container *ngFor="let step of totalSummary?.calcSkill?.precastSteps">
          <div class="col-6">
            <app-calc-value
              [label]="step.label + ' ×' + step.repeat + ':'"
              styleClass="summary_value"
              [isGreaterIsBetter]="false"
              [max]="step.stepTime"
            ></app-calc-value>
          </div>
        </ng-container>
        <div class="col-6">
          <app-calc-value
            label="Release:"
            styleClass="summary_value"
            [isGreaterIsBetter]="false"
            [max]="totalSummary?.calcSkill?.releaseTime"
          ></app-calc-value>
        </div>
        <div class="col-6">
          <app-calc-value
            label="Ciclo Total:"
            styleClass="summary_highlight"
            [isGreaterIsBetter]="false"
            [max]="totalSummary?.calcSkill?.cycleTotalTime"
          ></app-calc-value>
        </div>
      </ng-container>
```

**Step 3: Add repeat dropdown to ro-calculator.component**

In `ro-calculator.component.ts`, find the `selectedCharacter` setup area (around where `atkSkills` is set). Add a computed property to get the current skill's precastSequence steps that have `userRepeat`:

```ts
  get precastUserRepeatSteps(): { name: string; label: string; maxRepeat: number }[] {
    const skill = this.atkSkills?.find(s => s.value === this.model.selectedAtkSkill);
    if (!skill?.precastSequence) return [];
    return skill.precastSequence
      .filter(s => s.userRepeat)
      .map(s => ({ name: s.name, label: s.userRepeat.label, maxRepeat: s.userRepeat.maxRepeat }));
  }

  getRepeatOptions(maxRepeat: number): { label: string; value: number }[] {
    return Array.from({ length: maxRepeat }, (_, i) => ({ label: `${i + 1}×`, value: i + 1 }));
  }

  onPrecastRepeatChange(stepName: string, repeat: number) {
    if (!this.model.precastRepeats) this.model.precastRepeats = {};
    this.model.precastRepeats[stepName] = repeat;
    this.updateItemEvent.next(1);
  }
```

In `ro-calculator.component.html`, find the skill dropdown section. After the atk skill dropdown (search for `onAtkSkillChange`), add the repeat dropdown:

```html
        <ng-container *ngFor="let step of precastUserRepeatSteps">
          <div class="field col-6 md:col-3">
            <label>{{ step.label }}</label>
            <p-dropdown
              [options]="getRepeatOptions(step.maxRepeat)"
              [ngModel]="model.precastRepeats?.[step.name] || 1"
              (ngModelChange)="onPrecastRepeatChange(step.name, $event)"
              optionLabel="label"
              optionValue="value"
              appendTo="body"
            ></p-dropdown>
          </div>
        </ng-container>
```

**Step 4: Initialize precastRepeats from skill defaults on skill change**

In `onAtkSkillChange()` in `ro-calculator.component.ts`, initialize default repeats:

```ts
  onAtkSkillChange() {
    const skill = this.atkSkills?.find(s => s.value === this.model.selectedAtkSkill);
    if (skill?.precastSequence) {
      if (!this.model.precastRepeats) this.model.precastRepeats = {};
      for (const step of skill.precastSequence) {
        if (step.userRepeat && !this.model.precastRepeats[step.name]) {
          this.model.precastRepeats[step.name] = step.userRepeat.defaultRepeat;
        }
      }
    }
    this.updateItemEvent.next(1);
  }
```

**Step 5: Build and verify**

Run: `npx ng build --configuration=development 2>&1 | head -10`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/app/layout/pages/ro-calculator/battle-dmg-summary/ src/app/layout/pages/ro-calculator/ro-calculator.component.ts src/app/layout/pages/ro-calculator/ro-calculator.component.html
git commit -m "feat: add precast cycle summary and repeat dropdown to UI"
```

---

### Task 9: Remove "Released" active skill toggle dependency

**Files:**
- Modify: `src/app/jobs/Warlock.ts`

**Step 1: Evaluate the "Released" toggle**

The existing "Released" toggle (lines 331-339) sets `releasedSkill: 1` which zeroes out cd/fct/vct in `calcSkillAspd`. With the new "(Released)" skill entries, the toggle is still useful for the **normal** skill entries (when user wants to cast a normal skill while Released is active). But when using a "(Released)" variant, the skill already has `fct: 0, vct: 0, cd: 0, acd: 0`.

**No change needed** — the Released toggle and the new Released skill entries work independently. The toggle affects normal skills, the new entries handle the full rotation. This task is a verification step only.

**Step 2: Verify by building**

Run: `npx ng build --configuration=development 2>&1 | head -5`
Expected: Build succeeds

---

### Task 10: Manual smoke test

**Step 1: Start dev server**

Run: `npm start`

**Step 2: Test in browser**

1. Open http://localhost:4200
2. Select Warlock class
3. Verify new "(Released)" skills appear in the atk skill dropdown
4. Select "Crimson Rock Lv5 (Released)"
5. Verify "Repetições" dropdown appears (1× to 7×)
6. Verify the Skill ASPD panel shows "Ciclo de Rotação" section with Memorizar time, Release time, and Ciclo Total
7. Change repetitions → verify DPS recalculates
8. Select normal "Crimson Rock Lv5" → verify precast section disappears
9. Test "Tetra Vortex Lv10 (Released)" → verify 2 precast steps (Memorizar + Invocar Esfera)

**Step 3: Run all tests**

Run: `npx ng test --watch=false`
Expected: All tests pass

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: smoke test fixes for skill sequence"
```
