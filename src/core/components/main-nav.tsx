"use client"

import * as React from "react"
import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useAccount } from "@/hooks/use-api"

import { NavItem } from "@/types/nav"
import { pb } from "@/lib/pocketbase"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const router = useRouter()
  const isValid = pb.authStore.isValid
  const { data, loading, error } = useAccount()
  const role = data?.role

  useEffect(() => {
    if (error) router.push("/login")
  }, [error])

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="hidden h-12 items-center space-x-2 md:flex">
        <Icons.logo />
      </Link>
      {items?.length ? (
        <nav className="flex flex-col gap-2 max-md:hidden md:flex">
          {items?.map((item, index) =>
            // check if role is required and if it matches the user's role
            item.roleRequired && item.roleRequired !== role
              ? null
              : item.href && (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      item.disabled && "cursor-not-allowed opacity-80"
                    )}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "-ml-2 h-8 w-full justify-between pl-2 text-left",
                        router.pathname === item.href &&
                          "bg-slate-100 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-gray-700"
                      )}
                      key={index}
                      type="button"
                    >
                      {item.title}
                      {router.pathname === item.href && (
                        <Icons.open className="h-4 w-4" />
                      )}
                    </Button>
                  </Link>
                )
          )}
        </nav>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="fixed right-6 top-6 gap-2 text-base hover:bg-transparent focus:ring-0 md:hidden"
          >
            <Icons.logo_tiny /> <span className="font-bold">Menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={24}
          className="w-[300px] overflow-scroll"
        >
          <DropdownMenuLabel>
            <Link href="/" className="flex items-center">
              <Icons.logo />
            </Link>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {items?.map((item, index) =>
            item.roleRequired && item.roleRequired !== role
              ? null
              : item.href && (
                  <DropdownMenuItem key={index} asChild>
                    <Link href={item.href}>{item.title}</Link>
                  </DropdownMenuItem>
                )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
