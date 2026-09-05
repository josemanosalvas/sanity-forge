import { TriangleAlert } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import type { dynamicIconImports } from "lucide-react/dynamic";

export const lucideIconPreview = (icon: keyof typeof dynamicIconImports) => (
  <DynamicIcon
    fallback={() => <TriangleAlert size={24} />}
    name={icon}
    size={24}
  />
);
