/**
 * This file was @generated using pocketbase-typegen
 */

import { Json } from "./database.types"
import { ScanData } from "./trace"

export enum Collections {
  ApiTokens = "api_tokens",
  Scanners = "scanners",
  Scans = "scans",
  Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
  id: RecordIdString
  created: IsoDateString
  updated: IsoDateString
  collectionId: string
  collectionName: Collections
  expand?: T
}

export type AuthSystemFields<T = never> = {
  email: string
  emailVisibility: boolean
  username: string
  verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export enum ApiTokensRoleOptions {
  "scanner" = "scanner",
  "api_user" = "api_user",
}
export type ApiTokensRecord = {
  expires?: IsoDateString
  role?: ApiTokensRoleOptions
}

export type ScannersRecord<Tconfig = unknown> = {
  config?: null | Tconfig
  name: string
} & BaseSystemFields

export enum ScansStatusOptions {
  "pending" = "pending",
  "running" = "running",
  "error" = "error",
  "queued" = "queued",
  "done" = "done",
}
export type ScansRecord = {
  done_at?: IsoDateString
  error?: string
  final_url?: string
  html?: string[]
  screenshots?: string[]
  slug?: string
  status?: ScansStatusOptions
  url?: string
  options?: {
    scannerId?: string
  }
  scandata?: ScanData
} & BaseSystemFields

export enum UsersRoleOptions {
  "admin" = "admin",
  "user" = "user",
}
export type UsersRecord = {
  avatar?: string
  name?: string
  role?: UsersRoleOptions
}

// Response types include system fields and match responses from the PocketBase API
export type ApiTokensResponse<Texpand = unknown> = Required<ApiTokensRecord> &
  AuthSystemFields<Texpand>
export type ScannersResponse<Tconfig = unknown, Texpand = unknown> = Required<
  ScannersRecord<Tconfig>
> &
  BaseSystemFields<Texpand>
export type ScansResponse<Texpand = unknown> = Required<ScansRecord> &
  BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> &
  AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
  api_tokens: ApiTokensRecord
  scanners: ScannersRecord
  scans: ScansRecord
  users: UsersRecord
}

export type CollectionResponses = {
  api_tokens: ApiTokensResponse
  scanners: ScannersResponse
  scans: ScansResponse
  users: UsersResponse
}
