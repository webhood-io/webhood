// error handler middleware
import { ApiError } from "next/dist/server/api-utils"
import { z } from "zod"

import { catchErrorsFrom } from "@/lib/api_error"
import { pb } from "@/lib/pocketbase"
import { generateSlug } from "@/lib/utils"

interface ScanApiScanCreateResponse {
  url: string
  id: string
  slug: string
  status: string
  created: string
  updated: string
  error: string
  html: [string]
  screenshots: [string]
  done_at: string
}

export type ScanApiScanResponse = ScanApiScanCreateResponse

// parse token from header
function getToken(authorization: string) {
  if (!authorization) throw new ApiError(401, "Unauthorized")
  const token = authorization.split(" ")[1]
  if (!token) throw new ApiError(401, "Unauthorized")
  return token
}

export const client = (req, res) => {
  const { authorization } = req.headers
  console.log("auth", authorization, req.headers)
  pb.authStore.save(getToken(authorization), null)
  return pb
}

const getApiScanSchema = z.object({
  status: z.string().optional(),
})

async function apiGetScans(req, res) {
  const { authorization } = req.headers
  console.log("auth", authorization, req.headers)
  const { status } = getApiScanSchema.parse(req.query)
  const pbCli = client(req, res)
  const options = {
    sort: "-created",
  }
  const data = await pbCli
    .collection("scans")
    .getFullList(
      status ? { filter: `status = "${status}"`, ...options } : options
    )
    .catch((e) => {
      throw new ApiError(e.status, e.message)
    })

  if (!data) throw new ApiError(404, "Not found")
  res.json(data)
  res.end()
}

const postApiScanSchema = z.object({
  url: z.string().url(),
  id: z.string().optional(),
})

async function apiPostScans(req, res) {
  // create a new scan
  const { url, id } = postApiScanSchema.parse(req.body)
  const pbCli = client(req, res)
  const data = await pbCli
    .collection("scans")
    .create({
      url,
      status: "pending",
      slug: generateSlug(url),
    })
    .catch((e) => {
      throw new ApiError(e.status, e.message)
    })
  const returnData = {
    url: data.url,
    id: data.id,
    slug: data.slug,
    status: data.status,
    created: data.created,
    updated: data.updated,
    error: data.error,
    html: data.html,
    screenshots: data.screenshots,
    done_at: data.done_at,
  } as ScanApiScanCreateResponse
  res.status(201).json(returnData)
  res.end()
}

export default catchErrorsFrom(async (req, res) => {
  if (req.method === "GET") {
    return apiGetScans(req, res)
  } else if (req.method === "POST") {
    return apiPostScans(req, res)
  } else {
    res.status(405).json({ message: "Method not allowed" })
    // Handle any other HTTP method
  }
})
