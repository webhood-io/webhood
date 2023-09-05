"use client"

import { FormEvent, useEffect, useState } from "react"
import Head from "next/head"
import { latestScansFetcher } from "@/hooks/use-api"
import { useToken } from "@/hooks/use-file"
import { useSubscription } from "@/hooks/use-sub"
import { useToast } from "@/hooks/use-toast"
import useSWR, { useSWRConfig } from "swr"

import { Scans } from "@/types/database.types"
import { ScansResponse } from "@/types/pocketbase-types"
import { pb } from "@/lib/pocketbase"
import { copyToClipboard, generateSlug, validateUrlRegex } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Layout } from "@/components/layout"
import { Title } from "@/components/title"
import { IconButton } from "@/components/ui/button-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  StatusMessage,
  StatusMessageProps,
} from "@/components/ui/statusMessage"
import { TypographyH3 } from "@/components/ui/typography/h3"
import { TypographySubtle } from "@/components/ui/typography/subtle"
import { ScanListItem } from "../components/ScanListItem"

function UrlForm({ refreshScanlist }: { refreshScanlist?: () => void }) {
  const [inputError, setInputError] = useState<StatusMessageProps | undefined>(
    undefined
  )

  // datetime now in unix timestamp
  const postUrl = async (rawUrl: string) => {
    // remove trailing whitespace and newlines
    const url = rawUrl.trim().replace(/^(?!(?:\w+:)?\/\/)/, "https://")
    let slug
    if (rawUrl.length === 0) {
      setInputError({ status: "error", message: "Empty URL" })
      throw new Error("Empty URL")
    }
    try {
      slug = generateSlug(url)
    } catch (e) {
      setInputError({ status: "error", message: "Invalid URL" })
      throw new Error("Invalid URL")
    }
    const data = {
      url: url,
      slug: slug,
      status: "pending",
    } as Scans

    const record = await pb.collection("scans").create(data)
    console.log(record)
    setInputError(undefined)
  }
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    let target = event.currentTarget
    postUrl(event.currentTarget["url"].value)
      .then(() => target.reset())
      .catch((e) => {
        setInputError({ status: "error", message: "Error" })
        console.error("Error trying to post URL", e)
      })
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="urlinput">URL</Label>
            <Input
              placeholder="Input URL here for scanning"
              id="urlinput"
              autoComplete="off"
              name="url"
            />
          </div>
          <div className="flex w-full flex-row items-center gap-4">
            <IconButton
              type="submit"
              icon={<Icons.start className={"h-full"} />}
              isLoading={false}
            >
              Start scan
            </IconButton>
            <div className="text-sm text-slate-500">
              <StatusMessage statusMessage={inputError} />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

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
    <div className="grid grid-cols-5 items-center gap-4">
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
              <div className="mx-1 flex flex-row items-center">
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

function ScanList({ scans }: { scans: ScansResponse[] }) {
  const { token } = useToken()
  return (
    <div className="flex w-full flex-col divide-y divide-slate-500">
      {scans?.map((document) => (
        <ScanListItem key={document.id} document={document} token={token} />
      ))}
    </div>
  )
}

export default function IndexPage() {
  // if not https
  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:"
  const {
    data: scanDataSwr,
    error: scanErrorSwr,
    isLoading: isSwrLoading,
  } = useSWR("/api/scans", latestScansFetcher)

  const { mutate } = useSWRConfig()

  useSubscription("scans", "*", () => mutate("/api/scans"))

  // use toast
  const { toast } = useToast()
  useEffect(() => {
    if (!isSecure) {
      toast({
        title: "Not secure",
        description:
          "Please use https to access this site. Functionality may be limited. See docs for more info.",
        duration: 5000,
        variant: "destructive",
      })
    }
  }, [isSecure])
  return (
    <Layout>
      <Head>
        <title>Webhood Dashboard</title>
        <meta
          name="description"
          content="Scan URL's around the web and identify phishing sites."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <section className="container grid auto-rows-max gap-6 pb-8 pt-6 md:py-10">
        <Title title="Start scans" subtitle="Start scanning here." />
        <UrlForm />
        <div className="flex flex-col gap-2 truncate">
          <div>
            <TypographyH3>Recent scans</TypographyH3>
            <TypographySubtle>
              Showing up to 10 most recent scans
            </TypographySubtle>
          </div>
          {scanDataSwr && <ScanList scans={scanDataSwr} />}
        </div>
      </section>
    </Layout>
  )
}
