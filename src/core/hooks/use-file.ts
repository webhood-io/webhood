import { useContext, useEffect, useState } from "react"

import { ScansRecord } from "@/types/pocketbase-types"
import { FileTokenContext } from "@/lib/FileTokenProvider"
import { pb } from "@/lib/pocketbase"

export function useFile(
  document: ScansRecord,
  fileField: string,
  token: string,
  fileNumber?: number 
) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (!document || !fileField || !token || document.status !== "done") return
    const url = pb.files.getUrl(document, document[fileField][fileNumber || 0], {
      token: token,
    })
    setImageUrl(url)
  }, [document, fileField, token])
  if (!document[fileField] || document[fileField].length === 0) return undefined
  return imageUrl
}

export function useFile2(scanItem) {
  const [html, setHtml] = useState("")
  const { token } = useToken()
  const htmlUrl = useFile(scanItem, "html", token, 1)
  useEffect(() => {
    if (scanItem?.id && htmlUrl) {
      // fetch the html file using fetch
      fetch(htmlUrl)
        .then((res) => res.text())
        .then((html) => setHtml(html))
    }
  }, [scanItem?.id, htmlUrl])
  return { html }
}

export function useToken() {
  const { token, setToken, isLoading, setIsLoading } =
    useContext(FileTokenContext)

  useEffect(() => {
    if (!token) updateToken()
  }, [])

  const updateToken = async () => {
    if (token || isLoading) return
    setIsLoading(true)
    const newToken = await pb.files
      .getToken({ $autoCancel: false })
      .catch(() => null)
    console.log(newToken, token)
    setToken(newToken)
    setIsLoading(false)
  }

  return { token, setToken, updateToken }
}
