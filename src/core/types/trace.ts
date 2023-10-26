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
