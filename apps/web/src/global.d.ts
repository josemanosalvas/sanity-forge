import type { Locale } from "@repo/internationalization/locales";
import type { AppFormats, Messages } from "@repo/internationalization/request";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
    Formats: AppFormats;
  }
}
