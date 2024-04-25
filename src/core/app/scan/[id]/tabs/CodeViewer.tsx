"use client"

import { useEffect, useState } from "react"
import { useFile, useToken } from "@/hooks/use-file"
import Editor from "@monaco-editor/react"
import { ScansResponse } from "@webhood/types"
import { useTheme } from "next-themes"

import { Icons } from "@/components/icons"

//#region CodeViewer
export function CodeViewer({ scanItem }: { scanItem: ScansResponse }) {
  const { resolvedTheme } = useTheme()
  const [html, setHtml] = useState("")
  const { token } = useToken()
  const htmlUrl = useFile(scanItem, "html", token)
  useEffect(() => {
    if (scanItem?.id && htmlUrl) {
      // fetch the html file using fetch
      fetch(htmlUrl)
        .then((res) => res.text())
        .then((html) => setHtml(html))
    }
  }, [scanItem?.id, htmlUrl])
  return (
    html && (
      <Editor
        height="90vh"
        defaultLanguage="html"
        theme={resolvedTheme == "dark" ? "vs-dark" : "vs-light"}
        loading={
          <div>
            Loading...
            <Icons.loader className={"inline"} />
          </div>
        }
        options={{ readOnly: true, links: false }}
        defaultValue={html}
      />
    )
  )
}
