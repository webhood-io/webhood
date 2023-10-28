import { useEffect, useState } from "react"

import { copyToClipboard } from "@/lib/utils"

export function useCopyToClipboard(props: { copy: boolean; content: string }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    // reset copied state after 2 seconds
    if (copied) {
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }, [copied])
  const onClick = () => {
    if (props.copy) {
      copyToClipboard(props.content)
      setCopied(true)
    }
  }
  return { copied, setCopied, onClick }
}
