import { Mail } from "lucide-react";
import { defineField, defineType } from "sanity";

import {
  definePortableTextField,
  imageWithAltField,
} from "../lib/schema-fields";

export const subscribeNewsletterSchema = defineType({
  fields: [
    defineField({
      description:
        "The main heading of the newsletter section. The sign-up form itself appears once the site connects a subscription handler.",
      name: "title",
      title: "Title",
      type: "string",
    }),
    definePortableTextField(["block"], {
      description:
        "The short paragraph beneath the title, telling visitors what they will receive",
      name: "subTitle",
      title: "SubTitle",
    }),
    definePortableTextField(["block"], {
      description:
        "The small print under the form, for example how often you send emails or a link to your privacy policy. Shown only together with the form.",
      name: "helperText",
      title: "Helper Text",
    }),
    defineField({
      description:
        "An optional customer testimonial shown in a panel beside the newsletter copy. Leave every field empty to hide the panel entirely.",
      fields: [
        defineField({
          description:
            'The small uppercase label above the quote, for example "Testimonials"',
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
        }),
        definePortableTextField(["block"], {
          description:
            "The testimonial quote. Use the Strong style to emphasize the sentences that should stand out brightly; the rest of the text appears muted.",
          name: "quote",
          title: "Quote",
        }),
        defineField({
          description:
            'The full name of the person giving the testimonial, for example "Jane Doe"',
          name: "authorName",
          title: "Author Name",
          type: "string",
        }),
        defineField({
          description:
            'The job title and company of the person, for example "CEO at Acme Inc"',
          name: "authorRole",
          title: "Author Role",
          type: "string",
        }),
        imageWithAltField({
          description:
            "A photo of the person giving the testimonial, shown as a small rounded avatar. Remember to add alt text.",
          name: "authorImage",
          title: "Author Image",
        }),
      ],
      name: "testimonial",
      title: "Testimonial",
      type: "object",
    }),
  ],
  icon: Mail,
  name: "subscribeNewsletter",
  preview: {
    prepare: ({ title }) => ({
      subtitle: "Subscribe Newsletter",
      title: title ?? "Untitled",
    }),
    select: {
      title: "title",
    },
  },
  title: "Subscribe Newsletter",
  type: "object",
});
