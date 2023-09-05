import { useEffect, useState } from "react"

import { Icons } from "@/components/icons"
import { TypographySubtle } from "@/components/ui/typography/subtle"

export interface StatusMessageProps {
  message: string
  status: "error" | "success"
}

export function StatusMessage({
  statusMessage,
}: {
  statusMessage: StatusMessageProps
}) {
  const [status, setStatus] = useState<StatusMessageProps | undefined>(
    undefined
  )
  useEffect(() => {
    console.log(statusMessage, statusMessage?.status, status)
    if (!statusMessage) return
    if (statusMessage.status === "success") {
      setStatus({ message: "Success", status: "success" })
      setTimeout(() => {
        setStatus(undefined)
      }, 5000)
    } else if (statusMessage.status === "error") {
      setStatus({ message: statusMessage.message, status: "error" })
    }
  }, [statusMessage?.status, statusMessage?.message])
  if (!status) return null
  return (
    <div className="flex items-center gap-2">
      {status.status === "error" && (
        <Icons.warning className="h-5 w-5 text-red-500" />
      )}
      {status.status === "success" && (
        <Icons.check className="h-5 w-5 text-green-500" />
      )}
      <TypographySubtle>{status.message}</TypographySubtle>
    </div>
  )
}
