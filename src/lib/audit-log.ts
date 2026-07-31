import { randomUUID } from "crypto";
import { UAParser } from "ua-parser-js";
import { getMongoDatabase } from "@/lib/mongodb";
import type {
  ActionLogEntry,
  LogActionOptions,
} from "@/lib/audit-log-types";

const ACTION_LOGS_COLLECTION = "actionLogs";

function getClientIp(request: Request | null | undefined): string {
  if (!request) return "";
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  return "unknown";
}

function detectPlatform(request: Request | null | undefined): string | null {
  if (!request) return null;
  const platformHeader = request.headers.get("x-app-platform");
  if (platformHeader) return platformHeader;
  const ua = request.headers.get("user-agent") || "";
  if (ua.toLowerCase().includes("capacitor")) return "android-app";
  return "web";
}

const geoCache = new Map<string, { city?: string; region?: string; country?: string } | null>();

async function lookupGeo(ip: string): Promise<{ city?: string; region?: string; country?: string } | null> {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return null;
  }
  if (geoCache.has(ip)) return geoCache.get(ip) ?? null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      geoCache.set(ip, null);
      return null;
    }
    const data = await res.json();
    const geo = {
      city: data.city || undefined,
      region: data.region || undefined,
      country: data.country_name || data.country || undefined,
    };
    geoCache.set(ip, geo.city || geo.region || geo.country ? geo : null);
    return geoCache.get(ip) ?? null;
  } catch {
    geoCache.set(ip, null);
    return null;
  }
}

export function extractRequestMeta(request: Request | null | undefined) {
  const headers = request?.headers;
  const userAgent = headers?.get("user-agent") || "";
  const result = UAParser(userAgent);

  const browser =
    result.browser?.name
      ? `${result.browser.name}${result.browser.major ? ` ${result.browser.major}` : ""}`
      : null;
  const os =
    result.os?.name
      ? `${result.os.name}${result.os.version ? ` ${result.os.version}` : ""}`
      : null;

  return {
    ip: getClientIp(request),
    userAgent,
    platform: detectPlatform(request),
    browser,
    os,
    device: result.device?.type || null,
    referer: headers?.get("referer") || null,
    acceptLanguage: headers?.get("accept-language") || null,
    cfCountry: headers?.get("cf-ipcountry") || null,
    path: request ? new URL(request.url).pathname : "",
    method: request?.method || "",
  };
}

function buildLogId(): string {
  return `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
}

export async function logAction(options: LogActionOptions) {
  const meta = extractRequestMeta(options.request);

  const entry: ActionLogEntry = {
    id: buildLogId(),
    action: options.action,
    category: options.category,
    userId: options.userId ?? null,
    userEmail: options.userEmail ?? null,
    userName: options.userName ?? null,
    userRole: options.userRole ?? null,
    details: options.details,
    metadata: options.metadata ?? null,
    ip: meta.ip,
    userAgent: meta.userAgent,
    platform: meta.platform,
    browser: meta.browser,
    os: meta.os,
    device: meta.device,
    referer: meta.referer,
    acceptLanguage: meta.acceptLanguage,
    cfCountry: meta.cfCountry,
    geo: await lookupGeo(meta.ip),
    path: meta.path,
    method: meta.method,
    duration: null,
    statusCode: options.statusCode ?? null,
    timestamp: new Date().toISOString(),
  };

  try {
    const db = await getMongoDatabase();
    const collection = db.collection(ACTION_LOGS_COLLECTION);
    await collection.insertOne(entry as any);
  } catch (error) {
    console.error("[audit-log] failed to write action log entry:", error);
  }
}
