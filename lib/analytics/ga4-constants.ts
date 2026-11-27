/**
 * Shared non-client constants for Consent Mode v2 and regional edge/client detection.
 */
export const CONSENT_STORAGE_KEY = "dailycalcwell_consent_v1";
export const REGION_COOKIE_NAME = "dcw_region";
export const GPC_COOKIE_NAME = "dcw_gpc";
export const DEFAULT_ADSENSE_CLIENT_ID = "ca-pub-8498634781020156";

export function getAdSenseClientId(): string {
  return (
    (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "").trim() ||
    DEFAULT_ADSENSE_CLIENT_ID
  );
}

/**
 * ISO 3166-1 alpha-2 country codes for EEA (27 EU + IS, LI, NO), UK, and Switzerland.
 */
export const EEA_UK_CH_COUNTRY_CODES = [
  "AT",
  "BE",
  "BG",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
  "GB",
] as const;
