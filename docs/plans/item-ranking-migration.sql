-- Item Ranking Cache Tables & RPCs
-- Migration for rolatam-calc item/skill ranking feature

-- ============================================================
-- 1. Cache Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS skill_ranking_cache (
  class_id    int          NOT NULL,
  skill_name  text         NOT NULL,
  build_count int          NOT NULL,
  unique_users int         NOT NULL,
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, skill_name)
);

CREATE TABLE IF NOT EXISTS item_ranking_cache (
  class_id    int          NOT NULL,
  skill_name  text         NOT NULL,
  slot        text         NOT NULL,
  type        text         NOT NULL CHECK (type IN ('item', 'card')),
  item_id     int          NOT NULL,
  use_count   int          NOT NULL,
  rank        int          NOT NULL CHECK (rank BETWEEN 1 AND 5),
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  PRIMARY KEY (class_id, skill_name, slot, type, rank)
);

-- ============================================================
-- 2. RLS Policies
-- ============================================================

ALTER TABLE skill_ranking_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_ranking_cache  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on skill_ranking_cache"
  ON skill_ranking_cache FOR SELECT
  USING (true);

CREATE POLICY "Allow public read on item_ranking_cache"
  ON item_ranking_cache FOR SELECT
  USING (true);

-- ============================================================
-- 3. RPC: get_skill_ranking
-- ============================================================

CREATE OR REPLACE FUNCTION get_skill_ranking(
  p_class_id       int,
  p_ttl_minutes    int  DEFAULT 30,
  p_force_refresh  bool DEFAULT false
)
RETURNS TABLE (
  skill_name   text,
  build_count  bigint,
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
    SELECT MIN(src.updated_at) INTO v_cache_age
      FROM skill_ranking_cache src
     WHERE src.class_id = p_class_id;

    IF v_cache_age IS NOT NULL
       AND v_cache_age > now() - (p_ttl_minutes || ' minutes')::interval
    THEN
      RETURN QUERY
        SELECT src.skill_name, src.build_count::bigint, src.unique_users::bigint
          FROM skill_ranking_cache src
         WHERE src.class_id = p_class_id
         ORDER BY src.build_count DESC;
      RETURN;
    END IF;
  END IF;

  -- Clear stale cache for this class
  DELETE FROM skill_ranking_cache
   WHERE skill_ranking_cache.class_id = p_class_id;

  -- Recalculate from shared_builds
  INSERT INTO skill_ranking_cache (class_id, skill_name, build_count, unique_users)
    SELECT p_class_id,
           sb.skill_name,
           COUNT(*)::int,
           COUNT(DISTINCT sb.user_id)::int
      FROM shared_builds sb
     WHERE sb.class_id = p_class_id
       AND sb.skill_name IS NOT NULL
     GROUP BY sb.skill_name;

  -- Return fresh results
  RETURN QUERY
    SELECT src.skill_name, src.build_count::bigint, src.unique_users::bigint
      FROM skill_ranking_cache src
     WHERE src.class_id = p_class_id
     ORDER BY src.build_count DESC;
END;
$$;

-- ============================================================
-- 4. RPC: get_item_ranking
-- ============================================================

CREATE OR REPLACE FUNCTION get_item_ranking(
  p_class_id       int,
  p_skill_name     text,
  p_ttl_minutes    int  DEFAULT 30,
  p_force_refresh  bool DEFAULT false
)
RETURNS TABLE (
  slot      text,
  type      text,
  item_id   int,
  use_count bigint,
  rank      bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cache_age timestamptz;
BEGIN
  -- Check cache freshness
  IF NOT p_force_refresh THEN
    SELECT MIN(irc.updated_at) INTO v_cache_age
      FROM item_ranking_cache irc
     WHERE irc.class_id   = p_class_id
       AND irc.skill_name = p_skill_name;

    IF v_cache_age IS NOT NULL
       AND v_cache_age > now() - (p_ttl_minutes || ' minutes')::interval
    THEN
      RETURN QUERY
        SELECT irc.slot, irc.type, irc.item_id, irc.use_count::bigint, irc.rank::bigint
          FROM item_ranking_cache irc
         WHERE irc.class_id   = p_class_id
           AND irc.skill_name = p_skill_name
         ORDER BY irc.slot, irc.type, irc.rank;
      RETURN;
    END IF;
  END IF;

  -- Clear stale cache for this class + skill
  DELETE FROM item_ranking_cache
   WHERE item_ranking_cache.class_id   = p_class_id
     AND item_ranking_cache.skill_name = p_skill_name;

  -- Recalculate: extract equipment items and cards, rank top 5 per slot
  INSERT INTO item_ranking_cache (class_id, skill_name, slot, type, item_id, use_count, rank)
  WITH raw_items AS (
    SELECT slots.slot_name AS slot,
           slots.slot_type AS type,
           slots.item_id
      FROM shared_builds sb,
           LATERAL (VALUES
             -- Equipment slots (type = 'item')
             ('weapon',                 'item', COALESCE((sb.model->'weapon'->>'id')::int, 0)),
             ('leftWeapon',             'item', COALESCE((sb.model->'leftWeapon'->>'id')::int, 0)),
             ('shield',                 'item', COALESCE((sb.model->'shield'->>'id')::int, 0)),
             ('headUpper',              'item', COALESCE((sb.model->'headUpper'->>'id')::int, 0)),
             ('headMiddle',             'item', COALESCE((sb.model->'headMiddle'->>'id')::int, 0)),
             ('headLower',              'item', COALESCE((sb.model->'headLower'->>'id')::int, 0)),
             ('armor',                  'item', COALESCE((sb.model->'armor'->>'id')::int, 0)),
             ('garment',                'item', COALESCE((sb.model->'garment'->>'id')::int, 0)),
             ('boot',                   'item', COALESCE((sb.model->'boot'->>'id')::int, 0)),
             ('accLeft',                'item', COALESCE((sb.model->'accLeft'->>'id')::int, 0)),
             ('accRight',               'item', COALESCE((sb.model->'accRight'->>'id')::int, 0)),
             ('ammo',                   'item', COALESCE((sb.model->'ammo'->>'id')::int, 0)),
             ('pet',                    'item', COALESCE((sb.model->'pet'->>'id')::int, 0)),
             ('costumeEnchantUpper',    'item', COALESCE((sb.model->'costumeEnchantUpper'->>'id')::int, 0)),
             ('costumeEnchantMiddle',   'item', COALESCE((sb.model->'costumeEnchantMiddle'->>'id')::int, 0)),
             ('costumeEnchantLower',    'item', COALESCE((sb.model->'costumeEnchantLower'->>'id')::int, 0)),
             ('costumeEnchantGarment',  'item', COALESCE((sb.model->'costumeEnchantGarment'->>'id')::int, 0)),
             ('shadowWeapon',           'item', COALESCE((sb.model->'shadowWeapon'->>'id')::int, 0)),
             ('shadowArmor',            'item', COALESCE((sb.model->'shadowArmor'->>'id')::int, 0)),
             ('shadowShield',           'item', COALESCE((sb.model->'shadowShield'->>'id')::int, 0)),
             ('shadowBoot',             'item', COALESCE((sb.model->'shadowBoot'->>'id')::int, 0)),
             ('shadowEarring',          'item', COALESCE((sb.model->'shadowEarring'->>'id')::int, 0)),
             ('shadowPendant',          'item', COALESCE((sb.model->'shadowPendant'->>'id')::int, 0)),
             -- Card slots (type = 'card')
             ('weapon',    'card', COALESCE((sb.model->'weaponCard1'->>'id')::int, 0)),
             ('weapon',    'card', COALESCE((sb.model->'weaponCard2'->>'id')::int, 0)),
             ('weapon',    'card', COALESCE((sb.model->'weaponCard3'->>'id')::int, 0)),
             ('weapon',    'card', COALESCE((sb.model->'weaponCard4'->>'id')::int, 0)),
             ('leftWeapon','card', COALESCE((sb.model->'leftWeaponCard1'->>'id')::int, 0)),
             ('leftWeapon','card', COALESCE((sb.model->'leftWeaponCard2'->>'id')::int, 0)),
             ('leftWeapon','card', COALESCE((sb.model->'leftWeaponCard3'->>'id')::int, 0)),
             ('leftWeapon','card', COALESCE((sb.model->'leftWeaponCard4'->>'id')::int, 0)),
             ('shield',    'card', COALESCE((sb.model->'shieldCard'->>'id')::int, 0)),
             ('headUpper', 'card', COALESCE((sb.model->'headUpperCard'->>'id')::int, 0)),
             ('headMiddle','card', COALESCE((sb.model->'headMiddleCard'->>'id')::int, 0)),
             ('armor',     'card', COALESCE((sb.model->'armorCard'->>'id')::int, 0)),
             ('garment',   'card', COALESCE((sb.model->'garmentCard'->>'id')::int, 0)),
             ('boot',      'card', COALESCE((sb.model->'bootCard'->>'id')::int, 0)),
             ('accLeft',   'card', COALESCE((sb.model->'accLeftCard'->>'id')::int, 0)),
             ('accRight',  'card', COALESCE((sb.model->'accRightCard'->>'id')::int, 0))
           ) AS slots(slot_name, slot_type, item_id)
     WHERE sb.class_id   = p_class_id
       AND sb.skill_name = p_skill_name
  ),
  ranked AS (
    SELECT ri.slot,
           ri.type,
           ri.item_id,
           COUNT(*)  AS use_count,
           ROW_NUMBER() OVER (
             PARTITION BY ri.slot, ri.type
             ORDER BY COUNT(*) DESC, ri.item_id
           ) AS rank
      FROM raw_items ri
     WHERE ri.item_id > 0
     GROUP BY ri.slot, ri.type, ri.item_id
  )
  SELECT p_class_id,
         p_skill_name,
         r.slot,
         r.type,
         r.item_id,
         r.use_count::int,
         r.rank::int
    FROM ranked r
   WHERE r.rank <= 5;

  -- Return fresh results
  RETURN QUERY
    SELECT irc.slot, irc.type, irc.item_id, irc.use_count::bigint, irc.rank::bigint
      FROM item_ranking_cache irc
     WHERE irc.class_id   = p_class_id
       AND irc.skill_name = p_skill_name
     ORDER BY irc.slot, irc.type, irc.rank;
END;
$$;
