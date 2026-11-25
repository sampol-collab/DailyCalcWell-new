import {
  CalculatorMeta,
  getSiteUrl,
  SITE_NAME,
} from "../constants/calculators";
import {
  DEFAULT_LOCALE,
  LOCALE_CONFIG,
  Locale,
  localizePath,
} from "../i18n/config";
import { getUiDictionary } from "../i18n/ui";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function buildWebSiteSchema(locale: Locale = DEFAULT_LOCALE) {
  const siteUrl = getSiteUrl();
  const ui = getUiDictionary(locale);
  const localizedHome = localizePath("/", locale);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "DailyCalcWell Online Calculators",
    description: ui.siteTagline,
    inLanguage: LOCALE_CONFIG[locale].hreflang,
    url: `${siteUrl}${localizedHome}`,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}${localizedHome}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: `${siteUrl}/`,
    logo: `${siteUrl}/icon-512.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "contact@dailycalcwell.com",
    },
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function buildCollectionPageSchema(params: {
  name: string;
  description: string;
  path: string;
  items: CalculatorMeta[];
  locale?: Locale;
}) {
  const { name, description, path, items, locale = DEFAULT_LOCALE } = params;
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: pageUrl,
    inLanguage: LOCALE_CONFIG[locale].hreflang,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: item.name,
        url: `${siteUrl}${localizePath(`/${item.slug}/`, locale)}`,
      })),
    },
  };
}

export function buildWebApplicationSchema(
  calc: CalculatorMeta,
  locale: Locale = DEFAULT_LOCALE
) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: calc.name,
    description: calc.seoDescription,
    inLanguage: LOCALE_CONFIG[locale].hreflang,
    url: `${siteUrl}${localizePath(`/${calc.slug}/`, locale)}`,
    image: `${siteUrl}/og-image.png`,
    dateModified: calc.lastReviewed,
    isAccessibleForFree: true,
    applicationCategory:
      calc.category === "health" ? "HealthApplication" : "UtilitiesApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: `${siteUrl}/`,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function buildFaqSchema(faqs: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
