import { expect, test } from "@playwright/test"
import { entrarComo } from "./apoio"

test.describe("assistido", () => {
  test.beforeEach(({ page }) => entrarComo(page, "assistido"))

  test("inscreve, recebe confirmação e cancela", async ({ page }) => {
    await page.goto("/painel/item/oficina/ofi-teatro")
    await page.getByRole("button", { name: "Quero participar" }).click()
    await expect(page.getByText("Você está inscrito")).toBeVisible()
    await page.goto("/painel/inscricoes")
    await expect(page.getByText("Teatro Comunitário").first()).toBeVisible()
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

  test("atividades da Casa separa o que participo do que posso me inscrever", async ({ page }) => {
    await page.goto("/painel/explorar")
    await page.getByRole("tab", { name: /Já participo/ }).click()
    await expect(page.getByRole("heading", { name: "Pintura em Tela" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Teatro Comunitário" })).toHaveCount(0)
    await page.getByRole("tab", { name: /Posso me inscrever/ }).click()
    await expect(page.getByRole("heading", { name: "Teatro Comunitário" })).toBeVisible()
    await page.locator("article", { hasText: "Teatro Comunitário" }).getByRole("button", { name: "Quero participar" }).click()
    await page.getByRole("tab", { name: /Já participo/ }).click()
    await expect(page.getByRole("heading", { name: "Teatro Comunitário" })).toBeVisible()
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

  test("compromissos mostram os dias e o check-in fica dentro da chamada do dia", async ({ page }) => {
    await page.goto("/painel")
    await page.getByRole("link", { name: /Fazer chamada|Abrir chamada/ }).first().click()
    await expect(page.getByRole("heading", { name: "Escolha o dia" })).toBeVisible()
    await page.goto("/painel/presenca/atividade/atv-violao")
    const passado = page.getByRole("group", { name: "Dias deste compromisso" }).getByRole("button", { name: /Feita|Pendente/ }).last()
    await passado.click()
    await expect(page.getByRole("heading", { name: "Check-in de quem chegou" })).toBeVisible()
    await page.getByLabel("Código do assistido").fill("usr-ana")
    await page.getByRole("button", { name: "Registrar" }).click()
    await expect(page.getByRole("status").filter({ hasText: "Ana Souza chegou" })).toBeVisible()
  })

  test("agenda alterna entre meus e todos, e a ficha salva a disponibilidade", async ({ page }) => {
    await page.goto("/painel/agenda")
    await page.getByRole("button", { name: "Lista", exact: true }).click()
    await expect(page.getByText("Capoeira Infantil")).toHaveCount(0)
    await page.getByRole("button", { name: "Todos da Casa" }).click()
    await expect(page.getByText("Capoeira Infantil").first()).toBeVisible()
    await page.goto("/painel/ficha")
    await page.getByRole("button", { name: "Domingo, Manhã" }).click()
    await page.getByRole("button", { name: "Salvar ficha" }).click()
    await page.reload()
    await expect(page.getByRole("button", { name: "Domingo, Manhã" })).toHaveAttribute("aria-pressed", "true")
  })

  test("sem internet guarda a marcação e envia depois", async ({ page, context }) => {
    await page.goto("/painel/presenca/atividade/atv-violao")
    await page.getByRole("group", { name: "Dias deste compromisso" }).getByRole("button", { name: /Feita/ }).last().click()
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
