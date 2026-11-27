import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";
import {
  CONSENT_STORAGE_KEY,
  GPC_COOKIE_NAME,
  REGION_COOKIE_NAME,
  getEffectiveConsent,
  parseTcfData,
  saveStoredConsent,
  setLatestTcfState,
  syncAdSenseConsent,
  syncGoogleConsent,
  trackEvent,
} from "../lib/analytics/ga4";
import { SUPPORTED_LOCALES } from "../lib/i18n/config";
import { getUiDictionary } from "../lib/i18n/ui";

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  clear(): void {
    this.map.clear();
  }
}

function setupMockBrowser(opts: {
  cookie?: string;
  gpc?: boolean;
  adsEnabled?: boolean;
  adsClient?: string;
  gdprCmp?: boolean;
}) {
  const storage = new MemoryStorage();
  const dispatchedEvents: string[] = [];
  const dataLayer: unknown[][] = [];
  const gtagCalls: unknown[][] = [];
  const adsbygoogle: unknown[] & { requestNonPersonalizedAds?: number } = [];

  const mockWindow = {
    localStorage: storage,
    dataLayer,
    adsbygoogle,
    gtag: (...args: unknown[]) => {
      gtagCalls.push(args);
      dataLayer.push(args);
    },
    dispatchEvent: (ev: { type?: string }) => {
      if (ev?.type) dispatchedEvents.push(ev.type);
      return true;
    },
  };

  Object.defineProperty(globalThis, "window", {
    value: mockWindow,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "document", {
    value: { cookie: opts.cookie ?? "" },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "navigator", {
    value: { globalPrivacyControl: Boolean(opts.gpc) },
    configurable: true,
    writable: true,
  });
  if (typeof globalThis.CustomEvent === "undefined") {
    Object.defineProperty(globalThis, "CustomEvent", {
      value: class MockCustomEvent {
        type: string;
        detail: unknown;
        constructor(type: string, init?: { detail?: unknown }) {
          this.type = type;
          this.detail = init?.detail;
        }
      },
      configurable: true,
      writable: true,
    });
  }

  process.env.NEXT_PUBLIC_ADSENSE_ENABLED = opts.adsEnabled ? "true" : "false";
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID =
    opts.adsClient ?? (opts.adsEnabled ? "ca-pub-1234567890123456" : "");
  process.env.NEXT_PUBLIC_ADSENSE_GDPR_CMP = opts.gdprCmp ? "true" : "false";

  setLatestTcfState(null);

  return { storage, dataLayer, gtagCalls, adsbygoogle, dispatchedEvents };
}

test("proxy detects EEA, UK, Switzerland, US, India and Sec-GPC headers cleanly", () => {
  for (const country of ["DE", "FR", "GB", "CH", "NO"]) {
    const encoded = Buffer.from(JSON.stringify({ country: { code: country } })).toString(
      "base64"
    );
    const req = new NextRequest("https://dailycalcwell.com/bmi-calculator/", {
      headers: { "x-nf-geo": encoded },
    });
    const res = proxy(req);
    assert.equal(
      res.cookies.get(REGION_COOKIE_NAME)?.value,
      "eea",
      `Expected ${country} to resolve to eea`
    );
  }

  for (const [headerName, country] of [
    ["cf-ipcountry", "US"],
    ["x-vercel-ip-country", "IN"],
    ["cloudfront-viewer-country", "CA"],
  ] as const) {
    const req = new NextRequest("https://dailycalcwell.com/percentage-calculator/", {
      headers: { [headerName]: country },
    });
    const res = proxy(req);
    assert.equal(
      res.cookies.get(REGION_COOKIE_NAME)?.value,
      "row",
      `Expected ${country} via ${headerName} to resolve to row`
    );
  }

  const gpcReq = new NextRequest("https://dailycalcwell.com/", {
    headers: { "sec-gpc": "1", "cf-ipcountry": "US" },
  });
  const gpcRes = proxy(gpcReq);
  assert.equal(gpcRes.cookies.get(GPC_COOKIE_NAME)?.value, "1");
  assert.equal(gpcRes.cookies.get(REGION_COOKIE_NAME)?.value, "row");

  const clearGpcReq = new NextRequest("https://dailycalcwell.com/", {
    headers: { cookie: `${GPC_COOKIE_NAME}=1` },
  });
  const clearGpcRes = proxy(clearGpcReq);
  assert.equal(clearGpcRes.cookies.get(GPC_COOKIE_NAME)?.value, "");
});

test("parseTcfData enforces Google Vendor 755 and required IAB TCF purposes", () => {
  assert.equal(parseTcfData({ eventStatus: "cmpuishown", gdprApplies: true }), null);

  const nonEea = parseTcfData({ eventStatus: "tcloaded", gdprApplies: false });
  assert.deepEqual(nonEea, {
    loaded: true,
    gdprApplies: false,
    adsAllowed: true,
    analyticsAllowed: true,
  });

  const eeaDenied = parseTcfData({
    eventStatus: "useractioncomplete",
    gdprApplies: true,
    purpose: { consents: { "1": true, "3": false, "4": true, "8": false } },
    vendor: { consents: { "755": true } },
  });
  assert.deepEqual(eeaDenied, {
    loaded: true,
    gdprApplies: true,
    adsAllowed: false,
    analyticsAllowed: false,
  });

  const eeaMissingGoogleVendor = parseTcfData({
    eventStatus: "tcloaded",
    gdprApplies: true,
    purpose: { consents: { "1": true, "3": true, "4": true, "8": true } },
    vendor: { consents: { "755": false } },
  });
  assert.equal(eeaMissingGoogleVendor?.adsAllowed, false);

  const eeaGranted = parseTcfData({
    eventStatus: "useractioncomplete",
    gdprApplies: true,
    purpose: { consents: { "1": true, "3": true, "4": true, "8": true } },
    vendor: { consents: { "755": true } },
  });
  assert.deepEqual(eeaGranted, {
    loaded: true,
    gdprApplies: true,
    adsAllowed: true,
    analyticsAllowed: true,
  });
});

test("Consent behavior across EEA (with/without Google CMP), India, US, and GPC", () => {
  // 1. EEA/UK/CH with Google Privacy & Messaging GDPR CMP enabled
  const eeaCmp = setupMockBrowser({
    cookie: `${REGION_COOKIE_NAME}=eea`,
    adsEnabled: true,
    gdprCmp: true,
  });
  const eeaInitial = getEffectiveConsent();
  assert.equal(eeaInitial.managedByGoogleCmp, true);
  assert.equal(eeaInitial.analytics, false);
  assert.equal(eeaInitial.advertising, false);
  // Google CMP controls AdSense NPA directly; custom syncAdSenseConsent must be a no-op
  syncAdSenseConsent(false, true);
  assert.equal(eeaCmp.adsbygoogle.requestNonPersonalizedAds, undefined);

  // When TCF callback grants consent, trackEvent should work
  setLatestTcfState(
    parseTcfData({
      eventStatus: "useractioncomplete",
      gdprApplies: true,
      purpose: { consents: { "1": true, "3": true, "4": true, "8": true } },
      vendor: { consents: { "755": true } },
    })
  );
  trackEvent("calculator_used", { calculator_slug: "bmi-calculator" });
  assert.equal(eeaCmp.gtagCalls.length, 1);

  // 2. EEA with Google CMP disabled -> custom banner opt-in required
  setupMockBrowser({
    cookie: `${REGION_COOKIE_NAME}=eea`,
    adsEnabled: true,
    gdprCmp: false,
  });
  const eeaCustomInitial = getEffectiveConsent();
  assert.equal(eeaCustomInitial.managedByGoogleCmp, false);
  assert.equal(eeaCustomInitial.analytics, false);
  assert.equal(eeaCustomInitial.advertising, false);

  // 3. India / US without GPC -> analytics & ads granted immediately without banner block
  const rowBrowser = setupMockBrowser({
    cookie: `${REGION_COOKIE_NAME}=row`,
    adsEnabled: true,
    gdprCmp: true,
    gpc: false,
  });
  const rowInitial = getEffectiveConsent();
  assert.equal(rowInitial.managedByGoogleCmp, false);
  assert.equal(rowInitial.analytics, true);
  assert.equal(rowInitial.advertising, true);
  syncAdSenseConsent(rowInitial.advertising, false);
  assert.equal(rowBrowser.adsbygoogle.requestNonPersonalizedAds, 0);
  trackEvent("calculation_completed", { calculator_slug: "percentage-calculator" });
  assert.equal(rowBrowser.gtagCalls.length, 1);

  // 4. US with GPC active overrides prior non-GPC consent and enforces NPA
  const gpcBrowser = setupMockBrowser({
    cookie: `${REGION_COOKIE_NAME}=row; ${GPC_COOKIE_NAME}=1`,
    adsEnabled: true,
    gdprCmp: false,
    gpc: true,
  });
  // Simulate saved non-GPC consent from an earlier non-GPC session
  gpcBrowser.storage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({
      necessary: true,
      analytics: true,
      advertising: true,
      gpcOverridden: false,
      updatedAt: "2026-11-26T00:00:00.000Z",
    })
  );
  const gpcEffective = getEffectiveConsent();
  assert.equal(gpcEffective.gpcActive, true);
  assert.equal(gpcEffective.analytics, true);
  assert.equal(gpcEffective.advertising, false);
  syncGoogleConsent(gpcEffective.analytics, gpcEffective.advertising, false);
  assert.equal(gpcBrowser.adsbygoogle.requestNonPersonalizedAds, 1);
  assert.deepEqual(gpcBrowser.gtagCalls.at(-1), [
    "consent",
    "update",
    {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    },
  ]);

  // Explicit user override via Accept All / Preferences sets gpcOverridden = true
  saveStoredConsent(true, true);
  const gpcOverriddenEffective = getEffectiveConsent();
  assert.equal(gpcOverriddenEffective.advertising, true);
  assert.equal(gpcBrowser.adsbygoogle.requestNonPersonalizedAds, 0);

  // Necessary Only denies all 4 consent signals & enforces NPA
  saveStoredConsent(false, false);
  assert.equal(gpcBrowser.adsbygoogle.requestNonPersonalizedAds, 1);
  assert.deepEqual(gpcBrowser.gtagCalls.at(-1), [
    "consent",
    "update",
    {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    },
  ]);
  const callCountBefore = gpcBrowser.gtagCalls.length;
  trackEvent("calculator_used", { calculator_slug: "age-calculator" });
  assert.equal(gpcBrowser.gtagCalls.length, callCountBefore);
});

test("All 6 locales provide consent accessibility, Ad label, Privacy Choices, and GPC translations", () => {
  for (const locale of SUPPORTED_LOCALES) {
    const ui = getUiDictionary(locale);
    assert.ok(ui.footer.privacyChoices.trim().length > 3, `Missing privacyChoices in ${locale}`);
    assert.ok(ui.consent.bannerAriaLabel.trim().length > 3, `Missing bannerAriaLabel in ${locale}`);
    assert.ok(ui.consent.adLabel.trim().length > 3, `Missing adLabel in ${locale}`);
    assert.ok(ui.consent.gpcNotice.trim().length > 10, `Missing gpcNotice in ${locale}`);
  }
});

test("Architecture guards: no timezone heuristics, beforeInteractive bootstrap, key={slug}, and StrictMode AdSlot", () => {
  const root = process.cwd();
  const ga4Src = fs.readFileSync(path.join(root, "lib/analytics/ga4.ts"), "utf8");
  assert.ok(!ga4Src.includes("timeZone"), "Timezone heuristic must not exist in ga4.ts");

  const adSlotSrc = fs.readFileSync(path.join(root, "components/ads/AdSlot.tsx"), "utf8");
  assert.ok(adSlotSrc.includes("pushedRef"), "AdSlot must guard pushes with pushedRef");
  assert.ok(adSlotSrc.includes("MutationObserver"), "AdSlot must collapse unfilled ads via MutationObserver");
  assert.ok(adSlotSrc.includes("ui.consent.adLabel"), "AdSlot must use localized adLabel");

  const calcLayoutSrc = fs.readFileSync(
    path.join(root, "components/calculators/CalculatorPageLayout.tsx"),
    "utf8"
  );
  assert.ok(
    /AdSlot[\s\S]*?key=\{slug\}/.test(calcLayoutSrc),
    "CalculatorPageLayout must pass key={slug} to AdSlot"
  );

  for (const layoutRel of ["app/(en)/layout.tsx", "app/[lang]/layout.tsx"]) {
    const layoutSrc = fs.readFileSync(path.join(root, layoutRel), "utf8");
    assert.ok(layoutSrc.includes("<head>"), `${layoutRel} must explicitly include <head>`);
    assert.ok(layoutSrc.includes("<ConsentBootstrap />"), `${layoutRel} must mount ConsentBootstrap inside <head>`);
  }

  const consentAnalyticsSrc = fs.readFileSync(
    path.join(root, "components/privacy/ConsentAndAnalytics.tsx"),
    "utf8"
  );
  assert.ok(
    !consentAnalyticsSrc.includes("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"),
    "ConsentAndAnalytics must not duplicate adsbygoogle.js already loaded in <head>"
  );

  const adsTxt = fs.readFileSync(path.join(root, "public/ads.txt"), "utf8");
  assert.ok(
    adsTxt.includes("google.com, pub-8498634781020156, DIRECT, f08c47fec0942fa0"),
    "public/ads.txt must contain live publisher entry"
  );
});

test("ConsentBootstrap inline script executes Consent Mode v2 & NPA defaults deterministically before adsbygoogle.js", async () => {
  const vm = await import("node:vm");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { ConsentBootstrap } = await import("../components/privacy/ConsentBootstrap");

  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123456";
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED = "true";
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = "ca-pub-8498634781020156";
  process.env.NEXT_PUBLIC_ADSENSE_GDPR_CMP = "true";

  const markup = renderToStaticMarkup(ConsentBootstrap());
  const bootstrapIdx = markup.indexOf('id="dailycalcwell-consent-bootstrap"');
  const adsenseIdx = markup.indexOf(
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8498634781020156"
  );
  assert.ok(bootstrapIdx !== -1, "Bootstrap script must render in <head>");
  assert.ok(adsenseIdx !== -1, "AdSense verification script must render in <head>");
  assert.ok(bootstrapIdx < adsenseIdx, "ConsentBootstrap must precede adsbygoogle.js in <head>");

  const scriptMatch = markup.match(
    /<script id="dailycalcwell-consent-bootstrap">([\s\S]*?)<\/script>/
  );
  assert.ok(scriptMatch && scriptMatch[1], "Must extract inline bootstrap JS");
  const inlineJs = scriptMatch[1];
  assert.ok(inlineJs.includes("gtag('consent', 'default'"), "Bootstrap must set Consent Mode default");

  const runBootstrap = (opts: {
    cookie: string;
    gpc?: boolean;
    saved?: Record<string, unknown> | null;
  }) => {
    const store = new Map<string, string>();
    if (opts.saved) store.set(CONSENT_STORAGE_KEY, JSON.stringify(opts.saved));
    const windowObj: {
      dataLayer: unknown[];
      adsbygoogle: unknown[] & { requestNonPersonalizedAds?: number };
      localStorage: { getItem: (k: string) => string | null };
      gtag?: (...args: unknown[]) => void;
    } = {
      dataLayer: [],
      adsbygoogle: [],
      localStorage: { getItem: (k: string) => store.get(k) ?? null },
    };
    const context = {
      window: windowObj,
      document: { cookie: opts.cookie },
      navigator: { globalPrivacyControl: Boolean(opts.gpc) },
    };
    vm.runInNewContext(inlineJs, context);
    return {
      dataLayer: windowObj.dataLayer.map((entry) => Array.from(entry as Iterable<unknown>)),
      npa: windowObj.adsbygoogle.requestNonPersonalizedAds,
    };
  };

  // EEA with Google CMP enabled: defaults denied for EEA_UK_CH, leaves NPA to Google TCF CMP
  const eeaCmp = runBootstrap({ cookie: `${REGION_COOKIE_NAME}=eea` });
  assert.equal(eeaCmp.npa, undefined);
  assert.equal((eeaCmp.dataLayer[0][2] as Record<string, unknown>).ad_storage, "denied");
  assert.equal((eeaCmp.dataLayer[0][2] as Record<string, unknown>).analytics_storage, "denied");
  assert.ok(Array.isArray((eeaCmp.dataLayer[0][2] as Record<string, unknown>).region));

  // US/India without GPC: analytics & ads granted globally, regional EEA denied override, NPA=0
  const rowNoGpc = runBootstrap({ cookie: `${REGION_COOKIE_NAME}=row`, gpc: false });
  assert.equal(rowNoGpc.npa, 0);
  assert.equal((rowNoGpc.dataLayer[0][2] as Record<string, unknown>).analytics_storage, "granted");
  assert.equal((rowNoGpc.dataLayer[0][2] as Record<string, unknown>).ad_storage, "granted");
  assert.equal((rowNoGpc.dataLayer[1][2] as Record<string, unknown>).ad_storage, "denied");

  // US with GPC enabled: analytics granted, ad_* denied, NPA=1
  const rowGpc = runBootstrap({ cookie: `${REGION_COOKIE_NAME}=row; ${GPC_COOKIE_NAME}=1`, gpc: true });
  assert.equal(rowGpc.npa, 1);
  assert.equal((rowGpc.dataLayer[0][2] as Record<string, unknown>).analytics_storage, "granted");
  assert.equal((rowGpc.dataLayer[0][2] as Record<string, unknown>).ad_storage, "denied");
  assert.equal((rowGpc.dataLayer[0][2] as Record<string, unknown>).ad_user_data, "denied");
  assert.equal((rowGpc.dataLayer[0][2] as Record<string, unknown>).ad_personalization, "denied");

  // Saved "Necessary Only" in ROW: all 4 signals denied, NPA=1
  const necessaryOnly = runBootstrap({
    cookie: `${REGION_COOKIE_NAME}=row`,
    saved: { necessary: true, analytics: false, advertising: false },
  });
  assert.equal(necessaryOnly.npa, 1);
  assert.equal((necessaryOnly.dataLayer[0][2] as Record<string, unknown>).analytics_storage, "denied");
  assert.equal((necessaryOnly.dataLayer[0][2] as Record<string, unknown>).ad_storage, "denied");
});

