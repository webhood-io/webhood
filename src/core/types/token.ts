import { JWTPayload, JWTVerifyResult } from "jose"

export interface ApiToken extends JWTPayload {
  role: string
}

// Used when creating a new token
export interface ApiTokenPayload {
  role: string
  sub: string
}

export interface ApiTokenResponse {
  id: string
  token: string
  expires: string
}
