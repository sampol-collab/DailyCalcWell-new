import { AdSenseHeadScript } from "@/components/privacy/AdSenseHeadScript";
import {
  CONSENT_STORAGE_KEY,
  EEA_UK_CH_COUNTRY_CODES,
  GPC_COOKIE_NAME,
  REGION_COOKIE_NAME,
  getAdSenseClientId,
} from "@/lib/analytics/ga4-constants";

/**
 * Synchronous pre-hydration head bootstrap for Google Consent Mode v2,
 * AdSense NPA defaults, and the AdSense site-verification/loader script.
 * Rendered directly inside <head> in Root Layouts so Consent Mode defaults
 * always execute before adsbygoogle.js, and Google's verification crawler sees
 * the AdSense script in the initial HTML <head> response.
 */
export function ConsentBootstrap() {
  const adsClient = getAdSenseClientId();
  const gdprCmpEnabled =
    Boolean(adsClient) &&
    process.env.NEXT_PUBLIC_ADSENSE_GDPR_CMP === "true";

  const bootstrapCode = `
    (function () {
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = window.gtag || gtag;

      function readCookie(name) {
        try {
          var prefix = name + '=';
          var parts = document.cookie ? document.cookie.split(';') : [];
          for (var i = 0; i < parts.length; i++) {
            var item = parts[i].trim();
            if (item.indexOf(prefix) === 0) {
              return decodeURIComponent(item.slice(prefix.length));
            }
          }
        } catch (e) {}
        return null;
      }

      var regionCookie = readCookie(${JSON.stringify(REGION_COOKIE_NAME)});
      var regionMode = regionCookie === 'eea' ? 'eea' : (regionCookie === 'row' ? 'row' : 'unknown');
      var gpc = Boolean(
        (typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true) ||
        readCookie(${JSON.stringify(GPC_COOKIE_NAME)}) === '1'
      );

      var saved = null;
      try {
        var raw = window.localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)});
        if (raw) saved = JSON.parse(raw);
      } catch (e) {}

      var managedByGoogleCmp = ${JSON.stringify(gdprCmpEnabled)} && regionMode === 'eea';

      if (managedByGoogleCmp) {
        gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          wait_for_update: 500,
          region: ${JSON.stringify(EEA_UK_CH_COUNTRY_CODES)}
        });
      } else if (saved) {
        var adsGranted = Boolean(saved.advertising) && (!gpc || Boolean(saved.gpcOverridden));
        gtag('consent', 'default', {
          analytics_storage: saved.analytics ? 'granted' : 'denied',
          ad_storage: adsGranted ? 'granted' : 'denied',
          ad_user_data: adsGranted ? 'granted' : 'denied',
          ad_personalization: adsGranted ? 'granted' : 'denied'
        });
      } else {
        gtag('consent', 'default', {
          analytics_storage: 'granted',
          ad_storage: gpc ? 'denied' : 'granted',
          ad_user_data: gpc ? 'denied' : 'granted',
          ad_personalization: gpc ? 'denied' : 'granted'
        });
        gtag('consent', 'default', {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          wait_for_update: 500,
          region: ${JSON.stringify(EEA_UK_CH_COUNTRY_CODES)}
        });
      }

      if (${JSON.stringify(Boolean(adsClient))}) {
        window.adsbygoogle = window.adsbygoogle || [];
        if (!managedByGoogleCmp) {
          var adsAllowed = saved
            ? (Boolean(saved.advertising) && (!gpc || Boolean(saved.gpcOverridden)))
            : (regionMode === 'row' && !gpc);
          window.adsbygoogle.requestNonPersonalizedAds = adsAllowed ? 0 : 1;
        }
      }
    })();
  `;

  return (
    <>
      <script
        id="dailycalcwell-consent-bootstrap"
        dangerouslySetInnerHTML={{ __html: bootstrapCode }}
      />
      {adsClient && <AdSenseHeadScript clientId={adsClient} />}
    </>
  );
}
