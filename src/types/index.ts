// TODO: remove puppeteer-core from dependency, bundle
import { Protocol, RemoteAddress } from "puppeteer-core/lib/types";
export * from "./db";

export type WebhoodScandataResponse = {
  type: "response";
  url: string;
  ts: number;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  timing: Protocol.Network.ResourceTiming | null;
  remoteAddress?: RemoteAddress;
  securityDetails?: {
    issuer?: string;
    protocol?: string;
    subjectAlternativeNames?: string[];
    subjectName?: string;
    validFrom?: number;
    validTo?: number;
  } | null;
};

export type WebhoodScandataRequest = {
  type: "request";
  url: string;
  headers: Record<string, string>;
  method: string;
  resourceType: string;
  postData?: string;
  redirectChain: string[];
  ts: number;
};

export type WebhoodScandataDocument = {
  title: string;
  url: string;
  origin: string;
  protocol: string;
  links: string[];
};

export enum ScreenshotRate {
  Slow = "slow",
  Balanced = "balanced",
  Fast = "fast",
}

export type ScanOptions = {
  scannerId?: string;
  /** How fast should the scan complete vs. how much we want to wait for additional page resources */
  rate?: ScreenshotRate;
  screenshotSize?:
    | {
        width: string;
        height: string;
      }
    | "full";
} | null;

export type ScanData = ScanDataV1_0 | ScanDataV1_1 | null;

export type ScanDataV1_0 = {
  version: "1.0"; // additions = increment minor, breaking changes / removals / changes = increment major
  document: WebhoodScandataDocument;
  request: WebhoodScandataRequest | undefined;
  response: WebhoodScandataResponse | undefined;
};

export type ScanMetaEmbed = {
  /** Which scanner actually did the scan */
  scannedByScanner?: string;
  /** Who initiated the scan */
  initiatedBy?: string;
  /** Was the scan initiated by real user or API token */
  initiatedByType?: "user" | "api";
  /** When the scan was initiated */
  initiatedAt?: string;
  /** When the scan was started */
  startedAt?: string;
  /** When the scan was completed */
  completedAt?: string;
  /** How long the scan took */
  duration?: number;
};

export type ScanDataV1_1 = {
  version: "1.1"; // additions = increment minor, breaking changes / removals / changes = increment major
  document: WebhoodScandataDocument;
  request: WebhoodScandataRequest | undefined;
  response: WebhoodScandataResponse | undefined;
  scanOptions: ScanOptions;
  scannerConfig: ScannerConfigEmbed;
  meta: ScanMetaEmbed;
};

export type ScanDataUpdateRequest = {
  version: "1.1";
  scanOptions?: ScanOptions;
  scannerConfig?: ScannerConfigEmbed;
  document?: WebhoodScandataDocument;
  request?: WebhoodScandataRequest;
  response?: WebhoodScandataResponse;
  meta?: ScanMetaEmbed;
};

export type ScannerConfig = {
  ua?: string;
  lang?: string;
  useStealth?: boolean;
  useCloudCaptchaSolver?: boolean;
  useSkipCookiePrompt?: boolean;
  simultaneousScans?: string;
};

/** This is an excerpt of ScannerConfig to embed inside the scan metadata. We do not want to include any sensitive data such as api keys since the metadata is visible to all users */
export type ScannerConfigEmbed = {
  ua?: string;
  lang?: string;
  useStealth?: boolean;
  useSkipCookiePrompt?: boolean;
};

export interface RequestTrace extends TraceObj {
  type: "request";
  method: string; // request only
  resourceType: string;
  postData?: string;
}

export interface ResponseTrace extends TraceObj {
  type: "response";
  status: number;
  remoteAddress: {
    port?: number;
    ip?: string;
  };
  timing: Record<string, string> | null; //  Protocol.Network.ResourceTiming | null
}

export type TraceObj = {
  type: "request" | "response";
  url: string;
  ts: number;
  headers: Record<string, string>;
};

export type TraceWrap = {
  type: "requestfinished" | "requestfailed";
  request: RequestTrace;
  response: ResponseTrace | null;
};

export type Traces = {
  version: "0.1";
  traces: TraceWrap[];
};
