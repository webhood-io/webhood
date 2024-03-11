"use client"

import {
  ColumnDef,
  Row,
  RowPinningState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Table as TableType,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

function PinnedRow({ row, table }: { row: Row<any>; table: TableType<any> }) {
    return (
      <tr
        style={{
          backgroundColor: 'lightblue',
          position: 'sticky',
          top:
            row.getIsPinned() === 'top'
              ? `${row.getPinnedIndex() * 26 + 48}px`
              : undefined,
          bottom:
            row.getIsPinned() === 'bottom'
              ? `${
                  (table.getBottomRows().length - 1 - row.getPinnedIndex()) * 26
                }px`
              : undefined,
        }}
      >
        {row.getVisibleCells().map(cell => {
          return (
            <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          )
        })}
      </tr>
    )
  }


export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  const [rowPinning, setRowPinning] = useState<RowPinningState>({
    top: [],
    bottom: [],
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
        {table.getTopRows().map(row => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {table.getRowModel().rows?.length ? (
            table.getCenterRows().map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
