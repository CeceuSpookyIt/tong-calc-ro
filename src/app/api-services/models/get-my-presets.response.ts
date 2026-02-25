import { RoPresetModel } from './ro-preset-model';

export type GetMyPresetsResponse = Omit<RoPresetModel, 'model' | 'userId'>[];
