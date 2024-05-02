import { useToken } from "@/hooks/use-file"
import { ScansResponse } from "@webhood/types"

import { getPbFileUrl } from "@/lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

const basicMenuItems = [
  {
    label: "Copy Link to Image",
    action: copyLinkToClipboard,
  },
  {
    label: "Open Image in New Tab",
    action: openImageInNewTab,
  },
]

interface ActionProps {
  record: ScansResponse
  /** Full path to the file which can be opened in a separate tab */
  fileUrl: string
}

function copyLinkToClipboard({ fileUrl }: ActionProps) {
  navigator.clipboard.writeText(fileUrl)
}

function openImageInNewTab({ fileUrl }: ActionProps) {
  window.open(fileUrl, "_blank")
}

export function ScreenshotContextMenu({
  imageUrl,
  record,
  children,
}: {
  imageUrl: string
  record: ScansResponse
  children: React.ReactNode
}) {
  const { token } = useToken()
  const fileUrl = getPbFileUrl(record, imageUrl, token)
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {basicMenuItems.map((item) => (
          <ContextMenuItem
            key={item.label}
            onSelect={() => item.action({ record, fileUrl })}
          >
            {item.label}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}
