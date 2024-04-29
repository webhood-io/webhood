import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { siteConfig } from "@/config/site"
import { Title } from "@/components/title"
import Search from "./search"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Search - ${siteConfig.name}`,
  }
}
export default async function SearchPage({ searchParams }) {
  if (
    !searchParams ||
    searchParams.filter === undefined ||
    !searchParams.page === undefined
  ) {
    return redirect("/search?filter=&page=1")
  }
  return (
    <div className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col items-start gap-2">
        <Title title={"Search"} subtitle={"Search for past scan results"} />
      </div>
      <div className="grid">
        <Search />
      </div>
    </div>
  )
}
