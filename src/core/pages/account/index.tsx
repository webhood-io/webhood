import { FormEvent, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { useToast } from "@/hooks/use-toast"

import { pb } from "@/lib/pocketbase"
import { Icons } from "@/components/icons"
import { Layout } from "@/components/layout"
import { StatusMessage, StatusMessageProps } from "@/components/statusMessage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TypographyH3 } from "@/components/ui/typography/h3"
import { TypographySubtle } from "@/components/ui/typography/subtle"

export function ChangePasswordForm() {
  const [passwordMessage, setPasswordMessage] =
    useState<StatusMessageProps | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const setMessage = (message: string, status: "error" | "success") => {
    setPasswordMessage({ message, status })
    setIsLoading(false)
  }
  const { toast } = useToast()
  const router = useRouter()
  const onChangePassword = (e: FormEvent<HTMLFormElement>) => {
    setIsLoading(true)
    e.preventDefault()
    let target = e.currentTarget
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)
    const oldPassword = formData.get("old-password")
    const password = formData.get("password")
    const passwordAgain = formData.get("password-again")
    if (password !== passwordAgain) {
      setMessage("Passwords do not match", "error")
      return
    }
    if (password.toString().length < 8) {
      setMessage("Password must be at least 8 characters", "error")
      return
    }
    if (password.toString().length > 64) {
      setMessage("Password must be at most 64 characters", "error")
      return
    }
    const authData = {
      password: password.toString(),
      passwordConfirm: passwordAgain.toString(),
      oldPassword: oldPassword.toString(),
    }
    const currentUser = pb.authStore.model
    const record = pb
      .collection("users")
      .update(currentUser.id, authData)
      .then(() => {
        target.reset()
        setMessage("Password changed successfully", "success")
        toast({
          title: "Password changed",
          description: "Password was changed successfully, please login again",
        })
        // force login after 2 seconds
        setTimeout(() => {
          pb.authStore.clear()
          router.push("/login")
        }, 2000)
      })
      .catch((error) => {
        setMessage(error.message, "error")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  return (
    <form onSubmit={onChangePassword} id="changePassword">
      <div className="flex flex-col gap-2">
        <div className="mb-6 flex flex-col gap-2">
          <Label htmlFor="old-password">Old password</Label>
          <Input
            id="old-password"
            autoComplete={"old-password"}
            type="password"
            name="old-password"
            defaultValue=""
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            autoComplete={"new-password"}
            type="password"
            name="password"
            defaultValue=""
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">New password again</Label>
          <Input
            id="password-again"
            type="password"
            autoComplete={"new-password"}
            name="password-again"
            defaultValue=""
          />
        </div>
        <div className="flex justify-start gap-2">
          <Button type="submit" disabled={isLoading}>
            Change password
            {isLoading && <Icons.loader className={"ml-2"} />}
          </Button>
          {passwordMessage && <StatusMessage statusMessage={passwordMessage} />}
        </div>
      </div>
    </form>
  )
}

export default function DashboardPage() {
  // const { data: user, error: accountError }: { data: User; error: string } =
  //  useAccount()
  const user = pb.authStore.model

  return (
    <Layout>
      <Head>
        <title>Account - Webhood</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
            Account
          </h1>
          <p className="max-w-[700px] text-lg text-slate-700 dark:text-slate-400 sm:text-xl">
            View and manage your account settings.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            <TypographyH3>Account</TypographyH3>
            <TypographySubtle>View your account information.</TypographySubtle>
          </div>
          <div className="flex flex-col gap-2">
            {/* Username */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Username</Label>
              <Input
                id="username"
                type="username"
                value={user?.username || ""}
                disabled
              />
            </div>
            {/* email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
              />
            </div>
            {/* Role viewonly */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" type="text" value={user?.role || ""} disabled />
            </div>
          </div>
          {/* Change password */}
          <div className="flex flex-col">
            <TypographyH3>Change password</TypographyH3>
            <TypographySubtle>Change your password.</TypographySubtle>
          </div>
          <ChangePasswordForm />
        </div>
      </section>
    </Layout>
  )
}
