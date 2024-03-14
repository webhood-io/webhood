import { useEffect, useState } from "react"

import { Icons } from "@/components/icons"
import { TypographySubtle } from "@/components/ui/typography/subtle"

export interface StatusMessageProps {
  message: string
  status: "error" | "success"
  details?: any
}

export function StatusMessage({
  statusMessage,
}: {
  statusMessage: StatusMessageProps
}) {
  if (!statusMessage) return null
  return (
    <div className="flex items-center gap-2">
      {statusMessage.status === "error" && (
        <Icons.warning className="h-5 w-5 text-red-500" />
      )}
      {statusMessage.status === "success" && (
        <Icons.check className="h-5 w-5 text-green-500" />
      )}
      <span data-cy="status-message">
        <TypographySubtle>{statusMessage.message}</TypographySubtle>
      </span>
    </div>
  )
}
