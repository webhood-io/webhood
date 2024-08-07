import { ImageLoaderProps } from "next/image"
import { clsx, type ClassValue } from "clsx"
import { FileOptions } from "pocketbase"
import { twMerge } from "tailwind-merge"

import { pb } from "./pocketbase"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Copy to clipboard using clipboard API
// https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
function copyToClipboard(text: string) {
  // check if secure context
  if (!navigator.clipboard) {
    console.error("Clipboard API not available, use HTTPS")
    return
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log("Async: Copying to clipboard was successful!")
    },
    function (err) {
      console.error("Async: Could not copy text: ", err)
    }
  )
}

// parse string using regex
// ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
// https://regex101.com/r/4N4x4x/1
function parseUrl(url: string) {
  const regex = new RegExp(
    "^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?",
    "i"
  )
  const result = regex.exec(url)
  return {
    protocol: result[2],
    host: result[4],
    path: result[5],
    query: result[7],
    fragment: result[9],
  }
}

const validateUrlRegex = (url: string) => {
  const regex = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ) // fragment locator
  return !regex.test(url)
}

function getClientLocale() {
  if (typeof Intl !== "undefined") {
    try {
      return Intl.NumberFormat().resolvedOptions().locale
    } catch (err) {
      console.error("Cannot get locale from Intl")
    }
  }
}

function dateToLocaleString(date: Date) {
  return date.toLocaleString(getClientLocale())
}

function generateSlug(url: string) {
  const now = new Date().getTime().toFixed(0)
  const host =
    parseUrl(url)
      .host?.replaceAll(".", "-")
      .replaceAll(":", "--")
      .substring(0, 25) || "unknown"
  const slug = `${encodeURIComponent(host)}-${now}`
  return slug
}

function stringToUrl(rawUrl: string) {
  const url = rawUrl.trim().replace(/^(?!(?:\w+:)?\/\/)/, "https://")
  return url
}

const urlWithParams = (url: string, options: any) => {
  let urlWithParams = new URL(url, document.URL)
  const params = options.params || {}
  Object.keys(params).forEach((key) =>
    urlWithParams.searchParams.append(key, params[key])
  )
  return urlWithParams
}

const getPbFileUrl = (record, src, token, additionalOptions?: FileOptions) => {
  if (!src) return
  return pb.files.getUrl(record, src, {
    token: token,
    ...additionalOptions,
  })
}

const imageLoader = (
  { src, width, quality }: ImageLoaderProps,
  record,
  token
) => {
  if (!src) return
  return getPbFileUrl(record, src, token, {
    thumb: `${width}x0`,
  })
}

export {
  copyToClipboard,
  dateToLocaleString,
  generateSlug,
  getPbFileUrl,
  imageLoader,
  parseUrl,
  stringToUrl,
  urlWithParams,
  validateUrlRegex,
}
