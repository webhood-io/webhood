/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	ApiTokens = "api_tokens",
	Scanners = "scanners",
	Scans = "scans",
	Scanstats = "scanstats",
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
	config?: RecordIdString
	expires?: IsoDateString
	role?: ApiTokensRoleOptions
}

export type ScannersRecord<Tconfig = unknown> = {
	apiToken?: string
	config?: null | Tconfig
	isCloudManaged?: boolean
	name?: string
	useCloudApi?: boolean
}

export enum ScansStatusOptions {
	"pending" = "pending",
	"running" = "running",
	"error" = "error",
	"done" = "done",
	"queued" = "queued",
}
export type ScansRecord<Toptions = unknown, Tscandata = unknown> = {
	done_at?: IsoDateString
	error?: string
	files?: string[]
	final_url?: string
	html?: string[]
	options?: null | Toptions
	scandata?: null | Tscandata
	screenshots?: string[]
	slug?: string
	status?: ScansStatusOptions
	url?: string
}

export enum ScanstatsStatusOptions {
	"pending" = "pending",
	"running" = "running",
	"error" = "error",
	"done" = "done",
	"queued" = "queued",
}
export type ScanstatsRecord = {
	count_items?: number
	status?: ScanstatsStatusOptions
}

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
export type ApiTokensResponse<Texpand = unknown> = Required<ApiTokensRecord> & AuthSystemFields<Texpand>
export type ScannersResponse<Tconfig = unknown, Texpand = unknown> = Required<ScannersRecord<Tconfig>> & BaseSystemFields<Texpand>
export type ScansResponse<Toptions = unknown, Tscandata = unknown, Texpand = unknown> = Required<ScansRecord<Toptions, Tscandata>> & BaseSystemFields<Texpand>
export type ScanstatsResponse<Texpand = unknown> = Required<ScanstatsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	api_tokens: ApiTokensRecord
	scanners: ScannersRecord
	scans: ScansRecord
	scanstats: ScanstatsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	api_tokens: ApiTokensResponse
	scanners: ScannersResponse
	scans: ScansResponse
	scanstats: ScanstatsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: 'api_tokens'): RecordService<ApiTokensResponse>
	collection(idOrName: 'scanners'): RecordService<ScannersResponse>
	collection(idOrName: 'scans'): RecordService<ScansResponse>
	collection(idOrName: 'scanstats'): RecordService<ScanstatsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
