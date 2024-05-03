import { ContextMenuSeparator } from "@radix-ui/react-context-menu"
import { ExternalLink } from "lucide-react"

import { pb } from "@/lib/pocketbase"
import { stringToUrl } from "@/lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import ErrorBoundary from "./ErrorBoundary"

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
    label: "Scan on Webhood",
    action: scanOnWebhood,
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
    label: "Scan on Webhood",
    action: scanOnWebhood,
  },
  {
    label: "Search on Google",
    action: searchUrlOnGoogle,
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

function scanOnWebhood({ content }: ActionProps) {
  const url = stringToUrl(content)
  return pb
    .send("/api/ui/scans", {
      method: "POST",
      body: JSON.stringify({ url: url }),
    })
    .then((res) => {
      window.open(`/scan/${res.slug}`, "_blank")
      console.log(res)
    })
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
  const regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/
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
        <ErrorBoundary>
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
              label="Domain actions"
              content={content}
            />
          )}
          {isIp(content) && (
            <ContextMenuSpecific
              actionItems={ipMenuItems}
              label="IP actions"
              content={content}
            />
          )}
        </ErrorBoundary>
      </ContextMenuContent>
    </ContextMenu>
  )
}
