import "@/styles/globals.css"

import ClientLayout from "./client-layout"
import Styled from "./style"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Styled />
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
