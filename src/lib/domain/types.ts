export type BuildingCode = string;

export type UnitCode = "CUR" | "AHU" | "CT" | "CS";

export type QuarterNumber = 1 | 2 | 3 | 4;

export type UnitId = `${BuildingCode}-${UnitCode}-${string}`;

export type QuarterYear = `${number}-Q${QuarterNumber}`;
