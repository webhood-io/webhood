"use client"

import { FormEvent, useState } from "react"

import { Scans } from "@/types/database.types"
import { pb } from "@/lib/pocketbase"
import { generateSlug } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { StatusMessage, StatusMessageProps } from "@/components/statusMessage"
import { IconButton } from "@/components/ui/button-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function UrlForm({ refreshScanlist }: { refreshScanlist?: () => void }) {
  const [inputError, setInputError] = useState<StatusMessageProps | null>(
    undefined
  )
  const [isLoading, setIsLoading] = useState(false)

  // datetime now in unix timestamp
  const postUrl = async (rawUrl: string) => {
    console.log("Posting URL", rawUrl)
    // remove trailing whitespace and newlines
    const url = rawUrl.trim().replace(/^(?!(?:\w+:)?\/\/)/, "https://")
    let slug
    if (rawUrl.length === 0) {
      setInputError({ status: "error", message: "Empty URL" })
      return
    }
    try {
      slug = generateSlug(url)
    } catch (e) {
      setInputError({ status: "error", message: "Invalid URL" })
      return
    }
    const data = {
      url: url,
      slug: slug,
      status: "pending",
    } as Scans

    const record = await pb.collection("scans").create(data)
    console.log(record)
    setInputError(null)
    setIsLoading(false)
  }
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
    setInputError(null)
    event.preventDefault()
    let target = event.currentTarget
    postUrl(event.currentTarget["url"].value)
      .then(() => target.reset())
      .catch((e) => {
        setInputError({ status: "error", message: "Error" })
        console.error("Error trying to post URL", e)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  return (
    <UrlFormComponent
      handleSubmit={handleSubmit}
      inputError={inputError}
      isLoading={isLoading}
    />
  )
}

export function UrlFormComponent({
  handleSubmit,
  inputError,
  isLoading,
}: {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  inputError: StatusMessageProps | null
  isLoading?: boolean
}) {
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="urlinput">URL</Label>
            <Input
              data-cy="url-input"
              placeholder="Input URL here for scanning"
              id="urlinput"
              autoComplete="off"
              name="url"
            />
          </div>
          <div className="flex w-full flex-row items-center gap-4">
            <IconButton
              data-cy="url-submit"
              type="submit"
              icon={<Icons.start className={"h-full"} />}
              isLoading={isLoading}
            >
              Start scan
            </IconButton>
            <div className="text-sm text-slate-500">
              {inputError && (
                <div data-cy="url-input-error">
                  <StatusMessage statusMessage={inputError} />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
