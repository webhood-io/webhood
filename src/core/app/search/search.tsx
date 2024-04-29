"use client"

import { FormEvent, Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { scansSearchFetcher } from "@/hooks/use-api"
import useSWR from "swr"
import { useLocalStorage } from "usehooks-ts"

import { cn } from "@/lib/utils"
import SelectScrollable from "@/components/AutocompleteSearch"
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

function getRangeNumber(value: string): number | null {
  if (!value) return null
  const parsed = parseInt(value)
  if (isNaN(parsed) || parsed < 0) return null
  return parsed
}

export function Search() {
  const router = useRouter()
  const params = useSearchParams()
  const page = params.get("page")
  const [limit, setLimit] = useLocalStorage("searchLimit", 10)
  const [search, setSearch] = useState<string>("")
  const [searchInput, setSearchInput] = useState<string>("")
  // const [range, setRange] = useState<Range>({ start: 0, end: limit - 1 })
  const { data, error } = useSWR({ search, limit, page }, scansSearchFetcher)

  const isLoading = !data && !error

  const pageNumber = getRangeNumber(page as string) || 1
  useEffect(() => {
    if (pageNumber < 1) {
      router.push("/search?page=1")
    }
  }, [pageNumber])

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const search = formData.get("search-query")
    if (!search) setSearch("")
    else setSearch(search.toString())
  }
  const onReset = () => {
    setSearch("")
    setSearchInput("")
  }
  const incrementPage = () => {
    router.push(`/search?page=${pageNumber + 1}`)
  }
  const decrementPage = () => {
    router.push(`/search?page=${pageNumber - 1}`)
  }
  const onLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    router.push(`/search?page=${1}`)
  }
  const data_length = (): number => {
    if (data) {
      return data.length
    }
    return 0
  }

  // debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
    }, 1000)
    return () => clearTimeout(timeout)
  }, [searchInput])

  return (
    <div className="flex w-full flex-col gap-8 truncate">
      <form onSubmit={onSearch} autoComplete="off">
        <div className="flex flex-col gap-4 truncate">
          <div className="mx-1 flex flex-col items-start gap-2">
            <div className="grid w-full items-center gap-1.5">
              <Label>Search</Label>
              <div className="flex flex-row items-center">
                <SelectScrollable
                  value={searchInput}
                  setValue={setSearchInput}
                />
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
            <div className="flex justify-end">
              <IconButton
                isLoading={isLoading}
                type="submit"
                icon={<Icons.search className="h-full" />}
              >
                Search{" "}
              </IconButton>
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
                  disabled={pageNumber === 1}
                  onClick={decrementPage}
                />
                {pageNumber
                  ? pageNumber * limit -
                    limit +
                    1 +
                    " - " +
                    (pageNumber * limit - limit + data_length())
                  : ""}
                <IconButton
                  icon={<Icons.right className={"h-full"} />}
                  variant="outline"
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

export default function SearchPage() {
  return (
    <Suspense>
      <Search />
    </Suspense>
  )
}
