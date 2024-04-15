"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { useFile, useToken } from "@/hooks/use-file"
import {
  ScanData,
  ScannerConfig,
  ScanOptions,
  ScansResponse,
} from "@webhood/types"
import useSWR from "swr"

import { pb } from "@/lib/pocketbase"
import { GenericTooltip } from "@/components/ui/generic-tooltip"
import { Separator } from "@/components/ui/separator"

export const ScanDetailItem = ({
  label,
  value,
}: {
  label: string
  value: string | ReactNode
}) => {
  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      {value ? (
        <div className="col-span-4 text-sm font-medium">{value}</div>
      ) : (
        <div className="col-span-4 text-sm font-medium italic">none</div>
      )}
    </div>
  )
}
//#region ScanMetadetails
export function ScanMetadetails({ scanItem }: { scanItem: ScansResponse }) {
  const { token } = useToken()
  const scanData = scanItem?.scandata as ScanData
  let scannerConfig = {} as ScannerConfig
  let scanOptions = {} as ScanOptions
  if (scanData.version === "1.1") {
    scannerConfig = scanData.scannerConfig
    scanOptions = scanData.scanOptions
  }
  const { data: scannerData } = useSWR({ slug: scanOptions?.scannerId }, () =>
    pb.collection("scanners").getOne(scanOptions.scannerId)
  )
  const url = useFile(scanItem, "files", token, 0)
  console.log(scanData.version)
  return (
    <div className="flex flex-col gap-2 truncate">
      <h4 className="text-md font-medium dark:text-gray-300">Scan results</h4>
      <ScanDetailItem label="Input URL" value={scanItem?.url} />
      <ScanDetailItem label="Final URL" value={scanItem?.final_url} />
      <Separator />
      <h4 className="text-md font-medium dark:text-gray-300">Scan metadata</h4>
      <ScanDetailItem label="Scan ID" value={scanItem?.id} />
      <ScanDetailItem label="Status" value={scanItem?.status} />
      {(!scanData || scanData?.version < "1.1") && (
        <>
          <ScanDetailItem label={"Started"} value={scanItem?.created} />
          <ScanDetailItem label={"Finished"} value={scanItem?.done_at} />
        </>
      )}
      {scanData.version === "1.1" && (
        <>
          <ScanDetailItem
            label={"Initiated at"}
            value={scanData.meta.initiatedAt}
          />
          <ScanDetailItem
            label={"Started scanning at"}
            value={scanData.meta.startedAt}
          />
          <ScanDetailItem
            label={"Finished"}
            value={scanData.meta.completedAt}
          />
          <ScanDetailItem
            label={"Duration"}
            value={scanData.meta.duration ? `${scanData.meta.duration}s` : ""}
          />
          <ScanDetailItem
            key={"initiatedBy"}
            label={"Initiated by user"}
            value={scanData.meta.initiatedBy}
          />
        </>
      )}
      <ScanDetailItem label={"Error message"} value={scanItem?.error || ""} />
      <ScanDetailItem
        label={"Downloaded file"}
        value={
          scanItem?.files.length > 0 ? (
            <div className="flex h-fit flex-row gap-2">
              {scanItem?.files[0]}
              {url && (
                <Link className="text-blue-700 underline" href={url || ""}>
                  Download
                </Link>
              )}
              <GenericTooltip>
                The Download link will initiate a download on your browser for a
                .zip file containting the file downloaded from the scanned page.
              </GenericTooltip>
            </div>
          ) : (
            "No file downloaded"
          )
        }
      />
      {scanData.version === "1.1" && scannerConfig && (
        <>
          <Separator />
          <h4 className="text-md font-medium dark:text-gray-300">
            Scanner config
          </h4>
          <ScanDetailItem
            key={"ua"}
            label={"User agent"}
            value={scannerConfig.ua}
          />
          <ScanDetailItem
            key={"lang"}
            label={"Browser language"}
            value={scannerConfig.lang}
          />
          <ScanDetailItem
            key={"useStealth"}
            label={"Stealth mode"}
            value={scannerConfig.useStealth ? "Enabled" : "Disabled"}
          />
          <ScanDetailItem
            key={"useSkipCookiePrompt"}
            label={"Skip cookie prompt"}
            value={scannerConfig.useSkipCookiePrompt ? "Enabled" : "Disabled"}
          />
        </>
      )}
      {scanData.version === "1.1" && scanOptions && (
        <>
          <Separator />
          <h4 className="text-md font-medium dark:text-gray-300">
            Scan options
          </h4>
          <ScanDetailItem
            key={"scannerId"}
            label={"Scanner ID"}
            value={
              scanOptions.scannerId
                ? `${scanOptions.scannerId} (${scannerData?.name})`
                : ""
            }
          />
          <ScanDetailItem
            key={"rate"}
            label={"Scan rate"}
            value={scanOptions.rate}
          />
        </>
      )}
    </div>
  )
}
