import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { FeatureCardsWithIcon } from "./component";

describe(FeatureCardsWithIcon, () => {
  test("FeatureCardsWithIcon renders the card list", () => {
    const html = renderToStaticMarkup(
      <FeatureCardsWithIcon
        title="Highlights"
        cards={[
          {
            _key: "card-1",
            icon: "boxes",
            richText: [
              {
                _key: "block-1",
                _type: "block",
                children: [
                  { _type: "span", text: "One shared implementation." },
                ],
              },
            ],
            title: "Reusable",
          },
        ]}
      />
    );

    expect(html).toMatch(/Highlights/u);
    expect(html).toMatch(/Reusable/u);
    expect(html).toMatch(/One shared implementation/u);
  });

  test("FeatureCardsWithIcon renders with no cards", () => {
    const html = renderToStaticMarkup(
      <FeatureCardsWithIcon title="No cards yet" />
    );

    expect(html).toMatch(/No cards yet/u);
  });
});
