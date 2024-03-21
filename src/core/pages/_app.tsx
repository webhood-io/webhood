import type { AppProps } from "next/app"
import { Inter as FontSans } from "next/font/google"
import { ThemeProvider } from "next-themes"

import "@/styles/globals.css"

import Head from "next/head"

import { FileTokenProvider } from "@/lib/FileTokenProvider"
// import { client } from "@/lib/supabase"
import { Icons } from "@/components/icons"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href={Icons.favicon.src} />
      </Head>
      <style jsx global>{`
				:root {
					--font-sans: ${fontSans.style.fontFamily};
				}
			}`}</style>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <FileTokenProvider>
          <TooltipProvider delayDuration={0}>
            <Component {...pageProps} />
            <Toaster />
          </TooltipProvider>
        </FileTokenProvider>
      </ThemeProvider>
    </>
  )
}
