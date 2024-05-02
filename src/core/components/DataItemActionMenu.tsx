import { ContextMenuSeparator } from "@radix-ui/react-context-menu"
import { ExternalLink } from "lucide-react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

const basicMenuItems = [
  {
    label: "Copy to Clipboard",
    action: copyItemToClipboard,
  },
]

const domainMenuItems = [
  {
    label: "Copy Domain to Clipboard",
    action: copyDomainToClipboard,
  },
  {
    label: "Search on Google",
    action: searchDomainOnGoogle,
    external: true,
  },
  {
    label: "Search on Shodan",
    action: searchDomainOnShodan,
    external: true,
  },
  {
    label: "Search on Whois",
    action: searchDomainOnWhois,
    external: true,
  },
  {
    label: "Search on Talos Intelligence",
    action: searchDomainOnTalos,
    external: true,
  },
]

const urlMenuItems = [
  {
    label: "Search on Google",
    action: searchUrlOnGoogle,
    external: true,
  },
  {
    label: "Search on Shodan",
    action: searchUrlOnShodan,
    external: true,
  },
]

const ipMenuItems = [
  {
    label: "Search on Talos Intelligence",
    action: searchOnTalos,
    external: true,
  },
]

function copyItemToClipboard({ content }: ActionProps) {
  navigator.clipboard.writeText(content)
}

function copyDomainToClipboard({ content }: ActionProps) {
  const url = new URL(content)
  navigator.clipboard.writeText(url.host)
}

function searchDomainOnGoogle({ content }: ActionProps) {
  const url = new URL(content)
  window.open(`https://www.google.com/search?q=${url.host}`, "_blank")
}

function searchOnTalos({ content }: ActionProps) {
  window.open(
    `https://talosintelligence.com/reputation_center/lookup?search=${content}`,
    "_blank"
  )
}

function searchDomainOnTalos({ content }: ActionProps) {
  const url = new URL(content)
  searchOnTalos({ content: url.host })
}

function searchDomainOnShodan({ content }: ActionProps) {
  const url = new URL(content)
  window.open(`https://www.shodan.io/search?query=${url.host}`, "_blank")
}

function searchUrlOnGoogle({ content }: ActionProps) {
  window.open(`https://www.google.com/search?q=${content}`, "_blank")
}

function searchUrlOnShodan({ content }: ActionProps) {
  window.open(`https://www.shodan.io/search?query=${content}`, "_blank")
}

function searchDomainOnWhois({ content }: ActionProps) {
  const url = new URL(content)
  window.open(`https://www.whois.com/whois/${url.host}`, "_blank")
}

function isUrl(str: string) {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

function isIp(str: string) {
  const regex = new RegExp(
    "^(?!0)(?!.*.$)((1?d?d|25[0-5]|2[0-4]d)(.|$)){4}$",
    "i"
  )
  return regex.test(str)
}

interface ActionProps {
  content: string
}

interface ActionItem {
  label: string
  action: (props: ActionProps) => void
  external?: boolean
}

function ContextMenuSpecific({
  actionItems,
  label,
  content,
}: {
  actionItems: ActionItem[]
  label: string
  content: string
}) {
  return (
    <>
      <ContextMenuSeparator />
      <ContextMenuLabel>{label}</ContextMenuLabel>
      {actionItems.map((item) => (
        <ContextMenuItem
          key={item.label}
          onSelect={() => item.action({ content })}
        >
          {item.label}
          {item.external && <ExternalLink className="ml-1 h-4" color="gray" />}
        </ContextMenuItem>
      ))}
    </>
  )
}

export function DataItemContextMenu({
  content,
  children,
}: {
  content: string
  children: React.ReactNode
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {basicMenuItems.map((item) => (
          <ContextMenuItem
            key={item.label}
            onSelect={() => item.action({ content })}
          >
            {item.label}
          </ContextMenuItem>
        ))}
        {isUrl(content) && (
          <ContextMenuSpecific
            actionItems={urlMenuItems}
            label="URL Actions"
            content={content}
          />
        )}
        {isUrl(content) && (
          <ContextMenuSpecific
            actionItems={domainMenuItems}
            label="Domain"
            content={content}
          />
        )}
        {isIp(content) && (
          <ContextMenuSpecific
            actionItems={ipMenuItems}
            label="IP"
            content={content}
          />
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
