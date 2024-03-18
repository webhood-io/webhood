"use client"

import { useState } from "react"
import { scannersFetcher } from "@/hooks/use-api"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import useSWR from "swr"
import { z } from "zod"

import { ScansRecord } from "@webhood/types"
import { pb } from "@/lib/pocketbase"
import { generateSlug } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { StatusMessage, StatusMessageProps, StatusMessageUncontrolled } from "@/components/statusMessage"
import { IconButton } from "@/components/ui/button-icon"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"

const urlFormSchema = z.object({
  url: z.string(),
  options: z
    .object({
      scannerId: z.string().optional(),
    })
    .optional(),
})

export function UrlForm() {
  const [inputError, setInputError] = useState<StatusMessageProps | null>(
    undefined
  )
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<z.infer<typeof urlFormSchema>>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      options: {
        scannerId: "any",
      },
      url: "",
    },
  })

  const {
    data: scannerDataSwr,
    error: scannerErrorSwr,
    isLoading: isSwrLoading,
  } = useSWR("/api/scanners", scannersFetcher)

  // TODO: handle other errors as well
  const isOptionsError = scannerDataSwr && scannerDataSwr.length === 0

  // datetime now in unix timestamp
  const postUrl = async (rawUrl: string) => {
    console.log("Posting URL", rawUrl)
    // remove trailing whitespace and newlines
    const url = rawUrl.trim().replace(/^(?!(?:\w+:)?\/\/)/, "https://")
    let slug
    if (rawUrl.length === 0) {
      setInputError({ status: "error", message: "Empty URL" })
      return
    }
    try {
      slug = generateSlug(url)
    } catch (e) {
      setInputError({ status: "error", message: "Invalid URL" })
      return
    }
    const scannerId = form.getValues("options.scannerId")
    const data = {
      url: url,
      slug: slug,
      status: "pending",
      options: {
        scannerId: scannerId === "any" ? undefined : scannerId,
      },
    } as ScansRecord

    const record = await pb.collection("scans").create(data)
    console.log(record)
    setInputError(null)
    setIsLoading(false)
  }
  const handleSubmit = (data) => {
    setIsLoading(true)
    setInputError(null)
    postUrl(data.url)
      .then(() => form.resetField("url"))
      .catch((e) => {
        setInputError({ status: "error", message: "Error" })
        console.error("Error trying to post URL", e)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} autoComplete="off">
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input
                    data-cy="url-input"
                    placeholder="URL to scan"
                    autoFocus
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Collapsible>
            <IconButton
              data-cy="url-submit"
              type="submit"
              icon={<Icons.start className={"h-full"} />}
              isLoading={isLoading}
            >
              Start scan
            </IconButton>
            <CollapsibleTrigger asChild>
              <Toggle type="button" className="mx-2" data-cy="options-open">
                Options{" "}
                {isOptionsError && (
                  <AlertCircle className="h-4 stroke-red-500" />
                )}
              </Toggle>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <FormField
                control={form.control}
                name="options.scannerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scanner</FormLabel>
                    {isOptionsError && (
                      <FormDescription>
                        <StatusMessageUncontrolled
                          statusMessage={{
                            message: "No scanners available.",
                            status: "error",
                          }}
                        />
                      </FormDescription>
                    )}
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        name={field.name}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select scanner to run the scan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem key={"any"} value={"any"}>
                            {"any (default)"}
                          </SelectItem>
                          {scannerDataSwr &&
                            scannerDataSwr.map((scanner) => (
                              <SelectItem key={scanner.id} value={scanner.id}>
                                {scanner.name || scanner.id}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>
          {inputError && (
            <div data-cy="url-input-error">
              <StatusMessage statusMessage={inputError} />
            </div>
          )}
        </div>
      </form>
    </Form>
  )
}
