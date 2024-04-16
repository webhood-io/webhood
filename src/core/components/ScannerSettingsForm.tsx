import { zodResolver } from "@hookform/resolvers/zod"
import { ScannerConfig, ScannersResponse } from "@webhood/types"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  ScannerLangTip,
  ScannerUaTip,
  SimultaneousScansTooltip,
  SkipCookiePromptTooltip,
  StealthTooltip,
  UseCloudApiTooltip,
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
import { Switch } from "@/components/ui/switch"

export function SettingsInput({
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
export function SwitchInput({
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

export const scannerOptionsSchema = z
  .object({
    id: z.string(),
    config: z.object({
      ua: z.string().optional(),
      lang: z.string().optional(),
      simultaneousScans: z.string().optional(),
      useStealth: z.boolean().optional(),
      useSkipCookiePrompt: z.boolean().optional(),
      useCloudCaptchaSolver: z.boolean().optional(),
    }),
    useCloudApi: z.boolean(),
    apiToken: z.string().optional(),
    name: z.string(),
  })
  .superRefine((data, ctx) => {
    console.log(data)
    if (data.useCloudApi && !(data.apiToken?.length > 0)) {
      ctx.addIssue({
        path: ["apiToken"],
        code: z.ZodIssueCode.custom,
        message: "Cloud API token is required when using cloud API.",
      })
      return data.apiToken?.length > 0
    }
    return z.NEVER
  })

export const managedByCloudPlaceholder = "Managed by cloud"

export function ScannerSettingsForm({
  scanner,
  onSubmit,
  statusMessage,
}: {
  scanner: ScannersResponse
  onSubmit: (data: any) => void
  statusMessage: StatusMessageProps
}) {
  const form = useForm<z.infer<typeof scannerOptionsSchema>>({
    resolver: zodResolver(scannerOptionsSchema),
    defaultValues: {
      config: (scanner.config as ScannerConfig) || {
        ua: "",
        lang: "",
        useStealth: false,
        useSkipCookiePrompt: false,
        useCloudCaptchaSolver: false,
      },
      useCloudApi: scanner.useCloudApi || false,
      apiToken: scanner.apiToken || "",
      id: scanner.id,
      name: scanner.name,
    },
  })
  const isCloudManaged = scanner.isCloudManaged === true
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SettingsInput {...field} label="Id" disabled={true} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    value={isCloudManaged ? "" : field.value}
                    disabled={isCloudManaged}
                    placeholder={
                      isCloudManaged
                        ? managedByCloudPlaceholder
                        : "Friendly name for this scanner"
                    }
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
                    value={isCloudManaged ? "" : field.value}
                    label="Simultaneous Scans"
                    disabled={isCloudManaged}
                    name="config.simultaneousScans"
                    placeholder={
                      isCloudManaged
                        ? managedByCloudPlaceholder
                        : "Defaults to 1 when not set"
                    }
                    tooltip={SimultaneousScansTooltip}
                    type="number"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="useCloudApi"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SwitchInput
                    {...field}
                    label="Use Cloud API"
                    name="useCloudApi"
                    tooltip={UseCloudApiTooltip}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch("useCloudApi") && (
            <div className="border-l-2 pl-4">
              <FormField
                control={form.control}
                name="apiToken"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SettingsInput
                        {...field}
                        label="API Token"
                        name="apiToken"
                        placeholder="API Token for cloud.webhood.io"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="config.useCloudCaptchaSolver"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SwitchInput
                        {...field}
                        label="Captcha Solver"
                        name="config.useCloudCaptchaSolver"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
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
