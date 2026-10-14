"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

/**
 * Interface text for block controls, announcements, and fallbacks.
 * `BlockLabelsProvider` supplies translations for the visitor's language.
 * Without a provider, Storybook and tests use the English defaults.
 */
export interface BlockLabels {
  /** Announced after a code block's copy button succeeds. */
  copied: string;
  /** Accessible name of the copy button in code blocks. */
  copyCode: string;
  /** Rendered in place of a link whose target could not be resolved. */
  linkBroken: string;
  /** Accessible name of the logo cloud region. */
  logoCloud: string;
  newsletter: {
    emailLabel: string;
    emailPlaceholder: string;
    subscribe: string;
    /** Accessible name of the submit button. */
    subscribeToNewsletter: string;
    /** Submit button while the form is pending; also announced. */
    subscribing: string;
  };
  /** Screen-reader suffix on links that open a new tab. */
  opensInNewTab: string;
  /** Accessible name of a video's play button, with the clip's title when it has one. */
  playVideo: (title?: string) => string;
  /** Shown in place of a block whose renderer threw. */
  sectionFailed: string;
  /** Heading of a showcase grid that has no title of its own. */
  showcase: string;
  /** Retry control of a failed block. */
  tryAgain: string;
  /** Accessible name of a showcase card that links out to the named project. */
  visit: (name: string) => string;
}

export const defaultBlockLabels: BlockLabels = {
  copied: "Copied to clipboard",
  copyCode: "Copy code to clipboard",
  linkBroken: "Link broken",
  logoCloud: "Logo cloud",
  newsletter: {
    emailLabel: "Email address",
    emailPlaceholder: "Enter your email address",
    subscribe: "Subscribe",
    subscribeToNewsletter: "Subscribe to newsletter",
    subscribing: "Subscribing…",
  },
  opensInNewTab: "(opens in a new tab)",
  playVideo: (title) => (title ? `Play video: ${title}` : "Play video"),
  sectionFailed: "This section could not be displayed.",
  showcase: "Showcase",
  tryAgain: "Try again",
  visit: (name) => `Visit ${name}`,
};

const BlockLabelsContext = createContext<BlockLabels>(defaultBlockLabels);

export const BlockLabelsProvider = ({
  labels,
  children,
}: Readonly<{ labels: BlockLabels; children: ReactNode }>) => (
  <BlockLabelsContext.Provider value={labels}>
    {children}
  </BlockLabelsContext.Provider>
);

export const useBlockLabels = (): BlockLabels => useContext(BlockLabelsContext);
