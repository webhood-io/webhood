import { Protocol, RemoteAddress, SecurityDetails } from "puppeteer";
import { BaseSystemFields, ScansStatusOptions } from "./pocketbase-types";

export type ScanStatsRecord = {
  id: string;
  status: ScansStatusOptions;
  count_items: number;
} & BaseSystemFields;

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

export type ScanData = {
  version: "1.0"; // additions = increment minor, breaking changes / removals / changes = increment major
  document: WebhoodScandataDocument;
  request: WebhoodScandataRequest | null;
  response: WebhoodScandataResponse | null;
};
