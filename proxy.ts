import { NextRequest, NextResponse } from "next/server";
import { EEA_UK_CH_COUNTRY_CODES } from "@/lib/analytics/ga4-constants";

const EEA_SET = new Set<string>(EEA_UK_CH_COUNTRY_CODES);

function extractCountryCode(request: NextRequest): string | null {
  const nfGeo = request.headers.get("x-nf-geo");
  if (nfGeo) {
    try {
      const decoded = nfGeo.trim().startsWith("{")
        ? nfGeo
        : Buffer.from(nfGeo, "base64").toString("utf8");
      const parsed = JSON.parse(decoded) as {
        country?: { code?: string };
      };
      const code = parsed.country?.code?.trim().toUpperCase();
      if (code && /^[A-Z]{2}$/.test(code) && code !== "XX" && code !== "T1") {
        return code;
      }
    } catch {
      // Ignore malformed x-nf-geo header
    }
  }

  const headerCandidates = [
    "cf-ipcountry",
    "x-vercel-ip-country",
    "cloudfront-viewer-country",
    "x-country-code",
  ];

  for (const headerName of headerCandidates) {
    const val = request.headers.get(headerName)?.trim().toUpperCase();
    if (val && /^[A-Z]{2}$/.test(val) && val !== "XX" && val !== "T1") {
      return val;
    }
  }

  return null;
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const countryCode = extractCountryCode(request);
  if (countryCode) {
    const regionValue = EEA_SET.has(countryCode) ? "eea" : "row";
    if (request.cookies.get("dcw_region")?.value !== regionValue) {
      response.cookies.set("dcw_region", regionValue, {
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
        httpOnly: false,
      });
    }
  }

  const secGpc = request.headers.get("sec-gpc")?.trim();
  if (secGpc === "1") {
    if (request.cookies.get("dcw_gpc")?.value !== "1") {
      response.cookies.set("dcw_gpc", "1", {
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
        httpOnly: false,
      });
    }
  } else if (request.cookies.has("dcw_gpc")) {
    response.cookies.delete("dcw_gpc");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|__forms\\.html|.*\\.(?:ico|png|svg|jpg|jpeg|webp|txt|xml|json|css|js)$).*)",
  ],
};
