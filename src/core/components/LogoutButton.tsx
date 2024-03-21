import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { pb } from "@/lib/pocketbase"
import { Button } from "./ui/button"

export function LogoutButton() {
  const router = useRouter()
  return (
    <LogoutButtonComponent
      onClick={() => {
        pb.authStore.clear()
        router.push("/login")
      }}
    />
  )
}

export function LogoutButtonComponent({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <LogOut className="dark:scale-100 dark:text-slate-400 dark:hover:text-slate-100" />
    </Button>
  )
}
