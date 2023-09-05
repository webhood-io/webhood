/**
 * This file was @generated using pocketbase-typegen
 */

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
}
export type ApiTokensRecord = {
  role?: ApiTokensRoleOptions
  expires?: IsoDateString
}

export type ScannersRecord<Tconfig = unknown> = {
  config?: null | Tconfig
}

export enum ScansStatusOptions {
  "pending" = "pending",
  "running" = "running",
  "error" = "error",
  "done" = "done",
}
export type ScansRecord = {
  done_at?: IsoDateString
  error?: string
  html?: string[]
  final_url?: string
  slug?: string
  status?: ScansStatusOptions
  url?: string
  screenshots?: string[]
}

export enum UsersRoleOptions {
  "admin" = "admin",
  "user" = "user",
}
export type UsersRecord = {
  name?: string
  avatar?: string
  role?: UsersRoleOptions
}

// Response types include system fields and match responses from the PocketBase API
export type ApiTokensResponse = Required<ApiTokensRecord> & AuthSystemFields
export type ScannersResponse<Tconfig = unknown> = Required<
  ScannersRecord<Tconfig>
> &
  BaseSystemFields
export type ScansResponse = Required<ScansRecord> & BaseSystemFields
export type UsersResponse = Required<UsersRecord> & AuthSystemFields

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
