import { siteConfig } from "@/config/site"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "./LogoutButton"

export function SiteHeader() {
  return (
    <header className="fixed top-0 h-full w-40 border-r border-r-slate-200 dark:border-r-slate-700 max-md:w-0">
      <div className="flex h-full flex-col justify-between py-4">
        <div className="container flex flex-col items-center space-x-4 sm:justify-between sm:space-x-0">
          <MainNav items={siteConfig.mainNav} />
        </div>
        <div className="flex flex items-center justify-center gap-2 max-md:hidden">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}