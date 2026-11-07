import { defineConfig } from "@playwright/test"

const porta = 3210

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${porta}`,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    ...(process.env.PW_CHROME ? { launchOptions: { executablePath: process.env.PW_CHROME, args: ["--no-sandbox"] } } : {}),
  },
  webServer: {
    command: `npx next start -p ${porta}`,
    url: `http://localhost:${porta}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
