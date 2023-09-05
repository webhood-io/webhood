import { useRouter } from "next/router"
import { LogOut } from "lucide-react"

import { pb } from "@/lib/pocketbase"
import { Button } from "./ui/button"

export function LogoutButton() {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        pb.authStore.clear()
        router.push("/login")
      }}
    >
      <LogOut className="dark:scale-100 dark:text-slate-400 dark:hover:text-slate-100" />
    </Button>
  )
}
