import type { Dictionary } from "@/lib/i18n/en";
import type { BuildStage } from "@/lib/types";

export function buildStageLabel(stage: BuildStage, t: Dictionary): string {
  switch (stage) {
    case "stock":
      return t.garage.stock;
    case "stage_1":
      return t.garage.stage1;
    case "stage_2":
      return t.garage.stage2;
    case "stage_3":
      return t.garage.stage3;
    case "track":
      return t.garage.track;
    case "show":
      return t.garage.show;
    case "custom":
      return t.garage.custom;
    default:
      return stage;
  }
}
