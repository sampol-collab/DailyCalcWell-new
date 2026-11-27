"use client";

interface AdSenseHeadScriptProps {
  clientId: string;
}

/**
 * Client leaf for the AdSense head script tag.
 * Attaching an onLoad handler prevents React 19 from hoisting this <script async>
 * above the synchronous Consent Mode v2 bootstrap script in <head>, while keeping
 * the exact <script async src="...adsbygoogle.js?client=..."> tag in the initial HTML <head>.
 */
export function AdSenseHeadScript({ clientId }: AdSenseHeadScriptProps) {
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
        clientId
      )}`}
      crossOrigin="anonymous"
      onLoad={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("dailycalcwell-adsense-loaded"));
        }
      }}
    />
  );
}
