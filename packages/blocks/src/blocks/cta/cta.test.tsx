import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CTABlock } from "./cta";

describe(CTABlock, () => {
  test("CTABlock renders primary content", () => {
    const html = renderToStaticMarkup(
      <CTABlock
        eyebrow="Contact"
        title="Launch with confidence"
        buttons={[{ _key: "btn-1", href: "/contact", text: "Contact us" }]}
      />
    );

    expect(html).toMatch(/Launch with confidence/u);
    expect(html).toMatch(/Contact us/u);
  });

  test("CTABlock renders no empty heading without a title", () => {
    const html = renderToStaticMarkup(<CTABlock eyebrow="Contact" />);

    expect(html).not.toMatch(/<h2/u);
  });
});
