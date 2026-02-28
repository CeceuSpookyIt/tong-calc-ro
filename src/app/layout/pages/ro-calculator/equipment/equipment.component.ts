import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DropdownModel } from '../../../../models/dropdown.model';
import { ItemModel } from '../../../../models/item.model';
import { ItemTypeEnum, OptionableItemTypeSet } from '../../../../constants/item-type.enum';
import { ExtraOptionTable } from '../../../../constants/extra-option-table';
import { createNumberDropdownList, getGradeList } from '../../../../utils';
import { getEnchants } from 'src/app/constants/enchant_item';
import { getModuleMaxEnchant } from 'src/app/constants/enchant_item/automatic';

interface EventEmitterResultModel {
  itemType: string;
  itemId?: number;
  refine?: number;
  grade?: string;
}

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['../ro-calculator.component.css'],
})
export class EquipmentComponent implements OnChanges, OnInit {
  @Input({ required: true }) readonly itemType!: string;
  @Input({ required: true }) readonly placeholder: string;
  @Input() isEndWithSpace = false;
  @Input() readonly overlayLabel!: string;

  @Input() readonly items!: Record<number, ItemModel>;
  @Input() itemList: DropdownModel[] = [];
  @Input() refineList: DropdownModel[] = [];
  @Input() cardList: DropdownModel[] = [];
  @Input() mapEnchant!: Map<string, ItemModel>;
  @Input() optionList: any[] = [];

  @Output() selectItemChange = new EventEmitter<EventEmitterResultModel>();
  @Output() clearItemEvent = new EventEmitter<string>();
  @Output() optionChange = new EventEmitter<string>();
  @Output() gradeChange = new EventEmitter<EventEmitterResultModel>();

  @Input() itemId = undefined;
  @Output() itemIdChange = new EventEmitter<number>();

  @Input() itemRefine = undefined;
  @Output() itemRefineChange = new EventEmitter<number>();

  @Input() itemGrade: string = undefined;
  @Output() itemGradeChange = new EventEmitter<string>();

  @Input() card1Id = undefined;
  @Output() card1IdChange = new EventEmitter<number>();

  @Input() card2Id = undefined;
  @Output() card2IdChange = new EventEmitter<number>();

  @Input() card3Id = undefined;
  @Output() card3IdChange = new EventEmitter<number>();

  @Input() card4Id = undefined;
  @Output() card4IdChange = new EventEmitter<number>();

  @Input() enchant1Id = undefined;
  @Output() enchant1IdChange = new EventEmitter<number>();

  @Input() enchant2Id = undefined;
  @Output() enchant2IdChange = new EventEmitter<number>();

  @Input() enchant3Id = undefined;
  @Output() enchant3IdChange = new EventEmitter<number>();

  @Input() enchant4Id = undefined;
  @Output() enchant4IdChange = new EventEmitter<number>();

  @Input() option1Value = undefined;
  @Output() option1ValueChange = new EventEmitter<string>();

  @Input() option2Value = undefined;
  @Output() option2ValueChange = new EventEmitter<string>();

  @Input() option3Value = undefined;
  @Output() option3ValueChange = new EventEmitter<string>();

  totalCardSlots = 0;
  enchant1List: DropdownModel[] = [];
  enchant2List: DropdownModel[] = [];
  enchant3List: DropdownModel[] = [];
  enchant4List: DropdownModel[] = [];
  totalExtraOption = 0;
  gradeList: DropdownModel[] = [];
  isAutoEquipment = false;

  private itemTypeMap = {};
  private readonly requireSet = new Set(['items', 'itemList', 'mapEnchant',])
  private isInternalItemIdChange = false;

  constructor() { }

  ngOnInit(): void {
    this.itemTypeMap = {
      itemId: this.itemType,
      itemRefine: `${this.itemType}Refine`,
      itemGrade: `${this.itemType}Grade`,
      card1Id: this.isWeapon ? `${this.itemType}Card1` : `${this.itemType}Card`,
      card2Id: `${this.itemType}Card2`,
      card3Id: `${this.itemType}Card3`,
      card4Id: `${this.itemType}Card4`,
      enchant1Id: `${this.itemType}Enchant0`,
      enchant2Id: `${this.itemType}Enchant1`,
      enchant3Id: `${this.itemType}Enchant2`,
      enchant4Id: `${this.itemType}Enchant3`,
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(this.itemType, 'changes', changes)
    if ((changes['items'])) {
      if (!changes['items']?.isFirstChange() || changes['items'].currentValue) {
        this.requireSet.delete('items')
      }
    }
    if (changes['itemList'] && !changes['itemList']?.isFirstChange()) {
      this.requireSet.delete('itemList')
    }
    if ((changes['mapEnchant'])) {
      if (!changes['mapEnchant']?.isFirstChange() || changes['mapEnchant'].currentValue?.size) {
        this.requireSet.delete('mapEnchant')
      }
    }
    // if (this.itemType === 'weapon' && changes['mapEnchant']) {
    //   console.log({ size: this.mapEnchant?.size, isFirst: changes['mapEnchant']?.isFirstChange() })
    // }

    if (this.requireSet.size === 0) {
      this.requireSet.add('x1').add('x2').add('x3').add('x4').add('x5').add('x6')

      setTimeout(() => {
        // console.log(this.itemType, 'initial item ____ ', this.isInternalItemIdChange, changes['itemId'])
        this.onSelectItem('itemId', this.itemId, this.itemRefine, false)
      }, 0);
    } else if (changes['itemId'] && this.requireSet.size === 6) {
      // handle property was set from main component (when load data)
      if (!this.isInternalItemIdChange) {
        setTimeout(() => {
          // console.log(this.itemType, 'changes itemId isInternalItemIdChange ____ ', this.isInternalItemIdChange, changes['itemId'])
          this.onSelectItem('itemId', this.itemId, this.itemRefine, false)
        }, 0);
      }

      this.isInternalItemIdChange = false;
    }
  }

  get isHeadCardable() {
    return this.itemType === ItemTypeEnum.headMiddle || this.itemType === ItemTypeEnum.headUpper;
  }

  get isAcc() {
    return this.itemType === ItemTypeEnum.accLeft || this.itemType === ItemTypeEnum.accRight;
  }

  get isWeapon() {
    return this.itemType === ItemTypeEnum.weapon || this.itemType === ItemTypeEnum.leftWeapon;
  }

  get isAccR() {
    return this.itemType === ItemTypeEnum.accRight;
  }

  get isEndWithSpace2() {
    return this.isAccR && this.isEndWithSpace && (!this.itemId || !this.enchant3List.length);
  }

  get isRefinable() {
    return this.getItem(this.itemId).isRefinable ?? false
  }

  private getItem(mainItemId?: number) {
    return this.items?.[mainItemId || this.itemId] ?? ({} as ItemModel);
  }

  private setEnchantList() {
    const { aegisName, name, canGrade } = this.getItem();
    const enchants = getEnchants(aegisName) ?? getEnchants(name);

    const [e1, e2, e3, e4] = Array.isArray(enchants) ? enchants : [];

    // Detect if this is automatic equipment (module system)
    this.isAutoEquipment = aegisName?.startsWith('Auto_') ?? false;

    const mapToDropdown = (list: string[]) =>
      (list ?? [])
        .map((a: any) => this.mapEnchant.get(a))
        .filter(Boolean)
        .map((a: any) => ({ label: a.name, value: a.id, aegisName: a.aegisName }));

    this.enchant1List = mapToDropdown(e1);
    this.enchant2List = mapToDropdown(e2);
    this.enchant3List = mapToDropdown(e3);
    this.enchant4List = mapToDropdown(e4);

    this.gradeList = canGrade ? getGradeList() : [];

    // For automatic equipment, apply max enchant filtering
    if (this.isAutoEquipment) {
      this.filterAutoEnchantLists();
    }

    // Clear invalid selections
    for (const idx of [1, 2, 3, 4]) {
      const enchantList = this[`enchant${idx}List`] as any[];
      const property = `enchant${idx}Id`;
      const currentEnchantValue = this[property];
      if (this.itemId && currentEnchantValue != null && !enchantList.find((a) => a.value === currentEnchantValue)) {
        this[property] = undefined;
        this.onSelectItem(property);
      }
    }
  }

  /**
   * For automatic equipment: filter enchant slot 2/3 based on already-selected modules
   * and their max enchant limits. Enforces progressive slot unlocking.
   */
  private filterAutoEnchantLists() {
    const getAegis = (itemId: number | undefined): string | undefined => {
      if (!itemId) return undefined;
      return this.items?.[itemId]?.aegisName;
    };

    const enchant1Aegis = getAegis(this.enchant1Id);
    const enchant2Aegis = getAegis(this.enchant2Id);

    const countSelected = (upToSlot: number): Record<string, number> => {
      const counts: Record<string, number> = {};
      const slots = [enchant1Aegis, enchant2Aegis];
      for (let i = 0; i < upToSlot; i++) {
        const aegis = slots[i];
        if (aegis) {
          counts[aegis] = (counts[aegis] || 0) + 1;
        }
      }
      return counts;
    };

    const filterByMax = (list: any[], counts: Record<string, number>) => {
      return list.filter(item => {
        const aegis = item.aegisName;
        if (!aegis) return true;
        const max = getModuleMaxEnchant(aegis);
        const used = counts[aegis] || 0;
        return used < max;
      });
    };

    // Slot 2: filter based on slot 1 selection, empty if no slot 1
    if (this.enchant1Id) {
      const counts1 = countSelected(1);
      this.enchant2List = filterByMax(this.enchant2List, counts1);
    } else {
      this.enchant2List = [];
    }

    // Slot 3: filter based on slot 1+2 selections, empty if no slot 2
    if (this.enchant1Id && this.enchant2Id) {
      const counts2 = countSelected(2);
      this.enchant3List = filterByMax(this.enchant3List, counts2);
    } else {
      this.enchant3List = [];
    }
  }

  onSelectItem(itemType: string, itemId = 0, refine = 0, isEmitItemChange = true) {
    // console.log('_onSelectItem', { itemType, itemId, refine })
    if (itemType === 'itemId') {
      const item = this.getItem(itemId);
      this.totalCardSlots = item?.slots || 0;
      this.setEnchantList();
      this.itemIdChange.emit(this.itemId);
      this.itemRefineChange.emit(this.itemRefine);

      if (!this.gradeList.length) {
        this.itemGrade = null;
        this.onSelectGrade(this.itemGrade);
      }

      if (this.totalCardSlots < 4 && this.card4Id) {
        this.card4Id = undefined;
        this.card4IdChange.emit();
      }
      if (this.totalCardSlots < 3 && this.card3Id) {
        this.card3Id = undefined;
        this.card3IdChange.emit();
      }
      if (this.totalCardSlots < 2 && this.card2Id) {
        this.card2Id = undefined;
        this.card2IdChange.emit();
      }
      if (this.totalCardSlots < 1 && this.card1Id) {
        this.card1Id = undefined;
        this.card1IdChange.emit();
      }

      if (this.isWeapon) {
        this.totalExtraOption = 3;
      } else if (OptionableItemTypeSet.has(this.itemType as any)) {
        const itemAegisName = item?.aegisName;
        this.totalExtraOption = ExtraOptionTable[itemAegisName] || 0;
      }

      if (this.isAcc) {
        if (this.isRefinable) {
          this.refineList = createNumberDropdownList({ from: 0, to: 18 })
        } else {
          this.refineList = []
          if (this.itemRefine > 0) {
            this.itemRefine = 0;
            this.itemRefineChange.emit(this.itemRefine);
          }
        }
      }
    } else {
      const e = this[`${itemType}Change`];
      const val = this[`${itemType}`];
      if (e instanceof EventEmitter) {
        e.emit(val);
      }
    }

    // Re-filter automatic equipment enchant slots on selection change
    if (this.isAutoEquipment && (itemType === 'enchant1Id' || itemType === 'enchant2Id')) {
      const { aegisName, name } = this.getItem();
      const enchants = getEnchants(aegisName) ?? getEnchants(name);
      const [e1, e2, e3] = Array.isArray(enchants) ? enchants : [];

      const mapToDropdown = (list: string[]) =>
        (list ?? [])
          .map((a: any) => this.mapEnchant.get(a))
          .filter(Boolean)
          .map((a: any) => ({ label: a.name, value: a.id, aegisName: a.aegisName }));

      // Rebuild base lists for downstream slots
      if (itemType === 'enchant1Id') {
        this.enchant2List = mapToDropdown(e2);
        this.enchant3List = mapToDropdown(e3);
      } else if (itemType === 'enchant2Id') {
        this.enchant3List = mapToDropdown(e3);
      }

      this.filterAutoEnchantLists();

      // Clear downstream slots if now invalid
      if (itemType === 'enchant1Id') {
        if (!this.enchant1Id) {
          if (this.enchant2Id) { this.enchant2Id = undefined; this.onSelectItem('enchant2Id'); }
          if (this.enchant3Id) { this.enchant3Id = undefined; this.onSelectItem('enchant3Id'); }
        } else if (this.enchant2Id && !this.enchant2List.find(a => a.value === this.enchant2Id)) {
          this.enchant2Id = undefined;
          this.onSelectItem('enchant2Id');
        }
      }
      if (itemType === 'enchant2Id') {
        if (!this.enchant2Id) {
          if (this.enchant3Id) { this.enchant3Id = undefined; this.onSelectItem('enchant3Id'); }
        } else if (this.enchant3Id && !this.enchant3List.find(a => a.value === this.enchant3Id)) {
          this.enchant3Id = undefined;
          this.onSelectItem('enchant3Id');
        }
      }
    }

    // console.log({ itemType, t: this.itemTypeMap[itemType], itemId })

    if (isEmitItemChange) {
      this.selectItemChange.emit({ itemType: this.itemTypeMap[itemType], itemId, refine });
    }
  }

  onClearItem(itemType: string) {
    this.clearItemEvent.emit(itemType);
  }

  onSelectGrade(grade: string) {
    this.itemGradeChange.emit(grade);
    this.gradeChange.emit({ itemType: this.itemType, itemId: this.itemId, grade });
  }

  onOptionChange(optionType: string, optionValue: any) {
    const e = this[`${optionType}Change`];
    if (e instanceof EventEmitter) {
      e.emit(optionValue?.value);
    }

    this.optionChange.emit(optionValue);
  }
}
