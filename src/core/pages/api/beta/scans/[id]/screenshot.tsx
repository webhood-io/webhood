import { catchErrorsFrom } from "@/lib/api_error"
import { z } from "zod"
import {client} from "../index"
import { ApiError } from "next/dist/server/api-utils"

const getApiScanSchema = z.object({
  id: z.string(),
})

async function apiGetScanScreenshot(req, res) {
const { id } = getApiScanSchema.parse(req.query)
  const pbCli = client(req, res)
  
  const data = await pbCli
    .collection("scans")
    .getOne(id)
    .catch((e) => {
      throw new ApiError(e.status, e.message)
    })
  if (!data) throw new ApiError(404, "Not found")
  if (data.screenshots.length === 0) throw new ApiError(404, "Not found")
  const token = await pbCli.files.getToken()
  const ssUrl = pbCli.files.getUrl(data, data.screenshots[0], {token})
    console.log(ssUrl)
    res.redirect(ssUrl)
  res.end()
}

export default catchErrorsFrom(async (req, res) => {
  if (req.method === "GET") {
    return apiGetScanScreenshot(req, res)
  } else {
    res.status(405).json({ message: "Method not allowed" })
    // Handle any other HTTP method
  }
})
