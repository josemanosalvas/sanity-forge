import { BlockEyebrow } from "../../components/block-eyebrow";
import type { RichTextValue } from "../../components/rich-text";
import { RichText } from "../../components/rich-text";

export interface RichTextBlockProps {
  eyebrow?: string | null;
  richText?: RichTextValue;
  title?: string | null;
}

export const RichTextBlock = ({
  richText,
  title,
  eyebrow,
}: Readonly<RichTextBlockProps>) => (
  <section className="block-section">
    <div className="container">
      <div className="flex flex-col items-start gap-6">
        <BlockEyebrow eyebrow={eyebrow} />
        {title && <h2 className="block-title max-w-2xl">{title}</h2>}
      </div>
      {richText && (
        <div className="mt-8 max-w-3xl">
          <RichText richText={richText} />
        </div>
      )}
    </div>
  </section>
);
