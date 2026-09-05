import { describe, expect, test } from "vitest";

import { subscribeNewsletterToMarkdown } from "./markdown";

const para = (text: string) => [
  {
    _type: "block",
    children: [{ _type: "span", text }],
    style: "normal",
  },
];

describe(subscribeNewsletterToMarkdown, () => {
  test("subscribeNewsletterToMarkdown returns empty string for a fully empty block", () => {
    expect(subscribeNewsletterToMarkdown({}, {})).toBe("");
  });

  test("subscribeNewsletterToMarkdown renders title only", () => {
    expect(subscribeNewsletterToMarkdown({ title: "Subscribe" }, {})).toBe(
      "## Subscribe"
    );
  });

  test("subscribeNewsletterToMarkdown renders title and subTitle, and omits the form's helperText like the page does", () => {
    const result = subscribeNewsletterToMarkdown(
      {
        helperText: para("No spam, ever."),
        subTitle: para("Get weekly updates."),
        title: "Stay in the loop",
      },
      {}
    );
    expect(result).toBe("## Stay in the loop\n\nGet weekly updates.");
  });

  test("subscribeNewsletterToMarkdown escapes markdown chars in title", () => {
    const result = subscribeNewsletterToMarkdown(
      { title: "Subscribe to #updates" },
      {}
    );
    expect(result).toBe("## Subscribe to \\#updates");
  });

  test("subscribeNewsletterToMarkdown handles undefined subTitle and helperText", () => {
    expect(() =>
      subscribeNewsletterToMarkdown(
        { helperText: undefined, subTitle: undefined, title: "Sub" },
        {}
      )
    ).not.toThrow();
  });

  test("subscribeNewsletterToMarkdown emits no form or input markup", () => {
    const result = subscribeNewsletterToMarkdown(
      { subTitle: para("Enter your email."), title: "Subscribe" },
      {}
    );
    expect(result).not.toMatch(/<(?:form|input|button)/iu);
  });
});
