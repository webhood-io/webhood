import { scanStatsFetcher } from "@/hooks/use-api"
import useSWR from "swr"
import { TypographySubtle } from "./ui/typography/subtle"
import { Button } from "./ui/button"
import { Loader, RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"

export default function ScanStatus() {

  const {
    data: scanDataSwr,
    error: scanErrorSwr,
    isValidating: isSwrLoading,
    mutate
  } = useSWR("/api/scanStats", scanStatsFetcher, {
    refreshInterval: 2*1000,
    })
  return (
    <div>
            <div className="flex flex-row items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => mutate()} className="-ml-2">
            <span className="text-sm font-semibold tracking-tight mr-2">Stats</span>
                {
                isSwrLoading
                ? <Loader size={10} className="animate animate-spin"/>
                : <RefreshCcw size={10}/>
                }
                </Button>
            </div>
        {scanDataSwr
          && scanDataSwr.map((scan) => {
                return <div>
                <div key={scan.id} className="flex flex-row justify-between text-sm ">
                    <TypographySubtle>{scan.status}:</TypographySubtle>
                    <TypographySubtle>{scan.count_items}</TypographySubtle>
                    </div>
          </div>
                }
          )}
    </div>
  )
}