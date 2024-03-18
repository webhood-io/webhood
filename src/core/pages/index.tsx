"use client"

import { useEffect } from "react"
import Head from "next/head"
import { latestScansFetcher } from "@/hooks/use-api"
import { useSubscription } from "@/hooks/use-sub"
import { useToast } from "@/hooks/use-toast"
import { ScansResponse } from "@webhood/types"
import useSWR, { useSWRConfig } from "swr"

import { siteConfig } from "@/config/site"
import { Layout } from "@/components/layout"
import { Title } from "@/components/title"
import { TypographyH3 } from "@/components/ui/typography/h3"
import { TypographySubtle } from "@/components/ui/typography/subtle"
import { UrlForm } from "@/components/UrlForm"
import { ScanListItem } from "../components/ScanListItem"

function ScanList({ scans }: { scans: ScansResponse[] }) {
  return (
    <div className="flex w-full flex-col divide-y divide-slate-500">
      {scans?.map((document) => (
        <ScanListItem key={document.id} document={document} />
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
        <meta name="description" content={siteConfig.description} />
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
