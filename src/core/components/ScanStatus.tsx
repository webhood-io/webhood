import { scanStatsFetcher } from "@/hooks/use-api"
import { Loader, RefreshCcw } from "lucide-react"
import useSWR from "swr"

import { Button } from "./ui/button"
import { TypographySubtle } from "./ui/typography/subtle"

export default function ScanStatus() {
  const {
    data: scanDataSwr,
    error: scanErrorSwr,
    isValidating: isSwrLoading,
    mutate,
  } = useSWR("/api/scanStats", scanStatsFetcher, {
    refreshInterval: 2 * 1000,
  })
  return (
    <div>
      <div className="flex flex-row items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => mutate()}
          className="-ml-2"
        >
          <span className="mr-2 text-sm font-semibold tracking-tight">
            Stats
          </span>
          {isSwrLoading ? (
            <Loader size={10} className="animate animate-spin" />
          ) : (
            <RefreshCcw size={10} />
          )}
        </Button>
      </div>
      {scanDataSwr &&
        scanDataSwr.map((scan) => {
          return (
            <div key={scan.id}>
              <div
                key={scan.id}
                className="flex flex-row justify-between text-sm "
              >
                <TypographySubtle>{scan.status}:</TypographySubtle>
                <TypographySubtle>{scan.count_items}</TypographySubtle>
              </div>
            </div>
          )
        })}
    </div>
  )
}
