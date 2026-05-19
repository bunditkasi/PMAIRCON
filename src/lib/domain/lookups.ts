import type { UnitCode } from "./types";

export const UNIT_CODES: readonly UnitCode[] = ["CUR", "AHU", "CT", "CS"];

export const UNIT_CODE_SET = new Set<UnitCode>(UNIT_CODES);
