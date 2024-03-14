import { useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AccountErrors, useAccount } from "@/hooks/use-api"
import LoginLogoDark from "@/public/webhood-logo-icon-text-paths-dark.svg"
import LoginLogo from "@/public/webhood-logo-icon-text-paths.svg"

import { siteConfig } from "@/config/site"
import { pb } from "@/lib/pocketbase"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function getErrorMessage(
  error: any,
  isLoading: boolean,
  isRegistration?: boolean
): string | undefined {
  if (!error) {
    if (isLoading) {
      return "Loading..."
    }
  } else if (error.type === AccountErrors.NOT_LOGGED_IN) {
    if (!isRegistration) {
      return "Please log in"
    } else {
      return "Please register"
    }
  } else {
    return error?.message || "An error occured"
  }
}

function LoginForm() {
  const { data, error, loading, login } = useAccount()

  const router = useRouter()
  console.log(data, error)
  useEffect(() => {
    if (pb.authStore.isValid) {
      router.push("/")
    }
  }, [pb.authStore.isValid])

  const handleSubmit = async (event) => {
    event.preventDefault()
    login(event.target["email"].value, event.target["password"].value)
  }
  // TODO: Fix this
  const invalidCredentials = error && error.error === "invalid_grant"
  const errorMessage = getErrorMessage(error, loading)
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex w-96 flex-col items-center gap-4">
        <Input
          name="email"
          id="email"
          type="username"
          placeholder="Email or username"
          className={invalidCredentials && "border-red-500 dark:border-red-500"}
        />
        <Input
          name="password"
          id="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          // red outline if error
          className={invalidCredentials && "border-red-500 dark:border-red-500"}
        />
        <Button>
          Login
          {loading && <Icons.loader className={"mx-1"} />}
        </Button>
        <div>{errorMessage}</div>
      </div>
    </form>
  )
}

function RegisterForm() {
  const { data, error, loading, register } = useAccount()
  const router = useRouter()

  const handleSubmit = (event) => {
    event.preventDefault()
    register(event.target["email"].value, event.target["password"].value).then(
      (result) => {
        router.push("/")
      }
    )
  }
  const errorMessage = getErrorMessage(error, loading, true)
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex w-96 flex-col items-center gap-4">
        <Input name="email" id="email" type="email" placeholder="Email" />
        <Input
          name="password"
          id="password"
          type="password"
          placeholder="Password"
          autoComplete="new-password"
        />
        <Button>Register</Button>
        <div>{errorMessage}</div>
      </div>
    </form>
  )
}

export default function Login() {
  const { selfRegistration } = siteConfig
  const selfRegistrationEnabled =
    selfRegistration && selfRegistration === "true"
  return (
    <div className="container h-screen">
      <div className="flex h-full flex-col justify-center">
        <div className="flex flex-col items-center">
          <Image
            src={LoginLogo}
            alt="Webhood Logo"
            width={300}
            height={150}
            className="dark:hidden"
          />
          <Image
            src={LoginLogoDark}
            alt="Webhood Logo Dark"
            width={300}
            height={150}
            className="hidden dark:block"
          />
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Login with your local account
          </p>
          <Tabs defaultValue={"login"} className="pt-6">
            {selfRegistrationEnabled && (
              <TabsList>
                <TabsTrigger value={"login"}>Login</TabsTrigger>
                <TabsTrigger value={"register"}>Register</TabsTrigger>
              </TabsList>
            )}
            <TabsContent value={"login"}>
              <LoginForm />
            </TabsContent>
            <TabsContent value={"register"}>
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
