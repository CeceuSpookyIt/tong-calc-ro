# Design: Migração de Skill Names para AegisName

**Data:** 2026-03-31
**Objetivo:** Substituir EN display names por aegisNames como chave canônica de skills em todo o sistema, exibindo PT-BR na UI.

## Motivação

1. **Confiabilidade:** Nomes EN são ambíguos (ex: "Metallic Fury" vs "Metalic Sound" vs "Metallic Sound" — 3 variantes no codebase). AegisNames são únicos e estáveis.
2. **UX:** Exibir nomes PT-BR oficiais do cliente LATAM na interface.
3. **Manutenção:** O mapeamento PT-BR → EN é propenso a erros (ex: "Vulcão de Flechas" mapeado como "Severe Rainstorm" em vez de "Arrow Vulcan"). Com aegisName como chave, o mapeamento é direto.

## Abordagem

**Big bang** — migrar tudo de uma vez. AegisName literal (ex: `RK_IGNITIONBREAK`) como chave em todos os sistemas.

## Escopo Quantitativo

| Recurso | Quantidade |
|---------|------------|
| Skills únicas em item.json (chaves) | ~401 |
| Skills únicas em job files | ~465 |
| Skills no skill-name.ts | ~657 |
| Skills no skillinfolist.lub (GRF) | 1539 |
| Job files a migrar | ~36 |
| Share-passive/active-skills | ~30 |
| Arquivos totais que referenciam skills | ~129 |
| Chamadas learnLv()/isSkillActive() | ~229 |
| Comparações hardcoded (===) | ~15 |
| Templates HTML com display de skill | ~5 |

---

## Seção 1: Skill Registry

**Arquivo:** `src/app/constants/skill-registry.ts`

```ts
interface SkillEntry {
  en: string;     // 'Ignition Break' — para backwards compat e migração
  ptbr: string;   // 'Impacto Flamejante' — para display na UI
}

export const SKILL_REGISTRY = {
  RK_IGNITIONBREAK: { en: 'Ignition Break', ptbr: 'Impacto Flamejante' },
  AB_ADORAMUS: { en: 'Adoramus', ptbr: 'Adoramus' },
  WM_METALICSOUND: { en: 'Metalic Sound', ptbr: 'Ruído Estridente' },
  // ... ~657 entries (só skills usadas na calc)
} as const;

export type SKILL_AEGIS = keyof typeof SKILL_REGISTRY;

// Reverse lookups (gerados em runtime, cached)
export const aegisByEN = new Map<string, SKILL_AEGIS>();
export const aegisByPTBR = new Map<string, SKILL_AEGIS>();
// Populados via loop no módulo init
```

**Somente skills usadas pela calculadora** (~657), não todas as 1539 do GRF.

### Script Gerador

**Arquivo:** `scripts/generate-skill-registry.mjs`

Fontes de dados (cruzamento automático):
1. `skillinfolist.lub` do GRF → aegisName → PT-BR (1539 skills)
2. `skill-name.ts` + job files atuais → EN names usadas na calc (~657)
3. `skill-name-map.json` → PT-BR → EN (316 bridges)

O script cruza as 3 fontes, logando skills sem match para resolução manual. Output: `skill-registry.ts` pronto para commitar.

---

## Seção 2: Migração do item.json

### Chaves a migrar

| Padrão | Exemplo antes | Exemplo depois |
|--------|---------------|----------------|
| Skill name direto | `"Ignition Break": ["15"]` | `"RK_IGNITIONBREAK": ["15"]` |
| Prefixo `cd__` | `"cd__Ignition Break": ["0.5"]` | `"cd__RK_IGNITIONBREAK": ["0.5"]` |
| Prefixo `vct__` | `"vct__Meteor Storm": ["5"]` | `"vct__WZ_METEOR": ["5"]` |
| Prefixo `fct__` | `"fct__Reverberation": ["1"]` | `"fct__WM_REVERBERATION": ["1"]` |
| Prefixo `fix_vct__` | `"fix_vct__Psychic Wave": ["2"]` | `"fix_vct__WL_PSYCHIC_WAVE": ["2"]` |
| Prefixo `acd__` | `"acd__Holy Light": ["3"]` | `"acd__AL_HOLYLIGHT": ["3"]` |
| Prefixo `autocast__` | `"autocast__Fire Bolt": [...]` | `"autocast__MG_FIREBOLT": [...]` |
| Prefixo `flat_` | `"flat_Arrow Vulcan": ["100"]` | `"flat_CG_ARROWVULCAN": ["100"]` |
| Prefixo `dmg__` | `"dmg__Lucifer Morocc": ["10"]` | `"dmg__DK_LUCIFERMOROCC": ["10"]` |

**Nota sobre separadores:** Prefixos `cd__`, `vct__`, `fct__`, `fix_vct__`, `acd__`, `autocast__`, `dmg__` usam duplo underscore (`__`). O prefixo `flat_` usa underscore simples (`_`). AegisNames também usam underscore simples (`RK_IGNITIONBREAK`) mas **nunca contêm duplo underscore** (confirmado contra 1539 aegisNames do GRF). O parser do calculator distingue os prefixos por match exato do prefixo, não por split em `_`/`__`, então não há conflito.

### Valores a migrar (dentro das strings de valor)

| Padrão | Exemplo antes | Exemplo depois |
|--------|---------------|----------------|
| `LEARN_SKILL[Name==Lv]` | `"LEARN_SKILL[Snake Eyes==5]===10"` | `"LEARN_SKILL[AC_VULTURE==5]===10"` |
| `LEARN_SKILL2[Name==Lv]` | `"LEARN_SKILL2[Illusion - Shadow==1]===5"` | `"LEARN_SKILL2[SC_ILLUSION_SHADOW==1]===5"` |
| `ACTIVE_SKILL[Name]` | `"ACTIVE_SKILL[Platinum Altar]===10"` | `"ACTIVE_SKILL[CD_PLATINUM_ALTER]===10"` |
| `level:Name` | `"level:Clashing Spiral---1"` | `"level:LK_SPIRALPIERCE---1"` |

### O que NÃO migrar (dentro das strings de valor)

- `EQUIP[ItemName]` — nomes de itens, não skills
- `REFINE[...]` — referência a refino
- `SUM[stat1,stat2==N]` — referência a stats
- `POS_SPECIFIC[...]` — referência a posição + item

### Script de migração

**Arquivo:** `scripts/migrate-item-scripts.mjs`

1. Lê `item.json`
2. Para cada item, itera `Object.entries(script)`
3. Para cada chave: strip prefixo → tenta `aegisByEN` → se não achar, tenta `aegisByPTBR` (fallback pra scripts com nomes PT-BR misturados)
4. Para cada valor string: regex pra `LEARN_SKILL[`, `LEARN_SKILL2[`, `ACTIVE_SKILL[`, `level:` → traduz o skill name dentro
5. Gera **diff report** antes de gravar pra revisão humana
6. Loga skills não encontradas no registry

---

## Seção 3: Migração dos Job Files e Constants

### 3.1 `skill-name.ts`

Substituir as duas arrays (`ACTIVE_PASSIVE_SKILL_NAMES`, `OFFENSIVE_SKILL_NAMES`) com aegisNames. O type `SKILL_NAME` se torna re-export de `SKILL_AEGIS`:

```ts
// Antes
export const OFFENSIVE_SKILL_NAMES = ['Ignition Break', 'Arrow Vulcan', ...] as const;
export type SKILL_NAME = (typeof ACTIVE_PASSIVE_SKILL_NAMES)[number] | (typeof OFFENSIVE_SKILL_NAMES)[number];

// Depois
export { SKILL_AEGIS as SKILL_NAME } from './skill-registry';
export const OFFENSIVE_SKILL_NAMES = ['RK_IGNITIONBREAK', 'CG_ARROWVULCAN', ...] as const;
```

### 3.2 Job files (~36 arquivos)

Cada skill list entry migra:
- `name`: `'Ignition Break'` → `'RK_IGNITIONBREAK'`
- `label`: `'Ignition Break Lv10'` → `'Impacto Flamejante Lv10'` (PT-BR do registry)
- `value`: `'Ignition Break==10'` → `'RK_IGNITIONBREAK==10'`
- `values[]`: `['[Improved 1nd] Cart Cannon==5']` → `['[Improved 1nd] GN_CARTCANNON==5']`

**Ordem das skills nos arrays NÃO deve mudar** — índices numéricos de presets/builds salvos são posicionais.

### 3.3 Chamadas de lookup (~229)

```ts
// Antes
learnLv('Demon Bane')
isSkillActive('Aura Blade')
activeSkillLv('Two hand Quicken')

// Depois
learnLv('AL_DEMONBANE')
isSkillActive('KN_AURABLADE')
activeSkillLv('KN_TWOHANDQUICKEN')
```

### 3.4 Comparações hardcoded (~15)

```ts
// Antes (damage-calculator.ts)
if (skillName === 'Fist Spell') ...

// Depois
if (skillName === 'WL_FISTSPELL') ...
```

Arquivos afetados: `damage-calculator.ts`, `Cardinal.ts`, `Sura.ts`, `Windhawk.ts`, `ShadowChaser.ts`, `SuperNovice.ts`, `ro-calculator.component.ts` (`'Special Pharmacy'` → `'GN_S_PHARMACY'`).

### 3.5 Outros constants

| Arquivo | Mudança |
|---------|---------|
| `job-buffs.ts` | `name` fields → aegis |
| `share-passive-skills/*.ts` (~15 files) | `name` fields → aegis |
| `share-active-skills/*.ts` (~15 files) | `name` fields → aegis |
| `autocast-skill-registry.ts` | Record keys → aegis |
| `is-skill-can-edp.ts` | Object keys → aegis |
| `_raw-job.ts` | `name` fields → aegis |

### 3.6 Spec files

`calculator.spec.ts` e outros specs que referenciam skill names → migrar para aegis.

---

## Seção 4: Migração do Calculator Core e UI

### 4.1 Calculator core (mudanças mínimas)

O engine é **genérico** — processa chaves de `item.script` e `totalBonus` sem comparar com strings hardcoded. Se os dados de entrada (item.json + job skill lists) migrarem, o core funciona automaticamente.

**Mudanças manuais necessárias:**

| Arquivo | Mudança |
|---------|---------|
| `damage-calculator.ts` | `skillName === 'Fist Spell'` → `'WL_FISTSPELL'` |
| `damage-calculator.ts` | `skillName === 'basicAtk'` → manter (não é skill real) |
| `calc-skill-aspd.ts` | Nenhuma (genérico — `cd__${name}` funciona com aegis) |
| `calculator.ts` | Nenhuma (genérico) |

### 4.2 Angular Pipe para display PT-BR

**Novo arquivo:** `src/app/pipes/skill-name.pipe.ts`

```ts
@Pipe({ name: 'skillName' })
export class SkillNamePipe implements PipeTransform {
  transform(aegis: string): string {
    return SKILL_REGISTRY[aegis]?.ptbr || aegis;
  }
}
```

Usado nos templates onde skill names são exibidos.

### 4.3 Templates HTML

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `battle-dmg-summary.component.html:373` | `{{ ac.skillName }}` | `{{ ac.skillName \| skillName }}` |
| `shared-preset.component.html:129` | `{{ build.skillName }}` | `{{ build.skillName \| skillName }}` |
| `ro-calculator.component.html:2078` | `{{ model.selectedAtkSkill }}` | Helper que extrai aegis antes de `==` e traduz |
| `ro-calculator.component.html:552,562` | `selectedAtkSkill` dropdown | `label` já vem PT-BR do job (seção 3.2) |

### 4.4 `setSkillTable()` heurística

Hoje detecta skills no `totalSummary` via `charAt(0).toUpperCase()`. AegisNames são uppercase (`RK_IGNITIONBREAK`), stats são lowercase (`atk`). **Continua funcionando sem mudança.**

O display no skill multiplier table precisa do pipe:
```ts
// Antes: { name: 'Ignition Break', value: 15 }
// Depois: { name: 'RK_IGNITIONBREAK', value: 15 } → template usa pipe pra exibir PT-BR
```

### 4.5 `offensiveSkills` no componente

```ts
// Antes
offensiveSkills = names.map(name => ({ label: name, value: name }));

// Depois
offensiveSkills = names.map(name => ({
  label: SKILL_REGISTRY[name]?.ptbr || name,
  value: name
}));
```

### 4.6 Item search

`item-search.component.ts` faz `item.script[skillName]` e `item.script['cd__' + skillName]`. Genérico — funciona com aegis sem mudança.

---

## Seção 5: Migração do Supabase

### 5.1 Campos afetados

| Campo no preset/build | Formato atual | Formato migrado |
|----------------------|---------------|-----------------|
| `selectedAtkSkill` / `skill_name` | `'Ignition Break==10'` | `'RK_IGNITIONBREAK==10'` |
| `skillBuffMap` | `{ 'Dark Claw': 5 }` | `{ 'GC_DARKCLAW': 5 }` |
| `activeSkillMap` | `{ 'Aura Blade': 3 }` | `{ 'KN_AURABLADE': 3 }` |
| `passiveSkillMap` | `{ 'Sword Mastery': 5 }` | `{ 'SM_SWORD': 5 }` |
| `activeSkills` | `[0, 3, 2]` | **Não afetado** (índices posicionais) |
| `passiveSkills` | `[5, 0, 1]` | **Não afetado** (índices posicionais) |

### 5.2 Script de migração

**Arquivo:** `scripts/migrate-supabase-skills.mjs`

1. Lê todos os registros das tabelas `presets` e `shared_builds` do Supabase (tabela `shared_build_likes` não contém skill names)
2. Para cada registro:
   - `selectedAtkSkill` / `skill_name`: extrai nome antes de `==`, traduz via `aegisByEN`, reescreve
   - `skillBuffMap`, `activeSkillMap`, `passiveSkillMap`: traduz cada chave via `aegisByEN`
3. Atualiza o registro no Supabase
4. **Idempotente**: se a chave já é um aegisName reconhecido, skip
5. Loga registros que não conseguiu migrar

### 5.3 Fallback no load (defesa em profundidade)

`loadBuild()` / `importSharedBuild()`: ao receber `selectedAtkSkill`, tenta encontrar no `atkSkillList` pelo `value`. Se não encontrar (build antigo com EN name ou link compartilhado antigo):
1. Extrai nome antes de `==`
2. Tenta `aegisByEN` → reconstrói como `'AEGIS==Level'`
3. Busca novamente no `atkSkillList`

Mesmo fallback para `skillBuffMap`, `activeSkillMap`, `passiveSkillMap`.

O fallback pode ser removido após confirmação de que a migração do banco está completa.

### 5.4 Supabase RPCs e ranking

- `get_skill_ranking` recebe `p_skill_name` — pós-migração recebe aegisName
- `get_item_ranking` recebe `p_skill_name` — mesma situação
- A UI de preset-summary exibe `skill_name` — precisa do pipe `skillName` pra traduzir
- **Limpar cache de ranking** no Supabase após migração (ou esperar TTL expirar)

### 5.5 URLs de builds compartilhados

Links compartilhados podem conter `selectedAtkSkill` com EN name antigo. O parser de URL precisa do mesmo fallback da seção 5.3.

---

## Seção 6: Exclusões Explícitas

O script de migração **NÃO deve tentar traduzir** os seguintes padrões:

| Padrão | Motivo |
|--------|--------|
| `chance__*` | Chaves são nomes de stats (`str`, `atkPercent`, `p_size_all`), não skills |
| `basicAtk` | Constante interna do calculator, não é uma skill real |
| `EQUIP[...]` dentro de valores | Nomes de itens, não skills |
| `REFINE[...]`, `SUM[...]`, `POS_SPECIFIC[...]` | Referências a stats/posições |

### Items com nomes PT-BR misturados nos scripts

Confirmados existentes (precisam do fallback `aegisByPTBR`):
- `vct__Melodia de Morfeu`
- `vct__Ritmo Contagiante`
- `vct__Sinfonia dos Ventos`

Validar pós-migração que estes foram corretamente traduzidos.

---

## Seção 7: Ordem de Execução

A migração é big bang mas a implementação deve seguir esta ordem pra manter o codebase compilável a cada passo:

1. **Criar `skill-registry.ts`** + script gerador — sem impacto (arquivo novo)
2. **Criar pipe `skillName`** — sem impacto (arquivo novo)
3. **Criar testes do registry e do pipe** (ver seção 8)
4. **Migrar `skill-name.ts`** — atualiza o type system
5. **Migrar job files** — atualiza `name`, `label`, `value` (preservando ordem)
6. **Migrar constants** — `job-buffs.ts`, `share-*-skills/`, `autocast-skill-registry.ts`, `is-skill-can-edp.ts`
7. **Migrar `item.json`** — script automático com diff review
8. **Migrar calculator core** — ~3 comparações hardcoded
9. **Migrar templates HTML** — adicionar pipes
10. **Migrar specs** — atualizar skill names nos testes
11. **Rodar `npm test`** — todos os testes devem passar
12. **Backup Supabase** — exportar tabelas afetadas antes de migrar
13. **Migrar Supabase** — script de migração do banco (idempotente)
14. **Adicionar fallback no load** — backwards compat permanente
15. **Deploy + limpar cache de ranking**
16. **Atualizar skill `update-latam-client`** — novo pipeline gera aegisNames

---

## Seção 8: Estratégia de Testes

### Testes novos a criar

| Teste | O que valida |
|-------|-------------|
| `skill-registry.spec.ts` | Todos os aegisNames são strings uppercase válidas; nenhum entry tem `en` ou `ptbr` vazio; reverse lookups são bijetivos (sem colisões) |
| `skill-name.pipe.spec.ts` | Pipe traduz aegis → PT-BR; retorna aegis se não encontrado |
| `migrate-item-scripts.spec.mjs` | Round-trip: migrar EN→aegis, depois aegis→EN via registry.en, confirma que bate com o original |
| `migrate-supabase.spec.mjs` | Script é idempotente (rodar 2x não muda resultado); builds com aegisName são skipped |

### Validação da migração do item.json

O script `migrate-item-scripts.mjs` gera um **diff report** antes de gravar. Esse report deve listar:
- Chaves traduzidas (antes → depois)
- Skills não encontradas no registry (erros)
- Items com nomes PT-BR misturados que usaram o fallback

### Dev-mode warning

Após migração, `ro.service.ts` já valida script keys contra `OFFENSIVE_SKILL_NAMES`. Pós-migração, essa validação continua funcionando (agora contra aegisNames). Skills novas não registradas são logadas como `invalidBonusSet`.

---

## Seção 9: Impactos Downstream

### Skill `update-latam-client`

Após essa migração, o processo de adicionar itens novos do cliente (skill em `~/.claude/skills/update-latam-client/`) deve:
- Gerar scripts com **aegisNames** em vez de EN names
- Usar o `SKILL_REGISTRY` pra validar mapeamentos PT-BR → aegis
- Extrair aegisNames do `skillinfolist.lub` como fonte de verdade

A skill precisa ser atualizada como parte do passo 16 da execução.

### Label format variations

Os `label` fields nos jobs têm formatos variados:
- `'Ignition Break Lv10'` → `'Impacto Flamejante Lv10'`
- `'[Improved 1nd] Cart Cannon Lv5'` → `'[Improved 1nd] Canhão de Prótons Lv5'`
- Custom labels sem padrão fixo

O script de migração dos jobs deve:
1. Detectar se o label contém o EN skill name
2. Substituir só a parte do nome (preservando prefixos/sufixos como `[Improved]`, `Lv10`)
3. Se não conseguir parsear, logar pra resolução manual

---

## Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Skill sem aegisName no registry | Script gerador loga unmapped; resolução manual antes de prosseguir |
| Índices de presets quebram se ordem mudar | Ordem dos arrays nas skill lists NÃO muda durante migração |
| Builds antigos no Supabase inacessíveis | Fallback `aegisByEN` permanente no load + migração do banco |
| Links compartilhados antigos quebram | Fallback no parser de URL |
| Bundle size | ~657 entries × ~3 strings ≈ 50-70KB; aceitável |
| EN name sem match no registry | Script loga; resolução manual com Divine Pride API |
| PT-BR inconsistente entre GRF e cliente | GRF `skillinfolist.lub` é fonte de verdade |
| Migração Supabase falha parcialmente | Backup pré-migração + script idempotente (re-run seguro) |
| `chance__` confundido com skill | Exclusão explícita no script (seção 6) |
| Labels com formato irregular | Script detecta e loga pra revisão manual |

### Plano de Rollback

Se a migração falhar criticamente:
1. **Código:** `git revert` do commit de migração
2. **Supabase:** restaurar backup das tabelas exportadas no passo 12
3. **Fallback:** o `aegisByEN` no load garante que builds antigos continuam funcionando mesmo com código migrado parcialmente
