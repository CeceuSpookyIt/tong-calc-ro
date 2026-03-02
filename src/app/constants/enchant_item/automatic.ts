// ============================================================
// EP17.2 Automatic Modification Modules
// Reference: Divine Pride EP17.2 enchant table
// ============================================================
import { ClassName } from '../../jobs/_class-name';

// --- Epic modules (skill-specific) — Armor A/B only, max 2 ---
export const autoModEpic = [
  'Auto_Module_Db',   // Dragon Breath
  'Auto_Module_Wb',   // Wave Break
  'Auto_Module_Hs',   // Hundred Spiral
  'Auto_Module_Dp',   // Drive Press
  'Auto_Module_Vc',   // Vanishing Cannon
  'Auto_Module_Gg',   // Genesis Gloria
  'Auto_Module_Bc',   // Boost Cannon
  'Auto_Module_If',   // Ice Flame
  'Auto_Module_Ts',   // Tornado Swing
  'Auto_Module_Ct',   // Cannon Tornado
  'Auto_Module_Cm',   // Crazy Mandragora
  'Auto_Module_Ae',   // Acid Explosion
  'Auto_Module_Si',   // Sonic Impact
  'Auto_Module_Cs',   // Cutter Slasher
  'Auto_Module_Bs',   // Berserk Slash
  'Auto_Module_Fr',   // Fatal Raid
  'Auto_Module_Ss',   // Shadow Spell
  'Auto_Module_As',   // Angle Shot
  'Auto_Module_Ce',   // Crimson Strain
  'Auto_Module_Jl',   // Jack Lightning
  'Auto_Module_Cv',   // Comet Vortex
  'Auto_Module_Dbl',  // Double Bolt
  'Auto_Module_Ww',   // Warmer Wave
  'Auto_Module_Dg',   // Diamond Grave
  'Auto_Module_Mg',   // Magnus
  'Auto_Module_Hj',   // Holy Judex
  'Auto_Module_Du',   // Duple Light
  'Auto_Module_Ft',   // Fallen Tiger
  'Auto_Module_Ra',   // Rampage Arrow
  'Auto_Module_Rc',   // Raging Crush
  'Auto_Module_Cl',   // Cluster
  'Auto_Module_Bs2',  // Breeze Shooting
  'Auto_Module_Ab',   // Aimed Storm
  'Auto_Module_Me',   // Metallic Echo
  'Auto_Module_Rev',  // Reverberation
  'Auto_Module_Vs',   // Vulcan Severe
  'Auto_Module_Be',   // Blaze Explosion
  'Auto_Module_Mk',   // Moon Kick
  'Auto_Module_Ff',   // Falling Flash
  'Auto_Module_Ew',   // Esma/Eswhoo
  'Auto_Module_Esp',  // Espa
  'Auto_Module_Cx',   // Curse Explosion
  'Auto_Module_Dh',   // Death Hammer Dance
  'Auto_Module_Fh',   // Fire Howling Tail
  'Auto_Module_Sb',   // Storm Buster Trip
  'Auto_Module_Ps',   // Petal Spear Blade
  'Auto_Module_Csl',  // Cross Slash
  'Auto_Module_Dd',   // Dragon Draft Wind
  'Auto_Module_Sea',  // Power of Sea
  'Auto_Module_Land', // Power of Land
  'Auto_Module_Life', // Power of Life
];

// --- Per-equipment module lists ---

// Armor A/B: Normal(DEF,MDEF) + Rare(ATK,MATK,Shooter) + Unique(armor) + Epic
export const autoArmorModules = [
  'Auto_Module_A',    // Defense (Normal, max 3)
  'Auto_Module_A2',   // Magic Defense (Normal, max 3)
  'Auto_Module_B10',  // Attack Power (Rare, max 2)
  'Auto_Module_B11',  // Magic Power (Rare, max 2)
  'Auto_Module_B12',  // Sharpshooter/Shooter (Rare, max 2)
  'Auto_Module_C2',   // Magical Force (Unique, max 1)
  'Auto_Module_C3',   // Attacker Force (Unique, max 1)
  'Auto_Module_C',    // Range Force (Unique, max 1)
  'Auto_Module_C4',   // Critical Force (Unique, max 1)
  // 'Auto_Module_C5', // Recovery Force (Unique, max 1) — TBD: add to item.json
  // 'Auto_Module_C11',// Mirror Counter (Unique, max 1) — TBD: add to item.json
  'Auto_Module_C6',   // Delay after skill (Unique, max 1)
  'Auto_Module_C8',   // Power Force (Unique, max 1)
  ...autoModEpic,
];

// Engine Wing A/B: Normal(DEF,MDEF) + Rare(Fast,Caster,Critical) + Unique(engine)
export const autoEngineModules = [
  'Auto_Module_A',    // Defense (Normal, max 3)
  'Auto_Module_A2',   // Magic Defense (Normal, max 3)
  // 'Auto_Module_B7', // Fast (Rare, max 2) — TBD: add to item.json
  'Auto_Module_B14',  // Caster (Rare, max 2)
  'Auto_Module_B15',  // Critical (Rare, max 2)
  // 'Auto_Module_C12',// Above All (Unique, max 1) — TBD: add to item.json
  'Auto_Module_C9',   // Powerful (Unique, max 1)
  // 'Auto_Module_C13',// Reflection Reject (Unique, max 1) — TBD: add to item.json
];

// Leg A/B: Normal(DEF,MDEF) + Rare(Vital,Mental,Heal) + Unique(leg) + Legendary
export const autoLegModules = [
  'Auto_Module_A',    // Defense (Normal, max 3)
  'Auto_Module_A2',   // Magic Defense (Normal, max 3)
  'Auto_Module_B8',   // Vital (Rare, max 2)
  'Auto_Module_B9',   // Mental (Rare, max 2)
  'Auto_Module_B16',  // Heal (Rare, max 2)
  'Auto_Module_C7',   // Fixed Casting (Unique, max 1)
  'Auto_Module_C14',  // Robust (Unique, max 1)
  'Auto_Module_L1',   // Unlimited Vital (Legendary, max 1)
  'Auto_Module_L2',   // Spell Buster (Legendary, max 1)
  'Auto_Module_L3',   // Firing Shot (Legendary, max 1)
  'Auto_Module_L4',   // Overpower (Legendary, max 1)
  'Auto_Module_L5',   // Fatal Flash (Legendary, max 1)
  'Auto_Module_L6',   // Lucky Strike (Legendary, max 1)
];

// Accessory Right (Booster R, Battle Chip R):
// Normal(VIT,LUK,STR,AGI,HP Recovery) + Rare(Spell,ASPD,Fatal,Expert Archer)
// + Unique(Drain Life, Magic Healing, All Force)
export const autoAccRModules = [
  'Auto_Module_A3',   // VIT (Normal, max 2)
  'Auto_Module_A4',   // LUK (Normal, max 2)
  'Auto_Module_A5',   // STR (Normal, max 2)
  'Auto_Module_A6',   // AGI (Normal, max 2)
  // 'Auto_Module_A9', // HP Recovery (Normal, max 2) — TBD: add to item.json
  'Auto_Module_B3',   // Spell (Rare, max 1)
  'Auto_Module_B4',   // Attack Speed (Rare, max 1)
  'Auto_Module_B5',   // Fatal (Rare, max 1)
  'Auto_Module_B6',   // Expert Archer (Rare, max 1)
  // 'Auto_Module_C15',// Drain Life (Unique, max 1) — TBD: add to item.json
  // 'Auto_Module_C16',// Magic Healing (Unique, max 1) — TBD: add to item.json
  'Auto_Module_C10',  // All Force (Unique, max 1)
];

// Accessory Left (Booster L, Battle Chip L):
// Normal(VIT,LUK,INT,DEX,SP Recovery) + Rare(Spell,ASPD,Fatal,Expert Archer)
// + Unique(Drain Soul, Magic Soul, All Force)
export const autoAccLModules = [
  'Auto_Module_A3',   // VIT (Normal, max 2)
  'Auto_Module_A4',   // LUK (Normal, max 2)
  'Auto_Module_A7',   // INT (Normal, max 2)
  'Auto_Module_A8',   // DEX (Normal, max 2)
  // 'Auto_Module_A10',// SP Recovery (Normal, max 2) — TBD: add to item.json
  'Auto_Module_B3',   // Spell (Rare, max 1)
  'Auto_Module_B4',   // Attack Speed (Rare, max 1)
  'Auto_Module_B5',   // Fatal (Rare, max 1)
  'Auto_Module_B6',   // Expert Archer (Rare, max 1)
  // 'Auto_Module_C17',// Drain Soul (Unique, max 1) — TBD: add to item.json
  // 'Auto_Module_C18',// Magic Soul (Unique, max 1) — TBD: add to item.json
  'Auto_Module_C10',  // All Force (Unique, max 1)
];

// --- Max enchant per module (default is 1 if not listed) ---
export const moduleMaxEnchant: Record<string, number> = {
  // Normal — Defense/MDEF: max 3
  'Auto_Module_A': 3,
  'Auto_Module_A2': 3,
  // Normal — Stats: max 2
  'Auto_Module_A3': 2,   // VIT
  'Auto_Module_A4': 2,   // LUK
  'Auto_Module_A5': 2,   // STR
  'Auto_Module_A6': 2,   // AGI
  'Auto_Module_A7': 2,   // INT
  'Auto_Module_A8': 2,   // DEX
  // Rare — Armor: max 2
  'Auto_Module_B10': 2,  // Attack Power
  'Auto_Module_B11': 2,  // Magic Power
  'Auto_Module_B12': 2,  // Sharpshooter
  // Rare — Leg: max 2
  'Auto_Module_B8': 2,   // Vital
  'Auto_Module_B9': 2,   // Mental
  'Auto_Module_B16': 2,  // Heal
  // Rare — Engine: max 2
  'Auto_Module_B14': 2,  // Caster
  'Auto_Module_B15': 2,  // Critical
  // Epic — max 2
  ...Object.fromEntries(autoModEpic.map(aegis => [aegis, 2])),
  // Everything else defaults to 1 (Rare acc, Unique, Legendary)
};

/** Helper: get max enchant for a module aegisName. Returns 1 if not found. */
export function getModuleMaxEnchant(aegisName: string): number {
  return moduleMaxEnchant[aegisName] ?? 1;
}

// ============================================================
// Module Rarity, Class Mapping, and Class Order
// Used by the module grouping UX (Tasks 5 & 6)
// ============================================================

export type ModuleRarity = 'Normal' | 'Rare' | 'Unique' | 'Epic' | 'Legendary';

export const moduleRarityMap: Record<string, ModuleRarity> = {
  // Normal — Defense/MDEF
  'Auto_Module_A': 'Normal',
  'Auto_Module_A2': 'Normal',
  // Normal — Stats
  'Auto_Module_A3': 'Normal',
  'Auto_Module_A4': 'Normal',
  'Auto_Module_A5': 'Normal',
  'Auto_Module_A6': 'Normal',
  'Auto_Module_A7': 'Normal',
  'Auto_Module_A8': 'Normal',
  // 'Auto_Module_A9': 'Normal',   // TBD: HP Recovery (Acc R) — add to item.json first
  // 'Auto_Module_A10': 'Normal',  // TBD: SP Recovery (Acc L) — add to item.json first
  // Rare — Accessories
  'Auto_Module_B3': 'Rare',
  'Auto_Module_B4': 'Rare',
  'Auto_Module_B5': 'Rare',
  'Auto_Module_B6': 'Rare',
  // 'Auto_Module_B7': 'Rare',     // TBD: Fast (Engine) — add to item.json first
  // Rare — Leg
  'Auto_Module_B8': 'Rare',
  'Auto_Module_B9': 'Rare',
  'Auto_Module_B16': 'Rare',
  // Rare — Armor
  'Auto_Module_B10': 'Rare',
  'Auto_Module_B11': 'Rare',
  'Auto_Module_B12': 'Rare',
  // Rare — Engine
  'Auto_Module_B14': 'Rare',
  'Auto_Module_B15': 'Rare',
  // Unique — Armor
  'Auto_Module_C': 'Unique',
  'Auto_Module_C2': 'Unique',
  'Auto_Module_C3': 'Unique',
  'Auto_Module_C4': 'Unique',
  // 'Auto_Module_C5': 'Unique',   // TBD: Recovery Force (Armor) — add to item.json first
  'Auto_Module_C6': 'Unique',
  'Auto_Module_C8': 'Unique',
  // Unique — Engine
  'Auto_Module_C9': 'Unique',
  // 'Auto_Module_C11': 'Unique',  // TBD: Mirror Counter (Armor) — add to item.json first
  // 'Auto_Module_C12': 'Unique',  // TBD: Above All (Engine) — add to item.json first
  // 'Auto_Module_C13': 'Unique',  // TBD: Reflection Reject (Engine) — add to item.json first
  // Unique — Leg
  'Auto_Module_C7': 'Unique',
  'Auto_Module_C14': 'Unique',
  // Unique — Accessories
  'Auto_Module_C10': 'Unique',
  // 'Auto_Module_C15': 'Unique',  // TBD: Drain Life (Acc R) — add to item.json first
  // 'Auto_Module_C16': 'Unique',  // TBD: Magic Healing (Acc R) — add to item.json first
  // 'Auto_Module_C17': 'Unique',  // TBD: Drain Soul (Acc L) — add to item.json first
  // 'Auto_Module_C18': 'Unique',  // TBD: Magic Soul (Acc L) — add to item.json first
  // Epic — spread from autoModEpic
  ...Object.fromEntries(autoModEpic.map(aegis => [aegis, 'Epic' as ModuleRarity])),
  // Legendary
  'Auto_Module_L1': 'Legendary',
  'Auto_Module_L2': 'Legendary',
  'Auto_Module_L3': 'Legendary',
  'Auto_Module_L4': 'Legendary',
  'Auto_Module_L5': 'Legendary',
  'Auto_Module_L6': 'Legendary',
};

export const moduleClassMap: Record<string, ClassName[]> = {
  // Rune Knight / Dragon Knight
  'Auto_Module_Db': [ClassName.RuneKnight, ClassName.DragonKnight],
  'Auto_Module_Wb': [ClassName.RuneKnight, ClassName.DragonKnight],
  'Auto_Module_Hs': [ClassName.RuneKnight, ClassName.DragonKnight],
  // Royal Guard / Imperial Guard
  'Auto_Module_Dp': [ClassName.RoyalGuard, ClassName.ImperialGuard],
  'Auto_Module_Vc': [ClassName.RoyalGuard, ClassName.ImperialGuard],
  // Archbishop / Cardinal
  'Auto_Module_Gg': [ClassName.ArchBishop, ClassName.Cardinal],
  'Auto_Module_Mg': [ClassName.ArchBishop, ClassName.Cardinal],
  'Auto_Module_Hj': [ClassName.ArchBishop, ClassName.Cardinal, ClassName.Inquisitor],
  'Auto_Module_Du': [ClassName.ArchBishop, ClassName.Cardinal],
  // Sura / Inquisitor
  'Auto_Module_Ft': [ClassName.Sura, ClassName.Inquisitor],
  'Auto_Module_Ra': [ClassName.Sura],
  'Auto_Module_Rc': [ClassName.Sura],
  // Mechanic / Meister
  'Auto_Module_Bc': [ClassName.Mechanic, ClassName.Meister],
  'Auto_Module_If': [ClassName.Mechanic, ClassName.Meister],
  'Auto_Module_Ts': [ClassName.Mechanic, ClassName.Meister],
  // Genetic / Biolo
  'Auto_Module_Ct': [ClassName.Genetic, ClassName.Biolo],
  'Auto_Module_Cm': [ClassName.Genetic, ClassName.Biolo],
  'Auto_Module_Ae': [ClassName.Genetic, ClassName.Biolo],
  // Guillotine Cross / Shadow Cross
  'Auto_Module_Si': [ClassName.GuillotineCross, ClassName.ShadowCross],
  'Auto_Module_Cs': [ClassName.GuillotineCross, ClassName.ShadowCross],
  'Auto_Module_Bs': [ClassName.GuillotineCross, ClassName.ShadowCross],
  'Auto_Module_Fr': [ClassName.ShadowCross],
  'Auto_Module_Csl': [ClassName.GuillotineCross, ClassName.ShadowCross],
  // Shadow Chaser / Abyss Chaser
  'Auto_Module_Ss': [ClassName.ShadowChaser, ClassName.AbyssChaser],
  'Auto_Module_Cx': [ClassName.ShadowChaser, ClassName.AbyssChaser],
  // Ranger / Windhawk
  'Auto_Module_As': [ClassName.Ranger, ClassName.Windhawk],
  'Auto_Module_Cl': [ClassName.Ranger, ClassName.Windhawk],
  'Auto_Module_Bs2': [ClassName.Ranger, ClassName.Windhawk],
  'Auto_Module_Ab': [ClassName.Ranger, ClassName.Windhawk],
  // Warlock / Arch Mage
  'Auto_Module_Ce': [ClassName.Warlock, ClassName.ArchMage],
  'Auto_Module_Jl': [ClassName.Warlock, ClassName.ArchMage],
  'Auto_Module_Cv': [ClassName.Warlock, ClassName.ArchMage],
  'Auto_Module_Dbl': [ClassName.Warlock, ClassName.ArchMage],
  'Auto_Module_Ww': [ClassName.Warlock, ClassName.ArchMage],
  'Auto_Module_Dg': [ClassName.Warlock, ClassName.ArchMage],
  // Minstrel / Troubadour / Wanderer / Trouvere
  'Auto_Module_Me': [ClassName.Minstrel, ClassName.Troubadour, ClassName.Wanderer, ClassName.Trouvere],
  'Auto_Module_Rev': [ClassName.Minstrel, ClassName.Troubadour, ClassName.Wanderer, ClassName.Trouvere],
  'Auto_Module_Vs': [ClassName.Minstrel, ClassName.Troubadour, ClassName.Wanderer, ClassName.Trouvere],
  // Star Emperor / Sky Emperor
  'Auto_Module_Be': [ClassName.StarEmperor, ClassName.SkyEmperor],
  'Auto_Module_Mk': [ClassName.StarEmperor, ClassName.SkyEmperor],
  'Auto_Module_Ff': [ClassName.StarEmperor, ClassName.SkyEmperor],
  // Soul Reaper / Soul Ascetic
  'Auto_Module_Ew': [ClassName.SoulReaper, ClassName.SoulAscetic],
  'Auto_Module_Esp': [ClassName.SoulReaper, ClassName.SoulAscetic],
  // Rebellion / Night Watch
  'Auto_Module_Dh': [ClassName.Rebellion, ClassName.NightWatch],
  'Auto_Module_Fh': [ClassName.Rebellion, ClassName.NightWatch],
  'Auto_Module_Sb': [ClassName.Rebellion, ClassName.NightWatch],
  // Kagerou / Oboro / Shinkiro / Shiranui
  'Auto_Module_Ps': [ClassName.Kagerou, ClassName.Oboro, ClassName.Shinkiro, ClassName.Shiranui],
  'Auto_Module_Dd': [ClassName.Kagerou, ClassName.Oboro, ClassName.Shinkiro, ClassName.Shiranui],
  // Spirit Handler (Doram)
  'Auto_Module_Sea': [ClassName.SpiritHandler],
  'Auto_Module_Land': [ClassName.SpiritHandler],
  'Auto_Module_Life': [ClassName.SpiritHandler],
};

export const moduleClassOrder: ClassName[] = [
  ClassName.RoyalGuard, ClassName.ImperialGuard,
  ClassName.RuneKnight, ClassName.DragonKnight,
  ClassName.ArchBishop, ClassName.Cardinal,
  ClassName.Sura, ClassName.Inquisitor,
  ClassName.Ranger, ClassName.Windhawk,
  ClassName.Minstrel, ClassName.Troubadour,
  ClassName.Wanderer, ClassName.Trouvere,
  ClassName.GuillotineCross, ClassName.ShadowCross,
  ClassName.ShadowChaser, ClassName.AbyssChaser,
  ClassName.Warlock, ClassName.ArchMage,
  ClassName.Mechanic, ClassName.Meister,
  ClassName.Genetic, ClassName.Biolo,
  ClassName.SoulReaper, ClassName.SoulAscetic,
  ClassName.StarEmperor, ClassName.SkyEmperor,
  ClassName.Rebellion, ClassName.NightWatch,
  ClassName.Kagerou, ClassName.Oboro,
  ClassName.Shinkiro, ClassName.Shiranui,
  ClassName.SpiritHandler,
];
