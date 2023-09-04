import { ReactNode, useEffect, useState } from "react"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import { scanSingleFetcher } from "@/hooks/use-api"
import { useFile, useToken } from "@/hooks/use-file"
import { useSubscription } from "@/hooks/use-sub"
import Editor from "@monaco-editor/react"
import { useTheme } from "next-themes"
import useSWR, { useSWRConfig } from "swr"

import { ScansResponse } from "@/types/pocketbase-types"
import { Scan } from "@/types/pocketbase_db.types"
import { siteConfig } from "@/config/site"
import { parseUrl } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Layout } from "@/components/layout"
import { Title } from "@/components/title"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ScanImageProps {
  scanItem: ScansResponse
}

function ScanImage({ scanItem }: ScanImageProps) {
  const { token } = useToken()
  const imageUrl = useFile(scanItem, "screenshots", token)
  return (
    <div>
      {scanItem && imageUrl ? (
        <Image
          alt="Screenshot image of the page"
          width={1920 / 2}
          height={1080 / 2}
          placeholder={"blur"}
          blurDataURL={Icons.placeholder}
          src={imageUrl}
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

export default function ScanPage() {
  const router = useRouter()
  const scanId = router.query.scanid as string
  const { data: scanItem, error } = useSWR({ slug: scanId }, scanSingleFetcher)
  const { mutate } = useSWRConfig()
  useSubscription("scans", scanItem?.id, () => mutate({ slug: scanId }))
  const isLoading = !scanItem && !error

  const host = parseUrl(scanItem?.url).host
  const isError = scanItem?.status === "error"
  return (
    <Layout>
      <Head>
        <title>{host ? `${host} - ${siteConfig.name}` : siteConfig.name}</title>
      </Head>
      <div className="container grid auto-rows-max gap-6 pb-8 pt-6 md:py-10">
        <div className={"truncate"}>
          {" "}
          {/* for large url */}
          <Title title="Scan results" subtitle={scanItem?.url} />
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
          <Tabs defaultValue={isError ? "details" : "screenshot"}>
            <TabsList>
              <TabsTrigger value="screenshot" disabled={isError}>
                Screenshot
              </TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="html" disabled={isError}>
                HTML
              </TabsTrigger>
            </TabsList>
            <TabsContent value={"screenshot"}>
              {scanId && (
                <ScanImage scanItem={scanItem} key={scanId as string} />
              )}
            </TabsContent>
            <TabsContent value={"details"}>
              <ScanDetails scanItem={scanItem} key={scanId as string} />
            </TabsContent>
            <TabsContent value={"html"}>
              <CodeViewer scanItem={scanItem} key={scanId as string} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  )
}