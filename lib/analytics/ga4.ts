"use client";

import {
  CONSENT_STORAGE_KEY,
  DEFAULT_ADSENSE_CLIENT_ID,
  EEA_UK_CH_COUNTRY_CODES,
  GPC_COOKIE_NAME,
  REGION_COOKIE_NAME,
  getAdSenseClientId,
} from "@/lib/analytics/ga4-constants";

export {
  CONSENT_STORAGE_KEY,
  DEFAULT_ADSENSE_CLIENT_ID,
  EEA_UK_CH_COUNTRY_CODES,
  GPC_COOKIE_NAME,
  REGION_COOKIE_NAME,
  getAdSenseClientId,
};

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  gpcOverridden?: boolean;
  updatedAt: string;
}

export type RegionMode = "eea" | "row" | "unknown";

export interface TcfConsentState {
  loaded: boolean;
  gdprApplies: boolean;
  adsAllowed: boolean;
  analyticsAllowed: boolean;
}

export interface TcDataPayload {
  gdprApplies?: boolean;
  eventStatus?: "tcloaded" | "cmpuishown" | "useractioncomplete";
  purpose?: {
    consents?: Record<string, boolean>;
  };
  vendor?: {
    consents?: Record<string, boolean>;
  };
}

export interface EffectiveConsent {
  analytics: boolean;
  advertising: boolean;
  explicit: boolean;
  regionMode: RegionMode;
  managedByGoogleCmp: boolean;
  gpcActive: boolean;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  try {
    const prefix = `${name}=`;
    const parts = document.cookie ? document.cookie.split(";") : [];
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith(prefix)) {
        return decodeURIComponent(trimmed.slice(prefix.length));
      }
    }
  } catch {
    // Ignore cookie access errors
  }
  return null;
}

export function readRegionCookie(): "eea" | "row" | null {
  const val = readCookie(REGION_COOKIE_NAME);
  if (val === "eea" || val === "row") return val;
  return null;
}

export function hasGlobalPrivacyControl(): boolean {
  if (typeof window === "undefined") return false;
  const nav =
    typeof navigator !== "undefined"
      ? (navigator as Navigator & { globalPrivacyControl?: boolean })
      : null;
  return nav?.globalPrivacyControl === true || readCookie(GPC_COOKIE_NAME) === "1";
}

export function isGoogleGdprCmpEnabled(): boolean {
  const adsClient = getAdSenseClientId();
  return (
    Boolean(adsClient) &&
    process.env.NEXT_PUBLIC_ADSENSE_GDPR_CMP === "true"
  );
}

export function parseTcfData(tcData: TcDataPayload | null | undefined): TcfConsentState | null {
  if (!tcData || typeof tcData !== "object") return null;
  if (
    tcData.eventStatus !== "tcloaded" &&
    tcData.eventStatus !== "useractioncomplete"
  ) {
    return null;
  }

  const gdprApplies = Boolean(tcData.gdprApplies);
  if (!gdprApplies) {
    return {
      loaded: true,
      gdprApplies: false,
      adsAllowed: true,
      analyticsAllowed: true,
    };
  }

  const purposes = tcData.purpose?.consents ?? {};
  const vendors = tcData.vendor?.consents;
  const hasPurpose1 = Boolean(purposes["1"]);
  const hasGoogleVendor = vendors ? Boolean(vendors["755"]) : hasPurpose1;

  const adsAllowed =
    hasPurpose1 &&
    hasGoogleVendor &&
    Boolean(purposes["3"]) &&
    Boolean(purposes["4"]);

  const analyticsAllowed =
    hasPurpose1 &&
    Boolean(purposes["8"] ?? purposes["9"] ?? purposes["7"] ?? purposes["10"]);

  return {
    loaded: true,
    gdprApplies: true,
    adsAllowed,
    analyticsAllowed,
  };
}

export function getRegionMode(tcf?: TcfConsentState | null): RegionMode {
  if (tcf?.loaded) {
    return tcf.gdprApplies ? "eea" : "row";
  }
  const cookieRegion = readRegionCookie();
  if (cookieRegion === "eea" || cookieRegion === "row") {
    return cookieRegion;
  }
  return "unknown";
}

export function readStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      advertising: Boolean(parsed.advertising),
      gpcOverridden: Boolean(parsed.gpcOverridden),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return null;
  }
}

let latestTcfState: TcfConsentState | null = null;

export function setLatestTcfState(tcf: TcfConsentState | null): void {
  latestTcfState = tcf;
}

export function getLatestTcfState(): TcfConsentState | null {
  return latestTcfState;
}

export function getEffectiveConsent(
  tcf: TcfConsentState | null = latestTcfState
): EffectiveConsent {
  const gpcActive = hasGlobalPrivacyControl();
  const regionMode = getRegionMode(tcf);
  const cmpEnabled = isGoogleGdprCmpEnabled();

  if (tcf?.loaded && tcf.gdprApplies) {
    return {
      analytics: tcf.analyticsAllowed,
      advertising: tcf.adsAllowed,
      explicit: true,
      regionMode: "eea",
      managedByGoogleCmp: true,
      gpcActive,
    };
  }

  if (regionMode === "eea" && cmpEnabled) {
    return {
      analytics: false,
      advertising: false,
      explicit: false,
      regionMode: "eea",
      managedByGoogleCmp: true,
      gpcActive,
    };
  }

  const saved = readStoredConsent();
  if (saved) {
    const adsAllowed =
      saved.advertising && (!gpcActive || Boolean(saved.gpcOverridden));
    return {
      analytics: saved.analytics,
      advertising: adsAllowed,
      explicit: true,
      regionMode,
      managedByGoogleCmp: false,
      gpcActive,
    };
  }

  if (regionMode === "row") {
    return {
      analytics: true,
      advertising: !gpcActive,
      explicit: false,
      regionMode: "row",
      managedByGoogleCmp: false,
      gpcActive,
    };
  }

  return {
    analytics: false,
    advertising: false,
    explicit: false,
    regionMode,
    managedByGoogleCmp: false,
    gpcActive,
  };
}

export function syncAdSenseConsent(
  advertising: boolean,
  managedByGoogleCmp = false
): void {
  if (typeof window === "undefined" || managedByGoogleCmp) return;
  const queue = (window.adsbygoogle = window.adsbygoogle || []) as unknown[] & {
    requestNonPersonalizedAds?: number;
  };
  queue.requestNonPersonalizedAds = advertising ? 0 : 1;
}

export function syncGoogleConsent(
  analytics: boolean,
  advertising: boolean,
  managedByGoogleCmp = false
): void {
  if (typeof window === "undefined") return;
  if (!managedByGoogleCmp) {
    window.dataLayer = window.dataLayer || [];
    const gtagFn =
      typeof window.gtag === "function"
        ? window.gtag
        : (...args: unknown[]) => {
            window.dataLayer?.push(args);
          };
    window.gtag = gtagFn;
    gtagFn("consent", "update", {
      analytics_storage: analytics ? "granted" : "denied",
      ad_storage: advertising ? "granted" : "denied",
      ad_user_data: advertising ? "granted" : "denied",
      ad_personalization: advertising ? "granted" : "denied",
    });
  }
  syncAdSenseConsent(advertising, managedByGoogleCmp);
}

export function saveStoredConsent(
  analytics: boolean,
  advertising: boolean
): ConsentState {
  const gpcActive = hasGlobalPrivacyControl();
  const state: ConsentState = {
    necessary: true,
    analytics,
    advertising,
    gpcOverridden: advertising && gpcActive,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(
        new CustomEvent("dailycalcwell-consent-changed", { detail: state })
      );
    } catch {
      // Storage may be unavailable in strict private browsing modes
    }
    syncGoogleConsent(analytics, advertising, false);
  }
  return state;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
    __tcfapi?: (
      command: string,
      version: number,
      callback: (tcData: TcDataPayload, success: boolean) => void,
      parameter?: unknown
    ) => void;
    googlefc?: {
      showRevocationMessage?: () => void;
    };
  }
}

/**
 * Privacy-first GA4 event tracker.
 * Strictly avoids sending personal or health input values as event parameters.
 */
export function trackEvent(
  eventName:
    | "calculator_used"
    | "calculation_completed"
    | "category_navigation"
    | "outbound_click",
  params: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  const effective = getEffectiveConsent();
  if (!effective.analytics) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}
