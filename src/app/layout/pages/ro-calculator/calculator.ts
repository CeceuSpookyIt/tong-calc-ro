import {
  AllowAmmoMapper,
  ClassAmmoMapper,
  ElementType,
  ItemSubTypeId,
  ItemTypeEnum,
  MainItemTypeSet,
  MainItemWithRelations,
  WeaponAmmoMapper,
} from 'src/app/constants';
import { SKILL_NAME } from 'src/app/constants/skill-name';
import { Monster, Weapon } from 'src/app/domain';
import { AtkSkillModel, CharacterBase } from 'src/app/jobs';
import { createRawTotalBonus, floor, isNumber, round } from 'src/app/utils';
import { AutocastDamageSummary, AutocastEntry, AutocastTrigger } from '../../../models/autocast.model';
import { AUTOCAST_SKILL_REGISTRY } from '../../../constants/autocast-skill-registry';
import { ChanceModel } from '../../../models/chance-model';
import { BasicAspdModel, BasicDamageSummaryModel, MiscModel, SkillAspdModel, SkillDamageSummaryModel } from '../../../models/damage-summary.model';
import { EquipmentSummaryModel } from '../../../models/equipment-summary.model';
import { HpSpTable } from '../../../models/hp-sp-table.model';
import { AdditionalBonusInput } from '../../../models/info-for-class.model';
import { ItemModel } from '../../../models/item.model';
import { MainModel } from '../../../models/main.model';
import { MonsterModel } from '../../../models/monster.model';
import { BreakdownContext, BreakdownEntry, BreakdownSection, StatBreakdown } from './stat-breakdown.model';
import { DamageBreakdown, DamageStep } from './damage-breakdown.model';
import { DamageCalculator } from './damage-calculator';
import { HpSpCalculator } from './hp-sp-calculator';

// const getItem = (id: number) => items[id] as ItemModel;
const refinableItemTypes = [
  ItemTypeEnum.weapon,
  ItemTypeEnum.leftWeapon,
  ItemTypeEnum.headUpper,
  ItemTypeEnum.shield,
  ItemTypeEnum.armor,
  ItemTypeEnum.garment,
  ItemTypeEnum.boot,
  ItemTypeEnum.accLeft,
  ItemTypeEnum.accRight,

  ItemTypeEnum.shadowWeapon,
  ItemTypeEnum.shadowArmor,
  ItemTypeEnum.shadowBoot,
  ItemTypeEnum.shadowEarring,
  ItemTypeEnum.shadowPendant,
  ItemTypeEnum.shadowShield,
];
const mainStatuses: (keyof EquipmentSummaryModel)[] = ['str', 'dex', 'int', 'agi', 'luk', 'vit'];
const traitStatuses: (keyof EquipmentSummaryModel)[] = ['pow', 'sta', 'wis', 'spl', 'con', 'crt'];

interface ValidationResult {
  isValid: boolean;
  isEndValidate?: boolean;
  restCondition: string;
}

export class Calculator {
  private readonly DEFAULT_PERFECT_HIT = 5;

  private items!: Record<number, ItemModel>;

  private model: Partial<MainModel> = {
    class: undefined,
    level: 1,
    jobLevel: 1,
    str: 1,
    jobStr: undefined,
    agi: 1,
    jobAgi: undefined,
    vit: 1,
    jobVit: undefined,
    int: 1,
    jobInt: undefined,
    dex: 1,
    jobDex: undefined,
    luk: 1,
    jobLuk: undefined,
    propertyAtk: undefined,

    weapon: undefined,
    weaponRefine: undefined,
    weaponCard1: undefined,
    weaponCard2: undefined,
    weaponCard3: undefined,
    weaponEnchant1: undefined,
    weaponEnchant2: undefined,
    weaponEnchant3: undefined,

    ammo: undefined,

    headUpper: undefined,
    headUpperRefine: undefined,
    headUpperCard: undefined,
    headUpperEnchant1: undefined,
    headUpperEnchant2: undefined,
    headUpperEnchant3: undefined,
    headMiddle: undefined,
    headMiddleCard: undefined,
    headMiddleEnchant1: undefined,
    headMiddleEnchant2: undefined,
    headMiddleEnchant3: undefined,
    headLower: undefined,
    headLowerEnchant1: undefined,
    headLowerEnchant2: undefined,
    headLowerEnchant3: undefined,

    armor: undefined,
    armorRefine: undefined,
    armorCard: undefined,
    armorEnchant1: undefined,
    armorEnchant2: undefined,
    armorEnchant3: undefined,
    shield: undefined,
    shieldRefine: undefined,
    shieldCard: undefined,
    shieldEnchant1: undefined,
    shieldEnchant2: undefined,
    shieldEnchant3: undefined,
    garment: undefined,
    garmentRefine: undefined,
    garmentCard: undefined,
    garmentEnchant1: undefined,
    garmentEnchant2: undefined,
    garmentEnchant3: undefined,
    boot: undefined,
    bootRefine: undefined,
    bootCard: undefined,
    bootEnchant1: undefined,
    bootEnchant2: undefined,
    bootEnchant3: undefined,

    accLeft: undefined,
    accLeftRefine: undefined,
    accLeftCard: undefined,
    accLeftEnchant1: undefined,
    accLeftEnchant2: undefined,
    accLeftEnchant3: undefined,
    accRight: undefined,
    accRightRefine: undefined,
    accRightCard: undefined,
    accRightEnchant1: undefined,
    accRightEnchant2: undefined,
    accRightEnchant3: undefined,

    pet: undefined,
  };
  private equipItem = new Map<ItemTypeEnum, ItemModel>();
  private equipItemName = new Map<ItemTypeEnum, string>();
  private equipItemNameSet = new Set<string>();
  private mapRefine = new Map<ItemTypeEnum, number>();
  private mapGrade = new Map<ItemTypeEnum, string>();
  private mapItemNameRefine = new Map<string, number>();
  private usedSkillNames = new Set<string>();
  private learnedSkillMap = new Map<string, number>();
  private equipAtkSkillBonus: Record<string, Record<string, any>> = {};
  private buffMasteryAtkBonus: Record<string, Record<string, any>> = {};
  private buffEquipAtkBonus: Record<string, Record<string, any>> = {};
  private masteryAtkSkillBonus: Record<string, any> = {};
  private consumableBonuses: any[] = [];
  private aspdPotion: number = undefined;

  private skillName: SKILL_NAME = '' as any;
  private offensiveSkillLevel = 0;
  private allStatus = createRawTotalBonus();
  private totalEquipStatus = createRawTotalBonus();
  private equipStatus: Partial<Record<ItemTypeEnum, EquipmentSummaryModel>> = {
    weapon: { ...this.allStatus },
    weaponCard1: { ...this.allStatus },
    weaponCard2: { ...this.allStatus },
    weaponCard3: { ...this.allStatus },
    weaponCard4: { ...this.allStatus },
    weaponEnchant1: { ...this.allStatus },
    weaponEnchant2: { ...this.allStatus },
    weaponEnchant3: { ...this.allStatus },
    ammo: { ...this.allStatus },
    headUpper: { ...this.allStatus },
    headUpperRefine: { ...this.allStatus },
    headUpperCard: { ...this.allStatus },
    headUpperEnchant1: { ...this.allStatus },
    headUpperEnchant2: { ...this.allStatus },
    headUpperEnchant3: { ...this.allStatus },
    headMiddle: { ...this.allStatus },
    headMiddleCard: { ...this.allStatus },
    headMiddleEnchant1: { ...this.allStatus },
    headMiddleEnchant2: { ...this.allStatus },
    headMiddleEnchant3: { ...this.allStatus },
    headLower: { ...this.allStatus },
    headLowerEnchant1: { ...this.allStatus },
    headLowerEnchant2: { ...this.allStatus },
    headLowerEnchant3: { ...this.allStatus },
    armor: { ...this.allStatus },
    armorRefine: { ...this.allStatus },
    armorCard: { ...this.allStatus },
    armorEnchant1: { ...this.allStatus },
    armorEnchant2: { ...this.allStatus },
    armorEnchant3: { ...this.allStatus },
    shield: { ...this.allStatus },
    shieldRefine: { ...this.allStatus },
    shieldCard: { ...this.allStatus },
    shieldEnchant1: { ...this.allStatus },
    shieldEnchant2: { ...this.allStatus },
    shieldEnchant3: { ...this.allStatus },
    garment: { ...this.allStatus },
    garmentRefine: { ...this.allStatus },
    garmentCard: { ...this.allStatus },
    garmentEnchant1: { ...this.allStatus },
    garmentEnchant2: { ...this.allStatus },
    garmentEnchant3: { ...this.allStatus },
    boot: { ...this.allStatus },
    bootRefine: { ...this.allStatus },
    bootCard: { ...this.allStatus },
    bootEnchant1: { ...this.allStatus },
    bootEnchant2: { ...this.allStatus },
    bootEnchant3: { ...this.allStatus },
    accLeft: { ...this.allStatus },
    accLeftCard: { ...this.allStatus },
    accLeftEnchant1: { ...this.allStatus },
    accLeftEnchant2: { ...this.allStatus },
    accLeftEnchant3: { ...this.allStatus },
    accRight: { ...this.allStatus },
    accRightCard: { ...this.allStatus },
    accRightEnchant1: { ...this.allStatus },
    accRightEnchant2: { ...this.allStatus },
    accRightEnchant3: { ...this.allStatus },
  };

  private static readonly SLOT_LABELS: Record<string, string> = {
    weapon: 'Arma',
    weaponCard1: 'Arma Carta 1',
    weaponCard2: 'Arma Carta 2',
    weaponCard3: 'Arma Carta 3',
    weaponCard4: 'Arma Carta 4',
    weaponEnchant0: 'Arma Enc. 0',
    weaponEnchant1: 'Arma Enc. 1',
    weaponEnchant2: 'Arma Enc. 2',
    weaponEnchant3: 'Arma Enc. 3',
    headUpper: 'Topo',
    headUpperCard: 'Topo Carta',
    headUpperEnchant1: 'Topo Enc. 1',
    headUpperEnchant2: 'Topo Enc. 2',
    headUpperEnchant3: 'Topo Enc. 3',
    headMiddle: 'Meio',
    headMiddleCard: 'Meio Carta',
    headMiddleEnchant1: 'Meio Enc. 1',
    headMiddleEnchant2: 'Meio Enc. 2',
    headMiddleEnchant3: 'Meio Enc. 3',
    headLower: 'Baixo',
    headLowerEnchant1: 'Baixo Enc. 1',
    headLowerEnchant2: 'Baixo Enc. 2',
    headLowerEnchant3: 'Baixo Enc. 3',
    armor: 'Armadura',
    armorCard: 'Armadura Carta',
    armorEnchant1: 'Armadura Enc. 1',
    armorEnchant2: 'Armadura Enc. 2',
    armorEnchant3: 'Armadura Enc. 3',
    shield: 'Escudo',
    shieldCard: 'Escudo Carta',
    shieldEnchant1: 'Escudo Enc. 1',
    shieldEnchant2: 'Escudo Enc. 2',
    shieldEnchant3: 'Escudo Enc. 3',
    garment: 'Manto',
    garmentCard: 'Manto Carta',
    garmentEnchant1: 'Manto Enc. 1',
    garmentEnchant2: 'Manto Enc. 2',
    garmentEnchant3: 'Manto Enc. 3',
    boot: 'Sapato',
    bootCard: 'Sapato Carta',
    bootEnchant1: 'Sapato Enc. 1',
    bootEnchant2: 'Sapato Enc. 2',
    bootEnchant3: 'Sapato Enc. 3',
    accLeft: 'Acessório E',
    accLeftCard: 'Acessório E Carta',
    accLeftEnchant1: 'Acessório E Enc. 1',
    accLeftEnchant2: 'Acessório E Enc. 2',
    accLeftEnchant3: 'Acessório E Enc. 3',
    accRight: 'Acessório D',
    accRightCard: 'Acessório D Carta',
    accRightEnchant1: 'Acessório D Enc. 1',
    accRightEnchant2: 'Acessório D Enc. 2',
    accRightEnchant3: 'Acessório D Enc. 3',
    shadowWeapon: 'Shadow Arma',
    shadowWeaponEnchant2: 'Shadow Arma Enc. 2',
    shadowWeaponEnchant3: 'Shadow Arma Enc. 3',
    shadowArmor: 'Shadow Armadura',
    shadowArmorEnchant2: 'Shadow Armadura Enc. 2',
    shadowArmorEnchant3: 'Shadow Armadura Enc. 3',
    shadowShield: 'Shadow Escudo',
    shadowShieldEnchant2: 'Shadow Escudo Enc. 2',
    shadowShieldEnchant3: 'Shadow Escudo Enc. 3',
    shadowBoot: 'Shadow Sapato',
    shadowBootEnchant2: 'Shadow Sapato Enc. 2',
    shadowBootEnchant3: 'Shadow Sapato Enc. 3',
    shadowEarring: 'Shadow Brinco',
    shadowEarringEnchant2: 'Shadow Brinco Enc. 2',
    shadowEarringEnchant3: 'Shadow Brinco Enc. 3',
    shadowPendant: 'Shadow Colar',
    shadowPendantEnchant2: 'Shadow Colar Enc. 2',
    shadowPendantEnchant3: 'Shadow Colar Enc. 3',
    costumeEnchantUpper: 'Costume Enc. Topo',
    costumeEnchantMiddle: 'Costume Enc. Meio',
    costumeEnchantLower: 'Costume Enc. Baixo',
    costumeEnchantGarment: 'Costume Enc. Manto',
    costumeEnchantGarment2: 'Costume Enc. Manto 2',
    costumeEnchantGarment4: 'Costume Enc. Manto 4',
    extra: 'Enc. Sombrio',
  };

  private extraOptions: Record<string, number>[] = [];
  private weaponData = new Weapon();
  private leftWeaponData = new Weapon();
  private monster = new Monster();

  private hpSpCalculator = new HpSpCalculator();

  private _class: CharacterBase;
  private dmgCalculator = new DamageCalculator();
  private propertyBasicAtk = ElementType.Neutral;
  private propertyWindmind: ElementType;
  private baseEquipmentStat: Record<string, number> = {};
  private finalMultipliers = [] as number[];
  private finalPhyMultipliers = [] as number[];
  private finalMagicMultipliers = [] as number[];

  private maxHp = 0;
  private maxSp = 0;

  private def = 0;
  private softDef = 0;
  private mdef = 0;
  private softMdef = 0;

  private res = 0;
  private mres = 0;

  private damageSummary = {} as BasicDamageSummaryModel & Partial<SkillDamageSummaryModel>;
  private miscSummary = {} as MiscModel;
  private basicAspd = { hitsPerSec: 0, totalAspd: 0 } as BasicAspdModel;

  private selectedChanceList = [] as string[];
  private _chanceList = [] as ChanceModel[];
  private equipCombo = new Set<string>();

  private skillFrequency: SkillAspdModel = {
    cd: 0,
    reducedCd: 0,
    vct: 0,
    reducedVct: 0,
    fct: 0,
    reducedFct: 0,
    acd: 0,
    reducedAcd: 0,
    castPeriod: 0,
    hitPeriod: 0,
    totalHitPerSec: 0,
    sumDex2Int1: 0,
    vctByStat: 0,
    vctSkill: 0,
  };

  private autocastEntries: AutocastEntry[] = [];
  private autocastSummaries: AutocastDamageSummary[] = [];
  private autocastTotalDps = 0;
  private possiblyDamages: any[] = [];

  get chanceList() {
    return this._chanceList;
  }

  setMasterItems(items: any) {
    this.items = items;

    return this;
  }

  private getItem(id: number) {
    return this.items[id];
  }

  private isUsedSkill(skillName: string) {
    return this.usedSkillNames.has(skillName);
  }

  private get additionalBonusInput(): AdditionalBonusInput {
    return {
      model: this.model,
      monster: this.monster,
      totalBonus: this.totalEquipStatus,
      weapon: this.weaponData,
      skillName: this.skillName,
      ammoElement: this.equipItem.get(ItemTypeEnum.ammo)?.propertyAtk,
    };
  }

  private isEquipItem(itemName: string) {
    return this.equipItemNameSet.has(itemName);
  }

  isAllowAmmo() {
    const cName = this._class.className;

    return AllowAmmoMapper[this.weaponData.data?.typeName] || ClassAmmoMapper[cName] != null;
  }

  isAllowShield() {
    // if (!this.weaponData.data?.typeName && !environment.production) {
    //   switch (this._class.className) {
    //     case ClassName.Warlock:
    //       return true;
    //   }

    //   return false;
    // }

    return this.weaponData.isAllowShield();
  }

  getAmmoSubTypeId() {
    const cName = this._class.className;

    return WeaponAmmoMapper[this.weaponData.data?.typeName] || ClassAmmoMapper[cName];
  }

  private getChanceBonus() {
    return this._chanceList.filter((c) => this.selectedChanceList.includes(c.name)).map((c) => c.bonus);
  }

  private toPercent(n: number) {
    return n * 0.01;
  }

  setClass(c: CharacterBase) {
    this._class = c;

    return this;
  }

  setMonster(monster: MonsterModel) {
    this.monster.setData(monster);

    return this;
  }

  setModel(model: any) {
    this.model = { ...model };

    return this;
  }

  setWeapon(params: { itemId: number; refine: number; grade?: string; }) {
    const { itemId, refine, grade } = params;

    const itemData = this.getItem(itemId);
    this.equipItem.set(ItemTypeEnum.weapon, itemData);
    if (itemData) {
      this.equipItemName.set(ItemTypeEnum.weapon, this.removeItemSlotName(itemData.name));
    } else {
      this.equipItemName.delete(ItemTypeEnum.weapon);
    }

    this.mapRefine.set(ItemTypeEnum.weapon, refine);
    this.mapGrade.set(ItemTypeEnum.weapon, grade);
    this.weaponData.set({ itemData, refineLevel: refine, grade });

    return this;
  }

  setItem(params: { itemType: ItemTypeEnum; itemId: number; refine?: number; grade?: string; }) {
    const { itemId, itemType, refine, grade } = params;
    const itemData = this.getItem(itemId);
    this.equipItem.set(itemType, itemData);
    if (itemData) {
      this.equipItemName.set(itemType, this.removeItemSlotName(itemData.name));
    } else {
      this.equipItemName.delete(itemType);
    }

    if (refine != null) {
      this.mapRefine.set(itemType, refine);
    }

    if (grade != null) {
      this.mapGrade.set(itemType, grade);
    }

    return this;
  }

  setUsedSkillNames(usedSkillNames: Set<string>) {
    this.usedSkillNames = usedSkillNames;

    return this;
  }

  setLearnedSkills(learnedSkillMap: Map<string, number>) {
    this.learnedSkillMap = learnedSkillMap;

    return this;
  }

  setOffensiveSkill(skillValue: string) {
    const [, _skillName, _skillLevel] = skillValue?.match(/(.+)==(\d+)/) ?? [];
    this.skillName = _skillName as SKILL_NAME;
    this.offensiveSkillLevel = Number(_skillLevel) || 0;

    return this;
  }

  setEquipAtkSkillAtk(equipSkillBonus: Record<string, any>) {
    this.equipAtkSkillBonus = { ...equipSkillBonus };

    return this;
  }

  setBuffBonus(params: { masteryAtk: Record<string, any>; equipAtk: Record<string, any>; }) {
    const { masteryAtk, equipAtk } = params;
    this.buffEquipAtkBonus = { ...equipAtk };
    this.buffMasteryAtkBonus = { ...masteryAtk };

    return this;
  }

  setMasterySkillAtk(masterySkillBonus: Record<string, any>) {
    this.masteryAtkSkillBonus = { ...masterySkillBonus };

    return this;
  }

  setConsumables(consumableBonuses: any[]) {
    this.consumableBonuses = [...consumableBonuses];

    return this;
  }

  setAspdPotion(aspdPotion: number) {
    this.aspdPotion = aspdPotion;

    return this;
  }

  setExtraOptions(extraOptions: any[]) {
    this.extraOptions = extraOptions;

    return this;
  }

  setSelectedChances(selectedChances: string[]) {
    this.selectedChanceList = [...selectedChances.filter((name) => this._chanceList.some((c) => c.name === name))];

    return this;
  }

  loadItemFromModel(model: any) {
    this.model = { ...model };
    this.weaponData.set({ itemData: {} as any, refineLevel: 0, grade: '' });
    this.leftWeaponData.set({ itemData: {} as any, refineLevel: 0, grade: '' });
    this.equipItem.clear();
    this.equipItemName.clear();
    this.mapGrade.clear();

    this.mapRefine.clear();
    this.mapItemNameRefine.clear();

    const items = Object.entries(MainItemWithRelations) as [ItemTypeEnum, ItemTypeEnum[]][];

    for (const [mainItemType, itemRelations] of items) {
      const itemId = model[mainItemType];
      if (!isNumber(itemId)) continue;

      const refine = model[`${mainItemType}Refine`];
      const grade = model[`${mainItemType}Grade`];
      // console.log({itemId, refine, itemRelations})
      if (mainItemType === ItemTypeEnum.weapon) {
        this.setWeapon({ itemId, refine, grade });
      } else {
        // console.log({ mainItemType, refine });
        this.setItem({ itemType: mainItemType, itemId, refine, grade });
      }

      if (mainItemType === ItemTypeEnum.leftWeapon && itemId) {
        this.leftWeaponData.set({ itemData: this.items[itemId], refineLevel: refine, grade });
      }

      for (const itemRelation of itemRelations) {
        const itemId2 = this.equipItem.get(mainItemType) ? model[itemRelation] : 0;
        if (!isNumber(itemId2)) continue;

        this.setItem({ itemType: itemRelation, itemId: itemId2 });
      }
    }

    this.equipItemNameSet = new Set(this.equipItemName.values());
    for (const [itemType, itemName] of this.equipItemName) {
      this.mapItemNameRefine.set(itemName, this.mapRefine.get(itemType));
    }

    return this;
  }

  private calcPropertyAtkType() {
    const weaponEle = this.weaponData?.data?.propertyAtk;
    const buff = this.model.propertyAtk;
    const windmind = this.propertyWindmind;
    const ammo = this.equipItem.get(ItemTypeEnum.ammo)?.propertyAtk;

    this.propertyBasicAtk = windmind ?? buff ?? ammo ?? weaponEle ?? ElementType.Neutral;
  }

  calcAllAtk() {
    this.calcPropertyAtkType();

    this.dmgCalculator
      .setArgs({
        equipStatus: this.equipStatus as any,
        totalEquipStatus: this.totalEquipStatus,
        model: this.model,
        equipAtkSkillBonus: this.equipAtkSkillBonus,
        buffMasteryAtkBonus: this.buffMasteryAtkBonus,
        masteryAtkSkillBonus: this.masteryAtkSkillBonus,
        finalMultipliers: this.finalMultipliers,
        finalPhyMultipliers: this.finalPhyMultipliers,
        finalMagicMultipliers: this.finalMagicMultipliers,
        _class: this._class,
        monster: this.monster,
        weaponData: this.weaponData,
        aspdPotion: this.aspdPotion,
        leftWeaponData: this.leftWeaponData,
      })
      .setAmmoPropertyAtk(this.equipItem.get(ItemTypeEnum.ammo)?.propertyAtk);

    return this;
  }

  private calcConstantBonus(itemRefine: number, miniScript: string) {
    const [condition, bonus] = miniScript.split('===');
    const conditionNum = Number(condition);
    if (conditionNum && itemRefine < conditionNum) return 0;

    const bonusNum = Number(bonus);
    if (conditionNum && bonusNum) {
      return bonusNum;
    }

    const [statusCondition, value] = condition.split(':');
    if (statusCondition && value) {
      const passCondition = this.model[statusCondition] >= Number(value);
      if (passCondition) return Number(bonus);

      return 0;
    }

    // 50(90 segundos)
    const actualBonus = this.getActualBonus(bonus);
    if (isNumber(actualBonus)) return actualBonus;

    return 0;
  }

  private getActualBonus(bonusScript: string) {
    if (bonusScript.includes('(')) {
      const end = bonusScript.indexOf('(');

      return Number(bonusScript.substring(0, end));
    }

    return Number(bonusScript);
  }

  private calcStepBonus(itemRefine: number, lineScript: string) {
    const [condition, bonus] = lineScript.split('---');
    const conditionNum = Number(condition);
    const bonusNum = Number(bonus);
    const calc = (actual: number, cond: number) => floor(actual / cond) * bonusNum;
    // console.log({ lineScript, conditionNum, bonusNum });
    if (conditionNum && bonusNum) {
      return floor(itemRefine / conditionNum) * bonusNum;
    }

    // LEARN_SKILL[Snake Eyes==]1---2
    const [, skillName, skillLv] = condition.match(/LEARN_SKILL\[(.+?)==(\d+)]/) ?? [];
    if (skillName) {
      const learned = this.learnedSkillMap.get(skillName) || 0;
      return calc(learned, Number(skillLv));
    }

    // level:1(125)---1
    // level:1(1-125)---1
    const [, everyBaseLv, range] = condition.match(/level:(-*\d+)\((.+)\)/) ?? [];
    if (everyBaseLv && range) {
      // console.log({ baseLv, range });
      const [min, max = 999] = range.split('-').map(Number);
      const everyNum = Number(everyBaseLv);
      const cap = Math.min(max, this.model.level);

      return calc(cap - min + 1, everyNum);
    }

    // dex:10---1
    const [, status, statusCond] = condition.match(/(level|jobLevel|str|int|dex|agi|vit|luk):(-*\d+)/) ?? [];
    // console.log({ status, statusCond });
    if (status) {
      const myStatus = this.model[status];
      return calc(myStatus, Number(statusCond));
    }

    // SUM[str,luk==80]---6
    const [, sumOf, sumCond] = condition.match(/SUM\[(\D+)==(\d+)]/) ?? [];
    if (sumOf) {
      const sum = sumOf.split(',').reduce((total, stat) => total + (this.model[stat] || 0), 0);
      return calc(sum, Number(sumCond));
    }

    // REFINE[boot==1]---2
    const [, refineCombo, refineCond] = condition.match(/^REFINE\[(\D*?)=*=*(\d+)]/) ?? [];
    // console.log({ condition, refineCombo, refineCond });
    if (refineCombo) {
      const totalRefine = refineCombo
        .split(',')
        .map((itemType) => this.mapRefine.get(itemType as ItemTypeEnum))
        .reduce((sum, cur) => sum + (cur || 0), 0);

      return calc(totalRefine, Number(refineCond));
    }

    // REFINE_NAME[Judgment Slasher,Repent Slasher==3]---5
    const [, itemNames, refineCond2] = condition.match(/^REFINE_NAME\[(\D+)==(\d+)?]/) ?? [];
    if (refineCond2) {
      const totalRefine = itemNames
        .split(',')
        .map((itemName) => this.mapItemNameRefine.get(itemName))
        .reduce((sum, cur) => sum + (cur || 0), 0);

      return calc(totalRefine, Number(refineCond2));
    }

    // GVALUE[weapon==1]---2
    const [, itemPosition, gradeRate] = condition.match(/GVALUE\[(\D+)==(\d+)]/) ?? [];
    if (itemPosition && gradeRate) {
      const grade = this.getGradeValue(this.mapGrade.get(itemPosition as any));

      return calc(grade, Number(gradeRate));
    }

    return 0;
  }

  private getGradeValue(grade: string) {
    const x = {
      d: 1,
      D: 1,
      c: 2,
      C: 2,
      b: 3,
      B: 3,
      a: 4,
      A: 4,
    };

    return x[grade] || 0;
  }

  private isValidGrade(itemGrade: string, targetGrade: string): boolean {
    if (!itemGrade || !targetGrade) return false;

    return this.getGradeValue(itemGrade) >= this.getGradeValue(targetGrade);
  }

  private validateCondition(params: { itemType: ItemTypeEnum; itemRefine: number; script: string; }): ValidationResult {
    const { itemRefine, itemType, script } = params;
    let restCondition = script;
    const mainStatusRegex = /^(str|int|dex|agi|vit|luk|level):(\d+)&&(\d+===.+)/;
    const [, status, statusCondition, raw] = restCondition.match(mainStatusRegex) ?? [];
    if (status) {
      const isPass = this.model[status] >= Number(statusCondition);

      return { isValid: isPass, restCondition: raw };
    }

    // WEAPON_LEVEL
    const [toRemoveA, wLevel] = restCondition.match(/WEAPON_LEVEL\[(\d+)]/) ?? [];
    if (wLevel) {
      const wLv = Number(wLevel);
      const weaponLvl = (itemType || '').toLowerCase().startsWith('left') ? this.leftWeaponData?.data?.baseWeaponLevel : this.weaponData.data.baseWeaponLevel;
      const isValid = weaponLvl === wLv;
      if (!isValid) return { isValid, restCondition };

      restCondition = restCondition.replace(toRemoveA, '');
      if (restCondition.startsWith('===')) return { isValid, restCondition: restCondition.replace('===', '') };
    }

    // WEAPON_TYPE[bow]5
    const [toRemoveB, wType] = restCondition.match(/WEAPON_TYPE\[(\D+)]/) ?? [];
    if (wType) {
      const isValid = wType.split('||').includes(this.weaponData.data.typeName);
      if (!isValid) return { isValid, restCondition };

      restCondition = restCondition.replace(toRemoveB, '');
      if (restCondition.startsWith('===')) return { isValid, restCondition: restCondition.replace('===', '') };
    }

    if (restCondition.includes('GRADE')) {
      // GRADE[armor==A]===5
      // EQUIP[Time Dimensions Rune Crown (Abyss Chaser)]GRADE[weapon==A]GRADE[headUpper==A]REFINE[weapon,headUpper==1]---1
      for (let index = 0; index < 2; index++) {
        const [toRemoveGrade, conditionGrade] = restCondition.match(/GRADE\[(\D+?)]/) ?? [];
        if (!conditionGrade) break;

        const [rawitemType, targetGrade] = conditionGrade.split('==') ?? [];
        const tarGetitemType = rawitemType === 'me' ? itemType.replace(/Enchant\d/, '') : rawitemType;
        // console.log({ restCondition, itemType, tarGetitemType, rawitemType, targetGrade })
        const itemGrade = this.mapGrade.get(tarGetitemType as ItemTypeEnum);
        const isValid = this.isValidGrade(itemGrade, targetGrade);
        if (!isValid) return { isValid, restCondition };

        restCondition = restCondition.replace(toRemoveGrade, '');
        if (restCondition.startsWith('===')) return { isValid, restCondition: restCondition.replace('===', '') };

        if (!restCondition.includes('GRADE[')) break;
      }

      // EQUIP[Time Gap Kurojin (B)&&Time Dimensions Rune Crown (Shinkiro & Shiranui)]GRADES[weapon==A&&leftWeapon==A&&headUpper==A]===0.7
      const [toRemoveGrade, conditionGrades] = restCondition.match(/GRADES\[(\D+?)]/) ?? [];
      if (conditionGrades) {
        for (const conditionGrade of conditionGrades.split('&&')) {
          const [rawitemType, targetGrade] = conditionGrade.split('==') ?? [];
          const tarGetitemType = rawitemType === 'me' ? itemType.replace(/Enchant\d/, '') : rawitemType;
          // console.log({ restCondition, itemType, tarGetitemType, rawitemType, targetGrade })
          const itemGrade = this.mapGrade.get(tarGetitemType as ItemTypeEnum);
          const isValid = this.isValidGrade(itemGrade, targetGrade);
          if (!isValid) return { isValid, restCondition };
        }

        restCondition = restCondition.replace(toRemoveGrade, '');
        if (restCondition.startsWith('===')) return { isValid: true, restCondition: restCondition.replace('===', '') };
      }
    }

    // [weaponType=Pistol]20
    const [_, wSubTypeName] = restCondition.match(/^\[weaponType=(.+?)\]/) ?? [];
    if (wSubTypeName) {
      const subTypeName = this.weaponData?.data?.subTypeName;
      if (wSubTypeName !== subTypeName) return { isValid: false, restCondition };
      restCondition = restCondition.replace(`[weaponType=${wSubTypeName}]`, '');

      return { isValid: true, restCondition };
    }

    // SUM[str,luk==80]---6
    const [, toRemove3, statStr, sumCond] = restCondition.match(/(SUM\[(\D+)==(\d+)])[^-]/) ?? [];
    if (statStr && sumCond) {
      const totalStat = statStr.split(',').reduce((total, stat) => total + (this.model[stat] || 0), 0);
      const cond = Number(sumCond);
      if (totalStat < cond) return { isValid: false, restCondition };

      restCondition = restCondition.replace(toRemove3, '');
    }

    // USED[Mechanic]20
    const [toRemove, usedByClass] = restCondition.match(/USED\[(.+?)\]/) ?? [];
    if (usedByClass) {
      const cName = this._class.className.replace(' ', '');
      const isUsed = usedByClass.split('||').some((className) => className === cName || className === this._class.className || this._class.classNameSet.has(className));
      if (!isUsed) return { isValid: false, restCondition };

      restCondition = restCondition.replace(toRemove, '');
    }

    // LEARN_SKILL[Meow Meow==5]2
    const [_raw, toRemove_, learnCond] = restCondition.match(/(LEARN_SKILL\[(.+?)\]=?=?=?)-?\d+/) ?? [];
    if (learnCond) {
      const [skillName, skillLv] = learnCond.split('==');
      const isPass = this.learnedSkillMap.get(skillName) >= Number(skillLv);
      if (!isPass) return { isValid: false, restCondition };

      restCondition = restCondition.replace(toRemove_, '');
    }

    // LEARN_SKILL2[Illusion - Shadow==5]SUM[level==4]---2
    const [_raw2, toRemove2_, learnCond2] = restCondition.match(/(LEARN_SKILL2\[(.+?)\]=?=?=?)/) ?? [];
    if (learnCond2) {
      const [skillName, skillLv] = learnCond2.split('==');
      const isPass = this.learnedSkillMap.get(skillName) >= Number(skillLv);
      if (!isPass) return { isValid: false, restCondition };

      restCondition = restCondition.replace(toRemove2_, '');
    }

    // LEVEL[130]2---1
    // LEVEL[1-129]2---1
    const [toRemove2, lvCond] = restCondition.match(/LEVEL\[(.+?)\]/) ?? [];
    if (lvCond) {
      const [minLv, maxLv = 999] = lvCond.split('-').map(Number);
      const isPass = minLv <= this.model.level && this.model.level <= maxLv;
      if (!isPass) return { isValid: false, restCondition };

      restCondition = restCondition.replace(toRemove2, '');
    }

    // ACTIVE_SKILL[Platinum Altar]9===50(90 segundos)
    const [unused2, actSkillName] = restCondition.match(/ACTIVE_SKILL\[(.+)]/) ?? [];
    if (actSkillName) {
      // console.log({ script, unused2, actSkillName });
      const isUsed = this.isUsedSkill(actSkillName);

      if (!isUsed) return { isValid: false, restCondition };

      restCondition = restCondition.replace(unused2, '');
    }

    for (let i = 1; i <= 3; i++) {
      const [unused, itemType, refineCond] = restCondition.match(/XREFINEX\[(\D*?)=*=*(\d+)]/) ?? [];
      if (itemType) {
        const refine = this.mapRefine.get(itemType as ItemTypeEnum);
        if (refine >= Number(refineCond)) {
          restCondition = restCondition.replace(unused, '');
          continue;
        }

        return { isValid: false, restCondition };
      }

      break;
    }

    // POS[accRight]50
    const [unusedPos, position] = restCondition.match(/POS\[(\D+?)]/) ?? [];
    if (position) {
      if (position !== itemType) return { isValid: false, restCondition };
      restCondition = restCondition.replace(unusedPos, '');
      if (restCondition.startsWith('===')) return { isValid: true, restCondition };
    }

    // ITEM_LV[me==2]===8
    const [unusedItemLv, itemLvCondition] = restCondition.match(/ITEM_LV\[(.+?)]/) ?? [];
    if (itemLvCondition) {
      const [rawitemType, itemLv] = itemLvCondition.split('==');
      const targetItemType = rawitemType === 'me' ? itemType.replace(/Enchant\d|Card.*/, '') : rawitemType;
      const targetItem = this.equipItem.get(targetItemType as ItemTypeEnum);
      if (targetItem?.itemLevel !== Number(itemLv)) return { isValid: false, restCondition };
      restCondition = restCondition.replace(unusedItemLv, '');
      if (restCondition.startsWith('===')) return { isValid: true, restCondition };
    }

    // SPAWN[tur_d03_i||tur_d04_i]
    const [unusedSp, rawSpawn] = restCondition.match(/SPAWN\[(.+?)]/) ?? [];
    if (rawSpawn) {
      const spawns = rawSpawn.split('||');
      const monSpawns = this.monster.spawn.split(',');
      const isPass = spawns.some((sp) => monSpawns.includes(sp));
      // console.log({ rawSpawn, monSpawns, spawns, isPass, unusedSp });
      if (!isPass) return { isValid: false, restCondition };

      restCondition = restCondition.replace(unusedSp, '');
    }

    // EQUIP[Poenitentia Sol]POS_SPECIFIC[weapon==Poenitentia Sol]REFINE[weapon==2]---4
    const [unusedPos2, position2] = restCondition.match(/POS_SPECIFIC\[(\D+?)]/) ?? [];
    if (position2) {
      const [_position, _itemName] = position2.split('==');
      const itName = this.equipItem.get(_position as any)?.name;
      if (this.removeItemSlotName(itName || '') !== _itemName) return { isValid: false, restCondition };

      restCondition = restCondition.replace(unusedPos2, '');
      if (restCondition.startsWith('===')) return { isValid: true, restCondition };
    }

    // EQUIP[Bear's Power]===50
    const [setCondition, itemSet] = restCondition.match(/^EQUIP\[(.+?)]/) ?? [];
    if (itemSet) {
      const itemSets = itemSet.split('&&').filter(Boolean);
      // console.log({ itemRefine, itemSet, itemSets });
      const valid = itemSets.every((item) => {
        const res = item.split('||').some((_item) => this.isEquipItem(_item));

        return res;
      });
      if (!valid) return { isValid: false, restCondition };

      restCondition = restCondition.replace(setCondition, '');

      // REFINE[garment,armor==20]===10
      // REFINE[9]===25
      const [unused, refineCombo, refineCond] = restCondition.match(/^REFINE\[(\D*?)=*=*(\d+)]/) ?? [];
      if (refineCombo) {
        // console.log({ unused, refineCombo, restCondition });
        if (restCondition.includes(`${unused}---`)) {
          return { isValid: true, restCondition };
        }

        const totalRefine = refineCombo
          .split(',')
          .map((itemType) => this.mapRefine.get(itemType as ItemTypeEnum))
          .reduce((sum, cur) => sum + (cur || 0), 0);
        // console.log({ totalRefine, refineCond });
        if (totalRefine >= Number(refineCond)) {
          restCondition = restCondition.replace(unused, '');
          if (!restCondition.startsWith('===')) {
            return this.validateCondition({ itemType, itemRefine, script: restCondition });
          }
        } else {
          return { isValid: false, restCondition };
        }
      } else if (refineCond) {
        if (itemRefine >= Number(refineCond)) {
          restCondition = restCondition.replace(unused, '');
        } else {
          return {
            isValid: false,
            restCondition,
          };
        }
      }

      if (restCondition.startsWith('===')) {
        const replaced = restCondition.replace('===', '');
        if (Number.isNaN(Number(replaced))) {
          restCondition = restCondition.replace('0===', '');
        } else {
          restCondition = replaced;
        }
      }

      return { isValid: true, restCondition };
    }

    // REFINE[11]
    const [, unused, refineCond] = restCondition.match(/(REFINE\[(\d+)?])[^-]/) ?? [];
    // console.log({ restCondition, unused, refineCond })
    if (refineCond && itemRefine >= Number(refineCond)) {
      restCondition = restCondition.replace(unused, '');
      if (restCondition.startsWith('===')) {
        restCondition = restCondition.replace('===', '');
      }

      return {
        isValid: true,
        restCondition,
      };
    } else if (refineCond) {
      return { isValid: false, restCondition };
    }

    return {
      isValid: true,
      restCondition: restCondition,
    };
  }

  private updateBaseEquipStat(attr: string, lineScript: string | number) {
    const n = Number(lineScript);
    if (Number.isSafeInteger(n)) {
      this.baseEquipmentStat[attr] = n + (this.baseEquipmentStat[attr] || 0);
    }
  }

  private isAreadyCalcCombo(params: { item: ItemModel; attr: string; lineScript: string; }) {
    const { item, attr, lineScript } = params;
    if (lineScript.startsWith('EQUIP[')) {
      const comboFix = `${item.id}-${attr}-${lineScript}`;
      if (this.equipCombo.has(comboFix)) {
        return true;
      }

      this.equipCombo.add(comboFix);
    }

    return false;
  }

  private calcItemStatus(params: { itemType: ItemTypeEnum; itemRefine: number; item: ItemModel; }) {
    const { item, itemRefine, itemType } = params;
    const total: Record<string, number> = {};
    const chance = {} as Record<string, number>;
    const addChance = (attr: string, val: number) => {
      if (chance[attr]) {
        chance[attr] += val;
      } else {
        chance[attr] = val;
      }
    };

    // console.log({ itemRefine, script });
    for (const [attr, attrScripts] of Object.entries(item.script)) {
      if (attr.startsWith('autocast__')) {
        const skillName = attr.replace('autocast__', '');
        for (const lineScript of attrScripts) {
          const { isValid, restCondition } = this.validateCondition({ itemType, itemRefine, script: lineScript });
          if (!isValid) continue;

          const parts = restCondition.split(',');
          if (parts.length >= 3) {
            const level = Number(parts[0]);
            const chance = Number(parts[1]);
            const trigger = parts[2].trim() as AutocastTrigger;
            const useLearned = parts[3]?.trim() === 'learned';
            if (!Number.isNaN(level) && !Number.isNaN(chance)) {
              this.autocastEntries.push({
                skillName,
                skillLevel: level,
                chancePercent: chance,
                trigger,
                useLearned,
                sourceItemName: item.name,
              });
            }
          }
        }
        continue;
      }

      if (MainItemTypeSet.has(itemType)) {
        this.updateBaseEquipStat(attr, attrScripts[0]);
      }

      total[attr] = attrScripts.reduce((sum, lineScript) => {
        if (this.isAreadyCalcCombo({ item, attr, lineScript })) {
          return sum;
        }

        const { isValid, restCondition } = this.validateCondition({ itemType, itemRefine, script: lineScript });
        // console.log({ lineScript, restCondition, isValid });
        if (!isValid) return sum;

        if (restCondition.includes('===')) {
          return sum + this.calcConstantBonus(itemRefine, restCondition);
        }
        if (restCondition.includes('---')) {
          return sum + this.calcStepBonus(itemRefine, restCondition);
        }

        if (Number.isNaN(Number(restCondition))) {
          console.log('cannot turn to number', { lineScript, restCondition });

          return sum;
        }

        return sum + Number(restCondition);
      }, 0);

      if (attr.startsWith('chance__') && isNumber(total[attr]) && total[attr] !== 0) {
        const actualAttr = attr.replace('chance__', '');
        // console.log({ actualAttr, t: total[attr] });
        addChance(actualAttr, total[attr]);
      }
    }

    const chances = Object.keys(chance);
    if (Object.keys(chances).length > 0) {
      this._chanceList.push({
        name: item.name,
        label: `${item.name}`,
        label2: `[ ${chances.map((c) => `${c} ${c.startsWith('cd__') ? '-' : '+'}${chance[c]}`).join(', ')} ]`,
        bonus: chance,
      });
    }

    return total;
  }

  private removeItemSlotName(itemName: string) {
    return itemName.replace(/\[\d]$/, '').trim();
  }

  /**
   * Sometime it should get from base item
   * like card should get refine from it's own
   * @param itemType
   * @returns refine level
   */
  private getRefineLevelByItemType(itemType: ItemTypeEnum) {
    for (const _itemType of refinableItemTypes) {
      if (itemType.startsWith(_itemType)) {
        return this.mapRefine.get(_itemType);
      }
    }

    return 0;
  }

  private calcStatBoost(boostPercent: number, stat: 'agi' | 'dex'): number {
    const { agi, jobAgi, dex, jobDex } = this.model;
    let base = 0;
    if (stat === 'agi') {
      base = agi + jobAgi + (this.baseEquipmentStat['agi'] || 0);
    } else if (stat === 'dex') {
      base = dex + jobDex + (this.baseEquipmentStat['dex'] || 0);
    }

    return floor(base * (Number(boostPercent) / 100));
  }

  prepareAllItemBonus() {
    const baseMatk = Number(this.equipItem.get(ItemTypeEnum.weapon)?.script?.['matk']?.[0]) || 0;

    this.totalEquipStatus = { ...this.allStatus, matk: 0 - baseMatk, perfectHit: this.DEFAULT_PERFECT_HIT };
    this.equipStatus = {} as any;
    this.propertyBasicAtk = ElementType.Neutral;
    this.propertyWindmind = undefined;
    this._chanceList = [];
    this.equipCombo.clear();
    this.autocastEntries = [];

    const updateTotalStatus = (attr: keyof EquipmentSummaryModel, value: number) => {
      if (this.totalEquipStatus[attr]) {
        if (attr === 'fctPercent') {
          this.totalEquipStatus[attr] = Math.max(this.totalEquipStatus[attr], value);
        } else {
          this.totalEquipStatus[attr] += value;
        }
      } else {
        this.totalEquipStatus[attr] = value;
      }
    };

    this.equipStatus['extra'] = { ...this.allStatus };
    for (const scripts of this.extraOptions) {
      for (const [attr, value] of Object.entries(scripts)) {
        if (this.equipStatus['extra'][attr]) {
          this.equipStatus['extra'][attr] += value;
        } else {
          this.equipStatus['extra'][attr] = value;
        }

        updateTotalStatus(attr as any, value);
      }
    }

    this.baseEquipmentStat = {};
    this.finalMultipliers = [];
    this.finalPhyMultipliers = [];
    this.finalMagicMultipliers = [];
    for (const [itemType, itemData] of this.equipItem) {
      this.equipStatus[itemType] = { ...this.allStatus };
      if (!itemData) {
        continue;
      }

      if (itemType === ItemTypeEnum.ammo) {
        if (itemData.itemSubTypeId === ItemSubTypeId.Cannonball) {
          this.equipStatus[itemType].atk = 0;
          updateTotalStatus('cannonballAtk', itemData.attack);
          continue;
        }

        this.equipStatus[itemType].atk = itemData.attack;
      } else if (itemType === ItemTypeEnum.leftWeapon) {
        // this.equipStatus[itemType].atk = itemData.attack;
      } else if (itemType !== ItemTypeEnum.weapon && itemData.attack) {
        this.equipStatus[itemType].atk = itemData.attack;
        updateTotalStatus('atk', itemData.attack);
      }

      if (itemData.defense) {
        this.equipStatus[itemType].baseDef = itemData.defense;
        updateTotalStatus('def', itemData.defense);
      }

      // console.log({ itemType, itemData });
      const refine = this.getRefineLevelByItemType(itemType);
      if (MainItemTypeSet.has(itemType)) {
        this.equipStatus[itemType].refine = refine;
        this.equipStatus[itemType].weight = itemData.weight;
      }

      const calculatedItem = this.calcItemStatus({ itemType, itemRefine: refine, item: itemData });
      for (const [attr, value] of Object.entries(calculatedItem)) {
        if (attr === 'p_final') {
          this.finalPhyMultipliers.push(value);
        }
        if (attr === 'm_final') {
          this.finalMagicMultipliers.push(value);
        }

        this.equipStatus[itemType][attr] = value;

        updateTotalStatus(attr as any, value);
      }
    }

    for (const [skillName, scripts] of Object.entries(this.equipAtkSkillBonus)) {
      for (const [attr, value] of Object.entries(scripts)) {
        if (attr.startsWith('autocast__')) {
          const autocastSkillName = attr.replace('autocast__', '');
          const parts = String(value).split(',');
          if (parts.length >= 3) {
            this.autocastEntries.push({
              skillName: autocastSkillName,
              skillLevel: Number(parts[0]),
              chancePercent: Number(parts[1]),
              trigger: parts[2].trim() as AutocastTrigger,
              useLearned: parts[3]?.trim() === 'learned',
              sourceItemName: skillName,
            });
          }
          continue;
        }
        if (attr === 'propertyAtk') {
          this.propertyWindmind = value as any;
          continue;
        }

        let val = Number(value);
        if (attr === 'atk') val = 0;
        if (attr === 'final') {
          this.finalMultipliers.push(val);
          continue;
        }
        if (attr === 'p_final') {
          this.finalPhyMultipliers.push(val);
          continue;
        }

        this.equipStatus[skillName] = { ...this.allStatus, [attr]: val };

        updateTotalStatus(attr as any, val);

        this.updateBaseEquipStat(attr, val);
      }
    }
    for (const [skillName, scripts] of Object.entries(this.masteryAtkSkillBonus)) {
      for (const [attr, value] of Object.entries(scripts)) {
        if (attr === 'propertyAtk') {
          this.propertyWindmind = value as any;
          continue;
        }

        const val = Number(value);
        if (attr === 'atk') continue;
        if (attr === 'matk') continue;

        if (attr === 'p_final') {
          this.finalPhyMultipliers.push(val);
          continue;
        }

        this.equipStatus[skillName] = { ...this.allStatus, [attr]: val };

        updateTotalStatus(attr as any, val);

        this.updateBaseEquipStat(attr, val);
      }
    }

    for (const [buffName, scripts] of Object.entries(this.buffEquipAtkBonus)) {
      for (const [attr, value] of Object.entries(scripts)) {
        if (attr.startsWith('autocast__')) {
          const skillName = attr.replace('autocast__', '');
          const parts = String(value).split(',');
          if (parts.length >= 3) {
            this.autocastEntries.push({
              skillName,
              skillLevel: Number(parts[0]),
              chancePercent: Number(parts[1]),
              trigger: parts[2].trim() as AutocastTrigger,
              useLearned: parts[3]?.trim() === 'learned',
              sourceItemName: buffName,
            });
          }
          continue;
        }
        const val = Number(value);
        // if (attr === 'atk' || attr === 'matk') val = 0;

        this.equipStatus[buffName] = { ...this.allStatus, [attr]: val };

        updateTotalStatus(attr as any, value);
      }
    }
    for (const [buffName, scripts] of Object.entries(this.buffMasteryAtkBonus)) {
      for (const [attr, value] of Object.entries(scripts)) {
        const val = Number(value);
        if (attr === 'atk' || attr === 'matk') continue;

        this.equipStatus[buffName] = { ...this.allStatus, [attr]: val };

        updateTotalStatus(attr as any, value);
      }
    }

    const consumableBonus: Record<string, number> = {};
    for (const cons of this.consumableBonuses) {
      for (const [attr, value] of Object.entries(cons)) {
        const valNum = Number(value);
        if (mainStatuses.includes(attr as any) && consumableBonus[attr]) {
          consumableBonus[attr] = Math.max(consumableBonus[attr], valNum);
          continue;
        }

        if (consumableBonus[attr]) {
          consumableBonus[attr] += valNum;
        } else {
          consumableBonus[attr] = valNum;
        }
      }
    }
    const consumAllStat = consumableBonus['allStatus'] || 0;
    for (const [attr, value] of Object.entries(consumableBonus)) {
      let newVal = value;
      // stat +20 can stack with other
      if (mainStatuses.includes(attr as any) && newVal !== 20) {
        newVal = Math.max(value - consumAllStat, 0);
      }

      updateTotalStatus(attr as any, newVal);
    }

    const allStatus = this.totalEquipStatus.allStatus ?? 0;
    for (const status of mainStatuses) {
      updateTotalStatus(status as any, allStatus);
    }

    const allTrait = this.totalEquipStatus.allTrait ?? 0;
    for (const status of traitStatuses) {
      updateTotalStatus(status as any, allTrait);
    }

    if (this.totalEquipStatus['agiBoost'] > 0) {
      const boost = this.totalEquipStatus['agiBoost'];
      this.totalEquipStatus.agi += this.calcStatBoost(Number(boost), 'agi');
    }
    if (this.totalEquipStatus['dexBoost'] > 0) {
      const boost = this.totalEquipStatus['dexBoost'];
      this.totalEquipStatus.dex += this.calcStatBoost(Number(boost), 'dex');
    }

    if (this.weaponData.data.typeName === 'bow') {
      this.totalEquipStatus.range += this.totalEquipStatus.bowRange || 0;
    }

    this._class.setAdditionalBonus(this.additionalBonusInput);

    // fix floating point
    for (const [attr, val] of Object.entries(this.totalEquipStatus)) {
      if (isNumber(val) && val !== 0) {
        this.totalEquipStatus[attr] = round(val, 2);
        if (val !== this.totalEquipStatus[attr]) {
          console.log({ attr, val, newVal: this.totalEquipStatus[attr] });
        }
      }
    }

    return this;
  }

  calculateAllDamages(skillValue: string) {
    const { basicDmg, misc, skillDmg, skillAspd, basicAspd } = this.dmgCalculator
      .setExtraBonus([])
      .setPrecastRepeats(this.model.precastRepeats || {})
      .calculateAllDamages({ skillValue, propertyAtk: this.propertyBasicAtk, maxHp: this.maxHp, maxSp: this.maxSp });

    this.damageSummary = {
      ...basicDmg,
      ...(skillDmg || {}),
    };

    this.skillFrequency = skillAspd || ({} as any);
    this.miscSummary = misc;
    this.basicAspd = basicAspd;

    if (this.selectedChanceList.length > 0) {
      this.recalcExtraBonus(skillValue);
    }

    this.calculateAutocastDamages();

    return this;
  }

  private calculateAutocastDamages() {
    this.autocastSummaries = [];
    this.autocastTotalDps = 0;

    if (this.autocastEntries.length === 0) return;

    const merged = new Map<string, AutocastEntry>();
    for (const entry of this.autocastEntries) {
      const key = `${entry.skillName}__${entry.trigger}`;
      const existing = merged.get(key);
      if (existing) {
        existing.chancePercent = Math.min(100, existing.chancePercent + entry.chancePercent);
        if (entry.skillLevel > existing.skillLevel) {
          existing.skillLevel = entry.skillLevel;
        }
        existing.sourceItemName += `, ${entry.sourceItemName}`;
      } else {
        merged.set(key, { ...entry });
      }
    }

    const hitsPerSec = this.basicAspd.hitsPerSec;

    for (const entry of merged.values()) {
      const skillDef = AUTOCAST_SKILL_REGISTRY[entry.skillName];
      if (!skillDef) continue;

      let finalLevel = entry.skillLevel;
      if (entry.useLearned) {
        const learnedLevel = this.learnedSkillMap.get(entry.skillName) || 0;
        const offensiveLevel = entry.skillName === this.skillName ? this.offensiveSkillLevel : 0;
        finalLevel = Math.max(finalLevel, learnedLevel, offensiveLevel);
      }

      const skillValue = `${entry.skillName}==${finalLevel}`;
      const tempSkillData: AtkSkillModel = {
        label: `${entry.skillName} Lv${finalLevel}`,
        name: entry.skillName as any,
        value: skillValue,
        acd: 0,
        fct: 0,
        vct: 0,
        cd: 0,
        hit: skillDef.hit,
        totalHit: skillDef.totalHit,
        isMatk: skillDef.isMatk,
        isMelee: skillDef.isMelee,
        element: skillDef.element,
        isHit100: true,
        autoSpellChance: entry.chancePercent / 100,
        formula: () => skillDef.formula({ skillLevel: finalLevel, baseLevel: this.model.level || 1, str: this.model.str || 0, int: this.model.int || 0, agi: this.model.agi || 0 }),
      };

      const result = this.dmgCalculator
        .setExtraBonus([])
        .calculateAllDamages({
          skillValue,
          propertyAtk: skillDef.element,
          maxHp: this.maxHp,
          maxSp: this.maxSp,
          overrideSkillData: tempSkillData,
        });

      if (!result.skillDmg) continue;

      const { skillMinDamage, skillMaxDamage } = result.skillDmg;
      const avgDamage = floor((skillMinDamage + skillMaxDamage) / 2);
      const totalHit = skillDef.totalHit;

      let procsPerSec = 0;
      if (entry.trigger === 'onhit') {
        procsPerSec = hitsPerSec * (entry.chancePercent / 100);
      } else if (entry.trigger === 'onskill') {
        procsPerSec = (this.skillFrequency.totalHitPerSec || hitsPerSec) * (entry.chancePercent / 100);
      } else if (entry.trigger === 'onhurt') {
        procsPerSec = 1 * (entry.chancePercent / 100);
      }

      const dps = floor(avgDamage * totalHit * procsPerSec);

      this.autocastSummaries.push({
        skillName: entry.skillName,
        skillLevel: finalLevel,
        chancePercent: entry.chancePercent,
        trigger: entry.trigger,
        sourceItemName: entry.sourceItemName,
        minDamage: skillMinDamage,
        maxDamage: skillMaxDamage,
        avgDamage,
        dps,
        isMatk: skillDef.isMatk,
        element: skillDef.element,
      });

      this.autocastTotalDps += dps;
    }
  }

  setHpSpTable(hpSpTable: HpSpTable) {
    this.hpSpCalculator.setHpSpTable(hpSpTable);

    return this;
  }

  calculateHpSp(params: { isUseHpL: boolean; }) {
    const { maxHp, maxSp } = this.hpSpCalculator
      .setClass(this._class)
      .setAllInfo(this.dmgCalculator.infoForClass)
      .setBonusFlag(params)
      .calculate()
      .getTotalSummary();

    this.maxHp = maxHp;
    this.maxSp = maxSp;

    return this;
  }

  recalcExtraBonus(skillValue: string) {
    const c = this.getChanceBonus();
    if (c.length === 0) {
      this.selectedChanceList = [];
      return this;
    }

    const calc = this.dmgCalculator.setExtraBonus(c);
    const { maxHp, maxSp } = this.hpSpCalculator.setAllInfo(calc.infoForClass)
      .calculate()
      .getTotalSummary();

    const { basicDmg, skillDmg, basicAspd, skillAspd } = calc
      .setPrecastRepeats(this.model.precastRepeats || {})
      .calculateAllDamages({ skillValue, propertyAtk: this.propertyBasicAtk, maxHp, maxSp });
    // console.log(skillDmg);

    this.damageSummary = {
      ...this.damageSummary,
      effectedBasicDamageMin: basicDmg.basicMinDamage,
      effectedBasicDamageMax: basicDmg.basicMaxDamage,
      effectedBasicCriDamageMin: basicDmg.criMinDamage,
      effectedBasicCriDamageMax: basicDmg.criMaxDamage,
      effectedBasicDps: basicDmg.basicDps,
      effectedBasicHitsPerSec: basicAspd.hitsPerSec,

      effectedSkillDamageMin: skillDmg?.skillMinDamage || 0,
      effectedSkillDamageMax: skillDmg?.skillMaxDamage || 0,
      effectedSkillDps: skillDmg?.skillDps || 0,
      effectedSkillHitsPerSec: skillAspd?.totalHitPerSec || 0,
    };

    return this;
  }

  calcDmgWithExtraBonus(params: { skillValue: string; isUseHpL: boolean; }): BasicDamageSummaryModel & SkillDamageSummaryModel {
    this.calcAllAtk();

    const c = this.getChanceBonus();
    const calculator = this.dmgCalculator.setExtraBonus(c);
    const { maxHp, maxSp } = this.hpSpCalculator
      .setClass(this._class)
      .setAllInfo(calculator.infoForClass)
      .setBonusFlag(params)
      .calculate()
      .getTotalSummary();

    const { skillValue } = params;
    const { basicDmg, skillDmg } = calculator.calculateAllDamages({
      skillValue,
      propertyAtk: this.propertyBasicAtk,
      maxHp,
      maxSp,
    });

    return {
      ...basicDmg,
      ...skillDmg,
    };
  }

  private getObjSummary(obj: EquipmentSummaryModel, isRemoveFields = false) {
    const summary = {};
    const removableFiels = new Set(['weight', 'baseDef', 'refine']);
    for (const [key, value] of Object.entries(obj)) {
      if (isRemoveFields && removableFiels.has(key)) continue;

      if (value !== 0 && value != null) {
        summary[key] = value;
      }
    }

    return summary;
  }

  calcAllDefs() {
    const { level } = this.model;
    const { def = 0, defPercent = 0, softDef = 0, softDefPercent = 0, res = 0, mres = 0 } = this.totalEquipStatus;
    const { totalVit, totalAgi, totalSta, totalWis } = this.dmgCalculator.status;

    const rawSoftDef = floor(totalVit / 2 + totalAgi / 5 + level / 2);
    this.softDef = floor((rawSoftDef + softDef) * this.toPercent(100 + softDefPercent));

    const bonus = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5];
    const calcDefByRefine = (refine: number) => {
      return bonus.filter((_, i) => i + 1 <= refine).reduce((sum, val) => sum + val, 0);
    };
    const { headUpperRefine, armorRefine, shieldRefine, garmentRefine, bootRefine } = this.model;

    const { headUpper, armor, shield, garment, boot } = this.model;
    const { additionalDef, bonusRes } = [
      [headUpper, headUpperRefine],
      [armor, armorRefine],
      [shield, shieldRefine],
      [garment, garmentRefine],
      [boot, bootRefine],
    ]
      .filter(([id]) => this.getItem(id)?.itemLevel === 2)
      .reduce(
        ({ additionalDef, bonusRes }, [_, refine]) => {
          return {
            additionalDef: additionalDef + round(calcDefByRefine(refine) * 0.2, 0),
            bonusRes: bonusRes + refine * 2,
          };
        },
        { additionalDef: 0, bonusRes: 0 },
      );

    const refines = [headUpperRefine, armorRefine, shieldRefine, garmentRefine, bootRefine].filter((a) => Number(a) > 0);
    const bonusDefByRefine = refines.reduce((sum, refine) => sum + calcDefByRefine(refine), 0);
    this.def = floor((def + bonusDefByRefine) * this.toPercent(100 + defPercent)) + additionalDef;

    const { totalDex, totalInt } = this.dmgCalculator.status;
    const { mdef = 0, mdefPercent = 0, softMdef = 0, softMdefPercent = 0 } = this.totalEquipStatus;
    const rawSoftMdef = floor(totalInt + totalVit / 5 + totalDex / 5 + level / 4);
    this.softMdef = floor((rawSoftMdef + softMdef) * this.toPercent(100 + softMdefPercent));
    this.mdef = floor(mdef * this.toPercent(100 + mdefPercent));

    this.res = res + totalSta + floor(totalSta / 3) * 5 + bonusRes;
    this.mres = mres + totalWis + floor(totalWis / 3) * 5 + bonusRes;

    return this;
  }

  getMonsterSummary() {
    return {
      monster: { ...this.monster.data }
    };
  }

  getTotalSummary() {
    const { baseWeaponAtk = 0, refineBonus = 0 } = this.leftWeaponData?.data || {};
    const { totalBuffAtk, totalEquipAtk, totalHideMasteryAtk, totalMasteryAtk, totalStatusAtk, totalStatusMatk } = this.dmgCalculator.atkSummaryForUI;
    const leftWeaponAtk = baseWeaponAtk + refineBonus;

    return {
      ...this.getObjSummary(this.totalEquipStatus),
      monster: { ...this.monster.data },
      propertyAtk: this.propertyBasicAtk,
      weapon: this.weaponData.data,
      calcSkill: {
        dmgType: this.damageSummary.dmgType,
        baseSkillDamage: this.damageSummary.baseSkillDamage,
        dps: this.damageSummary.skillDps,
        totalHits: this.damageSummary.skillTotalHit,
        propertySkill: this.damageSummary.skillPropertyAtk,
        accuracy: this.damageSummary.skillAccuracy,
        totalPene: this.damageSummary.skillTotalPene,
        ...this.skillFrequency,
      },
      calc: {
        // display on stat summary
        maxHp: this.maxHp,
        maxSp: this.maxSp,
        dex2int1: this.skillFrequency.sumDex2Int1 || 0,
        to530: 530 - (this.skillFrequency.sumDex2Int1 || 0),
        def: this.def,
        softDef: this.softDef,
        mdef: this.mdef,
        softMdef: this.softMdef,
        res: this.res,
        mres: this.mres,
        totalAspd: this.basicAspd.totalAspd,
        hitPerSecs: this.basicAspd.hitsPerSec,
        totalCri: this.damageSummary.basicCriRate,
        ...this.miscSummary,
        hitRate: this.miscSummary.accuracy,
        dps: this.damageSummary.basicDps,
        leftWeaponRefineBonus: refineBonus,

        totalStatusAtk: totalStatusAtk,
        totalEquipAtk: totalEquipAtk + leftWeaponAtk,
        ammuAtk: this.equipStatus.ammo?.atk || 0,
        totalMasteryAtk: totalMasteryAtk,
        totalHideMasteryAtk: totalHideMasteryAtk,
        totalBuffAtk: totalBuffAtk,

        totalStatusMatk: totalStatusMatk,
      },
      dmg: {
        ...this.damageSummary,
      },
      autocast: {
        entries: this.autocastSummaries,
        totalDps: this.autocastTotalDps,
        combinedBasicDps: (this.damageSummary.basicDps || 0) + this.autocastTotalDps,
      },
      equipments: [...this.equipItemNameSet.keys()],
    };
  }

  getItemSummary() {
    const obj = {};
    for (const [itemType, itemData] of this.equipItem) {
      if (!itemData || !itemType) continue;

      obj[itemType] = this.getObjSummary(this.equipStatus[itemType], true);
    }

    return {
      ...obj,
      ...this.equipAtkSkillBonus,
      ...this.masteryAtkSkillBonus,
      ...{ extra: this.getObjSummary(this.equipStatus['extra']) },
      consumableBonuses: this.consumableBonuses,
    };
  }

  getModelSummary() {
    return this.getObjSummary(this.model as any);
  }

  getPossiblyDamages() {
    return this.possiblyDamages;
  }

  getAtkBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const atkSummary = this.dmgCalculator.atkSummaryForUI;
    const { totalStr, totalDex, totalLuk, totalPow } = this.dmgCalculator.status;
    const baseLvl = this.model.level;
    const isRange = this.weaponData?.data?.rangeType === 'range';
    const [primaryStat, primaryLabel, secondaryStat, secondaryLabel] = isRange
      ? [totalDex, 'DEX', totalStr, 'STR']
      : [totalStr, 'STR', totalDex, 'DEX'];

    // 1. Status ATK
    const statusEntries: BreakdownEntry[] = [
      { source: `Level / 4`, value: floor(baseLvl / 4), color: 'white' },
      { source: primaryLabel, value: primaryStat, color: 'white' },
      { source: `${secondaryLabel} / 5`, value: floor(secondaryStat / 5), color: 'white' },
      { source: 'LUK / 3', value: floor(totalLuk / 3), color: 'white' },
    ];
    if (totalPow > 0) {
      statusEntries.push({ source: 'POW × 5', value: totalPow * 5, color: 'white' });
    }
    const formulaStr = totalPow > 0
      ? `floor(${baseLvl}/4 + ${secondaryStat}/5 + ${primaryStat} + ${totalLuk}/3) + ${totalPow}×5`
      : `floor(${baseLvl}/4 + ${secondaryStat}/5 + ${primaryStat} + ${totalLuk}/3)`;

    sections.push({
      label: 'Status ATK',
      entries: statusEntries,
      formula: formulaStr,
      subtotal: atkSummary.totalStatusAtk,
    });

    // 2. Weapon ATK
    const weaponData = this.weaponData?.data;
    const baseWeaponAtk = weaponData?.baseWeaponAtk || 0;
    const refineBonus = weaponData?.refineBonus || 0;
    const highUpgradeBonus = weaponData?.highUpgradeBonus || 0;
    const weaponEntries: BreakdownEntry[] = [];

    if (baseWeaponAtk > 0) {
      const weaponName = this.equipItem.get('weapon' as any)?.name || 'Arma';
      weaponEntries.push({ source: weaponName, value: baseWeaponAtk, color: 'white' });
    }
    if (refineBonus > 0) {
      weaponEntries.push({ source: `Refine +${this.model.weaponRefine || 0}`, value: refineBonus, color: 'white' });
    }
    if (highUpgradeBonus > 0) {
      weaponEntries.push({ source: 'High Upgrade Bonus', value: highUpgradeBonus, color: 'white' });
    }
    const weaponTotal = baseWeaponAtk + refineBonus + highUpgradeBonus;

    sections.push({
      label: 'Weapon ATK',
      entries: weaponEntries,
      subtotal: weaponTotal,
      emptyMessage: 'Nenhuma arma equipada',
    });

    // 3. Mastery ATK
    const masteryEntries: BreakdownEntry[] = [];
    if (atkSummary.skillAtkMastery > 0) {
      masteryEntries.push({ source: 'Skill Mastery', value: atkSummary.skillAtkMastery });
    }
    if (atkSummary.buffAtk > 0) {
      masteryEntries.push({ source: 'Buff ATK', value: atkSummary.buffAtk });
    }
    if (atkSummary.uiMastery > 0) {
      masteryEntries.push({ source: 'UI Mastery', value: atkSummary.uiMastery });
    }
    if (atkSummary.hiddenMastery > 0) {
      masteryEntries.push({ source: 'Hidden Mastery', value: atkSummary.hiddenMastery });
    }
    const masteryTotal = atkSummary.totalMasteryAtk + atkSummary.totalHideMasteryAtk;

    sections.push({
      label: 'Mastery ATK',
      entries: masteryEntries,
      subtotal: masteryTotal,
      emptyMessage: 'Nenhum mastery ativo',
    });

    // 4. Equipment ATK
    const itemSummaryFull = this.getItemSummary();
    const equipEntries: BreakdownEntry[] = [];

    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const atkVal = (stats as any)?.atk;
      if (atkVal && atkVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        const source = itemData?.name || slotLabel;
        equipEntries.push({
          source,
          slot: slotLabel,
          value: atkVal,
        });
      }
    }

    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);

    sections.push({
      label: 'Equipamentos ATK',
      entries: equipEntries,
      subtotal: equipTotal,
      emptyMessage: 'Nenhum equipamento com ATK',
    });

    // Total
    const statusAtk = atkSummary.totalStatusAtk;
    const otherAtk = weaponTotal + masteryTotal + equipTotal;

    return {
      title: 'ATK Breakdown',
      sections,
      totalLabel: 'ATK',
      totalValue: `${statusAtk} + ${otherAtk}`,
    };
  }

  getMatkBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const atkSummary = this.dmgCalculator.atkSummaryForUI;
    const { totalInt, totalDex, totalLuk, totalSpl } = this.dmgCalculator.status;
    const baseLvl = this.model.level;

    // 1. Status MATK
    const statusEntries: BreakdownEntry[] = [
      { source: 'Level / 4', value: floor(baseLvl / 4), color: 'white' },
      { source: 'INT', value: totalInt, color: 'white' },
      { source: 'INT / 2', value: floor(totalInt / 2), color: 'white' },
      { source: 'DEX / 5', value: floor(totalDex / 5), color: 'white' },
      { source: 'LUK / 3', value: floor(totalLuk / 3), color: 'white' },
    ];
    if (totalSpl > 0) {
      statusEntries.push({ source: 'SPL × 5', value: totalSpl * 5, color: 'white' });
    }
    const formulaStr = totalSpl > 0
      ? `floor(${baseLvl}/4 + ${totalInt} + ${totalInt}/2 + ${totalDex}/5 + ${totalLuk}/3) + ${totalSpl}×5`
      : `floor(${baseLvl}/4 + ${totalInt} + ${totalInt}/2 + ${totalDex}/5 + ${totalLuk}/3)`;

    sections.push({
      label: 'Status MATK',
      entries: statusEntries,
      formula: formulaStr,
      subtotal: atkSummary.totalStatusMatk,
    });

    // 2. Weapon MATK
    const weaponData = this.weaponData?.data;
    const baseWeaponMatk = weaponData?.baseWeaponMatk || 0;
    const refineBonus = weaponData?.refineBonus || 0;
    const highUpgradeBonus = weaponData?.highUpgradeBonus || 0;
    const weaponEntries: BreakdownEntry[] = [];

    if (baseWeaponMatk > 0) {
      const weaponName = this.equipItem.get('weapon' as any)?.name || 'Arma';
      weaponEntries.push({ source: weaponName, value: baseWeaponMatk, color: 'white' });
    }
    if (refineBonus > 0) {
      weaponEntries.push({ source: `Refine +${this.model.weaponRefine || 0}`, value: refineBonus, color: 'white' });
    }
    if (highUpgradeBonus > 0) {
      weaponEntries.push({ source: 'High Upgrade Bonus', value: highUpgradeBonus, color: 'white' });
    }

    // Left weapon refine bonus
    const leftRefineBonus = this.leftWeaponData?.data?.refineBonus || 0;
    if (leftRefineBonus > 0) {
      const leftWeaponName = this.equipItem.get('leftWeapon' as any)?.name || 'Arma Esquerda';
      weaponEntries.push({ source: `${leftWeaponName} Refine`, value: leftRefineBonus, color: 'white' });
    }

    const weaponTotal = baseWeaponMatk + refineBonus + highUpgradeBonus + leftRefineBonus;

    sections.push({
      label: 'Weapon MATK',
      entries: weaponEntries,
      subtotal: weaponTotal,
      emptyMessage: 'Nenhuma arma equipada',
    });

    // 3. Equipment MATK
    const itemSummaryFull = this.getItemSummary();
    const equipEntries: BreakdownEntry[] = [];

    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const matkVal = (stats as any)?.matk;
      if (matkVal && matkVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        const source = itemData?.name || slotLabel;
        equipEntries.push({
          source,
          slot: slotLabel,
          value: matkVal,
        });
      }
    }

    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);

    sections.push({
      label: 'Equipamentos MATK',
      entries: equipEntries,
      subtotal: equipTotal,
      emptyMessage: 'Nenhum equipamento com MATK',
    });

    // Total
    const statusMatk = atkSummary.totalStatusMatk;
    const otherMatk = weaponTotal + equipTotal;

    return {
      title: 'MATK Breakdown',
      sections,
      totalLabel: 'MATK',
      totalValue: `${statusMatk} + ${otherMatk}`,
    };
  }

  getDefBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const { level } = this.model;
    const { totalVit, totalAgi } = this.dmgCalculator.status;
    const { softDef: equipSoftDef = 0, softDefPercent = 0, def: equipDef = 0, defPercent = 0 } = this.totalEquipStatus;
    const itemSummaryFull = this.getItemSummary();

    // 1. Soft DEF
    const softDefEntries: BreakdownEntry[] = [
      { source: 'VIT / 2', value: floor(totalVit / 2), color: 'white' },
      { source: 'AGI / 5', value: floor(totalAgi / 5), color: 'white' },
      { source: 'Level / 2', value: floor(level / 2), color: 'white' },
    ];

    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const sdVal = (stats as any)?.softDef;
      if (sdVal && sdVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        softDefEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: sdVal });
      }
    }

    if (softDefPercent !== 0) {
      softDefEntries.push({ source: 'Soft DEF %', value: softDefPercent, detail: '%' });
    }

    const rawSoftDef = floor(totalVit / 2 + totalAgi / 5 + level / 2);
    const formulaSoftDef = softDefPercent !== 0
      ? `floor((${rawSoftDef} + ${equipSoftDef}) × ${100 + softDefPercent}/100)`
      : `floor(${totalVit}/2 + ${totalAgi}/5 + ${level}/2) + equipSoftDef`;

    sections.push({
      label: 'Soft DEF',
      entries: softDefEntries,
      formula: formulaSoftDef,
      subtotal: this.softDef,
    });

    // 2. Hard DEF (Equipment)
    const hardDefEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const defVal = (stats as any)?.def;
      if (defVal && defVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        hardDefEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: defVal });
      }
    }
    hardDefEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const hardDefEquipTotal = hardDefEntries.reduce((sum, e) => sum + (e.value as number), 0);

    sections.push({
      label: 'Hard DEF (Equip)',
      entries: hardDefEntries,
      subtotal: hardDefEquipTotal,
      emptyMessage: 'Nenhum equipamento com DEF',
    });

    // 3. Refine DEF Bonus
    const bonus = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5];
    const calcDefByRefine = (refine: number) => bonus.filter((_, i) => i + 1 <= refine).reduce((sum, val) => sum + val, 0);

    const { headUpperRefine, armorRefine, shieldRefine, garmentRefine, bootRefine } = this.model;
    const refineSlots: [string, number, string][] = [
      ['headUpper', headUpperRefine, 'Topo'],
      ['armor', armorRefine, 'Armadura'],
      ['shield', shieldRefine, 'Escudo'],
      ['garment', garmentRefine, 'Manto'],
      ['boot', bootRefine, 'Sapato'],
    ];

    const refineEntries: BreakdownEntry[] = [];
    let bonusDefByRefine = 0;
    for (const [slotKey, refine, slotLabel] of refineSlots) {
      if (Number(refine) > 0) {
        const defByRefine = calcDefByRefine(Number(refine));
        bonusDefByRefine += defByRefine;
        const itemData = this.equipItem.get(slotKey as any);
        refineEntries.push({
          source: itemData?.name || slotLabel,
          slot: slotLabel,
          value: defByRefine,
          detail: `+${refine}`,
        });
      }
    }

    sections.push({
      label: 'Refine DEF Bonus',
      entries: refineEntries,
      subtotal: bonusDefByRefine,
      emptyMessage: 'Nenhum refine',
    });

    // 4. Item Level 2 Bonus
    const { headUpper, armor, shield, garment, boot } = this.model;
    const lv2Slots: [number, number, string, string][] = [
      [headUpper, headUpperRefine, 'headUpper', 'Topo'],
      [armor, armorRefine, 'armor', 'Armadura'],
      [shield, shieldRefine, 'shield', 'Escudo'],
      [garment, garmentRefine, 'garment', 'Manto'],
      [boot, bootRefine, 'boot', 'Sapato'],
    ];

    const lv2Entries: BreakdownEntry[] = [];
    let additionalDef = 0;
    for (const [itemId, refine, slotKey, slotLabel] of lv2Slots) {
      if (this.getItem(itemId)?.itemLevel === 2) {
        const bonus = round(calcDefByRefine(Number(refine)) * 0.2, 0);
        additionalDef += bonus;
        const itemData = this.equipItem.get(slotKey as any);
        lv2Entries.push({
          source: itemData?.name || slotLabel,
          slot: slotLabel,
          value: bonus,
          detail: 'Lv2',
        });
      }
    }

    if (additionalDef > 0) {
      sections.push({
        label: 'Item Level 2 Bonus',
        entries: lv2Entries,
        subtotal: additionalDef,
      });
    }

    // 5. DEF %
    if (defPercent !== 0) {
      sections.push({
        label: 'DEF %',
        entries: [{ source: 'DEF %', value: defPercent, detail: '%' }],
        formula: `floor((${hardDefEquipTotal} + ${bonusDefByRefine}) × ${100 + defPercent}/100) + ${additionalDef}`,
        subtotal: this.def,
      });
    }

    return {
      title: 'DEF Breakdown',
      sections,
      totalLabel: 'DEF',
      totalValue: `${this.softDef} + ${this.def}`,
    };
  }

  getMdefBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const { level } = this.model;
    const { totalInt, totalVit, totalDex } = this.dmgCalculator.status;
    const { softMdef: equipSoftMdef = 0, softMdefPercent = 0, mdef: equipMdef = 0, mdefPercent = 0 } = this.totalEquipStatus;
    const itemSummaryFull = this.getItemSummary();

    // 1. Soft MDEF
    const softMdefEntries: BreakdownEntry[] = [
      { source: 'INT', value: totalInt, color: 'white' },
      { source: 'VIT / 5', value: floor(totalVit / 5), color: 'white' },
      { source: 'DEX / 5', value: floor(totalDex / 5), color: 'white' },
      { source: 'Level / 4', value: floor(level / 4), color: 'white' },
    ];

    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const smVal = (stats as any)?.softMdef;
      if (smVal && smVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        softMdefEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: smVal });
      }
    }

    if (softMdefPercent !== 0) {
      softMdefEntries.push({ source: 'Soft MDEF %', value: softMdefPercent, detail: '%' });
    }

    const rawSoftMdef = floor(totalInt + totalVit / 5 + totalDex / 5 + level / 4);
    const formulaSoftMdef = softMdefPercent !== 0
      ? `floor((${rawSoftMdef} + ${equipSoftMdef}) × ${100 + softMdefPercent}/100)`
      : `floor(${totalInt} + ${totalVit}/5 + ${totalDex}/5 + ${level}/4) + equipSoftMdef`;

    sections.push({
      label: 'Soft MDEF',
      entries: softMdefEntries,
      formula: formulaSoftMdef,
      subtotal: this.softMdef,
    });

    // 2. Hard MDEF (Equipment)
    const hardMdefEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const mdefVal = (stats as any)?.mdef;
      if (mdefVal && mdefVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        hardMdefEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: mdefVal });
      }
    }
    hardMdefEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const hardMdefTotal = hardMdefEntries.reduce((sum, e) => sum + (e.value as number), 0);

    if (mdefPercent !== 0) {
      hardMdefEntries.push({ source: 'MDEF %', value: mdefPercent, detail: '%' });
    }

    sections.push({
      label: 'Hard MDEF (Equip)',
      entries: hardMdefEntries,
      subtotal: this.mdef,
      emptyMessage: 'Nenhum equipamento com MDEF',
    });

    return {
      title: 'MDEF Breakdown',
      sections,
      totalLabel: 'MDEF',
      totalValue: `${this.softMdef} + ${this.mdef}`,
    };
  }

  getCriBreakdown(context: BreakdownContext, damageSummary: any): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();

    // 1. Collect equip cri entries from equipStatus
    const equipEntries: BreakdownEntry[] = [];

    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const criVal = (stats as any)?.cri;
      if (criVal && criVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        const source = itemData?.name || slotLabel;
        equipEntries.push({
          source,
          slot: slotLabel,
          value: criVal,
        });
      }
    }

    // Add class additional bonus cri (e.g., Two Hand Quicken)
    const additionalCri = (this.totalEquipStatus.cri || 0) - equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    if (additionalCri > 0) {
      equipEntries.push({
        source: 'Skill/Class Bonus',
        slot: 'Skill',
        value: additionalCri,
      });
    }

    // Sort by value descending
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));

    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);

    sections.push({
      label: 'Equipamentos',
      entries: equipEntries,
      subtotal: equipTotal,
      emptyMessage: 'Nenhum equipamento com CRI',
    });

    // 2. LUK breakdown
    const { luk, jobLuk } = this.model;
    const equipLukDirect = this.totalEquipStatus.luk ?? 0;
    const allStatusVal = this.totalEquipStatus.allStatus ?? 0;
    const totalLuk = luk + (jobLuk ?? 0) + equipLukDirect;

    const lukEntries: BreakdownEntry[] = [];

    lukEntries.push({ source: 'Base LUK', value: luk, color: 'white' });

    // Per-item luk and allStatus entries
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const s = stats as any;
      const slotLabelForLuk = Calculator.SLOT_LABELS[slot] || slot;
      if (s?.allStatus && s.allStatus !== 0) {
        const itemData = this.equipItem.get(slot as any);
        lukEntries.push({
          source: itemData?.name || slotLabelForLuk,
          value: s.allStatus,
          detail: 'allStatus',
        });
      }
      if (s?.luk && s.luk !== 0) {
        const itemData = this.equipItem.get(slot as any);
        lukEntries.push({
          source: itemData?.name || slotLabelForLuk,
          value: s.luk,
        });
      }
    }

    if (jobLuk && jobLuk !== 0) {
      lukEntries.push({ source: 'Job Bonus', value: jobLuk });
    }

    const isActual = context !== 'status';
    const criFromLuk = isActual ? floor(totalLuk * 0.3) : floor(totalLuk / 3);
    const formulaStr = isActual ? `floor(${totalLuk} × 0.3) = ${criFromLuk}` : `floor(${totalLuk} / 3) = ${criFromLuk}`;

    lukEntries.push({ source: 'Cri from LUK', value: criFromLuk, color: 'green' });

    sections.push({
      label: 'LUK → Cri',
      entries: lukEntries,
      subtotal: totalLuk,
      formula: formulaStr,
    });

    // 3. Katar section
    const isKatar = this.weaponData.data?.typeName === 'katar';
    if (isKatar) {
      sections.push({
        label: 'Katar',
        entries: [{ source: 'Katar ×2', value: '×2', color: 'yellow' }],
      });
    }

    // 4. Skill-specific data
    const skillBaseCri = damageSummary?.baseSkillCri ?? 0;
    const skillBaseCriPercentage = damageSummary?.baseCriPercentage ?? 1;

    if (context === 'skill' && skillBaseCri > 0) {
      const skillEntries: BreakdownEntry[] = [{ source: 'Skill Base Cri', value: skillBaseCri }];
      if (skillBaseCriPercentage !== 1) {
        skillEntries.push({ source: 'Skill Cri %', value: `×${skillBaseCriPercentage}`, color: 'yellow' });
      }
      sections.push({
        label: 'Skill Cri',
        entries: skillEntries,
      });
    }

    // 5. Extra cri vs monster and criShield
    const extraCriToMonster = damageSummary?.extraCriToMonster ?? 0;
    const criShield = damageSummary?.criShield ?? 0;

    if ((context !== 'status' && extraCriToMonster !== 0) || criShield !== 0) {
      const vsEntries: BreakdownEntry[] = [];
      if (extraCriToMonster !== 0) {
        vsEntries.push({ source: 'Extra Cri vs Monster', value: extraCriToMonster });
      }
      if (criShield !== 0) {
        vsEntries.push({ source: 'Cri Shield', value: -criShield, color: 'red' });
      }
      sections.push({
        label: 'vs Monstro',
        entries: vsEntries,
      });
    }

    // 6. Compute total (same logic as before)
    let total: number;
    if (context === 'status') {
      const base = 1 + equipTotal + criFromLuk;
      total = isKatar ? base * 2 : base;
    } else if (context === 'basic') {
      const base = 1 + equipTotal + criFromLuk;
      total = Math.max(0, (isKatar ? base * 2 : base) + extraCriToMonster - criShield);
    } else {
      // skill
      const base = 1 + equipTotal + criFromLuk + skillBaseCri;
      const adjusted = isKatar
        ? Math.max(0, floor(base - criShield) * skillBaseCriPercentage)
        : Math.max(0, floor(base * skillBaseCriPercentage) - criShield);
      total = floor(adjusted);
    }

    const contextLabels: Record<BreakdownContext, string> = { status: 'Status', basic: 'Basic ATQ', skill: 'Skill' };

    return {
      title: 'CriRate Breakdown',
      sections,
      totalLabel: `CriRate (${contextLabels[context]})`,
      totalValue: String(total),
    };
  }

  getResBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const { totalSta } = this.dmgCalculator.status;
    const itemSummaryFull = this.getItemSummary();

    // 1. Base RES (STA)
    const staContrib = totalSta + floor(totalSta / 3) * 5;
    const baseEntries: BreakdownEntry[] = [
      { source: 'STA', value: totalSta, color: 'white' },
      { source: 'floor(STA / 3) × 5', value: floor(totalSta / 3) * 5, color: 'white' },
    ];

    sections.push({
      label: 'Base RES (STA)',
      entries: baseEntries,
      formula: `${totalSta} + floor(${totalSta}/3)×5 = ${staContrib}`,
      subtotal: staContrib,
    });

    // 2. Equipment RES
    const equipEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.res;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);

    sections.push({
      label: 'Equipamentos RES',
      entries: equipEntries,
      subtotal: equipTotal,
      emptyMessage: 'Nenhum equipamento com RES',
    });

    // 3. Refine Bonus RES (itemLevel 2 equipment)
    const { headUpper, armor, shield, garment, boot } = this.model;
    const { headUpperRefine, armorRefine, shieldRefine, garmentRefine, bootRefine } = this.model;
    const lv2Slots: [number, number, string, string][] = [
      [headUpper, headUpperRefine, 'headUpper', 'Topo'],
      [armor, armorRefine, 'armor', 'Armadura'],
      [shield, shieldRefine, 'shield', 'Escudo'],
      [garment, garmentRefine, 'garment', 'Manto'],
      [boot, bootRefine, 'boot', 'Sapato'],
    ];

    const refineEntries: BreakdownEntry[] = [];
    let bonusRes = 0;
    for (const [itemId, refine, slotKey, slotLabel] of lv2Slots) {
      if (this.getItem(itemId)?.itemLevel === 2 && Number(refine) > 0) {
        const bonus = Number(refine) * 2;
        bonusRes += bonus;
        const itemData = this.equipItem.get(slotKey as any);
        refineEntries.push({
          source: itemData?.name || slotLabel,
          slot: slotLabel,
          value: bonus,
          detail: `+${refine} Lv2`,
        });
      }
    }

    if (bonusRes > 0) {
      sections.push({
        label: 'Refine Bonus RES (Lv2)',
        entries: refineEntries,
        subtotal: bonusRes,
      });
    }

    return {
      title: 'RES Breakdown',
      sections,
      totalLabel: 'RES',
      totalValue: `${this.res}`,
    };
  }

  getMresBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const { totalWis } = this.dmgCalculator.status;
    const itemSummaryFull = this.getItemSummary();

    // 1. Base MRES (WIS)
    const wisContrib = totalWis + floor(totalWis / 3) * 5;
    const baseEntries: BreakdownEntry[] = [
      { source: 'WIS', value: totalWis, color: 'white' },
      { source: 'floor(WIS / 3) × 5', value: floor(totalWis / 3) * 5, color: 'white' },
    ];

    sections.push({
      label: 'Base MRES (WIS)',
      entries: baseEntries,
      formula: `${totalWis} + floor(${totalWis}/3)×5 = ${wisContrib}`,
      subtotal: wisContrib,
    });

    // 2. Equipment MRES
    const equipEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.mres;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);

    sections.push({
      label: 'Equipamentos MRES',
      entries: equipEntries,
      subtotal: equipTotal,
      emptyMessage: 'Nenhum equipamento com MRES',
    });

    // 3. Refine Bonus MRES (itemLevel 2 equipment) - same bonusRes as RES
    const { headUpper, armor, shield, garment, boot } = this.model;
    const { headUpperRefine, armorRefine, shieldRefine, garmentRefine, bootRefine } = this.model;
    const lv2Slots: [number, number, string, string][] = [
      [headUpper, headUpperRefine, 'headUpper', 'Topo'],
      [armor, armorRefine, 'armor', 'Armadura'],
      [shield, shieldRefine, 'shield', 'Escudo'],
      [garment, garmentRefine, 'garment', 'Manto'],
      [boot, bootRefine, 'boot', 'Sapato'],
    ];

    const refineEntries: BreakdownEntry[] = [];
    let bonusRes = 0;
    for (const [itemId, refine, slotKey, slotLabel] of lv2Slots) {
      if (this.getItem(itemId)?.itemLevel === 2 && Number(refine) > 0) {
        const bonus = Number(refine) * 2;
        bonusRes += bonus;
        const itemData = this.equipItem.get(slotKey as any);
        refineEntries.push({
          source: itemData?.name || slotLabel,
          slot: slotLabel,
          value: bonus,
          detail: `+${refine} Lv2`,
        });
      }
    }

    if (bonusRes > 0) {
      sections.push({
        label: 'Refine Bonus MRES (Lv2)',
        entries: refineEntries,
        subtotal: bonusRes,
      });
    }

    return {
      title: 'MRES Breakdown',
      sections,
      totalLabel: 'MRES',
      totalValue: `${this.mres}`,
    };
  }

  getPatkBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();
    const equipEntries: BreakdownEntry[] = [];

    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.pAtk;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const totalFromEquipStatus = this.totalEquipStatus.pAtk || 0;
    const additional = totalFromEquipStatus - equipTotal;
    if (additional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: additional });
    }

    sections.push({
      label: 'Equipamentos P.Atk',
      entries: equipEntries,
      subtotal: totalFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com P.Atk',
    });

    return {
      title: 'P.Atk Breakdown',
      sections,
      totalLabel: 'P.Atk',
      totalValue: `${totalFromEquipStatus}`,
    };
  }

  getSmatkBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();
    const equipEntries: BreakdownEntry[] = [];

    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.sMatk;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const totalFromEquipStatus = this.totalEquipStatus.sMatk || 0;
    const additional = totalFromEquipStatus - equipTotal;
    if (additional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: additional });
    }

    sections.push({
      label: 'Equipamentos S.Matk',
      entries: equipEntries,
      subtotal: totalFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com S.Matk',
    });

    return {
      title: 'S.Matk Breakdown',
      sections,
      totalLabel: 'S.Matk',
      totalValue: `${totalFromEquipStatus}`,
    };
  }

  getCrateBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();
    const equipEntries: BreakdownEntry[] = [];

    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.cRate;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const totalFromEquipStatus = this.totalEquipStatus.cRate || 0;
    const additional = totalFromEquipStatus - equipTotal;
    if (additional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: additional });
    }

    sections.push({
      label: 'Equipamentos C.Rate',
      entries: equipEntries,
      subtotal: totalFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com C.Rate',
    });

    return {
      title: 'C.Rate Breakdown',
      sections,
      totalLabel: 'C.Rate',
      totalValue: `${totalFromEquipStatus}`,
    };
  }

  getCritDmgBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();
    const equipEntries: BreakdownEntry[] = [];

    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.criDmg;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const totalFromEquipStatus = this.totalEquipStatus.criDmg || 0;
    const additional = totalFromEquipStatus - equipTotal;
    if (additional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: additional });
    }

    sections.push({
      label: 'Equipamentos Crit Dmg',
      entries: equipEntries,
      subtotal: totalFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com Crit Dmg',
    });

    return {
      title: 'Crit Dmg Breakdown',
      sections,
      totalLabel: 'Crit Dmg',
      totalValue: `${totalFromEquipStatus}%`,
    };
  }

  getMeleeBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();
    const equipEntries: BreakdownEntry[] = [];

    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.melee;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const totalFromEquipStatus = this.totalEquipStatus.melee || 0;
    const additional = totalFromEquipStatus - equipTotal;
    if (additional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: additional });
    }

    sections.push({
      label: 'Equipamentos Melee',
      entries: equipEntries,
      subtotal: totalFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com Melee',
    });

    return {
      title: 'Melee Breakdown',
      sections,
      totalLabel: 'Melee',
      totalValue: `${totalFromEquipStatus}%`,
    };
  }

  getRangeBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();
    const equipEntries: BreakdownEntry[] = [];

    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.range;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const totalFromEquipStatus = this.totalEquipStatus.range || 0;
    const additional = totalFromEquipStatus - equipTotal;
    if (additional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: additional });
    }

    sections.push({
      label: 'Equipamentos Range',
      entries: equipEntries,
      subtotal: totalFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com Range',
    });

    return {
      title: 'Range Breakdown',
      sections,
      totalLabel: 'Range',
      totalValue: `${totalFromEquipStatus}%`,
    };
  }

  getHitBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const { totalDex, totalLuk, totalCon } = this.dmgCalculator.status;
    const baseLvl = this.model.level;
    const { hit, perfectHit } = this.totalEquipStatus;
    const itemSummaryFull = this.getItemSummary();

    // 1. Base HIT (Stats)
    const baseEntries: BreakdownEntry[] = [
      { source: '175', value: 175, color: 'white' },
      { source: 'Level', value: baseLvl, color: 'white' },
      { source: 'DEX', value: totalDex, color: 'white' },
      { source: 'floor(LUK / 3)', value: floor(totalLuk / 3), color: 'white' },
      { source: 'CON × 2', value: totalCon * 2, color: 'white' },
    ];
    const baseHit = 175 + baseLvl + totalDex + floor(totalLuk / 3) + totalCon * 2;

    sections.push({
      label: 'Base HIT (Stats)',
      entries: baseEntries,
      formula: `175 + ${baseLvl} + ${totalDex} + floor(${totalLuk}/3) + ${totalCon}×2 = ${baseHit}`,
      subtotal: baseHit,
    });

    // 2. Equipment HIT
    const equipEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const hitVal = (stats as any)?.hit;
      if (hitVal && hitVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: hitVal });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const hitFromEquipStatus = this.totalEquipStatus.hit || 0;
    const hitAdditional = hitFromEquipStatus - equipTotal;
    if (hitAdditional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: hitAdditional });
    }

    sections.push({
      label: 'Equipamentos HIT',
      entries: equipEntries,
      subtotal: hitFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com HIT',
    });

    // 3. Perfect HIT
    const perfectBase = floor(totalLuk / 10);
    const perfectEntries: BreakdownEntry[] = [
      { source: 'floor(LUK / 10)', value: perfectBase, color: 'white' },
    ];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const phVal = (stats as any)?.perfectHit;
      if (phVal && phVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        perfectEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: phVal });
      }
    }
    const totalPerfectHit = floor(totalLuk / 10) + (perfectHit || 0);

    sections.push({
      label: 'Perfect HIT',
      entries: perfectEntries,
      formula: `floor(${totalLuk}/10) + ${perfectHit || 0} = ${totalPerfectHit}`,
      subtotal: totalPerfectHit,
    });

    const totalHit = this.miscSummary.totalHit || 0;

    return {
      title: 'HIT Breakdown',
      sections,
      totalLabel: 'HIT',
      totalValue: `${totalHit} (Perfect: ${totalPerfectHit}%)`,
    };
  }

  getAspdBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();
    const totalAspd = this.basicAspd.totalAspd;
    const hitsPerSec = this.basicAspd.hitsPerSec;

    // 1. Base ASPD
    sections.push({
      label: 'Base ASPD',
      entries: [{ source: 'ASPD (calculado)', value: totalAspd, color: 'white' }],
      subtotal: totalAspd,
    });

    // 2. Equipment ASPD (flat)
    const equipEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const aspdVal = (stats as any)?.aspd;
      if (aspdVal && aspdVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: aspdVal });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const aspdFromEquipStatus = this.totalEquipStatus.aspd || 0;
    const aspdAdditional = aspdFromEquipStatus - equipTotal;
    if (aspdAdditional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: aspdAdditional });
    }

    sections.push({
      label: 'Equipamentos ASPD',
      entries: equipEntries,
      subtotal: aspdFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com ASPD',
    });

    // 3. ASPD %
    const percentEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const aspdPctVal = (stats as any)?.aspdPercent;
      if (aspdPctVal && aspdPctVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        percentEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: aspdPctVal, detail: '%' });
      }
    }
    percentEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const percentTotal = percentEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const aspdPctFromEquipStatus = this.totalEquipStatus.aspdPercent || 0;
    const aspdPctAdditional = aspdPctFromEquipStatus - percentTotal;
    if (aspdPctAdditional !== 0) {
      percentEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: aspdPctAdditional, detail: '%' });
    }

    sections.push({
      label: 'ASPD %',
      entries: percentEntries,
      subtotal: aspdPctFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com ASPD %',
    });

    return {
      title: 'ASPD Breakdown',
      sections,
      totalLabel: 'ASPD',
      totalValue: `${totalAspd} (${hitsPerSec} Hits/s)`,
    };
  }

  getFleeBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const { totalAgi, totalLuk, totalCon } = this.dmgCalculator.status;
    const baseLvl = this.model.level;
    const { flee, perfectDodge } = this.totalEquipStatus;
    const itemSummaryFull = this.getItemSummary();

    // 1. Base FLEE (Stats)
    const baseEntries: BreakdownEntry[] = [
      { source: '100', value: 100, color: 'white' },
      { source: 'Level', value: baseLvl, color: 'white' },
      { source: 'AGI', value: totalAgi, color: 'white' },
      { source: 'floor(LUK / 5)', value: floor(totalLuk / 5), color: 'white' },
      { source: 'CON × 2', value: totalCon * 2, color: 'white' },
    ];
    const baseFlee = 100 + floor(baseLvl + totalAgi + totalLuk / 5) + totalCon * 2;

    sections.push({
      label: 'Base FLEE (Stats)',
      entries: baseEntries,
      formula: `100 + floor(${baseLvl} + ${totalAgi} + ${totalLuk}/5) + ${totalCon}×2 = ${baseFlee}`,
      subtotal: baseFlee,
    });

    // 2. Equipment FLEE
    const equipEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const fleeVal = (stats as any)?.flee;
      if (fleeVal && fleeVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: fleeVal });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const fleeFromEquipStatus = this.totalEquipStatus.flee || 0;
    const fleeAdditional = fleeFromEquipStatus - equipTotal;
    if (fleeAdditional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: fleeAdditional });
    }

    sections.push({
      label: 'Equipamentos FLEE',
      entries: equipEntries,
      subtotal: fleeFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com FLEE',
    });

    // 3. Perfect Dodge
    const perfectBase = floor(1 + totalLuk * 0.1);
    const perfectEntries: BreakdownEntry[] = [
      { source: '1 + floor(LUK × 0.1)', value: perfectBase, color: 'white' },
    ];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const pdVal = (stats as any)?.perfectDodge;
      if (pdVal && pdVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        perfectEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: pdVal });
      }
    }
    const totalPerfectDodge = this.miscSummary.totalPerfectDodge || 0;

    sections.push({
      label: 'Perfect Dodge',
      entries: perfectEntries,
      formula: `floor(1 + ${totalLuk}×0.1) + ${perfectDodge || 0} = ${totalPerfectDodge}`,
      subtotal: totalPerfectDodge,
    });

    const totalFlee = this.miscSummary.totalFlee || 0;

    return {
      title: 'FLEE Breakdown',
      sections,
      totalLabel: 'FLEE',
      totalValue: `${totalFlee} + ${totalPerfectDodge}`,
    };
  }

  getMaxHpBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();

    // 1. Base MaxHP
    sections.push({
      label: 'Base Max HP',
      entries: [{ source: 'Max HP (calculado)', value: this.maxHp, color: 'white' }],
      subtotal: this.maxHp,
    });

    // 2. Equipment HP
    const hpEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.hp;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        hpEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val });
      }
    }
    hpEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const hpTotal = hpEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const hpFromEquipStatus = this.totalEquipStatus.hp || 0;
    const hpAdditional = hpFromEquipStatus - hpTotal;
    if (hpAdditional !== 0) {
      hpEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: hpAdditional });
    }

    sections.push({
      label: 'Equipamentos HP',
      entries: hpEntries,
      subtotal: hpFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com HP',
    });

    // 3. HP %
    const hpPctEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.hpPercent;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        hpPctEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val, detail: '%' });
      }
    }
    hpPctEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const hpPctTotal = hpPctEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const hpPctFromEquipStatus = this.totalEquipStatus.hpPercent || 0;
    const hpPctAdditional = hpPctFromEquipStatus - hpPctTotal;
    if (hpPctAdditional !== 0) {
      hpPctEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: hpPctAdditional, detail: '%' });
    }

    sections.push({
      label: 'HP %',
      entries: hpPctEntries,
      subtotal: hpPctFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com HP %',
    });

    return {
      title: 'Max HP Breakdown',
      sections,
      totalLabel: 'Max HP',
      totalValue: `${this.maxHp}`,
    };
  }

  getMaxSpBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();

    // 1. Base MaxSP
    sections.push({
      label: 'Base Max SP',
      entries: [{ source: 'Max SP (calculado)', value: this.maxSp, color: 'white' }],
      subtotal: this.maxSp,
    });

    // 2. Equipment SP
    const spEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.sp;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        spEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val });
      }
    }
    spEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const spTotal = spEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const spFromEquipStatus = this.totalEquipStatus.sp || 0;
    const spAdditional = spFromEquipStatus - spTotal;
    if (spAdditional !== 0) {
      spEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: spAdditional });
    }

    sections.push({
      label: 'Equipamentos SP',
      entries: spEntries,
      subtotal: spFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com SP',
    });

    // 3. SP %
    const spPctEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.spPercent;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        spPctEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val, detail: '%' });
      }
    }
    spPctEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const spPctTotal = spPctEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const spPctFromEquipStatus = this.totalEquipStatus.spPercent || 0;
    const spPctAdditional = spPctFromEquipStatus - spPctTotal;
    if (spPctAdditional !== 0) {
      spPctEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: spPctAdditional, detail: '%' });
    }

    sections.push({
      label: 'SP %',
      entries: spPctEntries,
      subtotal: spPctFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com SP %',
    });

    return {
      title: 'Max SP Breakdown',
      sections,
      totalLabel: 'Max SP',
      totalValue: `${this.maxSp}`,
    };
  }

  getMatkPercentBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();

    const equipEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.matkPercent;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const totalFromEquipStatus = this.totalEquipStatus.matkPercent || 0;
    const additional = totalFromEquipStatus - equipTotal;
    if (additional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: additional });
    }

    sections.push({
      label: 'Equipamentos Matk %',
      entries: equipEntries,
      subtotal: totalFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com Matk %',
    });

    return {
      title: 'Matk % Breakdown',
      sections,
      totalLabel: 'Matk %',
      totalValue: `${totalFromEquipStatus}%`,
    };
  }

  getVctBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();

    const equipEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const vctVal = (stats as any)?.vct;
      if (vctVal && vctVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: vctVal });
      }
      const vctIncVal = (stats as any)?.vct_inc;
      if (vctIncVal && vctIncVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: `${itemData?.name || slotLabel} (inc)`, slot: slotLabel, value: vctIncVal, color: 'red' });
      }
    }
    equipEntries.sort((a, b) => Math.abs(b.value as number) - Math.abs(a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const totalFromEquipStatus = this.totalEquipStatus.vct || 0;
    const additional = totalFromEquipStatus - equipTotal;
    if (additional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: additional });
    }

    sections.push({
      label: 'Equipamentos VCT',
      entries: equipEntries,
      subtotal: totalFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com VCT',
    });

    return {
      title: 'VCT Breakdown',
      sections,
      totalLabel: 'VCT',
      totalValue: `${totalFromEquipStatus}%`,
    };
  }

  getFctBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();

    const equipEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const fctVal = (stats as any)?.fct;
      if (fctVal && fctVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: fctVal });
      }
      const fctPctVal = (stats as any)?.fctPercent;
      if (fctPctVal && fctPctVal !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: `${itemData?.name || slotLabel} (%)`, slot: slotLabel, value: fctPctVal, detail: '%' });
      }
    }
    equipEntries.sort((a, b) => Math.abs(b.value as number) - Math.abs(a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const totalFromEquipStatus = this.totalEquipStatus.fct || 0;
    const additional = totalFromEquipStatus - equipTotal;
    if (additional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: additional });
    }

    sections.push({
      label: 'Equipamentos FCT',
      entries: equipEntries,
      subtotal: totalFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com FCT',
    });

    return {
      title: 'FCT Breakdown',
      sections,
      totalLabel: 'FCT',
      totalValue: `${totalFromEquipStatus}`,
    };
  }

  getAcdBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();

    const equipEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const val = (stats as any)?.acd;
      if (val && val !== 0) {
        const itemData = this.equipItem.get(slot as any);
        const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
        equipEntries.push({ source: itemData?.name || slotLabel, slot: slotLabel, value: val });
      }
    }
    equipEntries.sort((a, b) => (b.value as number) - (a.value as number));
    const equipTotal = equipEntries.reduce((sum, e) => sum + (e.value as number), 0);
    const totalFromEquipStatus = this.totalEquipStatus.acd || 0;
    const additional = totalFromEquipStatus - equipTotal;
    if (additional !== 0) {
      equipEntries.push({ source: 'Skill/Class Bonus', slot: 'Skill', value: additional });
    }

    sections.push({
      label: 'Equipamentos ACD',
      entries: equipEntries,
      subtotal: totalFromEquipStatus,
      emptyMessage: 'Nenhum equipamento com ACD',
    });

    return {
      title: 'ACD Breakdown',
      sections,
      totalLabel: 'ACD',
      totalValue: `${totalFromEquipStatus}`,
    };
  }

  getCdBreakdown(): StatBreakdown {
    const sections: BreakdownSection[] = [];

    sections.push({
      label: 'Cooldown',
      entries: [],
      emptyMessage: 'CD é calculado por skill (cd__SkillName)',
    });

    return {
      title: 'CD Breakdown',
      sections,
      totalLabel: 'CD',
      totalValue: 'Per skill',
    };
  }

  getPenetrationBreakdown(context: BreakdownContext, damageSummary: any): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();

    // 1. Physical Penetration
    const physEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const statObj = stats as any;
      if (!statObj) continue;
      for (const [key, val] of Object.entries(statObj)) {
        if ((key.startsWith('p_pene_') || key === 'p_infiltration') && val && (val as number) !== 0) {
          const itemData = this.equipItem.get(slot as any);
          const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
          const label = key.replace('p_pene_', '').replace('_', ' ');
          physEntries.push({ source: `${itemData?.name || slotLabel} (${label})`, slot: slotLabel, value: val as number });
        }
      }
    }
    physEntries.sort((a, b) => Math.abs(b.value as number) - Math.abs(a.value as number));
    const physTotal = physEntries.reduce((sum, e) => sum + (e.value as number), 0);

    sections.push({
      label: 'Penetração Física',
      entries: physEntries,
      subtotal: physTotal,
      emptyMessage: 'Nenhum equipamento com penetração física',
    });

    // 2. Magical Penetration
    const magEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const statObj = stats as any;
      if (!statObj) continue;
      for (const [key, val] of Object.entries(statObj)) {
        if (key.startsWith('m_pene_') && val && (val as number) !== 0) {
          const itemData = this.equipItem.get(slot as any);
          const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
          const label = key.replace('m_pene_', '').replace('_', ' ');
          magEntries.push({ source: `${itemData?.name || slotLabel} (${label})`, slot: slotLabel, value: val as number });
        }
      }
    }
    magEntries.sort((a, b) => Math.abs(b.value as number) - Math.abs(a.value as number));
    const magTotal = magEntries.reduce((sum, e) => sum + (e.value as number), 0);

    sections.push({
      label: 'Penetração Mágica',
      entries: magEntries,
      subtotal: magTotal,
      emptyMessage: 'Nenhum equipamento com penetração mágica',
    });

    // 3. RES/MRES Penetration
    const resEntries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const statObj = stats as any;
      if (!statObj) continue;
      for (const [key, val] of Object.entries(statObj)) {
        if ((key.startsWith('pene_res') || key.startsWith('pene_mres')) && val && (val as number) !== 0) {
          const itemData = this.equipItem.get(slot as any);
          const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
          const label = key.replace('pene_', '').replace('_', ' ');
          resEntries.push({ source: `${itemData?.name || slotLabel} (${label})`, slot: slotLabel, value: val as number });
        }
      }
    }
    resEntries.sort((a, b) => Math.abs(b.value as number) - Math.abs(a.value as number));
    const resTotal = resEntries.reduce((sum, e) => sum + (e.value as number), 0);

    sections.push({
      label: 'Penetração RES/MRES',
      entries: resEntries,
      subtotal: resTotal,
      emptyMessage: 'Nenhum equipamento com penetração RES/MRES',
    });

    const peneValue = context === 'basic'
      ? (damageSummary?.totalPene ?? 0)
      : (damageSummary?.skillTotalPene ?? 0);

    return {
      title: 'Penetração Breakdown',
      sections,
      totalLabel: 'Penetração',
      totalValue: `${peneValue}%`,
    };
  }

  getAccuracyBreakdown(context: BreakdownContext, damageSummary: any): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const totalHit = this.miscSummary.totalHit || 0;
    const hitRequireFor100 = this.monster?.data?.hitRequireFor100 || 0;

    const accuracyValue = context === 'basic'
      ? (damageSummary?.accuracy ?? this.miscSummary.accuracy ?? 0)
      : (damageSummary?.skillAccuracy ?? this.miscSummary.accuracy ?? 0);

    // 1. HIT Total
    sections.push({
      label: 'HIT Total',
      entries: [{ source: 'HIT Total', value: totalHit, color: 'white' }],
      subtotal: totalHit,
    });

    // 2. Monster Hit Required
    sections.push({
      label: 'Monster Hit Required',
      entries: [{ source: `Hit p/ 100% (${this.monster?.data?.name || 'Monster'})`, value: hitRequireFor100, color: 'red' }],
      subtotal: hitRequireFor100,
    });

    // 3. Formula
    sections.push({
      label: 'Fórmula',
      entries: [{ source: `max(5, min(100, 100 + ${totalHit} - ${hitRequireFor100}))`, value: accuracyValue, color: 'white' }],
      subtotal: accuracyValue,
    });

    return {
      title: 'Precisão Breakdown',
      sections,
      totalLabel: 'Precisão',
      totalValue: `${accuracyValue}%`,
    };
  }

  getElementBreakdown(context: BreakdownContext, damageSummary: any): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();

    const entries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const statObj = stats as any;
      if (!statObj) continue;
      for (const [key, val] of Object.entries(statObj)) {
        if ((key.startsWith('p_element_') || key.startsWith('m_element_') || key.startsWith('m_my_element_')) && val && (val as number) !== 0) {
          const itemData = this.equipItem.get(slot as any);
          const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
          const label = key.replace('p_element_', 'Phys ').replace('m_element_', 'Mag ').replace('m_my_element_', 'Mag Own ');
          entries.push({ source: `${itemData?.name || slotLabel} (${label})`, slot: slotLabel, value: val as number });
        }
      }
    }
    entries.sort((a, b) => Math.abs(b.value as number) - Math.abs(a.value as number));
    const total = entries.reduce((sum, e) => sum + (e.value as number), 0);

    sections.push({
      label: 'Element Damage',
      entries,
      subtotal: total,
      emptyMessage: 'Nenhum equipamento com bônus elemental',
    });

    const multiplier = context === 'basic'
      ? (damageSummary?.propertyMultiplier ?? 0)
      : (damageSummary?.skillPropertyMultiplier ?? 0);

    return {
      title: 'Element Breakdown',
      sections,
      totalLabel: 'Element',
      totalValue: `x ${multiplier}`,
    };
  }

  getSizePenaltyBreakdown(context: BreakdownContext, damageSummary: any): StatBreakdown {
    const sections: BreakdownSection[] = [];
    const itemSummaryFull = this.getItemSummary();

    const entries: BreakdownEntry[] = [];
    for (const [slot, stats] of Object.entries(itemSummaryFull)) {
      if (slot === 'consumableBonuses') continue;
      const statObj = stats as any;
      if (!statObj) continue;
      for (const [key, val] of Object.entries(statObj)) {
        if ((key.startsWith('p_size_') || key.startsWith('m_size_') || key === 'ignore_size_penalty') && val && (val as number) !== 0) {
          const itemData = this.equipItem.get(slot as any);
          const slotLabel = Calculator.SLOT_LABELS[slot] || slot;
          const label = key.replace('p_size_', 'Phys ').replace('m_size_', 'Mag ').replace('ignore_size_penalty', 'Ignore Size');
          entries.push({ source: `${itemData?.name || slotLabel} (${label})`, slot: slotLabel, value: val as number });
        }
      }
    }
    entries.sort((a, b) => Math.abs(b.value as number) - Math.abs(a.value as number));
    const total = entries.reduce((sum, e) => sum + (e.value as number), 0);

    sections.push({
      label: 'Size Damage',
      entries,
      subtotal: total,
      emptyMessage: 'Nenhum equipamento com bônus de tamanho',
    });

    const penalty = context === 'basic'
      ? (damageSummary?.sizePenalty ?? 0)
      : (damageSummary?.skillSizePenalty ?? 0);

    return {
      title: 'Size Penalty Breakdown',
      sections,
      totalLabel: 'Size Penalty',
      totalValue: `${penalty}%`,
    };
  }

  /**
   * Build ATK processing steps showing how raw ATK components become totalATK.
   * Used at the beginning of physical basic/crit/skill breakdowns.
   */
  private _buildAtkProcessingSteps(p: any, finalTotalAtk: number, extras?: { extraDmg?: number; extraBasicDmg?: number }): { steps: DamageStep[]; running: number } {
    const steps: DamageStep[] = [];

    // Step 1: Status ATK × 2 (× mildwind if active)
    // p.statusAtk is already rawStatusAtk * 2 * mildwindMultiplier
    const statusAtk2 = floor(p.statusAtk);
    let running = statusAtk2;
    steps.push({ label: 'Status ATK × 2', operation: `${floor(p.statusAtkRaw)} × 2`, result: running, color: 'white' });

    // Step 2: + Weapon ATK
    const weaponAtk = floor(p.weaponAtkMaxOver || 0);
    if (weaponAtk !== 0) {
      running = running + weaponAtk;
      steps.push({ label: '+ Weapon ATK', operation: `+ ${weaponAtk}`, result: running, color: 'green' });
    }

    // Step 3: + Equipment ATK
    const extraAtk = floor(p.extraAtkTotal || 0);
    if (extraAtk !== 0) {
      running = running + extraAtk;
      steps.push({ label: '+ Equipment ATK', operation: `+ ${extraAtk}`, result: running, color: 'green' });
    }

    // Step 4: × Modifiers (combined atkPercent + race + size + element + monsterType + property)
    // Compute effective combined multiplier from raw weapon+extra through groups A+B and property
    const rawBase = p.rawWeaponPlusExtra || 0;
    if (rawBase > 0) {
      const groupA = p.groupAMaxOver || 0;
      const groupB = p.groupBMaxOver || 0;
      const combinedAfterProperty = floor((groupA + groupB) * (p.propertyMultiplier || 1));
      // The raw base just with statusAtk would give: statusAtk2 + rawBase
      // After modifiers it becomes: statusAtk2 + combinedAfterProperty
      const beforeMod = statusAtk2 + rawBase;
      const afterMod = statusAtk2 + combinedAfterProperty;
      if (beforeMod > 0 && Math.abs(afterMod / beforeMod - 1) > 0.001) {
        const effectiveMultiplier = round(afterMod / beforeMod, 4);
        running = afterMod;
        steps.push({ label: '× Modifiers', operation: `× ${effectiveMultiplier}`, result: running });
      } else {
        running = afterMod;
      }
    }

    // Step 5: × P.Atk
    if (p.pAtkMultiplier && p.pAtkMultiplier !== 1) {
      running = floor(running * p.pAtkMultiplier);
      steps.push({ label: '× P.Atk', operation: `× ${round(p.pAtkMultiplier, 4)}`, result: running });
    }

    // Step 6: + Mastery ATK
    const masteryAtk = floor(p.masteryAtkTotal || 0);
    if (masteryAtk !== 0) {
      running = running + masteryAtk;
      steps.push({ label: '+ Mastery ATK', operation: `+ ${masteryAtk}`, result: running, color: 'green' });
    }

    // Extra damage from class skills (added before entering formula)
    const extraDmg = floor(extras?.extraDmg || 0);
    const extraBasicDmg = floor(extras?.extraBasicDmg || 0);
    if (extraDmg !== 0) {
      running = running + extraDmg;
      steps.push({ label: '+ Extra ATK', operation: `+ ${extraDmg}`, result: running, color: 'green' });
    }
    if (extraBasicDmg !== 0) {
      running = running + extraBasicDmg;
      steps.push({ label: '+ Extra Basic ATK', operation: `+ ${extraBasicDmg}`, result: running, color: 'green' });
    }

    // Final: = Total ATK (use authoritative value)
    running = finalTotalAtk;
    steps.push({ label: '= Total ATK', result: running, color: 'white' });

    return { steps, running };
  }

  getBasicDamageBreakdown(): DamageBreakdown | null {
    const p = this.dmgCalculator.damagePipelineForUI.basic;
    if (!p || p.totalMax == null) return null;

    const hasAtkPipeline = p.statusAtk != null;
    const atkSteps = hasAtkPipeline ? this._buildAtkProcessingSteps(p, p.totalMax, { extraDmg: p.extraDmg, extraBasicDmg: p.extraBasicDmg }) : null;
    const steps: DamageStep[] = atkSteps ? [...atkSteps.steps] : [];
    let running = p.totalMax;

    if (!hasAtkPipeline) {
      steps.push({ label: 'Total ATK', operation: `${running}`, result: running, color: 'white' });
    }

    if (p.rangedMultiplier !== 1) {
      running = floor(running * p.rangedMultiplier);
      steps.push({ label: 'Melee/Range %', operation: `× ${round(p.rangedMultiplier, 4)}`, result: running });
    }

    if (p.dmgMultiplier !== 1) {
      running = floor(running * p.dmgMultiplier);
      steps.push({ label: 'Dmg %', operation: `× ${round(p.dmgMultiplier, 4)}`, result: running });
    }

    if (p.resReduction !== 1) {
      running = floor(running * p.resReduction);
      steps.push({ label: 'RES Reduction', operation: `× ${round(p.resReduction, 4)}`, result: running });
    }

    if (p.hardDef !== 1) {
      running = floor(running * p.hardDef);
      steps.push({ label: 'Hard DEF', operation: `× ${round(p.hardDef, 4)}`, result: running });
    }

    if (p.softDef !== 0) {
      running = running - p.softDef;
      steps.push({ label: 'Soft DEF', operation: `− ${p.softDef}`, result: running, color: 'red' });
    }

    if (p.advKatarMultiplier !== 1) {
      running = floor(running * p.advKatarMultiplier);
      steps.push({ label: 'Adv Katar', operation: `× ${round(p.advKatarMultiplier, 4)}`, result: running });
    }

    if (p.debuffMultiplier !== 1) {
      running = floor(running * p.debuffMultiplier);
      steps.push({ label: 'Debuff', operation: `× ${round(p.debuffMultiplier, 4)}`, result: running, color: 'yellow' });
    }

    const dmg = this.damageSummary;
    return {
      title: 'Basic Damage Breakdown',
      steps,
      minDamage: dmg.basicMinDamage,
      maxDamage: dmg.basicMaxDamage,
      dps: dmg.basicDps,
      dpsLabel: 'Basic DPS',
    };
  }

  getCritDamageBreakdown(): DamageBreakdown | null {
    const p = this.dmgCalculator.damagePipelineForUI.crit;
    if (!p || p.totalMaxAtkOver == null) return null;

    const hasAtkPipeline = p.statusAtk != null;
    const atkSteps = hasAtkPipeline ? this._buildAtkProcessingSteps(p, p.totalMaxAtkOver) : null;
    const steps: DamageStep[] = atkSteps ? [...atkSteps.steps] : [];
    let running = p.totalMaxAtkOver;

    if (!hasAtkPipeline) {
      steps.push({ label: 'Max ATK', operation: `${running}`, result: running, color: 'white' });
    }

    if (p.bonusCriDmgMultiplier !== 1) {
      running = floor(running * p.bonusCriDmgMultiplier);
      steps.push({ label: 'Crit Dmg %', operation: `× ${round(p.bonusCriDmgMultiplier, 4)}`, result: running });
    }

    if (p.rangedMultiplier !== 1) {
      running = floor(running * p.rangedMultiplier);
      steps.push({ label: 'Melee/Range %', operation: `× ${round(p.rangedMultiplier, 4)}`, result: running });
    }

    if (p.dmgMultiplier !== 1) {
      // NO Math.floor on this step — matching actual code line 1188
      running = running * p.dmgMultiplier;
      steps.push({ label: 'Dmg %', operation: `× ${round(p.dmgMultiplier, 4)}`, result: floor(running) });
    }

    if (p.resReduction !== 1) {
      running = floor(running * p.resReduction);
      steps.push({ label: 'RES Reduction', operation: `× ${round(p.resReduction, 4)}`, result: running });
    }

    if (p.hardDef !== 1) {
      running = floor(running * p.hardDef);
      steps.push({ label: 'Hard DEF', operation: `× ${round(p.hardDef, 4)}`, result: running });
    }

    if (p.advKatarMultiplier !== 1) {
      running = floor(running * p.advKatarMultiplier);
      steps.push({ label: 'Adv Katar', operation: `× ${round(p.advKatarMultiplier, 4)}`, result: running });
    }

    if (p.softDef !== 0) {
      running = running - p.softDef;
      steps.push({ label: 'Soft DEF', operation: `− ${p.softDef}`, result: running, color: 'red' });
    }

    if (p.criMultiplier !== 1) {
      running = floor(running * p.criMultiplier);
      steps.push({ label: 'Crit Multiplier', operation: `× ${round(p.criMultiplier, 4)}`, result: running, color: 'yellow' });
    }

    if (p.debuffMultiplier !== 1) {
      running = floor(running * p.debuffMultiplier);
      steps.push({ label: 'Debuff', operation: `× ${round(p.debuffMultiplier, 4)}`, result: running, color: 'yellow' });
    }

    if (p.extraDmgTotal && p.extraDmgTotal !== 0) {
      running = running + floor(p.extraDmgTotal);
      steps.push({ label: 'Extra Damage', operation: `+ ${floor(p.extraDmgTotal)}`, result: running, color: 'green' });
    }

    const dmg = this.damageSummary;
    return {
      title: 'Crit Damage Breakdown',
      steps,
      minDamage: dmg.criMinDamage,
      maxDamage: dmg.criMaxDamage,
    };
  }

  getSkillDamageBreakdown(): DamageBreakdown | null {
    const p = this.dmgCalculator.damagePipelineForUI.skill;
    if (!p || !p.dmgType) return null;
    const dmg = this.damageSummary;
    if (p.dmgType === 'Magical') {
      return this._buildMagicalSkillBreakdown(p, dmg);
    }
    return this._buildPhysicalSkillBreakdown(p, dmg);
  }

  private _buildPhysicalSkillBreakdown(p: any, dmg: any): DamageBreakdown {
    const hasAtkPipeline = p.statusAtk != null;
    const atkSteps = hasAtkPipeline ? this._buildAtkProcessingSteps(p, p.totalMaxOver) : null;
    const steps: DamageStep[] = atkSteps ? [...atkSteps.steps] : [];
    let running = p.totalMaxOver as number;

    if (!hasAtkPipeline) {
      steps.push({ label: 'Total ATK', operation: `${running}`, result: running, color: 'white' });
    }

    if (p.modifyFinalAtkFactor !== 1) {
      running = floor(running * p.modifyFinalAtkFactor);
      steps.push({ label: 'Job Modifier', operation: `× ${round(p.modifyFinalAtkFactor, 4)}`, result: running });
    }

    if (p.canCri && p.criMultiplierBonus !== 1) {
      running = floor(running * p.criMultiplierBonus);
      steps.push({ label: 'Crit Dmg %', operation: `× ${round(p.criMultiplierBonus, 4)}`, result: running });
    }

    if (p.rangedMultiplier !== 1) {
      running = floor(running * p.rangedMultiplier);
      steps.push({ label: 'Melee/Range %', operation: `× ${round(p.rangedMultiplier, 4)}`, result: running });
    }

    running = floor(running * p.baseSkillMultiplier);
    steps.push({ label: 'Base Skill %', operation: `× ${round(p.baseSkillMultiplier, 4)}`, result: running, color: 'yellow' });

    if (p.equipSkillMultiplier !== 1) {
      running = floor(running * p.equipSkillMultiplier);
      steps.push({ label: 'Skill Bonus %', operation: `× ${round(p.equipSkillMultiplier, 4)}`, result: running });
    }

    if (p.resReduction !== 1) {
      running = floor(running * p.resReduction);
      steps.push({ label: 'RES Reduction', operation: `× ${round(p.resReduction, 4)}`, result: running });
    }

    if (p.hardDef !== 1) {
      running = floor(running * p.hardDef);
      steps.push({ label: 'Hard DEF', operation: `× ${round(p.hardDef, 4)}`, result: running });
    }

    if (p.softDef !== 0) {
      running = running - p.softDef;
      steps.push({ label: 'Soft DEF', operation: `− ${p.softDef}`, result: running, color: 'red' });
    }

    if (p.canCri) {
      running = floor(running * p.criMultiplierBase);
      steps.push({ label: 'Crit Multiplier', operation: `× ${round(p.criMultiplierBase, 4)}`, result: running, color: 'yellow' });
    }

    if (p.advKatarMultiplier !== 1) {
      running = floor(running * p.advKatarMultiplier);
      steps.push({ label: 'Adv Katar', operation: `× ${round(p.advKatarMultiplier, 4)}`, result: running });
    }

    if (p.debuffMultiplier !== 1) {
      running = floor(running * p.debuffMultiplier);
      steps.push({ label: 'Debuff', operation: `× ${round(p.debuffMultiplier, 4)}`, result: running, color: 'yellow' });
    }

    const extraDmg = p.extraDmg || 0;
    if (extraDmg !== 0) {
      const extraDmgCri = p.canCri ? floor(extraDmg * p.criMultiplierBonus) : extraDmg;
      running = running + extraDmgCri;
      steps.push({ label: 'Extra Damage', operation: `+ ${extraDmgCri}`, result: running, color: 'green' });
    }

    return {
      title: 'Skill Damage (Physical)',
      steps,
      minDamage: dmg.skillMinDamage,
      maxDamage: dmg.skillMaxDamage,
      dps: dmg.skillDps,
      dpsLabel: 'Skill DPS',
    };
  }

  private _buildMagicalSkillBreakdown(p: any, dmg: any): DamageBreakdown {
    const steps: DamageStep[] = [];
    let running = p.totalMatkMax as number;

    steps.push({ label: 'Total MATK', operation: `${running}`, result: running, color: 'white' });

    if (p.sMatkMultiplier !== 1) {
      running = floor(running * p.sMatkMultiplier);
      steps.push({ label: 'S.Matk', operation: `× ${round(p.sMatkMultiplier, 4)}`, result: running });
    }

    if (p.raceMultiplier !== 1) {
      running = floor(running * p.raceMultiplier);
      steps.push({ label: 'Race %', operation: `× ${round(p.raceMultiplier, 4)}`, result: running });
    }

    if (p.sizeMultiplier !== 1) {
      running = floor(running * p.sizeMultiplier);
      steps.push({ label: 'Size %', operation: `× ${round(p.sizeMultiplier, 4)}`, result: running });
    }

    if (p.elementMultiplier !== 1) {
      running = floor(running * p.elementMultiplier);
      steps.push({ label: 'Element %', operation: `× ${round(p.elementMultiplier, 4)}`, result: running });
    }

    if (p.monsterTypeMultiplier !== 1) {
      running = floor(running * p.monsterTypeMultiplier);
      steps.push({ label: 'Monster Class %', operation: `× ${round(p.monsterTypeMultiplier, 4)}`, result: running });
    }

    if (p.matkPercentMultiplier !== 1) {
      running = floor(running * p.matkPercentMultiplier);
      steps.push({ label: 'MATK %', operation: `× ${round(p.matkPercentMultiplier, 4)}`, result: running });
    }

    if (p.cometMultiplier != null && p.cometMultiplier !== 1) {
      running = floor(running * p.cometMultiplier);
      steps.push({ label: 'Comet', operation: `× ${round(p.cometMultiplier, 4)}`, result: running, color: 'yellow' });
    }

    running = floor(running * p.baseSkillMultiplier);
    steps.push({ label: 'Base Skill %', operation: `× ${round(p.baseSkillMultiplier, 4)}`, result: running, color: 'yellow' });

    if (p.myElementMultiplier != null && p.myElementMultiplier !== 1) {
      running = floor(running * p.myElementMultiplier);
      steps.push({ label: 'My Element', operation: `× ${round(p.myElementMultiplier, 4)}`, result: running });
    }

    if (p.mresReduction !== 1) {
      running = floor(running * p.mresReduction);
      steps.push({ label: 'MRES Reduction', operation: `× ${round(p.mresReduction, 4)}`, result: running });
    }

    if (p.hardDef !== 1) {
      running = floor(running * round(p.hardDef, 4));
      steps.push({ label: 'Hard MDEF', operation: `× ${round(p.hardDef, 4)}`, result: running });
    }

    if (p.softMDef !== 0) {
      running = running - p.softMDef;
      steps.push({ label: 'Soft MDEF', operation: `− ${p.softMDef}`, result: running, color: 'red' });
    }

    if (p.equipSkillMultiplier !== 1) {
      running = floor(running * p.equipSkillMultiplier);
      steps.push({ label: 'Skill Bonus %', operation: `× ${round(p.equipSkillMultiplier, 4)}`, result: running });
    }

    if (p.propertyMultiplier !== 1) {
      running = floor(running * p.propertyMultiplier);
      steps.push({ label: 'Property', operation: `× ${round(p.propertyMultiplier, 4)}`, result: running });
    }

    if (p.finalDmgMultiplier !== 1) {
      running = floor(running * p.finalDmgMultiplier);
      steps.push({ label: 'Element Final %', operation: `× ${round(p.finalDmgMultiplier, 4)}`, result: running });
    }

    if (p.magicFinalMultiplier !== 1) {
      running = floor(running * p.magicFinalMultiplier);
      steps.push({ label: 'Magic Final %', operation: `× ${round(p.magicFinalMultiplier, 4)}`, result: running });
    }

    if (p.debuffMultiplier !== 1) {
      running = floor(running * p.debuffMultiplier);
      steps.push({ label: 'Debuff', operation: `× ${round(p.debuffMultiplier, 4)}`, result: running, color: 'yellow' });
    }

    return {
      title: 'Skill Damage (Magical)',
      steps,
      minDamage: dmg.skillMinDamage,
      maxDamage: dmg.skillMaxDamage,
      dps: dmg.skillDps,
      dpsLabel: 'Skill DPS',
    };
  }
}
