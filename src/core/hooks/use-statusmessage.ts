"use client"

import { useEffect, useState } from "react"

import { StatusMessageProps } from "@/components/statusMessage"

export function useStatusMessage() {
  const [statusMessage, setStatusMessage] = useState<
    StatusMessageProps | undefined
  >(undefined)
  useEffect(() => {
    if (!statusMessage) return
    if (statusMessage.status === "success") {
      setTimeout(() => {
        setStatusMessage(undefined)
      }, 2000)
    }
  }, [statusMessage?.status])
  return { statusMessage, setStatusMessage }
}
