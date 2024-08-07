import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import ScanLoading from "@/public/scan-in-progress.png"
import X from "@/public/x.png"
import {
  ScanData,
  ScannersResponse,
  ScanOptions,
  ScansResponse,
} from "@webhood/types"
import { Bot, Radar, User } from "lucide-react"

import { dateToLocaleString, parseUrl } from "@/lib/utils"
import { DataItem } from "@/components/DataItem"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ImageFileComponent } from "./ImageFileComponent"

export function ScanListItem({
  document,
  scanners,
}: {
  document: ScansResponse
  scanners?: ScannersResponse[]
}) {
  let img
  const fileName =
    document.screenshots &&
    document.screenshots.length > 0 &&
    document.screenshots[0]

  const getScannerNameFromId = (id: string): string => {
    if (!scanners) return ""
    return scanners.find((scanner) => scanner.id === id)?.name || ""
  }
  function getScanScannerId(document: ScansResponse) {
    const scanData = document.scandata as ScanData
    if (scanData?.version === "1.1" && scanData?.meta?.scannedByScanner) {
      return scanData.meta.scannedByScanner
    } else if (document.options) {
      const scanOptions = document.options as ScanOptions
      return scanOptions.scannerId
    }
    return undefined
  }
  const scannerName = useMemo(() => {
    const scannerId = getScanScannerId(document)
    if (scannerId) {
      return getScannerNameFromId(scannerId)
    }
  }, [document.status])
  switch (document.status) {
    case "pending" || "queued":
      img = (
        <Image
          src={ScanLoading}
          alt={"Placeholder image"}
          placeholder={"blur"}
          width={192 / 2}
          height={108 / 2}
        />
      )
      break
    case "done":
      img = (
        <ImageFileComponent
          fileName={fileName}
          document={document}
          alt={"Screenshot of the scan"}
          width={192 / 2}
          height={108 / 2}
          placeholder={"blur"}
          blurDataURL={Icons.placeholder}
        />
      )
      break
    case "error":
      img = (
        <Image
          src={X}
          alt={"Error image"}
          placeholder={"blur"}
          width={192 / 2}
          height={108 / 2}
        />
      )
      break
    case "running":
      img = (
        <Image
          src={ScanLoading}
          alt={"Placeholder image"}
          placeholder={"blur"}
          width={192 / 2}
          height={108 / 2}
        />
      )
      break
  }
  return (
    <ScanListItemComponent
      document={document}
      ImageComponent={img}
      scannerName={scannerName}
    />
  )
}

export function ScanListItemComponent({
  document,
  ImageComponent,
  scannerName,
}: {
  document: ScansResponse
  ImageComponent: React.ReactNode
  scannerName: string
}) {
  const { protocol, host, path, query, fragment } = parseUrl(document.url)
  const scanData = document.scandata as ScanData
  const username = scanData?.version === "1.1" && scanData.meta?.initiatedBy
  const initiatedByType =
    scanData?.version == "1.1" && scanData.meta?.initiatedByType
  return (
    <div className="flex-rows flex justify-between py-3">
      <div className="flex w-full flex-col truncate">
        <Popover>
          <PopoverTrigger>
            <div
              className={"truncate text-left text-xl font-bold text-slate-700"}
              data-cy="scan-url"
            >
              {/* Protocol
            <span className="text-slate-500 dark:text-slate-400 text-xs tracking-tight text-center mr-1">{protocol}</span>
            */}
              {/* Host */}
              <span className="text-slate-700 dark:text-slate-300">{host}</span>
              {/* Path */}
              <span className="text-slate-500 dark:text-slate-400">{path}</span>
              {/* Query */}
              {query && (
                <span className="text-slate-500 dark:text-slate-400">
                  ?{query}
                </span>
              )}
              {/* Fragment */}
              {fragment && (
                <span className="text-slate-500 dark:text-slate-400">
                  #{fragment}
                </span>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-[32rem] bg-slate-50"
            data-cy="scan-modal"
          >
            <div className="grid gap-4 truncate">
              <div className="flex flex-row items-start justify-between">
                <div className={"flex flex-row items-center gap-2"}>
                  <div data-cy="image-div">{ImageComponent}</div>
                  <div className="space-y-1">
                    <h4 className="font-medium leading-none">Details</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Details about the scan
                    </p>
                  </div>
                </div>
                <Link href={`/scan/${document.slug}`} target="_blank">
                  <div className="flex flex-row items-center">
                    <p className="text-sm dark:text-slate-300">
                      Open scan results
                    </p>
                    <Icons.link className="ml-1 h-4" />
                  </div>
                </Link>
              </div>
              <div
                className="mb-1 mr-1 grid gap-2"
                data-cy="scan-detailed-table"
              >
                <DataItem content={document.url} label={"Input URL"} copy />
                <DataItem
                  content={document.final_url}
                  label={"Final URL"}
                  copy
                />
                <Separator />
                <DataItem label={"Status"} content={document.status} />
                <DataItem label={"Started"} content={document.created} />
                <DataItem label={"Finished"} content={document.done_at} />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <div className="grid grid-cols-4 text-sm">
          {/* Status */}
          <div className="flex-rows flex items-center gap-0.5 text-slate-500">
            {document.status === "pending" && <Icons.clock className="h-4" />}
            {document.status === "queued" && <Icons.clock className="h-4" />}
            {document.status === "running" && <Icons.loader className="h-4" />}
            {document.status === "error" && <Icons.error className="h-4" />}
            {document.status === "done" && <Icons.done className="h-4" />}
            <div data-cy="scan-status-text">{document.status}</div>
          </div>
          {/* When */}
          <div
            className="flex flex-row items-center gap-0.5 text-slate-500"
            title="Date when the scan was initialized"
          >
            <div>{dateToLocaleString(new Date(document.created))}</div>
          </div>
          {/* Which scanner */}
          <div
            className="flex flex-row items-center gap-0.5 text-sm text-slate-500 dark:text-slate-400"
            title="Scanner name"
          >
            {scannerName && (
              <>
                <Radar size={15} />
                {scannerName}
              </>
            )}
          </div>
          {/* Who initiated */}
          <div
            className="flex flex-row items-center gap-0.5 text-sm text-slate-500 dark:text-slate-400"
            title="Initiated by"
          >
            {username && (
              <>
                {initiatedByType === "user" ? (
                  <User size={15} />
                ) : (
                  <Bot size={15} />
                )}
                {username}
              </>
            )}
          </div>
        </div>
      </div>
      <Link
        className="px-1"
        href={`/scan/${document.slug}`}
        data-cy="slug-link"
        //target="_blank"
      >
        <Button
          variant="ghost"
          className="align-right h-10 w-10"
          size="sm"
          type="button"
        >
          <Icons.open />
        </Button>
      </Link>
    </div>
  )
}
