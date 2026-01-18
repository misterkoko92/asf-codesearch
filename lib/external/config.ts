export function getCountryCode() {
  return (process.env.COUNTRY_CODE || "FR").toUpperCase();
}

export function isOpenFoodFactsEnabled() {
  return process.env.EXTERNAL_OPENFOODFACTS_ENABLED !== "false";
}

export function isExternalDatasetEnabled() {
  return process.env.EXTERNAL_DATASETS_ENABLED !== "false";
}

export type AsfWmsConfig = {
  baseUrl: string;
  apiKey: string;
};

export function getAsfWmsConfig(): AsfWmsConfig | null {
  const baseUrl = (process.env.ASF_WMS_BASE_URL || "").trim();
  if (!baseUrl) return null;
  const apiKey = (process.env.ASF_WMS_API_KEY || "").trim();
  return { baseUrl, apiKey };
}

export function isAsfWmsEnabled() {
  return Boolean((process.env.ASF_WMS_BASE_URL || "").trim());
}

export function isAsfWmsAuthConfigured() {
  const config = getAsfWmsConfig();
  if (!config) return false;
  return Boolean(config.apiKey);
}
