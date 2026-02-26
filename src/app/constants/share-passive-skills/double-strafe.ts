import { PassiveSkillModel } from '../../jobs/_character-base.abstract';

export const DoubleStrafeFn = (): PassiveSkillModel => ({
  label: 'Ataque Duplo',
  name: 'Double Strafe',
  inputType: 'dropdown',
  isEquipAtk: true,
  dropdown: [
    { label: '-', value: 0, isUse: false },
    { label: 'Lv 10', value: 10, skillLv: 10, isUse: true },
  ],
});
