// TODO: remove puppeteer-core from dependency, bundle 
import { Protocol, RemoteAddress } from "puppeteer-core/lib/types";
export * from "./db"


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

export type ScanOptions = {
  scannerId?: string;
} | null;


export interface RequestTrace extends TraceObj {
    type: "request"
    method: string // request only
    resourceType: string
    postData?: string
  }
  
  export interface ResponseTrace extends TraceObj {
    type: "response"
    status: number
    remoteAddress: {
      port?: number
      ip?: string
    }
    timing: Record<string, string> | null //  Protocol.Network.ResourceTiming | null
  }
  
  export type TraceObj = {
    type: "request" | "response"
    url: string
    ts: number
    headers: Record<string, string>
  }
  
  export type TraceWrap = {
    type: "requestfinished" | "requestfailed"
    request: RequestTrace
    response: ResponseTrace | null
  }
  
  export type Traces = {
    version: "0.1"
    traces: TraceWrap[]
  }
