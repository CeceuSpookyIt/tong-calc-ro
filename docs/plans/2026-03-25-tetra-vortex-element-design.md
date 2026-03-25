# Tetra Vortex Released — Seleção de Elemento

**Data:** 2026-03-25

## Problema

O Tetra Vortex Released do Warlock tem elemento fixo em Neutral. O usuário precisa escolher o elemento da esfera invocada (Fogo, Água, Vento, Terra).

## Design

Seguir o padrão existente do Sorcerer (Fist Spell): adicionar `levelList` com variantes de elemento e `getElement()` para mapear cada variante ao `ElementType`.

### Mudanças no `Warlock.ts` (skill Tetra Vortex Released)

1. **`value`** base muda de `'Tetra Vortex Released==10'` para `'Tetra Vortex Released Fire==10'` (default = Fogo)
2. **Adicionar `levelList`** com 4 variantes:
   - `Tetra Vortex Lv10 Released (Fogo)` → `'Tetra Vortex Released Fire==10'`
   - `Tetra Vortex Lv10 Released (Água)` → `'Tetra Vortex Released Water==10'`
   - `Tetra Vortex Lv10 Released (Vento)` → `'Tetra Vortex Released Wind==10'`
   - `Tetra Vortex Lv10 Released (Terra)` → `'Tetra Vortex Released Earth==10'`
3. **Adicionar `getElement(skillValue)`** mapeando cada valor ao ElementType correspondente
4. **Remover `element: ElementType.Neutral`**
5. **Manter intacto:** fórmula, totalHit, precastSequence (repeat fixo em 1), cast times zerados

### Nenhuma mudança em outros arquivos

- `name: 'Tetra Vortex'` não muda → bônus de itens continuam funcionando
- `getElement` + `levelList` já são tratados pela UI e damage calculator automaticamente
- Não precisa de `treatedAsSkillNameFn`
