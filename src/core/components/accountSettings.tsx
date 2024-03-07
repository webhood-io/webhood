import React, { useEffect, useState } from "react"
import { tokensFetcher, useApiv2, usersFetcher } from "@/hooks/use-api"
import useSWR, { mutate, useSWRConfig } from "swr"

import { ApiTokenResponse } from "@/types/token"
import { pb } from "@/lib/pocketbase"
import { dateToLocaleString } from "@/lib/utils"
import { Icons } from "@/components/icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { IconButton } from "@/components/ui/button-icon"
import { CopyButton } from "@/components/ui/copy-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TypographyLarge } from "@/components/ui/typography/large"
import { TypographySubtle } from "@/components/ui/typography/subtle"
import { UserEditSheet } from "./UserEditSheet"

const ADMIN_API_URL_PATH = (process.env.NEXT_PUBLIC_API_URL.startsWith("/"))  ?  process.env.NEXT_PUBLIC_API_URL + "api" : process.env.NEXT_PUBLIC_API_URL  + "/api"

export const newUser = {
  username: "",
  email: "",
  password: "",
  passwordConfirm: "",
  role: undefined,
  name: "",
  avatar: "",
}

function UsersTable() {
  const { data, error, isLoading } = useSWR("/api/accounts", usersFetcher)
  const { mutate } = useSWRConfig()
  const refresh = () => mutate("/api/accounts")

  const currentUser = pb.authStore.model

  const users = data || []
  return (
    <div>
      <div className="mb-2 grid grid-cols-8 gap-4">
        <div className="col-span-1 text-sm font-extrabold">Role</div>
        <div className="col-span-1 text-sm font-extrabold">Username</div>
        <div className="col-span-3 text-sm font-extrabold">Email</div>
        <div className="col-span-2 text-sm font-extrabold">Last updated</div>
        <div className="col-span-1 text-center text-sm font-extrabold">
          Actions
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-2 divide-y divide-slate-200 dark:divide-slate-800">
        {users?.map((user) => (
          <div
            className="grid h-8 grid-cols-8 items-center gap-4"
            key={user.id}
          >
            <div className="col-span-1 text-sm font-medium">{user.role}</div>
            <div className="col-span-1 text-sm font-medium">
              {user.username}
            </div>
            <div className="col-span-3 text-sm font-medium">{user.email}</div>
            <div className="col-span-2 truncate text-sm font-medium">
              {user.updated && dateToLocaleString(new Date(user.updated))}
            </div>
            {currentUser?.id !== user.id && (
              <UserEditSheet user={user} onClose={() => refresh()}>
                <IconButton
                  icon={<Icons.edit className={"h-full"} />}
                  size="sm"
                  variant={"ghost"}
                >
                  Edit
                </IconButton>
              </UserEditSheet>
            )}
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 right-0 m-12 grid justify-center">
        {isLoading && <Icons.loader />}
      </div>
      <div className="my-4">
        {/* @ts-ignore */}
        <UserEditSheet user={newUser} onClose={() => refresh()}>
          <IconButton icon={<Icons.add className={"h-full"} />} size="sm">
            Add user
          </IconButton>
        </UserEditSheet>
      </div>
    </div>
  )
}

function ApiTokenEditSheet({
  onClose,
  children,
}: {
  onClose: () => void
  children: React.ReactNode
}) {
  const { request: request2 } = useApiv2()
  const [tokenData, setTokenData] = useState<ApiTokenResponse | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const createApiUser = async (role) => {
    // create string of now datetime of format YYYYMMDDHHmmss
    const now = new Date()
    const nowString = now.toISOString().replace(/[-:]/g, "").slice(0, 14)
    const password = // create random password
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8)

    const user = await pb.collection("api_tokens").create({
      username: `api_token_${nowString}`,
      role: role,
      password: password,
      passwordConfirm: password,
    })
    return user
  }

  const onTokenCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const body = Object.fromEntries(formData.entries())
    const { id, role } = await createApiUser(body.role)
    console.log(ADMIN_API_URL_PATH, id, role)
    await request2(`${ADMIN_API_URL_PATH}/token/${id}`, {
      method: "POST",
      body: JSON.stringify({ id, role }),
    })
      .then(async (data: ApiTokenResponse) => {
        setTokenData(data)
        await pb.collection("api_tokens").update(id, { expires: data.expires })
        onClose() // to refresh
        setLoading(false)
      })
      .catch((error) => {
        console.log("error2", error)
      })
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={() => {
        setTokenData(null)
        setIsOpen(!isOpen)
      }}
    >
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add API Token</SheetTitle>
          <SheetDescription>Get your API token here</SheetDescription>
        </SheetHeader>
        <form id="create-token-form" onSubmit={onTokenCreate}>
          <div className="my-4 flex flex-col gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Role</Label>
              <Select name="role" required defaultValue="scanner">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scanner">Scanner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-right">
              <IconButton
                id="create-token-submit"
                type="submit"
                size="sm"
                variant="default"
                icon={<Icons.add className={"h-full"} />}
                isLoading={isLoading}
              >
                Create API token
              </IconButton>
            </div>
          </div>
        </form>
        {tokenData?.id && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">
                ID
              </Label>
              <div className="col-span-3 flex flex-row items-center">
                <Input
                  id="id"
                  name="id"
                  className="col-span-3"
                  disabled
                  value={tokenData?.id}
                />
                <CopyButton
                  type={"button"}
                  key={tokenData?.id}
                  value={tokenData?.id}
                  variant="ghost"
                  size="sm"
                />
              </div>
            </div>
            <TypographySubtle>
              This is the unique identifier for this API token. This is not a
              secret.
            </TypographySubtle>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="token" className="text-right">
                Token
              </Label>
              <div className="col-span-3 flex flex-row items-center">
                <Input
                  id="token"
                  name="token"
                  type="text"
                  className="col-span-3"
                  disabled
                  value={tokenData?.token}
                />
                <CopyButton
                  type={"button"}
                  value={tokenData?.token}
                  variant="ghost"
                  size="sm"
                />
              </div>
            </div>
            <TypographySubtle>
              Save this token and keep it secret, it will not be shown here ever
              again
            </TypographySubtle>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="created_at" className="text-right">
                Expires at
              </Label>
              <Input
                id="created_at"
                name="created_at"
                className="col-span-3"
                disabled
                value={tokenData?.expires}
              />
            </div>
            <TypographySubtle>
              Token will expire one year from its creation. Make sure to create
              a new token before this expires to keep your integrations working.
            </TypographySubtle>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function ApiTokenTable({ options }: { options: AccountOptions }) {
  const {
    data: tokens,
    error,
    isLoading,
  } = useSWR("/api/tokens", tokensFetcher)
  const refresh = () => {
    mutate("/api/tokens")
  }
  const revoke = async (id: string) => {
    pb.collection("api_tokens")
      .delete(id)
      .then(() => {
        refresh()
      })
  }
  useEffect(() => {
    refresh()
  }, [options])
  return (
    <div>
      <div className="mb-2 grid grid-cols-8 gap-4">
        <div className="col-span-2 text-sm font-extrabold">ID</div>
        <div className="col-span-1 text-sm font-extrabold">Role</div>
        <div className="col-span-2 text-sm font-extrabold">Created</div>
        <div className="col-span-2 text-sm font-extrabold">Expires</div>
        <div className="col-span-1 text-center text-sm font-extrabold">
          Actions
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-2 divide-y divide-slate-200 dark:divide-slate-800">
        {tokens &&
          Array.isArray(tokens) &&
          tokens.map((token) => (
            <div
              className="grid h-8 grid-cols-8 items-center gap-4"
              key={token.id}
            >
              <div className="col-span-2 flex flex-row items-center text-sm font-medium">
                <p className="truncate">{token.id}</p>
                <CopyButton variant={"ghost"} size={"sm"} value={token.id} />
              </div>
              <div className="col-span-1 text-sm font-medium">{token.role}</div>
              <div className="col-span-2 truncate text-sm font-medium">
                {token.created}
              </div>
              <div className="col-span-2 truncate text-sm font-medium">
                {token.expires}
              </div>
              <div className="col-span-1 text-center text-sm font-medium">
                <TooltipProvider>
                  <Tooltip content="Revoke token">
                    <TooltipContent>Revoke token</TooltipContent>
                    <TooltipTrigger>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <IconButton
                            icon={<Icons.error className={"h-full"} />}
                            size={"sm"}
                            variant={"ghost"}
                          >
                            Revoke
                          </IconButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently revoke this token and it will no
                              longer be able to access the API.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => revoke(token.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
      </div>
      <div className="fixed bottom-0 right-0 m-12 grid justify-center">
        {isLoading && <Icons.loader />}
      </div>
      <div className="my-4">
        <ApiTokenEditSheet onClose={() => refresh()}>
          <IconButton size={"sm"} icon={<Icons.bot className={"h-full"} />}>
            Add token
          </IconButton>
        </ApiTokenEditSheet>
      </div>
    </div>
  )
}

interface AccountOptions {
  show_revoked: boolean
  show_expired: boolean
}

export function AccountSettings() {
  const [options, setOptions] = useState<AccountOptions>({
    show_expired: false,
    show_revoked: false,
  })
  const onOptionsChange = (checked: boolean, name: string) => {
    setOptions({ ...options, [name]: checked })
  }
  return (
    <div className="flex flex-col justify-between gap-6">
      <div>
        <TypographyLarge>Users</TypographyLarge>
        <TypographySubtle>
          List of users able to login to this console. Edit user details and
          roles.
        </TypographySubtle>
      </div>
      <UsersTable />
      <div>
        <TypographyLarge>API Tokens</TypographyLarge>
        <TypographySubtle>
          Create API tokens to authenticate to the API. Revoke unneeded tokens.
        </TypographySubtle>
      </div>
      {/* Toolbar */}
      <div className="grid grid-cols-6 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="show-expired"
            onCheckedChange={(v) => onOptionsChange(v, "show_expired")}
            name="show_expired"
          />
          <Label htmlFor="show-expired">Show expired</Label>
        </div>
      </div>
      <ApiTokenTable options={options} />
    </div>
  )
}
