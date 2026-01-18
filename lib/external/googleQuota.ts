import { prisma } from "@/lib/db";

const GOOGLE_PROVIDER = "google_cse";
const DEFAULT_DAILY_LIMIT = 100;
const DEFAULT_RESET_HOUR = 8;
const DEFAULT_TIME_ZONE = "Europe/Paris";

function getDailyLimit() {
  const raw = Number.parseInt(process.env.EXTERNAL_GOOGLE_DAILY_LIMIT || "", 10);
  if (Number.isFinite(raw) && raw > 0) return raw;
  return DEFAULT_DAILY_LIMIT;
}

function getResetHour() {
  const raw = Number.parseInt(process.env.EXTERNAL_GOOGLE_RESET_HOUR || "", 10);
  if (Number.isFinite(raw) && raw >= 0 && raw <= 23) return raw;
  return DEFAULT_RESET_HOUR;
}

function getTimeZone() {
  const value = (process.env.EXTERNAL_GOOGLE_TIMEZONE || "").trim();
  return value || DEFAULT_TIME_ZONE;
}

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getTimeZoneParts(date: Date, timeZone: string): DateParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const parts = formatter.formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second)
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  const utcTime = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return utcTime - date.getTime();
}

function makeDateInTimeZone(parts: DateParts, timeZone: string) {
  const utcGuess = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
  );
  let offset = getTimeZoneOffsetMs(utcGuess, timeZone);
  let result = new Date(utcGuess.getTime() - offset);
  const offsetCheck = getTimeZoneOffsetMs(result, timeZone);
  if (offsetCheck !== offset) {
    result = new Date(utcGuess.getTime() - offsetCheck);
  }
  return result;
}

function addDaysToDateParts(parts: Pick<DateParts, "year" | "month" | "day">, days: number) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
}

export function getQuotaWindow(now = new Date()) {
  const timeZone = getTimeZone();
  const resetHour = getResetHour();
  const nowParts = getTimeZoneParts(now, timeZone);
  const baseDate = { year: nowParts.year, month: nowParts.month, day: nowParts.day };

  let endDate = baseDate;
  let windowEnd = makeDateInTimeZone(
    { ...endDate, hour: resetHour, minute: 0, second: 0 },
    timeZone
  );

  if (now >= windowEnd) {
    endDate = addDaysToDateParts(baseDate, 1);
    windowEnd = makeDateInTimeZone(
      { ...endDate, hour: resetHour, minute: 0, second: 0 },
      timeZone
    );
  }

  const startDate = addDaysToDateParts(endDate, -1);
  const windowStart = makeDateInTimeZone(
    { ...startDate, hour: resetHour, minute: 0, second: 0 },
    timeZone
  );

  return { windowStart, windowEnd };
}

export function formatCountdown(msUntilReset: number) {
  const totalMinutes = Math.max(0, Math.ceil(msUntilReset / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(hours)}h${pad(minutes)}`;
}

export type GoogleSearchQuota = {
  limit: number;
  count: number;
  remaining: number;
  allowed: boolean;
  windowStart: Date;
  windowEnd: Date;
  msUntilReset: number;
};

export async function getGoogleSearchQuota(now = new Date()): Promise<GoogleSearchQuota> {
  const { windowStart, windowEnd } = getQuotaWindow(now);
  const limit = getDailyLimit();

  const record = await prisma.externalSearchUsage.findUnique({
    where: {
      provider_windowStart_windowEnd: {
        provider: GOOGLE_PROVIDER,
        windowStart,
        windowEnd
      }
    }
  });

  const count = record?.count ?? 0;
  const remaining = Math.max(0, limit - count);
  return {
    limit,
    count,
    remaining,
    allowed: count < limit,
    windowStart,
    windowEnd,
    msUntilReset: windowEnd.getTime() - now.getTime()
  };
}

export async function incrementGoogleSearchUsage(now = new Date()) {
  const { windowStart, windowEnd } = getQuotaWindow(now);
  return prisma.externalSearchUsage.upsert({
    where: {
      provider_windowStart_windowEnd: {
        provider: GOOGLE_PROVIDER,
        windowStart,
        windowEnd
      }
    },
    create: {
      provider: GOOGLE_PROVIDER,
      windowStart,
      windowEnd,
      count: 1
    },
    update: {
      count: { increment: 1 }
    }
  });
}
