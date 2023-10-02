import { defineConfig } from "cypress"

export default defineConfig({
  projectId: "robbtp",
  e2e: {
    baseUrl: "http://localhost:3000",
    env: {
      // SCANNER_TOKEN: "",
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
})
