# Design: Cap de 7 Skills/s na Simulação de DPS

**Data:** 2026-03-03

## Problema

Quando reduções de After Cast Delay (ACD), Variable Cast Time (VCT) e Cooldown (CD) são muito altas, a quantidade de skills/s calculada pode ultrapassar 7/s. Isso é impossível de reproduzir no client do jogo por limitações técnicas e humanas (7 skills/s = 1 skill a cada ~142ms). O DPS resultante fica distorcido e não reflete a realidade do gameplay.

## Solução

Constante `MAX_SKILL_CASTS_PER_SEC = 7` aplicada no cálculo de `totalHitPerSec` em `calc-skill-aspd.ts`.

## Decisões

- **Escopo:** Apenas skill DPS. Auto-attack básico continua usando ASPD normalmente (até 193).
- **Configurabilidade:** Constante fixa no código. Sem configuração de usuário.
- **Feedback visual:** Nenhum. O DPS simplesmente usa o valor com cap.

## Abordagem Escolhida

**Cap no `calc-skill-aspd.ts`** (Abordagem A):
- Ponto único de mudança
- Afeta todos os consumidores consistentemente (skillDps, skillBattleTime, tabela de monstros)
- O cap é aplicado antes do `Math.min` com `basicAspd.hitsPerSec` em `damage-calculator.ts`

### Mudança Principal

```typescript
// src/app/utils/calc-skill-aspd.ts
const MAX_SKILL_CASTS_PER_SEC = 7;

// Na linha do totalHitPerSec:
totalHitPerSec: Math.min(floor(1 / hitPeriod, 1), MAX_SKILL_CASTS_PER_SEC)
```

## Impacto

- `skillDps` e `skillBattleTime` → afetados automaticamente
- Tabela de comparação de monstros → herda o cap
- `basicDps` e `basicBattleTime` → **não afetados**
- UI → sem mudanças visuais
