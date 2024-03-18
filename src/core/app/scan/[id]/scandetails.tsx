"use client"

import { ReactNode, useEffect, useMemo, useState } from "react"
import { scanSingleFetcher } from "@/hooks/use-api"
import { useFile, useToken } from "@/hooks/use-file"
import { useSubscription } from "@/hooks/use-sub"
import Editor from "@monaco-editor/react"
import { ScansResponse } from "@webhood/types"
import { Loader } from "lucide-react"
import { useTheme } from "next-themes"
import useSWR, { useSWRConfig } from "swr"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { ImageFileComponent } from "@/components/ImageFileComponent"
import { Title } from "@/components/title"
import Traceviewer from "@/components/TraceViewer"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { columns } from "./columns"
import { DataTable } from "./data-table"

interface ScanImageProps {
  scanItem: ScansResponse
}

function ScanImage({ scanItem }: ScanImageProps) {
  const fileName = scanItem.screenshots[0]
  return (
    <div>
      {scanItem && fileName ? (
        <ImageFileComponent
          alt="Screenshot image of the page"
          width={1920 / 2}
          height={1080 / 2}
          placeholder={"blur"}
          blurDataURL={Icons.placeholder}
          fileName={fileName}
          document={scanItem}
        />
      ) : (
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
    </div>
  )
}

const ScanDetailItem = ({
  label,
  value,
}: {
  label: string
  value: string | ReactNode
}) => {
  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="col-span-4 text-sm font-medium">{value}</div>
    </div>
  )
}
function ScanDetails({ scanItem }: { scanItem: ScansResponse }) {
  const valsGen = (item) => {
    if (!scanItem.scandata || !scanItem.scandata[item]) return []
    const val = scanItem.scandata[item]
    return Object.keys(val).map((key) => {
      return { key: `${item}.${key}`, value: val[key] }
    })
  }
  if (!scanItem.scandata) return <p>No details available</p>
  const data = [
    ...valsGen("request"),
    ...valsGen("response"),
    ...valsGen("document"),
  ]
  return (
    <div className="truncate">
      <DataTable columns={columns} data={data} />
    </div>
  )
}

function ScanMetadetails({ scanItem }: { scanItem: ScansResponse }) {
  return (
    <div className="flex flex-col gap-2 truncate">
      <h4 className="text-md font-medium dark:text-gray-300">Scan results</h4>
      <ScanDetailItem label="Input URL" value={scanItem?.url} />
      <ScanDetailItem label="Final URL" value={scanItem?.final_url} />
      <Separator />
      <h4 className="text-md font-medium dark:text-gray-300">Scan metadata</h4>
      <ScanDetailItem label="Scan ID" value={scanItem?.id} />
      <ScanDetailItem label="Status" value={scanItem?.status} />
      <ScanDetailItem label={"Started"} value={scanItem?.created} />
      <ScanDetailItem label={"Finished"} value={scanItem?.done_at} />
      <ScanDetailItem
        label={"Error message"}
        value={scanItem?.error || <i>none</i>}
      />
    </div>
  )
}

function CodeViewer({ scanItem }: ScanImageProps) {
  const { resolvedTheme } = useTheme()
  const [html, setHtml] = useState("")
  const { token } = useToken()
  const htmlUrl = useFile(scanItem, "html", token)
  useEffect(() => {
    if (scanItem?.id && htmlUrl) {
      // fetch the html file using fetch
      fetch(htmlUrl)
        .then((res) => res.text())
        .then((html) => setHtml(html))
    }
  }, [scanItem?.id, htmlUrl])
  return (
    html && (
      <Editor
        height="90vh"
        defaultLanguage="html"
        theme={resolvedTheme == "dark" ? "vs-dark" : "vs-light"}
        loading={
          <div>
            Loading...
            <Icons.loader className={"inline"} />
          </div>
        }
        options={{ readOnly: true, links: false }}
        defaultValue={html}
      />
    )
  )
}

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
            <TabsTrigger value="screenshot" disabled={isError}>
              Screenshot
            </TabsTrigger>
            <TabsTrigger value="details" disabled={isError}>
              Details
            </TabsTrigger>
            <TabsTrigger value="html" disabled={isLoading || isError}>
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
