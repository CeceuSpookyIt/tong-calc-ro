// Normal modules - available for all automatic equipment (armor/garment/shoes)
export const autoModNormal = [
  'Auto_Module_A',   // DEF
  'Auto_Module_A2',  // MDEF
  'Auto_Module_A8',  // DEX (range)
];

// Normal modules - accessories only
export const autoModNormalAccR = [
  'Auto_Module_A3',  // VIT
  'Auto_Module_A4',  // LUK
  'Auto_Module_A5',  // STR
  'Auto_Module_A6',  // AGI
];

export const autoModNormalAccL = [
  'Auto_Module_A3',  // VIT
  'Auto_Module_A4',  // LUK
  'Auto_Module_A7',  // INT
  'Auto_Module_A6',  // AGI
];

// Rare modules
export const autoModRare = [
  'Auto_Module_B4',   // ASPD
  'Auto_Module_B5',   // Fatal
  'Auto_Module_B6',   // Expert Archer
  'Auto_Module_B10',  // ATK
  'Auto_Module_B11',  // MATK
  'Auto_Module_B12',  // Sharpshooter
  'Auto_Module_B15',  // Critical
];

export const autoModRareGarment = [
  'Auto_Module_B13',  // Speed
];

export const autoModRareAcc = [
  'Auto_Module_B3',   // Spell
  'Auto_Module_B14',  // Caster
];

// Unique modules
export const autoModUnique = [
  'Auto_Module_C2',   // Magical Force
  'Auto_Module_C3',   // Attacker Force
  'Auto_Module_C',    // Ranged Force
  'Auto_Module_C4',   // Critical Force
  'Auto_Module_C6',   // Post-skill Delay
  'Auto_Module_C8',   // Power Force
  'Auto_Module_C9',   // Powerful
];

export const autoModUniqueShoes = [
  'Auto_Module_C7',   // Fixed Cast Time
];

export const autoModUniqueAcc = [
  'Auto_Module_C10',  // All-Force
];

// Epic modules (skill-specific) - available on armor/garment/shoes
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

// Combined lists for each equipment slot
export const autoArmorSlot1 = [...autoModNormal, ...autoModRare, ...autoModUnique, ...autoModEpic];
export const autoArmorSlot2 = [...autoModNormal, ...autoModRare, ...autoModUnique, ...autoModEpic];
export const autoArmorSlot3 = [...autoModNormal, ...autoModRare, ...autoModUnique, ...autoModEpic];

export const autoGarmentSlot1 = [...autoModNormal, ...autoModRareGarment, ...autoModRare, ...autoModUnique, ...autoModEpic];
export const autoGarmentSlot2 = [...autoModNormal, ...autoModRareGarment, ...autoModRare, ...autoModUnique, ...autoModEpic];
export const autoGarmentSlot3 = [...autoModNormal, ...autoModRareGarment, ...autoModRare, ...autoModUnique, ...autoModEpic];

export const autoShoesSlot1 = [...autoModNormal, ...autoModRare, ...autoModUnique, ...autoModUniqueShoes, ...autoModEpic];
export const autoShoesSlot2 = [...autoModNormal, ...autoModRare, ...autoModUnique, ...autoModUniqueShoes, ...autoModEpic];
export const autoShoesSlot3 = [...autoModNormal, ...autoModRare, ...autoModUnique, ...autoModUniqueShoes, ...autoModEpic];

export const autoAccRSlot1 = [...autoModNormalAccR, ...autoModRareAcc, ...autoModUniqueAcc];
export const autoAccRSlot2 = [...autoModNormalAccR, ...autoModRareAcc, ...autoModUniqueAcc];
export const autoAccRSlot3 = [...autoModNormalAccR, ...autoModRareAcc, ...autoModUniqueAcc];

export const autoAccLSlot1 = [...autoModNormalAccL, ...autoModRareAcc, ...autoModUniqueAcc];
export const autoAccLSlot2 = [...autoModNormalAccL, ...autoModRareAcc, ...autoModUniqueAcc];
export const autoAccLSlot3 = [...autoModNormalAccL, ...autoModRareAcc, ...autoModUniqueAcc];
