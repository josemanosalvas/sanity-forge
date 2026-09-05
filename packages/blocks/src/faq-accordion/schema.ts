import { MessageCircle } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

export const faqAccordionSchema = defineType({
  fields: [
    defineField({
      description:
        "The smaller text that sits above the title to provide context",
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
    }),
    defineField({
      description: "The large text that is the primary focus of the block",
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      description: "Additional context below the main title",
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),
    defineField({
      description: "Optional link for additional content or actions",
      fields: [
        defineField({
          description: "The text to display for the link",
          name: "title",
          title: "Link Title",
          type: "string",
        }),
        defineField({
          description: "A brief description of where the link leads to",
          name: "description",
          title: "Link Description",
          type: "string",
        }),
        defineField({
          description: "The destination URL for the link",
          name: "url",
          title: "URL",
          type: "customUrl",
        }),
      ],
      name: "link",
      title: "Link",
      type: "object",
    }),
    defineField({
      description:
        "Groups of questions shown as a switchable list. The first category is shown by default; visitors click a category to reveal its questions.",
      name: "categories",
      of: [
        defineArrayMember({
          fields: [
            defineField({
              description:
                'The label shown in the left-hand category list (for example "Components" or "Pricing")',
              name: "title",
              title: "Category Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              description:
                "Choose the questions and answers shown when this category is selected. Add them in the order you want visitors to see them.",
              name: "faqs",
              of: [
                defineArrayMember({
                  options: {
                    disableNew: true,
                    // FAQs are localized per document: only offer the ones
                    // written in this page's language.
                    filter: ({ document }) => {
                      const { language } = document as { language?: string };
                      return language
                        ? {
                            filter: "language == $language",
                            params: { language },
                          }
                        : {};
                    },
                  },
                  to: [{ type: "faq" }],
                  type: "reference",
                  // Weak so a category can reference draft/unpublished FAQ docs
                  // without failing mutations or triggering a strength mismatch.
                  weak: true,
                }),
              ],
              title: "FAQs",
              type: "array",
              validation: (Rule) => [Rule.required(), Rule.unique()],
            }),
          ],
          name: "faqCategory",
          preview: {
            prepare: ({ title, faqs }) => ({
              subtitle: `${faqs?.length ?? 0} FAQ${
                faqs?.length === 1 ? "" : "s"
              }`,
              title: title ?? "Untitled category",
            }),
            select: {
              faqs: "faqs",
              title: "title",
            },
          },
          title: "Category",
          type: "object",
        }),
      ],
      title: "Categories",
      type: "array",
    }),
  ],
  icon: MessageCircle,
  name: "faqAccordion",
  preview: {
    prepare: ({ title }) => ({
      subtitle: "FAQ Accordion",
      title: title ?? "Untitled",
    }),
    select: {
      title: "title",
    },
  },
  type: "object",
});
