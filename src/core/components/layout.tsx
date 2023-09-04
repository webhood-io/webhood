import { SiteHeader } from "@/components/site-header"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <SiteHeader />
      <main className="w-screen overflow-hidden md:pl-40">{children}</main>
    </>
  )
}
