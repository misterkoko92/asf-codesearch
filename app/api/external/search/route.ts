import { NextResponse } from "next/server";
import { searchExternalSources } from "@/lib/external";
import { searchAsfWms } from "@/lib/external/asfWms";
import {
  getAsfWmsConfig,
  isExternalDatasetEnabled,
  isOpenFoodFactsEnabled
} from "@/lib/external/config";
import type { ExternalSearchResult } from "@/lib/external/types";
import { formatCountdown, getGoogleSearchQuota, incrementGoogleSearchUsage } from "@/lib/external/googleQuota";
import { normalizeCode, cleanString } from "@/lib/normalize";
import { requireAuth } from "@/lib/auth";
import { scoreExternalResult } from "@/lib/external/score";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let ean = normalizeCode(searchParams.get("ean"), { skipEmpty: true });
  let gtin = normalizeCode(searchParams.get("gtin"), { skipEmpty: true });
  let cip = normalizeCode(searchParams.get("cip"), { skipEmpty: true });
  let q = cleanString(searchParams.get("q"), { skipEmpty: true });
  const sourceParam = (searchParams.get("sources") || "").trim();
  const sourceList = sourceParam
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const hasSourceFilter = sourceList.length > 0;
  const includeExternal = hasSourceFilter ? sourceList.includes("external") : true;
  const includeGoogle = hasSourceFilter ? sourceList.includes("google") : true;
  const includeAsf = hasSourceFilter ? sourceList.includes("asf") : true;

  if (q) {
    const matchGtin = q.match(/(?:^|\\D)(\\d{14})(?!\\d)/);
    const matchEan = q.match(/(?:^|\\D)(\\d{13})(?!\\d)/);
    const matchCip = q.match(/(?:^|\\D)(\\d{7})(?!\\d)/);
    if (!gtin && matchGtin) gtin = matchGtin[1];
    if (!ean && matchEan) ean = matchEan[1];
    if (!cip && matchCip) cip = matchCip[1];
  }

  if (!q) {
    const code = ean || gtin || cip;
    if (code) {
      q = `ean ${code}`;
    }
  }

  if (!ean && !gtin && !cip && !q) {
    return NextResponse.json({ error: "Provide q, ean, gtin, or cip" }, { status: 400 });
  }

  const now = new Date();
  const googleEnabled = process.env.EXTERNAL_GOOGLE_ENABLED === "true";
  const googleConfigured = Boolean(process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_ID);
  const shouldCheckGoogleQuota = Boolean(q && googleEnabled && googleConfigured && includeGoogle);
  let googleAllowed = true;
  let googleLimitNotice: string | null = null;

  if (shouldCheckGoogleQuota) {
    const quota = await getGoogleSearchQuota(now);
    if (!quota.allowed) {
      googleAllowed = false;
      googleLimitNotice = `limite de ${quota.limit} recherches gratuites par jour atteinte, revenez dans ${formatCountdown(
        quota.msUntilReset
      )}`;
    }
  }

  const baseResultsPromise = searchExternalSources(
    { ean, gtin, cip, q },
    { includeGoogle: shouldCheckGoogleQuota && googleAllowed, includeLookups: includeExternal }
  );
  const wmsConfig = getAsfWmsConfig();
  const asfWmsEnabled = Boolean(wmsConfig?.baseUrl);
  const asfWmsAuthConfigured = Boolean(wmsConfig?.apiKey);
  let wmsResults: ExternalSearchResult[] = [];
  let wmsWarning: string | null = null;

  if (includeAsf && asfWmsEnabled && asfWmsAuthConfigured && wmsConfig) {
    try {
      wmsResults = await searchAsfWms({ ean, gtin, cip, q }, wmsConfig);
    } catch (error) {
      wmsWarning = `ASF WMS search failed: ${String(error)}`;
    }
  }

  const baseResults = await baseResultsPromise;
  if (shouldCheckGoogleQuota && googleAllowed) {
    await incrementGoogleSearchUsage(now);
  }
  const results = baseResults.concat(wmsResults);
  const scored = results
    .map((result) => ({
      ...result,
      score: scoreExternalResult(result, q)
    }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  if (scored[0]) {
    scored[0].isBest = true;
  }

  const warnings: string[] = [];
  let notice: string | null = null;

  if (includeGoogle && googleEnabled && !googleConfigured) {
    warnings.push("Google CSE enabled but not configured.");
  }
  if (includeExternal && !isOpenFoodFactsEnabled()) {
    warnings.push("Open Food Facts disabled.");
  }
  if (includeExternal && !isExternalDatasetEnabled()) {
    warnings.push("External datasets disabled.");
  }
  if (includeAsf && asfWmsEnabled && !asfWmsAuthConfigured) {
    warnings.push("ASF WMS API key missing.");
  }
  if (includeAsf && wmsWarning) {
    warnings.push(wmsWarning);
  }
  if (includeGoogle && googleLimitNotice) {
    notice = googleLimitNotice;
  }

  return NextResponse.json({
    data: scored,
    meta: {
      warnings,
      notice,
      googleEnabled,
      googleConfigured,
      openFoodFactsEnabled: isOpenFoodFactsEnabled(),
      externalDatasetsEnabled: isExternalDatasetEnabled(),
      asfWmsEnabled,
      asfWmsAuthConfigured
    }
  });
}
