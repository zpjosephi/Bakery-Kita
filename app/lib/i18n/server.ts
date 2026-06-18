import "server-only";
import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  getDictionary,
  isLocale,
  type Locale,
} from "./dictionaries";

// current locale from the `lang` cookie (defaults to English)
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDict() {
  return getDictionary(await getLocale());
}
