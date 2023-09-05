import { BaseModel, Record } from "pocketbase"

export interface Scan extends Record {
  url: string
  slug: string
  status: string
  created: string | null
  updated: string | null
  done_at: string | null
  error: string | null
  screenshots: string[] | null
  html: string[] | null
  final_url: string | null
}

export interface ScanListSuccessResponse {
  code: number // 200
  page: number
  perPage: number
  totalPages: number
  totalItems: number
  items: Scan[]
}

export interface ScanListErrorResponse {
  code: number // 400
  message: string
  data: object // empty object
}

export interface ScanListNotAuthorizedResponse {
  code: number // 403
  message: string
  data: object // empty object
}

export type ScanListResponse =
  | ScanListSuccessResponse
  | ScanListErrorResponse
  | ScanListNotAuthorizedResponse

interface ScannerConfigObject {
  ua: string
  lang: string
}

export interface Scanner extends BaseModel {
  config: ScannerConfigObject
}
