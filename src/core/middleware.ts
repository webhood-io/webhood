import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

import { ApiToken } from "@/types/token"

function isAuthorizedAdmin(role: string) {
  return role === "admin"
}

async function adminMiddleware(req: NextRequest) {
  const res = NextResponse.next()

  const token = req.headers.get("authorization")

  let role
  /*
  const supabase = createMiddlewareSupabaseClient<Database>(
    { req, res },
    {
      supabaseKey: process.env.NEXT_PUBLIC_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_API_URL,
    }
  )
  console.log(process.env.NEXT_PUBLIC_API_URL)
  const {
    data: { session },
  } = await supabase.auth.getSession()
  role = session?.user?.app_metadata?.role
  console.log("role from existing session is...", role)
  if (!session || (!role && refreshToken && accessToken)) {
    const { data, error } = await supabase.auth.setSession({
      refresh_token: refreshToken,
      access_token: accessToken,
    })
    if (error) {
      console.log("error setting session", error)
      throw Error("Error trying to set sessions", error)
    }
    const {
      data: { session },
    } = await supabase.auth.getSession()
    role = session?.user?.app_metadata?.role
    console.log("role from new session", role)
  } else {
    // make sure you handle this case!
    NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }

  if (isAuthorizedAdmin(role)) {
    // Authentication successful, forward request to protected route.
    console.log("auth success")
    return res
  }
  return NextResponse.json(
    { error: "Error in authorization flow" },
    { status: 500 }
  )
  */
}

async function parseToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  const { payload, protectedHeader } = await jwtVerify(token, secret)
  return payload as ApiToken
}

async function getRoleFromToken(token: string) {
  try {
    const payload = await parseToken(token)
    return payload.role
  } catch (err) {
    console.log("error getting role from token", err)
    return null
  }
}

async function getIdFromToken(token: string) {
  try {
    const payload = await parseToken(token)
    return payload.sub
  } catch (err) {
    console.log("error getting id from token", err)
    return null
  }
}

function isAuthorized(role: string) {
  return role === "scanner"
}

async function scanMiddleware(req: NextRequest) {
  const res = NextResponse.next()
  // get bearer token from authorization header
  const token = req.headers.get("Authorization")?.split(" ")[1]
  console.log(token)
  if (!token) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }
  const role = await getRoleFromToken(token)
  // const isRevoked = await isRevokedById(await getIdFromToken(token))
  const isRevoked = false
  if (isAuthorized(role) && isRevoked === false) {
    // Authentication successful, forward request to protected route.
    console.log("auth success")
    return res
  } else {
    console.log("auth failed", "role", role, "isRevoked", isRevoked)
    return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  }
  return NextResponse.json(
    { error: "Error in authorization flow" },
    { status: 500 }
  )
}

export async function middleware(req: NextRequest) {
  /*
  if (req.nextUrl.pathname.startsWith("/api/accounts")) {
    return adminMiddleware(req)
  }
  console.log(req.nextUrl.pathname)
  if (req.nextUrl.pathname.startsWith("/api/v1")) {
    return scanMiddleware(req)
  }
  return NextResponse.json({ error: "Not authorized" }, { status: 401 })
  */
}
export const config = {
  /*
  matcher: "/api/v1/:path*",
  */
}
