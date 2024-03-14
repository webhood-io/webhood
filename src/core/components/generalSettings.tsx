import * as React from "react"
import { scannersFetcher } from "@/hooks/use-api"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import useSWR, { useSWRConfig } from "swr"
import { z } from "zod"

import { ScannersRecord } from "@/types/pocketbase-types"
import { pb } from "@/lib/pocketbase"
import {
  ScannerLangTip,
  ScannerUaTip,
  SimultaneousScansTooltip,
  SkipCookiePromptTooltip,
  StealthTooltip,
} from "@/lib/tips"
import { Icons } from "@/components/icons"
import { StatusMessage, StatusMessageProps } from "@/components/statusMessage"
import { IconButton } from "@/components/ui/button-icon"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { GenericTooltip } from "@/components/ui/generic-tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TypographyLarge } from "@/components/ui/typography/large"
import { TypographySubtle } from "@/components/ui/typography/subtle"
import { Switch } from "@/components/ui/switch"
import { useStatusMessage } from "@/hooks/use-statusmessage"

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
function SwitchInput({
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
    <div className="grid grid-cols-5 items-center py-2">
      <Label>
        <div className={"mr-2 flex items-center justify-between gap-1"}>
          {label}
          {tooltip && <GenericTooltip>{tooltip}</GenericTooltip>}
        </div>
      </Label>
      <Switch
        checked={props.value}
        onCheckedChange={props.onChange}
        id={name.toLowerCase()}
        {...props}
      />
    </div>
  )
}

const scannerOptionsSchema = z.object({
  config: z.object({
    ua: z.string().optional(),
    lang: z.string().optional(),
    simultaneousScans: z.string().optional(),
    useStealth: z.boolean().optional(),
    useSkipCookiePrompt: z.boolean().optional(),
  }),
  name: z.string(),
})

function ScannerSettingsForm({
  scanner,
  onSubmit,
  statusMessage,
}: {
  scanner: ScannersRecord
  onSubmit: (data: any) => void
  statusMessage: StatusMessageProps
}) {
  const form = useForm<z.infer<typeof scannerOptionsSchema>>({
    resolver: zodResolver(scannerOptionsSchema),
    defaultValues: {
      config: scanner.config,
      name: scanner.name,
    },
  })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SettingsInput
                    {...field}
                    label="Name"
                    name="name"
                    placeholder="Friendly name for this scanner"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.ua"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SettingsInput
                    {...field}
                    label="User Agent"
                    name="config.ua"
                    placeholder="User agent"
                    tooltip={ScannerUaTip}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.lang"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SettingsInput
                    {...field}
                    label="Language"
                    name="config.lang"
                    placeholder="Language"
                    tooltip={ScannerLangTip}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.useStealth"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SwitchInput
                    {...field}
                    label="Stealth mode"
                    name="config.useStealth"
                    placeholder="False"
                    tooltip={StealthTooltip}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.useSkipCookiePrompt"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SwitchInput
                    {...field}
                    label="Skip cookie prompts"
                    name="config.useSkipCookiePrompt"
                    placeholder="False"
                    tooltip={SkipCookiePromptTooltip}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="config.simultaneousScans"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SettingsInput
                    {...field}
                    label="Simultaneous Scans"
                    name="config.simultaneousScans"
                    placeholder="Defaults to 1 when not set"
                    tooltip={SimultaneousScansTooltip}
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className={"mt-2 flex flex-row gap-2"}>
          <IconButton icon={<Icons.save className={"h-full"} />} type="submit">
            Save
          </IconButton>
          <StatusMessage statusMessage={statusMessage} />
        </div>
      </form>
    </Form>
  )
}

export function GeneralSettings() {
  const {statusMessage, setStatusMessage} = useStatusMessage()
  const [selectedScanner, setSelectedScanner] = React.useState<
    ScannersRecord | undefined
  >(undefined)
  const {
    data: scanDataSwr,
    error: scanErrorSwr,
    isLoading: isSwrLoading,
  } = useSWR("/api/scanners", scannersFetcher)

  const { mutate } = useSWRConfig()
  React.useEffect(() => {
    if (scanDataSwr && selectedScanner === undefined) {
      setSelectedScanner(scanDataSwr[0])
    }
  }, [scanDataSwr])

  const handleSubmit = (data: ScannersRecord) => {
    const record = pb
      .collection("scanners")
      .update(selectedScanner.id, data)
      .then((res) => {
        setStatusMessage({
          status: "success",
          message: "Settings saved",
        })
        mutate("/api/scanners")
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
  const { ua, lang } = selectedScanner?.config || { ua: "", lang: "" }
  if ((!scanDataSwr || scanDataSwr.length === 0) && !isSwrLoading)
    return <div>No scanners found. Add a scanner and start scanning.</div>
  if (!selectedScanner) return <div>Loading...</div>
  return (
    <div className="flex flex-col justify-between gap-6">
      <div className="flex flex-row justify-between gap-2">
        <div>
          <TypographyLarge>Scanner settings</TypographyLarge>
          <TypographySubtle>
            Configure settings for your scanners.
          </TypographySubtle>
        </div>
        <div className="max-w-[300px]">
        <Select
          defaultValue={selectedScanner.id}
          onValueChange={(value) =>
            setSelectedScanner(scanDataSwr?.find((e) => e.id === value))
          }
        >
          <SelectTrigger className="truncate">
            <SelectValue placeholder="Select a scanner"/>
          </SelectTrigger>
          <SelectContent>
            {scanDataSwr?.map((scanner) => (
              <SelectItem value={scanner.id} className="-z-100">
                {scanner.name || scanner.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      </div>
      <ScannerSettingsForm
        scanner={selectedScanner}
        onSubmit={handleSubmit}
        key={selectedScanner.id}
        statusMessage={statusMessage}
      />
    </div>
  )
}
