"use client"

import { ScansResponse } from "@webhood/types"

import { Icons } from "@/components/icons"
import { ImageFileComponent } from "@/components/ImageFileComponent"
import { ScreenshotContextMenu } from "@/components/ScreenshotActionMenu"

export interface ScanImageProps {
  scanItem: ScansResponse
}

//#region ScanImage
export function Screenshot({ scanItem }: ScanImageProps) {
  const fileName = scanItem.screenshots[0]
  return (
    <div>
      {scanItem && fileName ? (
        <ScreenshotContextMenu imageUrl={fileName} record={scanItem}>
          <ImageFileComponent
            alt="Screenshot image of the page"
            width={1920 / 2}
            height={1080 / 2}
            placeholder={"blur"}
            blurDataURL={Icons.placeholder}
            fileName={fileName}
            document={scanItem}
          />
        </ScreenshotContextMenu>
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
