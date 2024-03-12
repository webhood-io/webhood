import type { Metadata, ResolvingMetadata } from "next"
import { scanSingleFetcher } from "@/hooks/use-api"

import { siteConfig } from "@/config/site"
import { pb } from "@/lib/pocketbase"
import ScanDetails from "./scandetails"

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id
  return {
    title: `${id} - ${siteConfig.name}`,
  }
}
export default async function ScanPage({ params }: { params: { id: string } }) {
  return <ScanDetails id={params.id} />
}
