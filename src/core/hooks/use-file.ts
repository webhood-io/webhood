import { useContext, useEffect, useState } from "react"

import { FileTokenContext } from "@/lib/FileTokenProvider"
import { pb } from "@/lib/pocketbase"
import { ScansRecord } from "@/types/pocketbase-types"

export function useFile(document: ScansRecord, fileField: string, token: string) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  useEffect(() => {
    if (!document || !fileField || !token || document.status !== "done") return
    const url = pb.files.getUrl(document, document[fileField][0], {
      token: token,
    })
    setImageUrl(url)
  }, [document, fileField, token])
  if (!document[fileField] || document[fileField].length === 0) return undefined
  return imageUrl
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
