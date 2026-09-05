import { defineField } from "sanity";

import { PathnameFieldComponent } from "../../components/slug-field";
import {
  createSlugErrorValidator,
  isUniqueSlug,
  createSlugWarningValidator,
  getDocumentTypeConfig,
} from "../../lib/slug-validation";

export const documentSlugField = (
  documentType: string,
  options: {
    group?: string;
    description?: string;
    title?: string;
  } = {}
) => {
  const {
    group,
    description = `The public path where people find this ${documentType}, without a language prefix (automatically created from the title)`,
    title = "URL",
  } = options;

  return defineField({
    components: {
      field: PathnameFieldComponent,
    },
    description,
    group,
    name: "slug",
    options: { isUnique: isUniqueSlug },
    title,
    type: "slug",
    validation: (rule) => {
      const config = getDocumentTypeConfig(documentType);
      return [
        rule.custom(createSlugErrorValidator(config)),
        rule.custom(createSlugWarningValidator(config)).warning(),
      ];
    },
  });
};
