# Item Ranking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the existing `/preset-summary` page with a new item ranking system based on `shared_builds`, using server-side aggregation via Supabase RPCs with cache tables.

**Architecture:** Two Supabase RPCs (`get_skill_ranking`, `get_item_ranking`) aggregate shared builds server-side, writing results to cache tables with a 30-minute TTL. The Angular frontend calls these RPCs via a refactored `SummaryService`, displaying results in a class → skill → slot grid layout using a new `SlotRankingCardComponent`.

**Tech Stack:** Angular 16, PrimeNG 16, Supabase (PostgreSQL RPCs), TypeScript

**Design doc:** `docs/plans/2026-02-26-item-ranking-design.md`

---

### Task 1: Create SQL Migration File

**Files:**
- Create: `docs/plans/item-ranking-migration.sql`

**Step 1: Write the cache tables DDL**

```sql
-- =============================================
-- Item Ranking Cache Tables + RPCs
-- Run in Supabase SQL Editor
-- =============================================

-- 1. Cache tables
CREATE TABLE IF NOT EXISTS skill_ranking_cache (
  class_id int NOT NULL,
  skill_name text NOT NULL,
  build_count int NOT NULL,
  unique_users int NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, skill_name)
);

CREATE TABLE IF NOT EXISTS item_ranking_cache (
  class_id int NOT NULL,
  skill_name text NOT NULL,
  slot text NOT NULL,
  type text NOT NULL CHECK (type IN ('item', 'card')),
  item_id int NOT NULL,
  use_count int NOT NULL,
  rank int NOT NULL CHECK (rank BETWEEN 1 AND 5),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, skill_name, slot, type, rank)
);
```

**Step 2: Write the `get_skill_ranking` RPC**

```sql
CREATE OR REPLACE FUNCTION get_skill_ranking(
  p_class_id int,
  p_ttl_minutes int DEFAULT 30,
  p_force_refresh bool DEFAULT false
)
RETURNS TABLE (
  skill_name text,
  build_count bigint,
  unique_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cache_age timestamptz;
BEGIN
  -- Check cache freshness
  IF NOT p_force_refresh THEN
    SELECT MIN(updated_at) INTO v_cache_age
    FROM skill_ranking_cache
    WHERE skill_ranking_cache.class_id = p_class_id;

    IF v_cache_age IS NOT NULL AND v_cache_age > now() - (p_ttl_minutes || ' minutes')::interval THEN
      RETURN QUERY
        SELECT src.skill_name, src.build_count::bigint, src.unique_users::bigint
        FROM skill_ranking_cache src
        WHERE src.class_id = p_class_id
        ORDER BY src.build_count DESC;
      RETURN;
    END IF;
  END IF;

  -- Invalidate old cache
  DELETE FROM skill_ranking_cache WHERE skill_ranking_cache.class_id = p_class_id;

  -- Recalculate and insert
  INSERT INTO skill_ranking_cache (class_id, skill_name, build_count, unique_users, updated_at)
  SELECT
    p_class_id,
    sb.skill_name,
    COUNT(*)::int,
    COUNT(DISTINCT sb.user_id)::int,
    now()
  FROM shared_builds sb
  WHERE sb.class_id = p_class_id
    AND sb.skill_name IS NOT NULL
  GROUP BY sb.skill_name;

  -- Return fresh data
  RETURN QUERY
    SELECT src.skill_name, src.build_count::bigint, src.unique_users::bigint
    FROM skill_ranking_cache src
    WHERE src.class_id = p_class_id
    ORDER BY src.build_count DESC;
END;
$$;
```

**Step 3: Write the `get_item_ranking` RPC**

This is the large RPC that extracts all equipment slots and card slots from the JSONB `model` field.

```sql
CREATE OR REPLACE FUNCTION get_item_ranking(
  p_class_id int,
  p_skill_name text,
  p_ttl_minutes int DEFAULT 30,
  p_force_refresh bool DEFAULT false
)
RETURNS TABLE (
  slot text,
  type text,
  item_id int,
  use_count bigint,
  rank bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cache_age timestamptz;
BEGIN
  -- Check cache freshness
  IF NOT p_force_refresh THEN
    SELECT MIN(updated_at) INTO v_cache_age
    FROM item_ranking_cache irc
    WHERE irc.class_id = p_class_id AND irc.skill_name = p_skill_name;

    IF v_cache_age IS NOT NULL AND v_cache_age > now() - (p_ttl_minutes || ' minutes')::interval THEN
      RETURN QUERY
        SELECT irc.slot, irc.type, irc.item_id, irc.use_count::bigint, irc.rank::bigint
        FROM item_ranking_cache irc
        WHERE irc.class_id = p_class_id AND irc.skill_name = p_skill_name
        ORDER BY irc.slot, irc.type, irc.rank;
      RETURN;
    END IF;
  END IF;

  -- Invalidate old cache
  DELETE FROM item_ranking_cache
  WHERE item_ranking_cache.class_id = p_class_id
    AND item_ranking_cache.skill_name = p_skill_name;

  -- Recalculate: extract all equipment + card slots from JSONB model
  INSERT INTO item_ranking_cache (class_id, skill_name, slot, type, item_id, use_count, rank, updated_at)
  WITH filtered_builds AS (
    SELECT sb.model, sb.user_id
    FROM shared_builds sb
    WHERE sb.class_id = p_class_id AND sb.skill_name = p_skill_name
  ),
  -- Equipment items: extract each slot from model JSONB
  slot_items AS (
    SELECT v.slot_name, v.item_id
    FROM filtered_builds fb,
    LATERAL (VALUES
      ('weapon',               COALESCE((fb.model->>'weapon')::int, 0)),
      ('leftWeapon',           COALESCE((fb.model->>'leftWeapon')::int, 0)),
      ('shield',               COALESCE((fb.model->>'shield')::int, 0)),
      ('headUpper',            COALESCE((fb.model->>'headUpper')::int, 0)),
      ('headMiddle',           COALESCE((fb.model->>'headMiddle')::int, 0)),
      ('headLower',            COALESCE((fb.model->>'headLower')::int, 0)),
      ('armor',                COALESCE((fb.model->>'armor')::int, 0)),
      ('garment',              COALESCE((fb.model->>'garment')::int, 0)),
      ('boot',                 COALESCE((fb.model->>'boot')::int, 0)),
      ('accLeft',              COALESCE((fb.model->>'accLeft')::int, 0)),
      ('accRight',             COALESCE((fb.model->>'accRight')::int, 0)),
      ('ammo',                 COALESCE((fb.model->>'ammo')::int, 0)),
      ('pet',                  COALESCE((fb.model->>'pet')::int, 0)),
      ('costumeEnchantUpper',  COALESCE((fb.model->>'costumeEnchantUpper')::int, 0)),
      ('costumeEnchantMiddle', COALESCE((fb.model->>'costumeEnchantMiddle')::int, 0)),
      ('costumeEnchantLower',  COALESCE((fb.model->>'costumeEnchantLower')::int, 0)),
      ('costumeEnchantGarment',COALESCE((fb.model->>'costumeEnchantGarment')::int, 0)),
      ('shadowWeapon',         COALESCE((fb.model->>'shadowWeapon')::int, 0)),
      ('shadowArmor',          COALESCE((fb.model->>'shadowArmor')::int, 0)),
      ('shadowShield',         COALESCE((fb.model->>'shadowShield')::int, 0)),
      ('shadowBoot',           COALESCE((fb.model->>'shadowBoot')::int, 0)),
      ('shadowEarring',        COALESCE((fb.model->>'shadowEarring')::int, 0)),
      ('shadowPendant',        COALESCE((fb.model->>'shadowPendant')::int, 0))
    ) AS v(slot_name, item_id)
    WHERE v.item_id > 0
  ),
  -- Card items: extract each card field, mapped to parent slot
  slot_cards AS (
    SELECT v.slot_name, v.card_id
    FROM filtered_builds fb,
    LATERAL (VALUES
      ('weapon', COALESCE((fb.model->>'weaponCard1')::int, 0)),
      ('weapon', COALESCE((fb.model->>'weaponCard2')::int, 0)),
      ('weapon', COALESCE((fb.model->>'weaponCard3')::int, 0)),
      ('weapon', COALESCE((fb.model->>'weaponCard4')::int, 0)),
      ('leftWeapon', COALESCE((fb.model->>'leftWeaponCard1')::int, 0)),
      ('leftWeapon', COALESCE((fb.model->>'leftWeaponCard2')::int, 0)),
      ('leftWeapon', COALESCE((fb.model->>'leftWeaponCard3')::int, 0)),
      ('leftWeapon', COALESCE((fb.model->>'leftWeaponCard4')::int, 0)),
      ('shield',    COALESCE((fb.model->>'shieldCard')::int, 0)),
      ('headUpper', COALESCE((fb.model->>'headUpperCard')::int, 0)),
      ('headMiddle',COALESCE((fb.model->>'headMiddleCard')::int, 0)),
      ('armor',     COALESCE((fb.model->>'armorCard')::int, 0)),
      ('garment',   COALESCE((fb.model->>'garmentCard')::int, 0)),
      ('boot',      COALESCE((fb.model->>'bootCard')::int, 0)),
      ('accLeft',   COALESCE((fb.model->>'accLeftCard')::int, 0)),
      ('accRight',  COALESCE((fb.model->>'accRightCard')::int, 0))
    ) AS v(slot_name, card_id)
    WHERE v.card_id > 0
  ),
  -- Rank equipment items: top 5 per slot
  ranked_items AS (
    SELECT
      si.slot_name AS slot,
      'item'::text AS type,
      si.item_id,
      COUNT(*) AS use_count,
      ROW_NUMBER() OVER (PARTITION BY si.slot_name ORDER BY COUNT(*) DESC, si.item_id) AS rank
    FROM slot_items si
    GROUP BY si.slot_name, si.item_id
  ),
  -- Rank cards: top 5 per slot
  ranked_cards AS (
    SELECT
      sc.slot_name AS slot,
      'card'::text AS type,
      sc.card_id AS item_id,
      COUNT(*) AS use_count,
      ROW_NUMBER() OVER (PARTITION BY sc.slot_name ORDER BY COUNT(*) DESC, sc.card_id) AS rank
    FROM slot_cards sc
    GROUP BY sc.slot_name, sc.card_id
  ),
  -- Combine items + cards, top 5 only
  combined AS (
    SELECT * FROM ranked_items WHERE rank <= 5
    UNION ALL
    SELECT * FROM ranked_cards WHERE rank <= 5
  )
  SELECT p_class_id, p_skill_name, c.slot, c.type, c.item_id::int, c.use_count::int, c.rank::int, now()
  FROM combined c;

  -- Return fresh data
  RETURN QUERY
    SELECT irc.slot, irc.type, irc.item_id, irc.use_count::bigint, irc.rank::bigint
    FROM item_ranking_cache irc
    WHERE irc.class_id = p_class_id AND irc.skill_name = p_skill_name
    ORDER BY irc.slot, irc.type, irc.rank;
END;
$$;
```

**Step 4: Enable RLS (read-only for anon)**

```sql
-- Allow anonymous reads on cache tables
ALTER TABLE skill_ranking_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_ranking_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read skill_ranking_cache"
  ON skill_ranking_cache FOR SELECT USING (true);

CREATE POLICY "Anyone can read item_ranking_cache"
  ON item_ranking_cache FOR SELECT USING (true);
```

**Step 5: Commit**

```bash
git add docs/plans/item-ranking-migration.sql
git commit -m "docs: add SQL migration for item ranking RPCs and cache tables"
```

---

### Task 2: Deploy SQL to Supabase

**Step 1: Open Supabase SQL Editor**

Navigate to the Supabase dashboard → SQL Editor. Paste and run the full content of `docs/plans/item-ranking-migration.sql`.

**Step 2: Verify tables exist**

Run in SQL Editor:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE '%ranking_cache';
```
Expected: `skill_ranking_cache`, `item_ranking_cache`

**Step 3: Verify RPCs exist**

Run in SQL Editor:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE 'get_%_ranking';
```
Expected: `get_skill_ranking`, `get_item_ranking`

**Step 4: Smoke test with force_refresh**

```sql
SELECT * FROM get_skill_ranking(4025, 0, true);  -- 4025 = any class with shared builds
```
Expected: rows with `skill_name`, `build_count`, `unique_users` (or empty if no builds for that class).

---

### Task 3: Create Angular Ranking Models

**Files:**
- Create: `src/app/layout/pages/preset-summary/model/skill-ranking.model.ts`
- Create: `src/app/layout/pages/preset-summary/model/slot-ranking.model.ts`
- Modify: `src/app/layout/pages/preset-summary/model/index.ts` (add exports)

**Step 1: Create SkillRankingEntry model**

File: `src/app/layout/pages/preset-summary/model/skill-ranking.model.ts`
```typescript
export interface SkillRankingEntry {
  skill_name: string;
  build_count: number;
  unique_users: number;
}
```

**Step 2: Create SlotRankingEntry and SlotRankingGroup models**

File: `src/app/layout/pages/preset-summary/model/slot-ranking.model.ts`
```typescript
export interface SlotRankingEntry {
  slot: string;
  type: 'item' | 'card';
  item_id: number;
  use_count: number;
  rank: number;
  itemName?: string;  // resolved from item.json in frontend
}

export interface SlotRankingGroup {
  slot: string;
  slotLabel: string;
  category: 'equipment' | 'shadow' | 'costume';
  items: SlotRankingEntry[];
  cards: SlotRankingEntry[];
  totalBuilds: number;
}
```

**Step 3: Update model barrel export**

Check `src/app/layout/pages/preset-summary/model/index.ts` and add:
```typescript
export * from './skill-ranking.model';
export * from './slot-ranking.model';
```

**Step 4: Commit**

```bash
git add src/app/layout/pages/preset-summary/model/skill-ranking.model.ts \
        src/app/layout/pages/preset-summary/model/slot-ranking.model.ts \
        src/app/layout/pages/preset-summary/model/index.ts
git commit -m "feat(ranking): add SkillRankingEntry and SlotRankingGroup models"
```

---

### Task 4: Refactor SummaryService to Use RPCs

**Files:**
- Modify: `src/app/api-services/summary.service.ts` (~61 lines → rewrite)

The current service fetches all published presets and calls `aggregatePresets()` client-side. Replace with two methods calling Supabase RPCs.

**Step 1: Rewrite SummaryService**

Replace the entire content of `src/app/api-services/summary.service.ts` with:

```typescript
import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { SkillRankingEntry } from '../layout/pages/preset-summary/model/skill-ranking.model';
import { SlotRankingEntry } from '../layout/pages/preset-summary/model/slot-ranking.model';

@Injectable({ providedIn: 'root' })
export class SummaryService {
  constructor(private supabaseService: SupabaseService) {}

  getSkillRanking(classId: number, forceRefresh = false): Observable<SkillRankingEntry[]> {
    return from(
      this.supabaseService.client.rpc('get_skill_ranking', {
        p_class_id: classId,
        p_ttl_minutes: 30,
        p_force_refresh: forceRefresh,
      })
    ).pipe(
      map((res) => {
        if (res.error) throw res.error;
        return (res.data ?? []) as SkillRankingEntry[];
      })
    );
  }

  getItemRanking(classId: number, skillName: string, forceRefresh = false): Observable<SlotRankingEntry[]> {
    return from(
      this.supabaseService.client.rpc('get_item_ranking', {
        p_class_id: classId,
        p_skill_name: skillName,
        p_ttl_minutes: 30,
        p_force_refresh: forceRefresh,
      })
    ).pipe(
      map((res) => {
        if (res.error) throw res.error;
        return (res.data ?? []) as SlotRankingEntry[];
      })
    );
  }
}
```

**Step 2: Verify build compiles**

Run: `npm start`
Expected: compiles without errors (the component will break temporarily — that's OK, we fix it in Task 6).

**Step 3: Commit**

```bash
git add src/app/api-services/summary.service.ts
git commit -m "feat(ranking): refactor SummaryService to use Supabase RPCs"
```

---

### Task 5: Create SlotRankingCardComponent

**Files:**
- Create: `src/app/layout/pages/preset-summary/slot-ranking-card/slot-ranking-card.component.ts`
- Create: `src/app/layout/pages/preset-summary/slot-ranking-card/slot-ranking-card.component.html`

This is the reusable card that displays top 5 items + top 5 cards for a single equipment slot.

**Step 1: Create the component TypeScript**

File: `src/app/layout/pages/preset-summary/slot-ranking-card/slot-ranking-card.component.ts`
```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SlotRankingGroup, SlotRankingEntry } from '../model';

@Component({
  selector: 'app-slot-ranking-card',
  templateUrl: './slot-ranking-card.component.html',
})
export class SlotRankingCardComponent {
  @Input() group: SlotRankingGroup;
  @Output() itemClick = new EventEmitter<number>();

  getPercentage(entry: SlotRankingEntry): number {
    if (!this.group.totalBuilds) return 0;
    return Math.ceil((entry.use_count * 100) / this.group.totalBuilds);
  }

  getBarColor(index: number): string {
    const colors = ['orange-500', 'blue-500', 'green-500', 'purple-500', 'pink-500'];
    return colors[index] || 'gray-500';
  }

  onItemClick(itemId: number): void {
    this.itemClick.emit(itemId);
  }
}
```

**Step 2: Create the component template**

File: `src/app/layout/pages/preset-summary/slot-ranking-card/slot-ranking-card.component.html`
```html
<div class="card mb-3">
  <div class="font-bold text-lg mb-3">{{ group.slotLabel }}</div>

  <div class="grid">
    <!-- Items column -->
    <div [ngClass]="group.cards.length > 0 ? 'col-6' : 'col-12'">
      <div class="text-sm font-semibold mb-2 text-color-secondary">Itens</div>
      <div *ngFor="let entry of group.items; let i = index"
           class="flex align-items-center gap-2 mb-2 cursor-pointer hover:surface-hover p-1 border-round"
           (click)="onItemClick(entry.item_id)">
        <span class="text-color-secondary" style="min-width: 1.2rem">{{ i + 1 }}.</span>
        <img [src]="'assets/demo/images/items/' + entry.item_id + '.png'"
             alt="" style="width: 24px; height: 24px"
             onerror="this.style.display='none'">
        <div class="flex-1 min-w-0">
          <div class="text_ellips text-sm">{{ entry.itemName || entry.item_id }}</div>
          <div class="surface-300 border-round overflow-hidden" style="height: 6px">
            <div class="h-full border-round"
                 [ngClass]="'bg-' + getBarColor(i)"
                 [style.width.%]="getPercentage(entry)">
            </div>
          </div>
        </div>
        <span class="text-sm font-semibold" style="min-width: 3rem; text-align: right">
          {{ getPercentage(entry) }}%
        </span>
      </div>
      <div *ngIf="group.items.length === 0" class="text-color-secondary text-sm">
        Sem dados
      </div>
    </div>

    <!-- Cards column (only if slot has cards) -->
    <div class="col-6" *ngIf="group.cards.length > 0">
      <div class="text-sm font-semibold mb-2 text-color-secondary">Cartas</div>
      <div *ngFor="let entry of group.cards; let i = index"
           class="flex align-items-center gap-2 mb-2 cursor-pointer hover:surface-hover p-1 border-round"
           (click)="onItemClick(entry.item_id)">
        <span class="text-color-secondary" style="min-width: 1.2rem">{{ i + 1 }}.</span>
        <img [src]="'assets/demo/images/items/' + entry.item_id + '.png'"
             alt="" style="width: 24px; height: 24px"
             onerror="this.style.display='none'">
        <div class="flex-1 min-w-0">
          <div class="text_ellips text-sm">{{ entry.itemName || entry.item_id }}</div>
          <div class="surface-300 border-round overflow-hidden" style="height: 6px">
            <div class="h-full border-round bg-yellow-500"
                 [style.width.%]="getPercentage(entry)">
            </div>
          </div>
        </div>
        <span class="text-sm font-semibold" style="min-width: 3rem; text-align: right">
          {{ getPercentage(entry) }}%
        </span>
      </div>
    </div>
  </div>
</div>
```

**Step 3: Commit**

```bash
git add src/app/layout/pages/preset-summary/slot-ranking-card/
git commit -m "feat(ranking): create SlotRankingCardComponent for per-slot item ranking"
```

---

### Task 6: Refactor PresetSummaryComponent

**Files:**
- Modify: `src/app/layout/pages/preset-summary/preset-summary.component.ts` (rewrite)
- Modify: `src/app/layout/pages/preset-summary/preset-summary.component.html` (rewrite)

**Step 1: Rewrite the component TypeScript**

Replace the full content of `preset-summary.component.ts`. Key changes:
- Remove all 4 old observables (getJobSkillSummary, getJobPresetSummary, etc.)
- Remove enchant toggle logic, old ranking map
- Add: `skillRankings: SkillRankingEntry[]`, `slotGroups: SlotRankingGroup[]`
- Call `summaryService.getSkillRanking()` on class change
- Call `summaryService.getItemRanking()` on skill change
- Group results by slot using `SLOT_CONFIG` constant

```typescript
import { Component, OnInit } from '@angular/core';
import { getClassDropdownList } from 'src/app/jobs/_class-list';
import { RoService } from 'src/app/api-services/ro.service';
import { SummaryService } from 'src/app/api-services/summary.service';
import { ItemModel } from 'src/app/models/item.model';
import { SkillRankingEntry } from './model/skill-ranking.model';
import { SlotRankingEntry, SlotRankingGroup } from './model/slot-ranking.model';

interface SlotConfig {
  slot: string;
  label: string;
  category: 'equipment' | 'shadow' | 'costume';
  hasCards: boolean;
}

const SLOT_CONFIG: SlotConfig[] = [
  // Equipment
  { slot: 'weapon', label: 'Arma', category: 'equipment', hasCards: true },
  { slot: 'leftWeapon', label: 'Arma Esquerda', category: 'equipment', hasCards: true },
  { slot: 'shield', label: 'Escudo', category: 'equipment', hasCards: true },
  { slot: 'headUpper', label: 'Topo', category: 'equipment', hasCards: true },
  { slot: 'headMiddle', label: 'Meio', category: 'equipment', hasCards: true },
  { slot: 'headLower', label: 'Baixo', category: 'equipment', hasCards: false },
  { slot: 'armor', label: 'Armadura', category: 'equipment', hasCards: true },
  { slot: 'garment', label: 'Capa', category: 'equipment', hasCards: true },
  { slot: 'boot', label: 'Sapato', category: 'equipment', hasCards: true },
  { slot: 'accLeft', label: 'Acessorio Esq.', category: 'equipment', hasCards: true },
  { slot: 'accRight', label: 'Acessorio Dir.', category: 'equipment', hasCards: true },
  { slot: 'ammo', label: 'Municao', category: 'equipment', hasCards: false },
  { slot: 'pet', label: 'Pet', category: 'equipment', hasCards: false },
  // Shadow
  { slot: 'shadowWeapon', label: 'Shadow Arma', category: 'shadow', hasCards: false },
  { slot: 'shadowArmor', label: 'Shadow Armadura', category: 'shadow', hasCards: false },
  { slot: 'shadowShield', label: 'Shadow Escudo', category: 'shadow', hasCards: false },
  { slot: 'shadowBoot', label: 'Shadow Sapato', category: 'shadow', hasCards: false },
  { slot: 'shadowEarring', label: 'Shadow Brinco', category: 'shadow', hasCards: false },
  { slot: 'shadowPendant', label: 'Shadow Colar', category: 'shadow', hasCards: false },
  // Costume
  { slot: 'costumeEnchantUpper', label: 'Costume Topo', category: 'costume', hasCards: false },
  { slot: 'costumeEnchantMiddle', label: 'Costume Meio', category: 'costume', hasCards: false },
  { slot: 'costumeEnchantLower', label: 'Costume Baixo', category: 'costume', hasCards: false },
  { slot: 'costumeEnchantGarment', label: 'Costume Capa', category: 'costume', hasCards: false },
];

const CATEGORY_LABELS: Record<string, string> = {
  equipment: 'Equipamento',
  shadow: 'Shadow',
  costume: 'Costume',
};

@Component({
  selector: 'app-preset-summary',
  templateUrl: './preset-summary.component.html',
})
export class PresetSummaryComponent implements OnInit {
  allClasses = getClassDropdownList();
  selectedJobId: number;
  selectedSkillName: string;
  selectedItemId: number;

  skillRankings: SkillRankingEntry[] = [];
  slotGroups: SlotRankingGroup[] = [];
  totalBuilds = 0;

  itemMap: Record<string, ItemModel> = {};
  isLoading = false;

  // For category separators in template
  categories = ['equipment', 'shadow', 'costume'];
  categoryLabels = CATEGORY_LABELS;

  constructor(
    private summaryService: SummaryService,
    private roService: RoService,
  ) {}

  ngOnInit(): void {
    this.selectedJobId = this.allClasses[0]?.value;
    this.roService.getItems().subscribe((items) => {
      this.itemMap = items;
      this.loadSkillRanking();
    });
  }

  onJobChange(): void {
    this.skillRankings = [];
    this.slotGroups = [];
    this.selectedSkillName = null;
    this.loadSkillRanking();
  }

  onSkillChange(): void {
    this.slotGroups = [];
    if (this.selectedSkillName) {
      this.loadItemRanking();
    }
  }

  onItemClick(itemId: number): void {
    this.selectedItemId = itemId;
  }

  getSelectedItem(): ItemModel | null {
    if (!this.selectedItemId) return null;
    return this.itemMap[this.selectedItemId] ?? null;
  }

  getGroupsByCategory(category: string): SlotRankingGroup[] {
    return this.slotGroups.filter((g) => g.category === category);
  }

  private loadSkillRanking(): void {
    if (!this.selectedJobId) return;
    this.isLoading = true;
    this.summaryService.getSkillRanking(this.selectedJobId).subscribe({
      next: (data) => {
        this.skillRankings = data;
        this.isLoading = false;
        // Auto-select first skill
        if (data.length > 0) {
          this.selectedSkillName = data[0].skill_name;
          this.loadItemRanking();
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private loadItemRanking(): void {
    if (!this.selectedJobId || !this.selectedSkillName) return;
    this.isLoading = true;

    // Get total builds for this skill for percentage calculation
    const skillEntry = this.skillRankings.find((s) => s.skill_name === this.selectedSkillName);
    this.totalBuilds = skillEntry?.build_count ?? 0;

    this.summaryService.getItemRanking(this.selectedJobId, this.selectedSkillName).subscribe({
      next: (entries) => {
        this.slotGroups = this.buildSlotGroups(entries);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private buildSlotGroups(entries: SlotRankingEntry[]): SlotRankingGroup[] {
    // Resolve item names
    for (const entry of entries) {
      const item = this.itemMap[entry.item_id];
      entry.itemName = item?.name ?? `Item #${entry.item_id}`;
    }

    // Group by slot
    const bySlot: Record<string, { items: SlotRankingEntry[]; cards: SlotRankingEntry[] }> = {};
    for (const entry of entries) {
      if (!bySlot[entry.slot]) bySlot[entry.slot] = { items: [], cards: [] };
      if (entry.type === 'item') {
        bySlot[entry.slot].items.push(entry);
      } else {
        bySlot[entry.slot].cards.push(entry);
      }
    }

    // Build groups in SLOT_CONFIG order, skipping empty slots
    return SLOT_CONFIG
      .map((cfg) => {
        const data = bySlot[cfg.slot];
        if (!data || (data.items.length === 0 && data.cards.length === 0)) return null;
        return {
          slot: cfg.slot,
          slotLabel: cfg.label,
          category: cfg.category,
          items: data.items,
          cards: data.cards,
          totalBuilds: this.totalBuilds,
        } as SlotRankingGroup;
      })
      .filter(Boolean) as SlotRankingGroup[];
  }
}
```

**Step 2: Rewrite the component template**

Replace the full content of `preset-summary.component.html`:

```html
<div class="grid" style="min-width: 1200px">
  <!-- Sidebar -->
  <div class="col-3">
    <!-- Job class selector -->
    <div class="card mb-3">
      <div class="font-bold mb-2">Classe</div>
      <p-listbox
        [options]="allClasses"
        [(ngModel)]="selectedJobId"
        optionValue="value"
        [listStyle]="{ height: '200px' }"
        (onChange)="onJobChange()"
        [disabled]="isLoading"
      >
        <ng-template let-item pTemplate="item">
          <div class="flex gap-2 py-0">
            <img [src]="'assets/demo/images/jobs/icon_jobs_' + item.icon + '.png'" alt="" class="job_img" />
            <div class="text_ellips">{{ item.label }}</div>
          </div>
        </ng-template>
      </p-listbox>
    </div>

    <!-- Skill ranking list -->
    <div class="card mb-3">
      <div class="font-bold mb-2">Skills</div>
      <p-listbox
        [options]="skillRankings"
        [(ngModel)]="selectedSkillName"
        optionValue="skill_name"
        [listStyle]="{ height: '300px' }"
        (onChange)="onSkillChange()"
        [disabled]="isLoading"
      >
        <ng-template let-item pTemplate="item">
          <div class="flex justify-content-between align-items-center w-full">
            <span class="text_ellips">{{ item.skill_name }}</span>
            <span class="text-sm text-color-secondary ml-2">{{ item.build_count }} builds</span>
          </div>
        </ng-template>
      </p-listbox>
    </div>

    <!-- Selected item description -->
    <div class="card sticky" style="top: 1rem" *ngIf="getSelectedItem() as item">
      <div class="font-bold mb-2">{{ item.name }}</div>
      <div class="flex justify-content-center mb-2">
        <img [src]="'assets/demo/images/items/' + item.id + '.png'" alt="" style="width: 48px" />
      </div>
      <div class="text-sm" [innerHTML]="item.description"></div>
    </div>
  </div>

  <!-- Main content: slot ranking cards -->
  <div class="col-9">
    <div *ngIf="isLoading" class="flex justify-content-center p-5">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
    </div>

    <div *ngIf="!isLoading && slotGroups.length === 0 && selectedSkillName" class="text-center text-color-secondary p-5">
      Sem dados para esta skill.
    </div>

    <ng-container *ngFor="let category of categories">
      <ng-container *ngIf="getGroupsByCategory(category) as groups">
        <div *ngIf="groups.length > 0" class="mb-2">
          <div class="text-xl font-bold mb-3 mt-2 text-color-secondary">{{ categoryLabels[category] }}</div>
          <div class="grid">
            <div *ngFor="let group of groups" class="col-12 md:col-6 lg:col-4">
              <app-slot-ranking-card
                [group]="group"
                (itemClick)="onItemClick($event)"
              ></app-slot-ranking-card>
            </div>
          </div>
        </div>
      </ng-container>
    </ng-container>
  </div>
</div>
```

**Step 3: Verify build compiles**

Run: `npm start`
Expected: no compilation errors

**Step 4: Commit**

```bash
git add src/app/layout/pages/preset-summary/preset-summary.component.ts \
        src/app/layout/pages/preset-summary/preset-summary.component.html
git commit -m "feat(ranking): rewrite PresetSummaryComponent to use shared builds RPCs"
```

---

### Task 7: Update Module Imports

**Files:**
- Modify: `src/app/layout/pages/preset-summary/preset-summary.module.ts`

**Step 1: Add SlotRankingCardComponent to declarations and add needed imports**

The current module imports: `PresetSummaryRoutingModule, ListboxModule, ButtonModule, CommonModule, FormsModule, CheckboxModule`.

Update to:
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { PresetSummaryRoutingModule } from './preset-summary-routing.module';
import { PresetSummaryComponent } from './preset-summary.component';
import { SlotRankingCardComponent } from './slot-ranking-card/slot-ranking-card.component';

@NgModule({
  imports: [CommonModule, FormsModule, ListboxModule, ButtonModule, PresetSummaryRoutingModule],
  declarations: [PresetSummaryComponent, SlotRankingCardComponent],
})
export class PresetSummaryModule {}
```

Removed `CheckboxModule` (no longer needed — enchant toggle removed).

**Step 2: Verify build compiles**

Run: `npm start`
Expected: compiles clean

**Step 3: Commit**

```bash
git add src/app/layout/pages/preset-summary/preset-summary.module.ts
git commit -m "feat(ranking): update PresetSummaryModule with SlotRankingCardComponent"
```

---

### Task 8: Clean Up Old Aggregation Code

**Files:**
- Delete or leave: `src/app/api-services/summary-aggregator.ts` (no longer imported)
- Check: `src/app/layout/pages/preset-summary/model/item-ranking.model.ts` (may still be used elsewhere)
- Check: `src/app/layout/pages/preset-summary/model/job-summary.model.ts` (may still be used elsewhere)

**Step 1: Search for imports of old files**

Run:
```bash
grep -r "summary-aggregator" src/ --include="*.ts"
grep -r "item-ranking.model" src/ --include="*.ts"
grep -r "job-summary.model" src/ --include="*.ts"
```

If no other files import them, delete them.

**Step 2: Delete unused files**

```bash
rm src/app/api-services/summary-aggregator.ts  # if only imported by old SummaryService
# Only delete models if not imported elsewhere
```

**Step 3: Verify build compiles**

Run: `npm start`
Expected: compiles clean

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor(ranking): remove unused aggregator and old ranking models"
```

---

### Task 9: End-to-End Smoke Test

**Step 1: Open the app**

Navigate to `http://localhost:4200/#/preset-summary`

**Step 2: Verify class selection**

- The class listbox should show all 39 classes
- Clicking a class should load skills in the sidebar

**Step 3: Verify skill selection**

- Skills should show with build count badge
- First skill should be auto-selected
- Clicking a skill should load the item ranking grid

**Step 4: Verify slot ranking cards**

- Cards should appear grouped by category (Equipamento, Shadow, Costume)
- Each card shows top 5 items with progress bars and percentages
- Slots with cards show a "Cartas" column
- Empty slots should not show

**Step 5: Verify item click**

- Clicking an item in any card should show its description in the sticky sidebar panel

**Step 6: Verify responsive layout**

- Cards should be 3 columns on desktop, 2 on medium, 1 on mobile

**Step 7: Test force_refresh**

- Temporarily change `SummaryService` to pass `forceRefresh = true`
- Verify data reloads from scratch (not cached)
- Revert to `forceRefresh = false`

---

### Task 10: Production Build Verification

**Step 1: Build for production**

Run:
```bash
MSYS_NO_PATHCONV=1 npx ng build --base-href /rolatam-calc/
```
Expected: builds without errors

**Step 2: Commit any remaining changes and push**

```bash
git push myfork main
```

---

## Summary of Files Changed

| Action | File |
|--------|------|
| Create | `docs/plans/item-ranking-migration.sql` |
| Create | `src/app/layout/pages/preset-summary/model/skill-ranking.model.ts` |
| Create | `src/app/layout/pages/preset-summary/model/slot-ranking.model.ts` |
| Create | `src/app/layout/pages/preset-summary/slot-ranking-card/slot-ranking-card.component.ts` |
| Create | `src/app/layout/pages/preset-summary/slot-ranking-card/slot-ranking-card.component.html` |
| Modify | `src/app/layout/pages/preset-summary/model/index.ts` |
| Rewrite | `src/app/api-services/summary.service.ts` |
| Rewrite | `src/app/layout/pages/preset-summary/preset-summary.component.ts` |
| Rewrite | `src/app/layout/pages/preset-summary/preset-summary.component.html` |
| Modify | `src/app/layout/pages/preset-summary/preset-summary.module.ts` |
| Delete | `src/app/api-services/summary-aggregator.ts` (if unused) |
| Deploy | SQL migration to Supabase (manual via SQL Editor) |
