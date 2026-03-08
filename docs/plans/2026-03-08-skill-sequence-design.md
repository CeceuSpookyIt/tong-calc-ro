# Skill Sequence (Precast) System — Design

**Date**: 2026-03-08
**Status**: Approved

## Problem

The Warlock (Arcana) class damage depends on a sequence of skills: Memorizar → Release. The calculator currently only supports selecting a single skill for DPS calculation, which doesn't account for the full rotation time. This also affects other classes like Sura that have skill sequences.

## Solution

Add a generic `precastSequence` property to `AtkSkillModel` that allows defining preparatory skill steps before the main attack skill.

## Data Model

### PrecastStep Interface

```ts
interface PrecastStep {
  name: string;           // e.g., "Memorizar"
  label: string;          // UI display label
  fct: number;            // Fixed Cast Time (seconds)
  vct: number;            // Variable Cast Time (seconds)
  acd: number;            // Aftercast Delay (seconds)
  cd: number;             // Cooldown (seconds)
  repeat?: number;        // Fixed repetitions (e.g., 1 for sphere invocation)
  userRepeat?: {          // User-configurable repetitions
    defaultRepeat: number;
    maxRepeat: number;
    label: string;        // Dropdown label (e.g., "Repetições")
  };
}
```

### AtkSkillModel Extension

```ts
// Added to AtkSkillModel in _character-base.abstract.ts
precastSequence?: PrecastStep[];
```

### Usage Examples

**Crimson Rock (Released):**
```ts
{
  name: 'Crimson Rock',
  label: 'Crimson Rock Lv5 (Released)',
  value: 'Crimson Rock Released==5',
  precastSequence: [
    {
      name: 'Memorizar', label: 'Memorizar',
      fct: 1, vct: 5, acd: 0, cd: 0,
      userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' }
    }
  ],
  // ... rest of skill (formula, element, etc.)
  // cd/fct/vct/acd of the skill itself are 0 (Release is ASPD-based)
}
```

**Tetra Vortex (Released):**
```ts
{
  name: 'Tetra Vortex',
  label: 'Tetra Vortex Lv10 (Released)',
  value: 'Tetra Vortex Released==10',
  precastSequence: [
    {
      name: 'Memorizar', label: 'Memorizar',
      fct: 1, vct: 5, acd: 0, cd: 0,
      repeat: 1
    },
    {
      name: 'Summon Element Ball', label: 'Invocar Esfera',
      fct: 0, vct: 2, acd: 1, cd: 0,
      repeat: 1
    },
  ],
  // ...
}
```

## Cycle Time Calculation

### Current Formula (unchanged for skills without precastSequence)

```
hitPeriod = max(reducedCd, reducedAcd) + reducedVct + reducedFct
totalHitPerSec = min(1 / hitPeriod, 7)
```

### New Formula (for skills with precastSequence)

```
// For each PrecastStep:
stepTime = (reducedVct_step + reducedFct_step + max(cd_step, acd_step)) × repeat
totalPrecastTime = sum of all stepTime

// Release time (ASPD-based):
releaseTime = 1 / basicAspd.hitsPerSec

// Total releases = sum of repeats from Memorizar steps
// (usually = userRepeat value)
N = totalReleases

// Full cycle:
cycleTotalTime = totalPrecastTime + (N × releaseTime)

// Effective hits per second:
totalHitPerSec = N / cycleTotalTime
```

### VCT/FCT Reduction

Precast steps use the same global reduction formulas (DEX/INT stats, equipment bonuses) as regular skills. Skill-specific reductions (e.g., `vct__Memorizar`) are also supported via the existing `totalEquipStatus` lookup.

## UI Changes

### Skill Selection

Released variants are separate entries in the `atkSkillList` dropdown. The user explicitly chooses between:
- "Crimson Rock Lv5" (normal cast)
- "Crimson Rock Lv5 (Released)" (Memorizar → Release rotation)

### Repeat Selector

When a skill with `precastSequence` is selected and a step has `userRepeat`:
- A dropdown appears with options "1×, 2×, 3×, ... maxRepeat×"
- Placed in the Skill ASPD summary panel
- Changing the value recalculates DPS

### Cycle Summary

Integrated in the existing Skill ASPD panel:
- Shows each precast step with its reduced time and repeat count
- Shows release time
- Shows total cycle time
- Example: "Memorizar ×3 (2.1s) + Release ×3 (0.14s) = 6.72s"

## Scope

### Phase 1 (this implementation)
- `PrecastStep` interface and `precastSequence` property on `AtkSkillModel`
- Modified `calcSkillAspd` to handle precast cycle time
- Warlock Released skills: Crimson Rock, Comet, Jack Frost, Chain Lightning, Soul Expansion, Earth Strain, Hell Inferno, Tetra Vortex, Drain Life, Frost Misty
- Same-skill repetition only (no mixed rotations)
- Dropdown UI for repeat count
- Cycle summary in Skill ASPD panel

### Future
- Sura skill sequences (Gates of Hell, etc.)
- Mixed skill rotations
- Other classes with combo mechanics
