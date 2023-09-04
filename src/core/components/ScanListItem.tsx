"use client"

import Image from "next/image"
import Link from "next/link"
import { useFile } from "@/hooks/use-file"
import ScanLoading from "@/public/scan-in-progress.png"
import X from "@/public/x.png"

import { ScansResponse } from "@/types/pocketbase-types"
import { dateToLocaleString, parseUrl } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { DataItem } from "../pages"

export function ScanListItem({
  document,
  token,
}: {
  document: ScansResponse
  token: string
}) {
  const { protocol, host, path, query, fragment } = parseUrl(document.url)
  const imageUrl = useFile(document, "screenshots", token)
  return (
    <div className="flex-rows flex justify-between py-3">
      <div className="flex w-full flex-col truncate">
        <Popover>
          <PopoverTrigger>
            <div
              className={"truncate text-left text-xl font-bold text-slate-700"}
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
          <PopoverContent className="w-[32rem] bg-slate-50">
            <div className="grid gap-4 truncate">
              <div className="flex flex-row items-start justify-between">
                <div className={"flex flex-row items-center gap-2"}>
                  {/* Status = Scanning */}
                  {document.status === "pending" && (
                    <Image
                      src={ScanLoading}
                      alt={"Placeholder image"}
                      placeholder={"blur"}
                      width={192 / 2}
                      height={108 / 2}
                    />
                  )}
                  {/* Status = Done */}
                  {document.status === "done" && imageUrl && (
                    <Image
                      alt={"Screenshot of the scan"}
                      src={imageUrl}
                      width={192 / 2}
                      height={108 / 2}
                      placeholder={"blur"}
                      blurDataURL={Icons.placeholder}
                    />
                  )}
                  {/* Status = Error */}
                  {document.status === "error" && (
                    <Image
                      src={X}
                      alt={"Placeholder image"}
                      placeholder={"blur"}
                      width={192 / 2}
                      height={108 / 2}
                    />
                  )}

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
              <div className="mb-1 mr-1 grid gap-2">
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
        <div className="grid grid-cols-4">
          {/* Status */}
          <div className="flex-rows flex items-center gap-0.5 text-slate-500">
            {document.status === "pending" && <Icons.clock className="h-4" />}
            {document.status === "running" && <Icons.loader className="h-4" />}
            {document.status === "error" && <Icons.error className="h-4" />}
            {document.status === "done" && <Icons.done className="h-4" />}
            <div className="text-sm">{document.status}</div>
          </div>
          {/* When */}
          <div className="flex-rows flex items-center gap-0.5 text-slate-500">
            <div className="text-sm">
              {dateToLocaleString(new Date(document.created))}
            </div>
          </div>
        </div>
      </div>
      <Link className="px-1" href={`/scan/${document.slug}`} target="_blank">
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
