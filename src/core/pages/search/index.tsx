import { FormEvent, useEffect, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { scansSearchFetcher } from "@/hooks/use-api"
import { useToken } from "@/hooks/use-file"
import useSWR from "swr"
import { useLocalStorage } from "usehooks-ts"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Layout } from "@/components/layout"
import { ScanListItem } from "@/components/ScanListItem"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/button-icon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
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

interface Range {
  start: number
  end: number
}

function getRangeNumber(value: string): number | null {
  if (!value) return null
  const parsed = parseInt(value)
  if (isNaN(parsed) || parsed < 0) return null
  return parsed
}

export default function DashboardPage() {
  const router = useRouter()
  const { page } = router.query
  const [limit, setLimit] = useLocalStorage("searchLimit", 10)
  const [search, setSearch] = useState<string>("")
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

  return (
    <Layout>
      <Head>
        <title>Search - Webhood</title>
        <meta name="description" content={siteConfig.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
            Search
          </h1>
          <p className="max-w-[700px] text-lg text-slate-700 dark:text-slate-400 sm:text-xl">
            Search for past scan results.
          </p>
        </div>
        <div className="flex flex-col gap-8 truncate">
          <form onSubmit={onSearch} autoComplete="off">
            <div className="flex flex-col gap-4 truncate">
              <div className="mx-1 flex flex-col items-start gap-2">
                <div className="grid w-full items-center gap-1.5">
                  <Label>Search</Label>
                  <div className="flex w-full flex-row items-center">
                    <Input
                      type="text"
                      placeholder="Search for past scans"
                      name="search-query"
                      autoFocus
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
      </section>
    </Layout>
  )
}
