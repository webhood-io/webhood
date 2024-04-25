"use client"

import { useEffect, useMemo, useState } from "react"
import { scanSingleFetcher } from "@/hooks/use-api"
import { useSubscription } from "@/hooks/use-sub"
import { Loader } from "lucide-react"
import useSWR, { useSWRConfig } from "swr"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Title } from "@/components/title"
import Traceviewer from "@/components/TraceViewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeViewer } from "./tabs/CodeViewer"
import { ScanDetails } from "./tabs/ScanDetails"
import { ScanImage } from "./tabs/ScanImage"
import { ScanMetadetails } from "./tabs/ScanMetadetails"

function getScanIcon(status: string) {
  const className = "md:size-[45px] size-[25px]"
  switch (status) {
    case "running":
      return (
        <span title="Scan is running">
          <Loader className={cn("animate animate-spin", className)} />
        </span>
      )
    case "error":
      return (
        <span title="Scan errored">
          <Icons.error className={className} />
        </span>
      )
    case "done":
      return (
        <span title="Scan is done">
          <Icons.check className={className} />
        </span>
      )
    case "pending":
      return (
        <span title="Scan is pending">
          <Icons.clock className={className} />
        </span>
      )
    default:
      return null
  }
}

//#region ScanPage
export default function ScanPage({ id }: { id: string }) {
  const [tabState, setTabState] = useState("screenshot")
  const scanId = id
  const { data: scanItem, error } = useSWR({ slug: scanId }, scanSingleFetcher)
  const { mutate } = useSWRConfig()
  useSubscription("scans", scanItem?.id, () => mutate({ slug: scanId }))
  const isLoading = !scanItem && !error

  const isError = scanItem?.status === "error"
  const isTraceDisabled = isError || scanItem?.html.length < 2
  useEffect(() => {
    if (scanItem?.status === "error") {
      setTabState("meta")
    }
    if (scanItem?.files.length > 0) {
      setTabState("meta")
    }
  }, [scanItem?.status])
  const titleStatusImg = useMemo(
    () => getScanIcon(scanItem?.status),
    [scanItem?.status]
  )
  const title = useMemo(() => {
    return (
      <div className="flex flex-row items-center gap-2">
        Scan results
        {titleStatusImg}
      </div>
    )
  }, [scanItem?.status])
  const hasContent = (field) => {
    return scanItem && scanItem[field]
  }
  const hasFiles = (field) => {
    return scanItem && scanItem[field] && scanItem[field].length > 0
  }
  return (
    <div className="container grid auto-rows-max gap-6 pb-8 pt-6 md:py-10">
      <div className={"truncate"}>
        {" "}
        {/* for large url */}
        <Title title={title} subtitle={scanItem?.url} />
      </div>
      {isLoading && (
        <div className="mx-auto w-full p-4 shadow">
          <div className="flex h-96 w-full animate-pulse space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 rounded bg-slate-700"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 h-2 rounded bg-slate-700"></div>
                  <div className="col-span-1 h-2 rounded bg-slate-700"></div>
                </div>
                <div className="h-2 rounded bg-slate-700"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {scanItem && (
        <Tabs
          defaultValue={isError ? "meta" : "screenshot"}
          value={tabState}
          onValueChange={setTabState}
        >
          <TabsList>
            <TabsTrigger
              value="screenshot"
              disabled={
                isError ||
                (scanItem?.status === "done" && !hasFiles("screenshots"))
              }
            >
              Screenshot
            </TabsTrigger>
            <TabsTrigger
              value="details"
              disabled={isError || !hasContent("scandata")}
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="html"
              disabled={isLoading || isError || !hasFiles("html")}
            >
              HTML
            </TabsTrigger>
            <TabsTrigger value="trace" disabled={isTraceDisabled}>
              Trace
            </TabsTrigger>
            <TabsTrigger value="meta">Metadata</TabsTrigger>
          </TabsList>
          <TabsContent value={"screenshot"}>
            {scanId && <ScanImage scanItem={scanItem} key={scanId as string} />}
          </TabsContent>
          <TabsContent value={"details"}>
            <ScanDetails scanItem={scanItem} key={scanId as string} />
          </TabsContent>
          <TabsContent value={"meta"}>
            <ScanMetadetails scanItem={scanItem} key={scanId as string} />
          </TabsContent>
          <TabsContent value={"html"}>
            <CodeViewer scanItem={scanItem} key={scanId as string} />
          </TabsContent>
          <TabsContent value={"trace"}>
            <Traceviewer scanItem={scanItem} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
