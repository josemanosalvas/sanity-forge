import { isLocale } from "@repo/internationalization/locales";
import { absoluteUrl } from "@repo/internationalization/routing";
import {
  getDefaultLocale,
  getSiteOrDefault,
} from "@repo/internationalization/sites";
import { CopyIcon } from "@sanity/icons/Copy";
import { Box, Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import type { ChangeEvent } from "react";
import { useCallback, useMemo } from "react";
import { set, unset, useFormValue } from "sanity";
import type { ObjectFieldProps, SanityDocument, SlugValue } from "sanity";

import { previewOrigin } from "../lib/site";
import { generateSlugFromTitle } from "../lib/slug-validation";
import { ValidationMessages } from "./validation-messages";

const monoStyle = { fontFamily: "monospace" } as const;

/**
 * Slug input that previews the public URL for the document's site and
 * language, so editors see the locale prefix without typing it.
 */
export const PathnameFieldComponent = (props: ObjectFieldProps<SlugValue>) => {
  const {
    inputProps: { onChange, value, readOnly },
    title,
    description,
    validation,
  } = props;

  const document = useFormValue([]) as SanityDocument & {
    site?: string;
    language?: string;
    title?: string;
  };
  const currentSlug = value?.current || "";

  const errors = useMemo(
    () => [
      ...new Set(
        validation
          .filter((v) => v.level === "error")
          .flatMap((v) => v.message.split("; "))
      ),
    ],
    [validation]
  );
  const warnings = useMemo(
    () => [
      ...new Set(
        validation
          .filter((v) => v.level === "warning")
          .flatMap((v) => v.message.split("; "))
      ),
    ],
    [validation]
  );

  const site = getSiteOrDefault(document?.site);
  const locale = isLocale(document?.language)
    ? document.language
    : getDefaultLocale(site);
  const pathname = currentSlug.startsWith("/")
    ? currentSlug
    : `/${currentSlug}`;
  const fullUrl = absoluteUrl(previewOrigin(site), site, locale, pathname);

  const handleChange = useCallback(
    (newValue?: string) => {
      const patch =
        typeof newValue === "string"
          ? set({ _type: "slug", current: newValue })
          : unset();
      onChange(patch);
    },
    [onChange]
  );

  const handleSlugChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleChange(e.target.value);
    },
    [handleChange]
  );

  const handleGenerate = useCallback(() => {
    const documentTitle = document?.title;
    if (!documentTitle?.trim()) {
      return;
    }
    const generatedSlug = generateSlugFromTitle(documentTitle, currentSlug);
    if (generatedSlug) {
      handleChange(generatedSlug);
    }
  }, [document?.title, currentSlug, handleChange]);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      // Clipboard access can be denied; the URL stays visible to copy manually.
    }
  }, [fullUrl]);

  const generateDisabled =
    !(typeof document?.title === "string" && document.title.trim()) || readOnly;

  return (
    <Stack gap={4}>
      {(title || description) && (
        <Stack gap={2}>
          {title && (
            <Text size={1} weight="semibold">
              {title}
            </Text>
          )}
          {description && (
            <Text muted size={1}>
              {description}
            </Text>
          )}
        </Stack>
      )}

      <Stack gap={4}>
        <Stack gap={2}>
          <Text size={1} weight="medium">
            URL Path
          </Text>
          <Flex align="center" gap={2}>
            <Box flex={1}>
              <TextInput
                disabled={readOnly}
                fontSize={1}
                onChange={handleSlugChange}
                placeholder="e.g., /about-us or /pricing/teams"
                style={monoStyle}
                value={currentSlug}
              />
            </Box>
            <Button
              disabled={generateDisabled}
              fontSize={1}
              mode="ghost"
              onClick={handleGenerate}
              text="Generate"
              tone="primary"
            />
          </Flex>
        </Stack>

        <ValidationMessages errors={errors} warnings={warnings} />

        <Text muted size={1}>
          Must start with a forward slash (/). Use forward slashes to create
          nested paths. Only lowercase letters, numbers, hyphens, and slashes
          are allowed. The language prefix is added automatically.
        </Text>

        {currentSlug && errors.length === 0 && (
          <Stack gap={2}>
            <Text size={1} weight="medium">
              Preview
            </Text>
            <Flex align="center" gap={2}>
              <Card border flex={1} padding={3} radius={2} tone="transparent">
                <Text muted size={1} style={monoStyle}>
                  {fullUrl}
                </Text>
              </Card>
              <Button
                icon={CopyIcon}
                mode="ghost"
                onClick={handleCopyUrl}
                padding={2}
                title="Copy URL"
              />
            </Flex>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
