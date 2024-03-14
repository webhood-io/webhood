import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { UsersResponse } from "@/types/pocketbase-types"
import { pb } from "@/lib/pocketbase"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { TypographySubtle } from "./ui/typography/subtle"
import { useStatusMessage } from "@/hooks/use-statusmessage"
import { StatusMessage } from "./statusMessage"

const userCreateSchema = z
  .object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(8).max(20),
    passwordConfirm: z.string().min(8).max(20),
    role: z.enum(["user", "admin"]),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ["passwordConfirm"],
  })

const userEditSchema = z
  .object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(8).max(20).optional(),
    passwordConfirm: z.string().min(8).max(20).optional(),
    role: z.enum(["user", "admin"]),
  })
  .refine(
    (data) => (data.password ? data.password === data.passwordConfirm : true),
    {
      message: "Passwords don't match",
      path: ["passwordConfirm"],
    }
  )

function getEditSchema(user) {
  if (user.id) {
    return userEditSchema
  } else {
    return userCreateSchema
  }
}

export function UserEditSheet({
  user,
  children,
  onClose,
}: {
  user: UsersResponse
  children?: React.ReactNode
  onClose: () => void
}) {
  const schema = getEditSchema(user)
  const {statusMessage, setStatusMessage} = useStatusMessage()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...user,
    },
  })
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClose = () => {
    form.reset()
    setIsOpen(false)
    onClose()
  }

  const handleSubmit = (data) => {
    if (user.id) {
      pb.collection("users")
        .update(user.id, data)
        .then((res) => {
          handleClose()
        })
        .catch((err) => {
          setStatusMessage({ message: err.message, status: "error", details: err.data })
        })
    } else {
      pb.collection("users")
        .create(data)
        .then((res) => {
          handleClose()
        })
        .catch((err) => {
          setStatusMessage({ message: err.message, status: "error", details: err.data })
        })
    }
  }
  const deleteUser = () => {
    pb.collection("users")
      .delete(user.id)
      .then((res) => {
        handleClose()
      })
      .catch((err) => {
          setStatusMessage({ message: err.message, status: "error", details: err.data })
      })
  }
  const onOpenChange = (open) => {
    setIsOpen(open)
    if (!open) { // close
      form.reset()
      setStatusMessage(null)
    }
  }
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger data-cy="trigger" asChild>
        {children}
      </SheetTrigger>
      <SheetContent
        position="right"
        size="content"
        className="max-h-screen overflow-y-scroll"
      >
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            <TypographySubtle>
              Make changes to user accounts here or create a new one. <br />{" "}
              Click save when you&apos;re done.
            </TypographySubtle>
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password again</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        name={field.name}
                      >
                        <FormControl>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter>
              <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
              {user.id && (
                <Button
                  variant="destructive"
                  type="button"
                  onClick={deleteUser}
                >
                  Delete
                </Button>
              )}
              {/* TODO: add loading and errors */}
              <Button type="submit" data-cy="submit-button">
                Save changes
              </Button>
              <StatusMessage statusMessage={statusMessage} />
              </div>
              {statusMessage && statusMessage.details &&
              <div className="max-w-[400px]">
              <p className="text-sm text-right">Error details</p>
              <div className="text-sm bg-slate-200 rounded p-4">{JSON.stringify(statusMessage.details)}</div>
              </div>
              }
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
