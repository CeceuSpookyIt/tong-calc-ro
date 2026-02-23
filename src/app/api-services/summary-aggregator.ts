import { EquipmentPosition } from '../layout/pages/preset-summary/model';
import { PresetModel } from './models/preset-model';
import { ItemRankingModel } from '../layout/pages/preset-summary/model/item-ranking.model';

export interface PresetRow {
  user_id: string;
  model: PresetModel;
  class_id: number;
}

interface EquipDef {
  type: 'equip';
  itemField: keyof PresetModel;
  enchantFields: (keyof PresetModel)[];
}

interface CardDef {
  type: 'card';
  cardFields: (keyof PresetModel)[];
}

type PositionDef = EquipDef | CardDef;

const POSITION_MAP: Record<EquipmentPosition, PositionDef> = {
  [EquipmentPosition.Weapon]: { type: 'equip', itemField: 'weapon', enchantFields: ['weaponEnchant1', 'weaponEnchant2', 'weaponEnchant3'] },
  [EquipmentPosition.WeaponCard]: { type: 'card', cardFields: ['weaponCard1', 'weaponCard2', 'weaponCard3', 'weaponCard4'] },
  [EquipmentPosition.LeftWeapon]: { type: 'equip', itemField: 'leftWeapon', enchantFields: ['leftWeaponEnchant1', 'leftWeaponEnchant2', 'leftWeaponEnchant3'] },
  [EquipmentPosition.LeftWeaponCard]: { type: 'card', cardFields: ['leftWeaponCard1', 'leftWeaponCard2', 'leftWeaponCard3', 'leftWeaponCard4'] },
  [EquipmentPosition.Shield]: { type: 'equip', itemField: 'shield', enchantFields: ['shieldEnchant1', 'shieldEnchant2', 'shieldEnchant3'] },
  [EquipmentPosition.ShieldCard]: { type: 'card', cardFields: ['shieldCard'] },
  [EquipmentPosition.HeadUpper]: { type: 'equip', itemField: 'headUpper', enchantFields: ['headUpperEnchant1', 'headUpperEnchant2', 'headUpperEnchant3'] },
  [EquipmentPosition.HeadUpperCard]: { type: 'card', cardFields: ['headUpperCard'] },
  [EquipmentPosition.HeadMiddle]: { type: 'equip', itemField: 'headMiddle', enchantFields: ['headMiddleEnchant1', 'headMiddleEnchant2', 'headMiddleEnchant3'] },
  [EquipmentPosition.HeadMiddleCard]: { type: 'card', cardFields: ['headMiddleCard'] },
  [EquipmentPosition.HeadLower]: { type: 'equip', itemField: 'headLower', enchantFields: ['headLowerEnchant1', 'headLowerEnchant2', 'headLowerEnchant3'] },
  [EquipmentPosition.Armor]: { type: 'equip', itemField: 'armor', enchantFields: ['armorEnchant1', 'armorEnchant2', 'armorEnchant3'] },
  [EquipmentPosition.ArmorCard]: { type: 'card', cardFields: ['armorCard'] },
  [EquipmentPosition.Garment]: { type: 'equip', itemField: 'garment', enchantFields: ['garmentEnchant1', 'garmentEnchant2', 'garmentEnchant3'] },
  [EquipmentPosition.GarmentCard]: { type: 'card', cardFields: ['garmentCard'] },
  [EquipmentPosition.Boot]: { type: 'equip', itemField: 'boot', enchantFields: ['bootEnchant1', 'bootEnchant2', 'bootEnchant3'] },
  [EquipmentPosition.BootCard]: { type: 'card', cardFields: ['bootCard'] },
  [EquipmentPosition.AccLeft]: { type: 'equip', itemField: 'accLeft', enchantFields: ['accLeftEnchant1', 'accLeftEnchant2', 'accLeftEnchant3'] },
  [EquipmentPosition.AccLeftCard]: { type: 'card', cardFields: ['accLeftCard'] },
  [EquipmentPosition.AccRight]: { type: 'equip', itemField: 'accRight', enchantFields: ['accRightEnchant1', 'accRightEnchant2', 'accRightEnchant3'] },
  [EquipmentPosition.AccRightCard]: { type: 'card', cardFields: ['accRightCard'] },
  [EquipmentPosition.CostumeEnchantUpper]: { type: 'equip', itemField: 'costumeEnchantUpper', enchantFields: [] },
  [EquipmentPosition.CostumeEnchantMiddle]: { type: 'equip', itemField: 'costumeEnchantMiddle', enchantFields: [] },
  [EquipmentPosition.CostumeEnchantLower]: { type: 'equip', itemField: 'costumeEnchantLower', enchantFields: [] },
  [EquipmentPosition.CostumeEnchantGarment]: { type: 'equip', itemField: 'costumeEnchantGarment', enchantFields: [] },
  [EquipmentPosition.ShadowWeapon]: { type: 'equip', itemField: 'shadowWeapon', enchantFields: ['shadowWeaponEnchant1', 'shadowWeaponEnchant2', 'shadowWeaponEnchant3'] },
  [EquipmentPosition.ShadowShield]: { type: 'equip', itemField: 'shadowShield', enchantFields: ['shadowShieldEnchant1', 'shadowShieldEnchant2', 'shadowShieldEnchant3'] },
  [EquipmentPosition.ShadowArmor]: { type: 'equip', itemField: 'shadowArmor', enchantFields: ['shadowArmorEnchant1', 'shadowArmorEnchant2', 'shadowArmorEnchant3'] },
  [EquipmentPosition.ShadowBoot]: { type: 'equip', itemField: 'shadowBoot', enchantFields: ['shadowBootEnchant1', 'shadowBootEnchant2', 'shadowBootEnchant3'] },
  [EquipmentPosition.ShadowEarring]: { type: 'equip', itemField: 'shadowEarring', enchantFields: ['shadowEarringEnchant1', 'shadowEarringEnchant2', 'shadowEarringEnchant3'] },
  [EquipmentPosition.ShadowPendant]: { type: 'equip', itemField: 'shadowPendant', enchantFields: ['shadowPendantEnchant1', 'shadowPendantEnchant2', 'shadowPendantEnchant3'] },
};

interface ItemTracker {
  userIds: Set<string>;
  presetCount: number;
  enchants: Record<string, number>;
  enchantTotal: number;
}

type TrackerMap = Record<string, Record<string, Record<string, Record<number, ItemTracker>>>>;

export interface AggregatedSummary {
  totalSummary: Record<string, Record<string, Record<string, ItemRankingModel[]>>>;
  jobSkillSummary: Record<string, Record<string, number>>;
  presetSummary: Record<string, Record<string, number>>;
  jobSummary: Record<string, number>;
}

function getOrCreate<K extends string, V>(obj: Record<K, V>, key: K, factory: () => V): V {
  if (!obj[key]) obj[key] = factory();
  return obj[key];
}

export function aggregatePresets(rows: PresetRow[]): AggregatedSummary {
  // Trackers
  const jobSkillUsers: Record<string, Record<string, Set<string>>> = {};
  const presetCount: Record<string, Record<string, number>> = {};
  const jobUsers: Record<string, Set<string>> = {};
  const itemTrackers: TrackerMap = {};

  for (const row of rows) {
    const jobId = String(row.class_id);
    const model = row.model;
    const userId = row.user_id;
    const skillName = model?.selectedAtkSkill;

    if (!model || !skillName) continue;

    // Job summary — unique users per job
    const jobSet = getOrCreate(jobUsers, jobId, () => new Set<string>());
    jobSet.add(userId);

    // Job-skill summary — unique users per (job, skill)
    const skillUsers = getOrCreate(jobSkillUsers, jobId, () => ({}));
    const skillSet = getOrCreate(skillUsers, skillName, () => new Set<string>());
    skillSet.add(userId);

    // Preset summary — count per (job, skill)
    const presets = getOrCreate(presetCount, jobId, () => ({}));
    presets[skillName] = (presets[skillName] || 0) + 1;

    // Item tracking per position
    const jobTrackers = getOrCreate(itemTrackers, jobId, () => ({}));
    const skillTrackers = getOrCreate(jobTrackers, skillName, () => ({}));

    for (const [position, def] of Object.entries(POSITION_MAP)) {
      const posTrackers = getOrCreate(skillTrackers, position, () => ({}));

      if (def.type === 'equip') {
        const itemId = model[def.itemField] as number;
        if (!itemId) continue;

        const tracker = getOrCreate(posTrackers, itemId as any, () => ({
          userIds: new Set<string>(),
          presetCount: 0,
          enchants: {},
          enchantTotal: 0,
        }));

        tracker.userIds.add(userId);
        tracker.presetCount++;

        // Track enchant combination
        if (def.enchantFields.length > 0) {
          const enchantIds = def.enchantFields.map((f) => (model[f] as number) || 0);
          const enchantKey = enchantIds.join('-');
          tracker.enchants[enchantKey] = (tracker.enchants[enchantKey] || 0) + 1;
          tracker.enchantTotal++;
        }
      } else {
        // Card positions — each card field is an independent item
        for (const cardField of def.cardFields) {
          const cardId = model[cardField] as number;
          if (!cardId) continue;

          const tracker = getOrCreate(posTrackers, cardId as any, () => ({
            userIds: new Set<string>(),
            presetCount: 0,
            enchants: {},
            enchantTotal: 0,
          }));

          tracker.userIds.add(userId);
          tracker.presetCount++;
        }
      }
    }
  }

  // Convert trackers to output format
  const totalSummary: AggregatedSummary['totalSummary'] = {};
  const jobSkillSummary: AggregatedSummary['jobSkillSummary'] = {};
  const presetSummary: AggregatedSummary['presetSummary'] = {};
  const jobSummary: AggregatedSummary['jobSummary'] = {};

  // jobSummary
  for (const [jobId, users] of Object.entries(jobUsers)) {
    jobSummary[jobId] = users.size;
  }

  // jobSkillSummary
  for (const [jobId, skills] of Object.entries(jobSkillUsers)) {
    jobSkillSummary[jobId] = {};
    for (const [skill, users] of Object.entries(skills)) {
      jobSkillSummary[jobId][skill] = users.size;
    }
  }

  // presetSummary
  for (const [jobId, skills] of Object.entries(presetCount)) {
    presetSummary[jobId] = { ...skills };
  }

  // totalSummary — convert item trackers to ItemRankingModel arrays
  for (const [jobId, skills] of Object.entries(itemTrackers)) {
    totalSummary[jobId] = {};
    for (const [skill, positions] of Object.entries(skills)) {
      totalSummary[jobId][skill] = {};

      // Initialize all positions with empty arrays
      for (const pos of Object.values(EquipmentPosition)) {
        totalSummary[jobId][skill][pos] = [];
      }

      for (const [position, items] of Object.entries(positions)) {
        const rankings: Omit<ItemRankingModel, 'ItemName' | 'ColorStyle' | 'IsEnchant' | 'EnchantInfos' | 'Percentage'>[] = [];

        for (const [itemIdStr, tracker] of Object.entries(items)) {
          const itemId = Number(itemIdStr);
          rankings.push({
            ItemId: itemId,
            UsingRate: tracker.userIds.size,
            TotalPreset: tracker.presetCount,
            TotalAccount: tracker.userIds.size,
            TotalEnchant: tracker.enchantTotal,
            Enchants: { ...tracker.enchants },
          });
        }

        // Sort by UsingRate descending
        rankings.sort((a, b) => b.UsingRate - a.UsingRate);

        totalSummary[jobId][skill][position] = rankings as ItemRankingModel[];
      }
    }
  }

  return { totalSummary, jobSkillSummary, presetSummary, jobSummary };
}
