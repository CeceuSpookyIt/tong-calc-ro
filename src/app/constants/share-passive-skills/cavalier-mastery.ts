import { PassiveSkillModel } from '../../jobs/_character-base.abstract';

export const CavalierMastery: PassiveSkillModel = {
  label: 'Domínio de Montaria',
  name: 'Cavalier Mastery',
  inputType: 'dropdown',
  dropdown: [
    { label: '-', value: 0, isUse: false },
    { label: 'Lv 5', value: 5, skillLv: 5, isUse: true },
  ],
};
