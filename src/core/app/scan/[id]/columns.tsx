"use client"

import { DataItem, DataItemValueOnly } from "@/components/DataItem"
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { Pin, PinOff } from "lucide-react"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns = [
    {
        id: 'pin',
        header: () => 'Pin to top',
        cell: ({ row }) =>
          row.getIsPinned() ? (
              <Button
              size="sm"
              variant="ghost"

              onClick={() => row.pin(false, false, false)}
            >
              <PinOff size={15}/>
            </Button>
          ) : (
            <div style={{ display: 'flex', gap: '4px' }}>
              <Button
              size="sm"
              variant="ghost"
                onClick={() =>
                  row.pin('top', false, false)
                }
              >
                <Pin size={15}/>
              </Button>
            </div>
          ),
      },
  {
    accessorKey: "key",
    header: "Key",
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({row}) => {
        console.log(typeof row.original.value)
        if(Array.isArray(row.original.value)) {
            if(row.original.value.length === 0) return <DataItemValueOnly content={null}/>
            return row.original.value.map((v, i) => 
            <div key={i}>
                <DataItemValueOnly content={(typeof v === 'object') ? JSON.stringify(v) : v}/>
                </div>
            )
        }
        if(typeof row.original.value === 'object' && row.original.value !== null)
            return Object.keys(row.original.value).map((k, i) => 
            <div key={i}>
            <DataItem label={k} content={row.original.value[k]}/>
            </div>
            )
        // if array
        if(row.original.value === null || row.original.value === undefined || row.original.value === "") return <DataItemValueOnly content={"Empty"}/>
        return <DataItemValueOnly content={row.original.value}/>
    }
  },
]
