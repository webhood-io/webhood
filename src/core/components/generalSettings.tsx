import * as React from "react"
import { scannerFetcher } from "@/hooks/use-api"
import useSWR from "swr"
import { z } from "zod"

import { pb } from "@/lib/pocketbase"
import { ScannerLangTip, ScannerUaTip } from "@/lib/tips"
import { Icons } from "@/components/icons"
import { StatusMessage, StatusMessageProps } from "@/components/statusMessage"
import { IconButton } from "@/components/ui/button-icon"
import { GenericTooltip } from "@/components/ui/generic-tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TypographyLarge } from "@/components/ui/typography/large"

interface MicrosoftAuthOptions {
  enabled: boolean
  clientId: string
  secret: string
  azureTenantId?: string
  redirectUri?: string
}

interface GoogleAuthOptions {
  enabled: boolean
  clientId: string
  secret: string
  redirectUri?: string
}

function SettingsInput({
  label,
  name,
  tooltip,
  ...props
}: {
  label: string
  name: string
  tooltip?: string
  [key: string]: any
}) {
  return (
    <div className="grid grid-cols-5 items-center">
      <Label>
        <div className={"mr-2 flex items-center justify-between gap-1"}>
          {label}
          {tooltip && <GenericTooltip>{tooltip}</GenericTooltip>}
        </div>
      </Label>
      <Input
        type="text"
        name={name}
        className={"col-span-4"}
        id={name.toLowerCase()}
        {...props}
      />
    </div>
  )
}

const scannerOptionsSchema = z.object({
  ua: z.string(),
  lang: z.string(),
})

export function GeneralSettings() {
  const [statusMessage, setStatusMessage] =
    React.useState<StatusMessageProps>(undefined)
  const {
    data: scanDataSwr,
    error: scanErrorSwr,
    isLoading: isSwrLoading,
  } = useSWR("/api/scanners", scannerFetcher)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      config: scannerOptionsSchema.parse(Object.fromEntries(formData)),
    }
    const record = pb
      .collection("scanners")
      .update(scanDataSwr.id, data)
      .then((res) => {
        setStatusMessage({
          status: "success",
          message: "Settings saved",
        })
      })
      .catch((err) => {
        console.log(err)
        setStatusMessage({
          status: "error",
          message: err,
        })
      })
  }
  // @ts-ignore TODO: fix this
  const { ua, lang } = scanDataSwr?.config || { ua: "", lang: "" }
  return (
    <div className="flex flex-col justify-between gap-6">
      <TypographyLarge>Scanner settings</TypographyLarge>
      <form onSubmit={(e) => handleSubmit(e, scanDataSwr.id)}>
        {scanDataSwr && (
          <div className="flex flex-col gap-4">
            <SettingsInput
              label="Id"
              name="id"
              placeholder="Id"
              disabled
              value={scanDataSwr?.id}
            />
            <SettingsInput
              label="User Agent"
              name="ua"
              placeholder="User agent"
              defaultValue={ua}
              tooltip={ScannerUaTip}
            />
            <SettingsInput
              label="Language"
              name="lang"
              placeholder="Language"
              defaultValue={lang}
              tooltip={ScannerLangTip}
            />
            <div className={"flex flex-row gap-2"}>
              <IconButton
                isLoading={isSwrLoading}
                icon={<Icons.save className={"h-full"} />}
                type="submit"
              >
                Save
              </IconButton>
              <StatusMessage statusMessage={statusMessage} />
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
