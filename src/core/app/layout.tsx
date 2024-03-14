import "@/styles/globals.css"

import ClientLayout from "./client-layout"
import Styled from "./style"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Styled />
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
