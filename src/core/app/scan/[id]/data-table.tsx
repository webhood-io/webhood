"use client"

import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  RowPinningState,
  Table as TableType,
  useReactTable,
} from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

function Filter({
  column,
  table,
}: {
  column: Column<any, unknown>
  table: TableType<any>
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue() as string | undefined

  const sortedUniqueValues = useMemo(
    () =>
      typeof firstValue === "number"
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()]
  )
  console.log(
    Array.from(column.getFacetedUniqueValues().keys()).sort(),
    column.getFacetedUniqueValues()
  )
  return (
    <div className="flex flex-row items-center gap-1">
      <datalist id={column.id + "list"}>
        {sortedUniqueValues.slice(0, 5000).map((value: any) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        list={column.id + "list"}
        placeholder={`filter ${column.id}`}
        type="text"
        value={columnFilterValue || ""}
        onChange={column.setFilterValue}
      />
      <Button
        size="sm"
        title="Clear filter"
        variant="ghost"
        onClick={() => column.setFilterValue("")}
      >
        <X size={15} />
      </Button>
    </div>
  )
}

// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowPinning, setRowPinning] = useState<RowPinningState>({
    top: [],
  })
  const savedPin = localStorage.getItem("rowPinning")
  const { toast } = useToast()
  console.log(rowPinning)
  const table = useReactTable({
    data,
    columns,
    state: {
      rowPinning,
    },
    onRowPinningChange: (newRowPinning) => {
      setRowPinning(newRowPinning)
    },
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })
  useEffect(() => {
    if (table && savedPin) {
      console.log(savedPin)
      table
        .getCenterRows()
        .filter((row) => savedPin.includes(row.original["key"]))
        .forEach((row) => row.pin("top", false, false))
    }
  }, [table])

  useEffect(() => {
    localStorage.setItem(
      "rowPinning",
      JSON.stringify(table.getTopRows().map((r) => r.original["key"]))
    )
  }, [rowPinning])

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  <div>
                    {header.column.getCanFilter() ? (
                      <Filter column={header.column} table={table} />
                    ) : header.isPlaceholder ? null : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </div>
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getTopRows().map((row) => (
          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
  )
}
