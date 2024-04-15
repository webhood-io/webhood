"use client"

import { ScansResponse } from "@webhood/types"

import { columns } from "./datatable/columns"
import { DataTable } from "./datatable/data-table"

//#region ScanDetails
export function ScanDetails({ scanItem }: { scanItem: ScansResponse }) {
  const valsGen = (item) => {
    if (!scanItem.scandata || !scanItem.scandata[item]) return []
    const val = scanItem.scandata[item]
    return Object.keys(val).map((key) => {
      return { key: `${item}.${key}`, value: val[key] }
    })
  }
  if (!scanItem.scandata) return <p>No details available</p>
  const data = [
    ...valsGen("request"),
    ...valsGen("response"),
    ...valsGen("document"),
  ]
  return (
    <div className="truncate">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
