"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";
import {
  CONSENT_STORAGE_KEY,
  getAdSenseClientId,
  getEffectiveConsent,
  syncAdSenseConsent,
} from "@/lib/analytics/ga4";

interface AdSlotProps {
  slotId?: string;
  format?: "auto" | "horizontal" | "rectangle";
}

/**
 * AdSense-ready manual display placement container.
 * Uses a synchronous pushedRef guard for React StrictMode safety, collapses
 * automatically when unfilled, and avoids rendering for invalid slot IDs.
 */
export function AdSlot({ slotId, format = "auto" }: AdSlotProps) {
  const { ui } = useLocale();
  const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
  const clientId = getAdSenseClientId();
  const cleanSlotId = (slotId || "").trim();
  const isValidSlot = /^\d+$/.test(cleanSlotId);

  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);
  const [unfilled, setUnfilled] = useState(false);

  useEffect(() => {
    if (!enabled || !clientId || !isValidSlot) return;

    const sync = () => {
      const effective = getEffectiveConsent();
      if (!effective.managedByGoogleCmp) {
        syncAdSenseConsent(effective.advertising, false);
      }
    };
    sync();

    const onStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY) sync();
    };
    window.addEventListener("dailycalcwell-consent-changed", sync);
    window.addEventListener("storage", onStorage);

    const insEl = insRef.current;
    let observer: MutationObserver | null = null;

    if (insEl) {
      if (insEl.getAttribute("data-ad-status") === "unfilled") {
        setUnfilled(true);
      }

      if (typeof MutationObserver !== "undefined") {
        observer = new MutationObserver(() => {
          const status = insEl.getAttribute("data-ad-status");
          if (status === "unfilled") {
            setUnfilled(true);
          } else if (status === "filled") {
            setUnfilled(false);
          }
        });
        observer.observe(insEl, {
          attributes: true,
          attributeFilter: ["data-ad-status"],
        });
      }

      if (!pushedRef.current && !insEl.getAttribute("data-adsbygoogle-status")) {
        pushedRef.current = true;
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
          // Ignore blocked ad-script environments gracefully
        }
      }
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener("dailycalcwell-consent-changed", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, [enabled, clientId, isValidSlot, cleanSlotId]);

  if (!enabled || !clientId || !isValidSlot) {
    return null;
  }

  return (
    <aside
      aria-label={ui.consent.adLabel}
      className={
        unfilled
          ? "hidden"
          : "my-8 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-center"
      }
    >
      <p className="mb-2 text-xs font-medium text-slate-500">
        {ui.consent.adLabel}
      </p>
      <ins
        ref={insRef}
        className="adsbygoogle block min-h-[90px]"
        data-ad-client={clientId}
        data-ad-slot={cleanSlotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
