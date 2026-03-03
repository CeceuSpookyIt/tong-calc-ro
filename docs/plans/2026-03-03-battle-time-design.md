# Battle Time Calculation — Design

**Date**: 2026-03-03
**Status**: Approved

## Goal

Replace the existing `skillHitKill` (hits-to-kill) with a **battle time** metric showing how long it takes to kill the selected monster, displayed in seconds or minutes+seconds. Show battle time for both skill DPS and basic (auto-attack) DPS separately.

## Current State

- `basicDps` and `skillDps` already calculated in `damage-calculator.ts`
- `skillHitKill = Math.ceil(hp / minDamage)` exists but is less useful than time
- Cooldown, cast time, and ACD are already factored into `skillDps` via `calcSkillAspd`
- Monster HP available via `monster.data.hp`

## Design

### Calculation

```
skillBattleTime = monsterHP / skillDps   (seconds, 1 decimal place)
basicBattleTime = monsterHP / basicDps   (seconds, 1 decimal place)
```

If DPS = 0, display `—` (dash).

### Model Changes

- `SkillDamageSummaryModel`: replace `skillHitKill: number` with `skillBattleTime: number`
- `BasicDamageSummaryModel`: add `basicBattleTime: number`

### Display Format

```
time <= 60s  → "12.5s"
time > 60s   → "2m 30s"
```

Implemented as a utility function `formatBattleTime(seconds: number): string`.

### UI Changes

- **Skill section** (battle-dmg-summary): replace Hit Kill line with "Tempo: Xs" or "Tempo: Xm Ys"
- **Basic ATQ section** (battle-dmg-summary): add "Tempo: Xs" line near the DPS value

### Files Affected

1. `src/app/models/damage-summary.model.ts` — model fields
2. `src/app/layout/pages/ro-calculator/damage-calculator.ts` — calculation
3. `src/app/layout/pages/ro-calculator/battle-dmg-summary/battle-dmg-summary.component.html` — template
4. `src/app/utils/format-battle-time.ts` — new utility function (small, justified)

### Approach

Approach A: Replace Hit Kill. Minimal impact — change 1 field in model, 1 calculation in damage-calculator, update template display, add 1 small utility function.
