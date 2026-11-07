import { expect, test } from "@playwright/test"
import { entrarComo } from "./apoio"

test.beforeEach(({ page }) => entrarComo(page, "admin"))

test("cria um evento, valida horário e abre a página dele", async ({ page }) => {
  await page.goto("/portal/eventos/novo")
  await page.getByRole("button", { name: "Criar evento" }).click()
  await expect(page.getByText("Dê um nome ao evento")).toBeVisible()

  await page.getByLabel(/Nome do evento/).fill("Sarau de Primavera")
  await page.getByRole("combobox", { name: /Tipo/ }).click()
  await page.getByRole("option", { name: "Cultural" }).click()
  await page.getByLabel(/^Data/).fill("2030-09-21")
  await page.getByLabel(/^Início/).fill("19:00")
  await page.getByLabel(/^Término/).fill("18:00")
  await page.getByLabel(/^Local/).fill("Biblioteca")
  await page.getByRole("button", { name: "Criar evento" }).click()
  await expect(page.getByText("O término deve ser depois do início")).toBeVisible()
  await expect(page.getByText("Escolha uma foto")).toBeVisible()
  await page.getByLabel("Escolher foto").setInputFiles("public/icone-192.png")

  await page.getByLabel(/^Término/).fill("21:00")
  await page.getByRole("button", { name: "Criar evento" }).click()
  await expect(page.getByRole("heading", { name: "Sarau de Primavera" })).toBeVisible()
  await expect(page.getByText("Biblioteca").first()).toBeVisible()
})

test("atividade semanal grava todos os dias", async ({ page }) => {
  await page.goto("/portal/atividades/novo")
  await page.getByLabel(/Nome da atividade/).fill("Judô")
  await page.getByLabel(/^Local/).fill("Tatame")
  await page.getByRole("button", { name: "Ter", exact: true }).click()
  await page.getByRole("button", { name: "Qui", exact: true }).click()
  await page.locator('input[type="time"]').nth(0).fill("17:00")
  await page.locator('input[type="time"]').nth(1).fill("18:00")
  await page.getByRole("button", { name: /Usar o horário de terça/ }).click()
  await page.getByLabel("Escolher foto").setInputFiles("public/icone-192.png")
  await page.getByRole("button", { name: "Criar atividade" }).click()
  await expect(page.getByText("Toda terça e quinta, 17:00 às 18:00").first()).toBeVisible()
})

test("duplica e exclui com confirmação", async ({ page }) => {
  await page.goto("/portal/oficinas/ofi-pintura")
  await page.getByRole("button", { name: "Duplicar" }).click()
  await page.waitForURL(/editar$/)
  await expect(page.getByLabel(/Nome da oficina/)).toHaveValue("Pintura em Tela (cópia)")
  await page.goto("/portal/eventos/evt-natal")
  await page.getByRole("button", { name: "Excluir" }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Excluir" }).click()
  await page.waitForURL(/\/portal\/eventos$/)
  await expect(page.locator("table").getByText("Natal Solidário")).toHaveCount(0)
})

test("agenda troca de visão e relatório filtra", async ({ page }) => {
  await page.goto("/portal/agenda")
  await page.getByRole("button", { name: "Lista", exact: true }).click()
  await expect(page.getByText("Sarau de Poesia e Música").first()).toBeVisible()
  await page.goto("/portal/relatorios")
  await page.getByRole("tab", { name: "Participação" }).click()
  await expect(page.getByRole("heading", { name: "Participação por item" })).toBeVisible()
  await page.getByLabel("Área").selectOption("oficina")
  await expect(page.locator("table").getByText("Festival de Cultura Popular")).toHaveCount(0)
  await expect(page.locator("table").getByText("Informática Básica")).toBeVisible()
})

test("aprovar pedido gera convite", async ({ page }) => {
  await page.goto("/portal/voluntarios?aba=pedidos")
  const pedido = page.locator("li", { hasText: "luciana.prates@email.com" })
  await pedido.getByRole("button", { name: "Aprovar e convidar" }).click()
  await expect(pedido.getByText("Aprovado")).toBeVisible()
  await page.goto("/portal/usuarios?aba=convites")
  await expect(page.getByText("luciana.prates@email.com")).toBeVisible()
})

test("a Visão geral mostra o quadro de tipos e a atenção por último", async ({ page }) => {
  await page.goto("/portal")
  await expect(page.getByRole("heading", { name: "Programação e atendimento" })).toBeVisible()
  const titulos = await page.locator("main h2").allTextContents()
  expect(titulos).toEqual(["Agenda da semana", "Programação e atendimento", "Precisa de atenção"])
})

test("a ficha da pessoa mostra dependentes, cuidados e assiduidade", async ({ page }) => {
  await page.goto("/portal/assistidos/usr-ana")
  await expect(page.getByRole("heading", { name: "Assiduidade" })).toBeVisible()
  await page.getByRole("tab", { name: "Dependentes" }).click()
  await expect(page.getByText("Pedro Souza")).toBeVisible()
  await page.getByRole("link", { name: /Também é assistido/ }).click()
  await expect(page.getByRole("heading", { name: "Beatriz Lima" })).toBeVisible()
  await page.goto("/portal/assistidos/usr-ana")
  await page.getByRole("tab", { name: "Acompanhamento" }).click()
  await page.getByLabel(/O que aconteceu/).fill("Ligação de acompanhamento")
  await page.getByRole("button", { name: "Salvar registro" }).click()
  await expect(page.getByText("Ligação de acompanhamento")).toBeVisible()
})

test("assiduidade é clicável e mostra a conta e cada dia", async ({ page }) => {
  await page.goto("/portal/assistidos/usr-ana?aba=assiduidade")
  await expect(page.getByText("Como o número é calculado")).toBeVisible()
  await page.getByRole("button", { name: "6 meses" }).click()
  await page.getByRole("button", { name: /veio a \d+ de [1-9]/ }).first().click()
  await expect(page.getByRole("heading", { name: "Histórico completo" })).toBeVisible()
})

test("dependente é inscrito em atividade, entra na lista e pode sair", async ({ page }) => {
  await page.goto("/portal/assistidos/usr-ana?aba=familia")
  const laura = page.locator("li", { hasText: "Laura Souza" }).first()
  await laura.getByRole("combobox").click()
  await page.getByRole("option", { name: "Teatro Comunitário" }).click()
  await laura.getByRole("button", { name: "Inscrever" }).click()
  await expect(laura.getByRole("link", { name: "Teatro Comunitário" })).toBeVisible()
  await page.goto("/portal/oficinas/ofi-teatro")
  await expect(page.getByRole("link", { name: /Laura Souza/ })).toBeVisible()
})

test("gestão separa assistidos e voluntários; usuários fica em suporte", async ({ page }) => {
  await page.goto("/portal")
  const menu = page.getByRole("navigation").first()
  await expect(menu.getByRole("link", { name: "Assistidos" })).toBeVisible()
  await expect(menu.getByRole("link", { name: "Voluntários" })).toBeVisible()
  await page.goto("/portal/assistidos?filtro=familia")
  await expect(page.getByRole("link", { name: /^Ana Souza/ })).toBeVisible()
  await page.goto("/portal/voluntarios")
  await expect(page.getByRole("link", { name: /Vitor Leal/ })).toBeVisible()
})

test("item não mostra presença geral: fica no diário de cada dia", async ({ page }) => {
  await page.goto("/portal/atividades/atv-violao")
  await expect(page.getByRole("heading", { name: "Diário de presença" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Presença", exact: true })).toHaveCount(0)
})

test("listas alternam entre tabela e cartões", async ({ page }) => {
  await page.goto("/portal/eventos")
  await expect(page.locator("table")).toBeVisible()
  await page.getByRole("button", { name: "Cartões" }).click()
  await expect(page.locator("table")).toBeHidden()
  await expect(page.locator('img[src="/demo/evt-festival.jpg"]')).toBeVisible()
  await page.reload()
  await expect(page.locator("table")).toBeHidden()
})

test("relatórios trazem o que está indo bem e o relatório individual", async ({ page }) => {
  await page.goto("/portal/relatorios")
  await expect(page.getByRole("heading", { name: "O que está indo bem" })).toBeVisible()
  await expect(page.getByText("Vale olhar de perto")).toHaveCount(0)
  await page.getByRole("tab", { name: "Pessoas" }).click()
  await page.getByRole("link", { name: /Relatório de/ }).first().click()
  await expect(page.getByRole("heading", { name: "O que está indo bem" })).toBeVisible()
})

test("foto é mostrada e o mapa aparece no item", async ({ page }) => {
  await page.goto("/portal/oficinas/ofi-info")
  await expect(page.locator('img[src="/demo/ofi-info.jpg"]')).toBeVisible()
  await expect(page.getByTitle(/Mapa:/)).toBeAttached()
})
