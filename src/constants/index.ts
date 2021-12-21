export const MinRowCount = 9;
export const MaxRowCount = 24;

export const MinColCount = 9;
export const MaxColCount = 30;

export const MinMineCount = 10;
export const MaxMineCount = 668;

export const MinDensity = 0.1;
export const MaxDensity = 0.21;

export type Option<T = any, V = T> = {
  label: T;
  value: V;
};

export const DifficultyMap = {
  custom: 'custom',
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
} as const;
export type TDifficulty = keyof typeof DifficultyMap;
export const Difficulties: Option<
  keyof typeof DifficultyMap,
  typeof DifficultyMap[keyof typeof DifficultyMap]
>[] = [
  {
    label: 'custom',
    value: DifficultyMap.custom,
  },
  {
    label: 'easy',
    value: DifficultyMap.easy,
  },
  {
    label: 'medium',
    value: DifficultyMap.medium,
  },
  {
    label: 'hard',
    value: DifficultyMap.hard,
  },
];

export type TParam = {
  difficulty: TDifficulty;
  rowCount: number;
  colCount: number;
  mineCount: number;
};

export type TPresetMap = Record<keyof typeof DifficultyMap, TParam>;
export const PresetMap: TPresetMap = {
  [DifficultyMap.custom]: {
    difficulty: DifficultyMap.custom,
    rowCount: MinRowCount,
    colCount: MinColCount,
    mineCount: MinMineCount,
  },
  [DifficultyMap.easy]: {
    difficulty: DifficultyMap.easy,
    rowCount: 9,
    colCount: 9,
    mineCount: 10,
  },
  [DifficultyMap.medium]: {
    difficulty: DifficultyMap.medium,
    rowCount: 16,
    colCount: 16,
    mineCount: 40,
  },
  [DifficultyMap.hard]: {
    difficulty: DifficultyMap.hard,
    rowCount: 16,
    colCount: 30,
    mineCount: 99,
  },
};

export const StatusMap = {
  default: 'default',
  playing: 'playing',
  ended: 'ended',
} as const;
export type TStatus = keyof typeof StatusMap;

export const MatrixItemStatusMap = {
  default: 'default',
  flagged: 'flagged',
  opened: 'opened',
} as const;
export type TMatrixItemStatus = keyof typeof MatrixItemStatusMap;
export const MatrixItemTypeMap = {
  bomb: 'bomb',
  empty: 'empty',
  number: 'number',
} as const;
export type TMatrixItemType = keyof typeof MatrixItemTypeMap;
export type TMatrixItem = {
  type: TMatrixItemType;
  status: TMatrixItemStatus;
};
export type TMatrix = TMatrixItem[][];
