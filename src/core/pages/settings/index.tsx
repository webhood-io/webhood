import Head from "next/head"

import { siteConfig } from "@/config/site"
import { AccountSettings } from "@/components/accountSettings"
import { Layout } from "@/components/layout"
import { ScannerSettings } from "@/components/scannerSettingsCard"
import { Title } from "@/components/title"
import { Container } from "@/components/ui/container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Settings() {
  return (
    <Layout>
      {/* @ts-ignore* */}
      <Container>
        <Head>
          <title>Settings - {siteConfig.name}</title>
        </Head>
        <Title
          title="Settings"
          subtitle="Configure settings for the whole deployment."
        />
        <Tabs defaultValue={"general"}>
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="account">Accounts</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <ScannerSettings />
          </TabsContent>
          <TabsContent value="account">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </Container>
    </Layout>
  )
}
