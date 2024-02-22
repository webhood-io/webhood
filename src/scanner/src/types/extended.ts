import { BaseSystemFields, ScansStatusOptions } from "./pocketbase-types";

export type ScanStatsRecord = {
  id: string;
  status: ScansStatusOptions;
  count_items: number;
} & BaseSystemFields;
