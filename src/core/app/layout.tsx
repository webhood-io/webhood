import "@/styles/globals.css"

import { Metadata } from "next"

import ClientLayout from "./client-layout"
import Styled from "./style"

export const metadata: Metadata = {
  referrer: "no-referrer",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <Styled />
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
