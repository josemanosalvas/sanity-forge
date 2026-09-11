import type { Locale } from "@repo/internationalization/locales";
import type { SiteKey } from "@repo/internationalization/sites";

import type { Strings } from "../lib/seed-documents.ts";

/**
 * Every source is open data. Artworks come from The Metropolitan Museum of
 * Art's Open Access collection (CC0; the build refuses anything not marked
 * public domain). Prose is the unmodified introduction of the Wikipedia article
 * named per locale (CC BY-SA 4.0; every page and footer credits it). The
 * Wikidata item ties the translations of one subject together, and the build
 * fails if a title resolves to a different item.
 */
export const MET_API =
  "https://collectionapi.metmuseum.org/public/collection/v1";

export const MET_OPEN_ACCESS_URL =
  "https://www.metmuseum.org/about-the-met/policies-and-documents/open-access";

export const USER_AGENT =
  "sanity-forge-seed/1.0 (https://github.com/josemanosalvas/sanity-forge)";

export interface WikipediaSubject {
  /** Wikidata item shared by every language edition, e.g. `Q5582`. */
  wikibase: string;
  /** Article title per locale, as written in that edition's URL. */
  titles: Partial<Record<Locale, string>>;
}

export interface SiteSeedSource {
  site: SiteKey;
  locales: readonly Locale[];
  home: {
    subject: WikipediaSubject;
    /** Met object IDs; the first is the hero and the featured showcase item. */
    works: readonly number[];
  };
  inner: {
    slug: string;
    subject: WikipediaSubject;
    works: readonly number[];
  };
}

export const sources: readonly SiteSeedSource[] = [
  {
    home: {
      subject: {
        titles: {
          de: "Post-Impressionismus",
          en: "Post-Impressionism",
          fr: "Post-impressionnisme",
        },
        wikibase: "Q166713",
      },
      works: [436_535, 438_817, 436_947, 437_984, 436_121, 438_722],
    },
    inner: {
      slug: "/vincent-van-gogh",
      subject: {
        titles: {
          de: "Vincent van Gogh",
          en: "Vincent van Gogh",
          fr: "Vincent van Gogh",
        },
        wikibase: "Q5582",
      },
      works: [436_532, 436_535, 437_984, 438_722, 459_123],
    },
    locales: ["en", "de", "fr"],
    site: "brand-a",
  },
  {
    home: {
      subject: {
        titles: { de: "Ukiyo-e", en: "Ukiyo-e" },
        wikibase: "Q185905",
      },
      works: [45_434, 37_245, 56_895, 37_337, 56_138, 55_735],
    },
    inner: {
      slug: "/hokusai",
      subject: {
        titles: { de: "Katsushika Hokusai", en: "Hokusai" },
        wikibase: "Q5586",
      },
      works: [36_491, 53_789, 57_004, 55_735, 56_138],
    },
    locales: ["en", "de"],
    site: "brand-b",
  },
];

export const strings: Record<Locale, Strings> = {
  de: {
    attribution: (title) =>
      `Text: Wikipedia-Autoren, „${title}“, Wikipedia, CC BY-SA 4.0, unveränderter Auszug der Einleitung.`,
    collection: "Sammlung des Met",
    copyright:
      "Bilder: The Metropolitan Museum of Art, CC0. Text: Wikipedia-Autoren, CC BY-SA 4.0.",
    home: "Startseite",
    imageCredit: "Bilddaten: The Met Open Access (CC0)",
    openAccessPolicy: "Open-Access-Richtlinie",
    openAccessText:
      "Das Metropolitan Museum of Art stellt Bilder und Daten seiner gemeinfreien Werke unter Creative Commons Zero (CC0) zur Verfügung. Jedes Bild auf dieser Seite verlinkt auf seinen Eintrag in der Sammlung.",
    openAccessTitle: "Open Access im Met",
    sources: "Quellen",
    textCredit: "Text: Wikipedia (CC BY-SA 4.0)",
    wikipedia: "Wikipedia",
    worksAtTheMet: "Werke im Met",
    worksBy: (artist) => `Werke von ${artist} im Met`,
  },
  en: {
    attribution: (title) =>
      `Text: Wikipedia contributors, "${title}", Wikipedia, CC BY-SA 4.0, unmodified excerpt of the introduction.`,
    collection: "The Met Collection",
    copyright:
      "Images: The Metropolitan Museum of Art, CC0. Text: Wikipedia contributors, CC BY-SA 4.0.",
    home: "Home",
    imageCredit: "Image data: The Met Open Access (CC0)",
    openAccessPolicy: "Open Access policy",
    openAccessText:
      "The Metropolitan Museum of Art releases images and data of its public-domain works under Creative Commons Zero (CC0). Every image on this site links to its record in the collection.",
    openAccessTitle: "Open Access at The Met",
    sources: "Sources",
    textCredit: "Text: Wikipedia (CC BY-SA 4.0)",
    wikipedia: "Wikipedia",
    worksAtTheMet: "Works at The Met",
    worksBy: (artist) => `Works by ${artist} at The Met`,
  },
  fr: {
    attribution: (title) =>
      `Texte : contributeurs de Wikipédia, « ${title} », Wikipédia, CC BY-SA 4.0, extrait non modifié de l'introduction.`,
    collection: "Collection du Met",
    copyright:
      "Images : The Metropolitan Museum of Art, CC0. Texte : contributeurs de Wikipédia, CC BY-SA 4.0.",
    home: "Accueil",
    imageCredit: "Données d'images : The Met Open Access (CC0)",
    openAccessPolicy: "Politique Open Access",
    openAccessText:
      "Le Metropolitan Museum of Art publie les images et les données de ses œuvres du domaine public sous Creative Commons Zero (CC0). Chaque image de ce site renvoie à sa fiche dans la collection.",
    openAccessTitle: "Open Access au Met",
    sources: "Sources",
    textCredit: "Texte : Wikipédia (CC BY-SA 4.0)",
    wikipedia: "Wikipédia",
    worksAtTheMet: "Œuvres au Met",
    worksBy: (artist) => `Œuvres de ${artist} au Met`,
  },
};
