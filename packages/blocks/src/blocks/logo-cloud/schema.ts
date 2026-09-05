import { Images } from "lucide-react";
import { defineField, defineType } from "sanity";

import { logoLinkItem } from "../../lib/schema-fields";

const logoCloudItem = logoLinkItem("logoCloudItem");

export const logoCloudSchema = defineType({
  fields: [
    defineField({
      description: "Add the partner or brand logos to display in the row",
      name: "logos",
      of: [logoCloudItem],
      title: "Logos",
      type: "array",
    }),
  ],
  icon: Images,
  name: "logoCloud",
  preview: {
    prepare: ({ logos = [] }) => {
      const logoCount = logos.length;
      const logoLabel = logoCount === 1 ? "logo" : "logos";

      return {
        subtitle: `${logoCount} ${logoLabel}`,
        title: "Logo Cloud",
      };
    },
    select: {
      logos: "logos",
    },
  },
  title: "Logo Cloud",
  type: "object",
});
