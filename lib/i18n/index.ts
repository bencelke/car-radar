import { de } from "@/lib/i18n/de";
import { en, type Dictionary } from "@/lib/i18n/en";

export type Locale = "en" | "de";

const dictionaries: Record<Locale, Dictionary> = { en, de };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

export type { Dictionary };
export { en, de };
