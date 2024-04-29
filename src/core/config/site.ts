import * as process from "process"

import { NavItem } from "@/types/nav"

interface SiteConfig {
  name: string
  description: string
  mainNav: NavItem[]
  selfRegistration: string
  traceVersions: string[] // currently supported traceversions
}

export const siteConfig: SiteConfig = {
  name: "Webhood",
  description:
    "Modern, simple and private URL scanner that helps you analyze website and find if they are safe to visit by you and your organization's users.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Search",
      href: "/search",
    },
    {
      title: "Account",
      href: "/account",
    },
    {
      title: "Settings",
      href: "/settings",
      roleRequired: "admin",
    },
  ],
  // @ts-ignore
  selfRegistration: process.env.NEXT_PUBLIC_SELF_REGISTER,
  traceVersions: ["0.1"],
}
