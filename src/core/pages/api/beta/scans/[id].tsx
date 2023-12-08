// error handler middleware
import { ApiError } from "next/dist/server/api-utils"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"

import { catchErrorsFrom } from "@/lib/api_error"
import { client, ScanApiScanResponse } from "."

const getApiScanSchema = z.object({
  id: z.string(),
})

async function apiGetScan(req, res) {
  const { id } = getApiScanSchema.parse(req.query)
  const pbCli = client(req, res)
  console.log(id, pbCli.authStore.token)
  const data = await pbCli
    .collection("scans")
    .getOne(id)
    .catch((e) => {
      throw new ApiError(e.status, e.message)
    })
  if (!data) throw new ApiError(404, "Not found")
  const retData = {
    id: data.id,
    slug: data.slug,
    url: data.url,
    status: data.status,
    created: data.created,
    updated: data.updated,
    error: data.error,
    html: data.html,
    screenshots: data.screenshots,
    done_at: data.done_at,
    final_url: data.final_url,
  } as ScanApiScanResponse
  if(retData.status === "done" || retData.status === "error") {
    res.status(200)
  } else {
    res.status(202)
  }
  res.json(retData)
  res.end()
}

export default catchErrorsFrom(async (req, res) => {
  if (req.method === "GET") {
    return apiGetScan(req, res)
  } else {
    res.status(405).json({ message: "Method not allowed" })
    // Handle any other HTTP method
  }
})
