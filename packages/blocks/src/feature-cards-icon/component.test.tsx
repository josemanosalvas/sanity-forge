import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";

import { FeatureCardsWithIcon } from "./component";

test("FeatureCardsWithIcon renders the card list", () => {
  const html = renderToStaticMarkup(
    <FeatureCardsWithIcon
      title="Highlights"
      cards={[
        {
          _key: "card-1",
          icon: "boxes",
          title: "Reusable",
          richText: [
            {
              _type: "block",
              _key: "block-1",
              children: [{ _type: "span", text: "One shared implementation." }],
            },
          ],
        },
      ]}
    />
  );

  expect(html).toMatch(/Highlights/);
  expect(html).toMatch(/Reusable/);
  expect(html).toMatch(/One shared implementation/);
});

test("FeatureCardsWithIcon renders with no cards", () => {
  const html = renderToStaticMarkup(
    <FeatureCardsWithIcon title="No cards yet" />
  );

  expect(html).toMatch(/No cards yet/);
});
