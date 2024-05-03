"use client"

import { useCopyToClipboard } from "@/hooks/use-copyclipboard"

import { Icons } from "@/components/icons"
import { Label } from "@/components/ui/label"
import { DataItemContextMenu } from "./DataItemActionMenu"

function Content(props: {
  copied: boolean
  onClick: () => void
  content: string
}) {
  return (
    <div
      className="relative col-span-4 select-all text-sm font-medium"
      onClick={props.onClick}
    >
      <div className="flex flex-row justify-between">
        <div className="max-w-5/6 truncate" title={props.content}>
          {props.content === null || props.content === undefined ? (
            <i>Empty</i>
          ) : (
            <DataItemContextMenu content={props.content}>
              {props.content}
            </DataItemContextMenu>
          )}
        </div>
        <div>
          {props.copied && (
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
  )
}

export function DataItem(props: {
  label: string
  content?: string
  copy?: boolean
}) {
  const { copied, setCopied, onClick } = useCopyToClipboard({
    copy: true,
    content: props.content,
  })
  return (
    <div
      className="grid grid-cols-5 items-center gap-4"
      data-cy="dataitem-wrapper"
    >
      <Label className="truncate" title={props.label}>
        {props.label}
      </Label>
      <Content content={props.content} copied={copied} onClick={onClick} />
    </div>
  )
}

export function DataItemValueOnly(props: { content: string }) {
  const { copied, setCopied, onClick } = useCopyToClipboard({
    copy: true,
    content: props.content,
  })
  return (
    <div className="grid grid-cols-1 rounded-md border-2 border-solid p-2">
      <DataItemContextMenu content={props.content}>
        <Content content={props.content} copied={copied} onClick={onClick} />
      </DataItemContextMenu>
    </div>
  )
}
