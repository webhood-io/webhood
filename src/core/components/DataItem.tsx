"use client"

import { useEffect, useState } from "react"

import { copyToClipboard } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Label } from "@/components/ui/label"

export function DataItem(props: {
  label: string
  content?: string
  copy?: boolean
}) {
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
  return (
    <div
      className="grid grid-cols-5 items-center gap-4"
      data-cy="dataitem-wrapper"
    >
      <Label>{props.label}</Label>
      <div
        className="relative col-span-4 select-all text-sm font-medium"
        onClick={onClick}
      >
        <div className="flex flex-row justify-between">
          <div className="max-w-5/6 truncate">
            {props.content || <i>Not available</i>}
          </div>
          <div className="">
            {copied && (
              <div
                className="mx-1 flex flex-row items-center"
                data-cy="dataitem-copymessage"
              >
                <p>Copied to clipboard</p>
                <Icons.check className="h-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
