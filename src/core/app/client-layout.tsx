"use client"

import { ThemeProvider } from "next-themes"

import { FileTokenProvider } from "@/lib/FileTokenProvider"
import { Layout } from "@/components/layout"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function ClientLayout({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <FileTokenProvider>
        <TooltipProvider delayDuration={0}>
          <Layout>{children}</Layout>
          <Toaster />
        </TooltipProvider>
      </FileTokenProvider>
    </ThemeProvider>
  )
}
