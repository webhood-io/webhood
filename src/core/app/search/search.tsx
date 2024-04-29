"use client"

import querystring from "querystring"
import { FormEvent, Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { scansSearchFetcher } from "@/hooks/use-api"
import { useSubscription } from "@/hooks/use-sub"
import useSWR from "swr"
import { useLocalStorage } from "usehooks-ts"

import { cn } from "@/lib/utils"
import AutocompleteSearch from "@/components/AutocompleteSearch"
import { Icons } from "@/components/icons"
import { ScanListItem } from "@/components/ScanListItem"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/button-icon"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TypographyH3 } from "@/components/ui/typography/h3"
import { TypographySubtle } from "@/components/ui/typography/subtle"

function LimitSelector({
  limit,
  setLimit,
}: {
  limit: number
  setLimit: (limit: number) => void
}) {
  const limits = [10, 25, 50, 100, 250, 500, 1000]
  return (
    <>
      <Label>Results limit</Label>
      <Select
        onValueChange={(value) => setLimit(parseInt(value))}
        value={limit.toString()}
      >
        <SelectTrigger className="w-24">
          <SelectValue placeholder="Results limit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Results limit</SelectLabel>
            {limits.map((limit) => (
              <SelectItem key={limit.toString()} value={limit.toString()}>
                {limit}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  )
}
let timer

export function Search() {
  const router = useRouter()
  const params = useSearchParams()
  const page = Number(params.get("page")) || 1
  const search = params.get("filter")
  const [limit, setLimit] = useLocalStorage("searchLimit", 10)
  const [searchInput, setSearchInput] = useState<string | null>(null)

  const { data, error, isLoading, mutate } = useSWR(
    { search, limit, page },
    scansSearchFetcher
  )
  function debounce() {
    // prevent scan changes from triggering mutate too often
    clearTimeout(timer)
    timer = setTimeout(() => {
      mutate()
    }, 1000)
  }
  useSubscription("scans", "*", () => debounce())
  // Form was submitted
  const onSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const search = formData.get("search-query")
    if (!search) setSearchQuery("")
    else setSearchQuery(search.toString())
  }
  const onReset = () => {
    setSearchQuery("")
    setSearchInput("")
  }
  const setSearchQuery = (search: string) => {
    const queryString = querystring.stringify({ filter: search, page: 1 })
    router.push(`/search?${queryString}`)
  }
  const incrementPage = () => {
    const queryString = querystring.stringify({
      filter: search,
      page: page + 1,
    })
    router.push(`/search?${queryString}`)
  }
  const decrementPage = () => {
    const queryString = querystring.stringify({
      filter: search,
      page: page - 1,
    })
    router.push(`/search?${queryString}`)
  }
  const onLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    const queryString = querystring.stringify({
      filter: search,
      page: 1,
    })
    router.push(`/search?${queryString}`)
  }
  const data_length = (): number => {
    if (data) {
      return data.length
    }
    return 0
  }

  // debounce search input, i.e. change the search in query params only after 1 second of inactivity
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== search) {
        setSearchQuery(searchInput)
      }
    }, 1000)
    return () => clearTimeout(timeout)
  }, [searchInput])

  // On load, set the search input to the query param
  useEffect(() => {
    if (search) {
      setSearchInput(search)
    } else {
      setSearchInput("")
    }
  }, [])

  return (
    <div className="flex w-full flex-col gap-8 truncate">
      <form onSubmit={onSearchSubmit} autoComplete="off">
        <div className="flex flex-col gap-4 truncate">
          <div className="mx-1 flex flex-col items-start gap-2">
            <div className="grid w-full items-center gap-1.5">
              <Label>Search</Label>
              <div className="flex flex-row items-center">
                {searchInput !== null && (
                  <AutocompleteSearch
                    value={searchInput}
                    setValue={setSearchInput}
                  />
                )}
                {searchInput === null && (
                  // Placeholder to prevent the dom from moving
                  <AutocompleteSearch value="" setValue={setSearchInput} />
                )}
                <Button
                  className={cn("-ml-11", search ? "block" : "hidden")}
                  size="sm"
                  variant="ghost"
                  type="reset"
                  onClick={onReset}
                >
                  <Icons.error />
                </Button>
              </div>
            </div>
            <div className="flex w-full items-center justify-between">
              <IconButton
                isLoading={isLoading}
                type="submit"
                icon={<Icons.search className="h-full" />}
              >
                Search{" "}
              </IconButton>
              {error && (
                <TypographySubtle>
                  Search query is not yet valid
                </TypographySubtle>
              )}
              {!error && search && (
                <TypographySubtle>✔ Query is valid</TypographySubtle>
              )}
            </div>
          </div>
          {/* Data */}
          <div className="flex flex-col">
            <TypographyH3>Results</TypographyH3>
            <div className={"flex flex-row items-end justify-between"}>
              <div className="flex flex-row items-center gap-2">
                <LimitSelector limit={limit} setLimit={onLimitChange} />
                <TypographySubtle>in one page</TypographySubtle>
              </div>
              <div className="flex items-center justify-center gap-2 p-1">
                <IconButton
                  icon={<Icons.left className={"h-full"} />}
                  variant="outline"
                  type="button"
                  disabled={page === 1}
                  onClick={decrementPage}
                />
                {page
                  ? page * limit -
                    limit +
                    1 +
                    " - " +
                    (page * limit - limit + data_length())
                  : ""}
                <IconButton
                  icon={<Icons.right className={"h-full"} />}
                  variant="outline"
                  type="button"
                  disabled={data_length() < limit}
                  onClick={incrementPage}
                />
              </div>
            </div>
            {data?.length === 0 && (
              <TypographySubtle>No results</TypographySubtle>
            )}
            {!data && (
              <TypographySubtle>
                Search for a scan, results will appear here
              </TypographySubtle>
            )}
            <div className="flex w-full flex-col divide-y divide-slate-500 p-1">
              {data?.map((document) => (
                <ScanListItem key={document.id} document={document} />
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// Suspense must be used when using useSearchParams
export default function SearchPage() {
  return (
    <Suspense>
      <Search />
    </Suspense>
  )
}
