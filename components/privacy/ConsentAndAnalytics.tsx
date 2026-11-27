"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { X } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";
import {
  ConsentState,
  TcfConsentState,
  getEffectiveConsent,
  hasGlobalPrivacyControl,
  parseTcfData,
  readStoredConsent,
  saveStoredConsent,
  setLatestTcfState,
  syncAdSenseConsent,
  syncGoogleConsent,
} from "@/lib/analytics/ga4";

export function ConsentAndAnalytics() {
  const { ui, lPath } = useLocale();
  const gaId = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "").trim();

  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [tcfState, setTcfState] = useState<TcfConsentState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsDraft, setAnalyticsDraft] = useState(false);
  const [adsDraft, setAdsDraft] = useState(false);
  const [gpcActive, setGpcActive] = useState(false);
  const tcfListenerAttached = useRef(false);

  const attachTcfListener = useCallback(() => {
    if (
      tcfListenerAttached.current ||
      typeof window === "undefined" ||
      typeof window.__tcfapi !== "function"
    ) {
      return;
    }
    tcfListenerAttached.current = true;
    try {
      window.__tcfapi("addEventListener", 2, (tcData, success) => {
        if (!success) return;
        const parsed = parseTcfData(tcData);
        if (!parsed) return;
        setLatestTcfState(parsed);
        setTcfState(parsed);
        if (parsed.gdprApplies) {
          setShowPreferences(false);
        }
      });
    } catch {
      // Ignore TCF listener errors if CMP is unavailable
    }
  }, []);

  useEffect(() => {
    attachTcfListener();

    const existing = readStoredConsent();
    const effective = getEffectiveConsent();
    setConsent(existing);
    setAnalyticsDraft(effective.analytics);
    setAdsDraft(effective.advertising);
    setGpcActive(effective.gpcActive);

    if (!effective.managedByGoogleCmp) {
      if (existing) {
        syncGoogleConsent(existing.analytics, effective.advertising, false);
      } else {
        syncAdSenseConsent(effective.advertising, false);
      }
    }

    setHydrated(true);

    const openPrefs = () => {
      const current = getEffectiveConsent();
      if (
        current.managedByGoogleCmp &&
        typeof window.googlefc?.showRevocationMessage === "function"
      ) {
        window.googlefc.showRevocationMessage();
        return;
      }
      setAnalyticsDraft(current.analytics);
      setAdsDraft(current.advertising);
      setGpcActive(hasGlobalPrivacyControl());
      setShowPreferences(true);
    };

    let tcfPollTimer: number | null = null;
    if (!tcfListenerAttached.current) {
      let attempts = 0;
      tcfPollTimer = window.setInterval(() => {
        attempts += 1;
        attachTcfListener();
        if (tcfListenerAttached.current || attempts >= 50) {
          if (tcfPollTimer !== null) {
            window.clearInterval(tcfPollTimer);
            tcfPollTimer = null;
          }
        }
      }, 200);
    }

    window.addEventListener("dailycalcwell-open-cookie-preferences", openPrefs);
    window.addEventListener("dailycalcwell-adsense-loaded", attachTcfListener);
    return () => {
      if (tcfPollTimer !== null) {
        window.clearInterval(tcfPollTimer);
      }
      window.removeEventListener(
        "dailycalcwell-open-cookie-preferences",
        openPrefs
      );
      window.removeEventListener(
        "dailycalcwell-adsense-loaded",
        attachTcfListener
      );
    };
  }, [attachTcfListener]);

  const acceptAll = () => {
    const saved = saveStoredConsent(true, true);
    setConsent(saved);
    setShowPreferences(false);
  };

  const rejectNonEssential = () => {
    const saved = saveStoredConsent(false, false);
    setConsent(saved);
    setShowPreferences(false);
  };

  const saveCustom = () => {
    const saved = saveStoredConsent(analyticsDraft, adsDraft);
    setConsent(saved);
    setShowPreferences(false);
  };

  const effective = hydrated ? getEffectiveConsent(tcfState) : null;
  const managedByGoogleCmp = Boolean(effective?.managedByGoogleCmp);
  const shouldShowBanner =
    hydrated && consent === null && !showPreferences && !managedByGoogleCmp;

  return (
    <>
      {gaId && (
        <>
          <Script id="dailycalcwell-ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(gaId)});
            `}
          </Script>
          <Script
            id="dailycalcwell-ga4-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
              gaId
            )}`}
            strategy="afterInteractive"
          />
        </>
      )}

      {shouldShowBanner && (
        <div
          role="region"
          aria-label={ui.consent.bannerAriaLabel}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl">
              {ui.consent.bannerText}{" "}
              <Link
                href={lPath("/cookie-policy/")}
                className="font-medium text-sky-700 underline hover:text-sky-900"
              >
                {ui.footer.cookiePolicy}
              </Link>
              .
            </p>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const current = getEffectiveConsent(tcfState);
                  setAnalyticsDraft(current.analytics);
                  setAdsDraft(current.advertising);
                  setGpcActive(current.gpcActive);
                  setShowPreferences(true);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 whitespace-nowrap"
              >
                {ui.consent.preferences}
              </button>
              <button
                type="button"
                onClick={rejectNonEssential}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 whitespace-nowrap"
              >
                {ui.consent.necessaryOnly}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-lg bg-[#38BDF8] px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-[#0EA5E9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 whitespace-nowrap"
              >
                {ui.consent.acceptAll}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreferences && !managedByGoogleCmp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-prefs-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="cookie-prefs-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {ui.consent.dialogTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {ui.consent.dialogSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                aria-label={ui.consent.closeDialog}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-sky-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {gpcActive && (
              <p className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs leading-relaxed text-sky-900">
                {ui.consent.gpcNotice}
              </p>
            )}

            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {ui.consent.necessaryTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {ui.consent.necessaryDesc}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    {ui.consent.alwaysActive}
                  </span>
                </div>
              </div>

              <label className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 cursor-pointer hover:border-slate-300">
                <div>
                  <span className="block text-sm font-semibold text-slate-900">
                    {ui.consent.analyticsTitle}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-600">
                    {ui.consent.analyticsDesc}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsDraft}
                  onChange={(e) => setAnalyticsDraft(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600"
                />
              </label>

              <label className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 cursor-pointer hover:border-slate-300">
                <div>
                  <span className="block text-sm font-semibold text-slate-900">
                    {ui.consent.adsTitle}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-600">
                    {ui.consent.adsDesc}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={adsDraft}
                  onChange={(e) => setAdsDraft(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={rejectNonEssential}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-sky-600"
              >
                {ui.consent.necessaryOnly}
              </button>
              <button
                type="button"
                onClick={saveCustom}
                className="rounded-lg bg-[#38BDF8] px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-[#0EA5E9] focus-visible:outline-2 focus-visible:outline-sky-600"
              >
                {ui.consent.savePreferences}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
