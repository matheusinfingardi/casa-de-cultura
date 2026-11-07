import { expect, test } from "@playwright/test"
import { entrarComo } from "./apoio"

test.describe("assistido", () => {
  test.beforeEach(({ page }) => entrarComo(page, "assistido"))

  test("inscreve, recebe confirmação e cancela", async ({ page }) => {
    await page.goto("/painel/item/oficina/ofi-teatro")
    await page.getByRole("button", { name: "Quero participar" }).click()
    await expect(page.getByText("Você está inscrito")).toBeVisible()
    await page.goto("/painel/inscricoes")
    await expect(page.getByText("Teatro Comunitário")).toBeVisible()
    await page.goto("/painel/item/oficina/ofi-teatro")
    await page.getByRole("button", { name: "Cancelar inscrição" }).click()
    await page.getByRole("dialog").getByRole("button", { name: "Cancelar inscrição" }).click()
    await expect(page.getByRole("button", { name: "Quero participar" })).toBeVisible()
  })

  test("oficina lotada oferece lista de espera", async ({ page }) => {
    await page.goto("/painel/item/oficina/ofi-info")
    await expect(page.getByText("Turma lotada")).toBeVisible()
    await page.getByRole("button", { name: "Entrar na lista de espera" }).click()
    await expect(page.getByText(/Você é o \d+º da fila/)).toBeVisible()
  })

  test("certificado e QR Code", async ({ page }) => {
    await page.goto("/painel/inscricoes")
    await page.getByRole("link", { name: "Certificado" }).first().click()
    await expect(page.getByRole("heading", { name: "Certificado de participação" })).toBeVisible()
    await page.goto("/painel/qr")
    await expect(page.getByAltText("Seu QR Code")).toBeVisible()
  })
})

test.describe("voluntário", () => {
  test.beforeEach(({ page }) => entrarComo(page, "voluntario"))

  test("check-in pelo código registra presença", async ({ page }) => {
    await page.goto("/painel/checkin")
    await page.getByLabel("Ou digite o código").fill("usr-a3")
    await page.getByRole("button", { name: "Registrar" }).click()
    await expect(page.getByText(/presença registrada/)).toBeVisible()
  })

  test("sem internet guarda a marcação e envia depois", async ({ page, context }) => {
    await page.goto("/painel/presenca/oficina/ofi-info")
    const grupo = page.getByRole("group", { name: /Situação de/ }).first()
    await context.setOffline(true)
    await grupo.getByRole("button", { name: "Ausente" }).click()
    await expect(page.getByText(/Sem internet/)).toBeVisible()
    await expect(page.getByText(/1 marcação guardada/)).toBeVisible()
    await context.setOffline(false)
    await expect(page.getByText(/1 marcação enviada/)).toBeVisible()
  })

  test("não acessa o portal da administração", async ({ page }) => {
    await page.goto("/portal")
    await page.waitForURL(/\/painel/)
  })
})
