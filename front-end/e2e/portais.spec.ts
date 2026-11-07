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
    await page.getByRole("link", { name: "Baixar certificado" }).first().click()
    await expect(page.getByRole("heading", { name: "Certificado de Participação" })).toBeVisible()
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
  })

  test("ficha guarda horário exato, tarefas e onde quer contribuir", async ({ page }) => {
    await page.goto("/painel/ficha")
    await page.getByRole("button", { name: "Domingo", exact: true }).click()
    await page.getByLabel("Domingo: início").fill("19:00")
    await page.getByLabel("Domingo: término").fill("18:00")
    await page.getByRole("button", { name: "Salvar ficha" }).click()
    await expect(page.getByText(/Domingo: o término/)).toBeVisible()
    await page.getByLabel("Domingo: término").fill("21:00")
    await page.getByRole("button", { name: "Reforço escolar", exact: true }).click()
    await page.getByRole("checkbox", { name: /Teatro Comunitário/ }).check()
    await page.getByLabel("Profissão").fill("Professor")
    await page.getByRole("button", { name: "Salvar ficha" }).click()
    await expect(page.getByText("Ficha salva")).toBeVisible()
    await page.reload()
    await expect(page.getByLabel("Domingo: término")).toHaveValue("21:00")
    await expect(page.getByRole("checkbox", { name: /Teatro Comunitário/ })).toBeChecked()
    await expect(page.getByLabel("Profissão")).toHaveValue("Professor")
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

test.describe("áreas do voluntário", () => {
  test.beforeEach(({ page }) => entrarComo(page, "voluntario"))

  test("minhas atividades tem página própria com frequência", async ({ page }) => {
    await page.goto("/painel/atividades")
    await page.getByRole("link", { name: "Aula de Violão" }).click()
    await expect(page.getByRole("heading", { name: "Diário de presença" })).toBeVisible()
    await expect(page.getByRole("heading", { name: /Inscritos/ })).toBeVisible()
    await page.getByRole("link", { name: "Fazer chamada" }).first().click()
    await expect(page.getByRole("heading", { name: "Escolha o dia" })).toBeVisible()
  })

  test("meus assistidos mostra só quem tem relação e protege dados sensíveis", async ({ page }) => {
    await page.goto("/painel/assistidos")
    await page.getByLabel("Buscar assistido").fill("Ana Souza")
    await page.getByRole("link", { name: /Ana Souza/ }).click()
    await expect(page.getByRole("heading", { name: "O que ajuda a acolher" })).toBeVisible()
    await expect(page.getByText("Bolsa Família")).toHaveCount(0)
    await page.getByLabel(/O que você observou/).fill("Chegou mais animada hoje")
    await page.getByRole("button", { name: "Salvar observação" }).click()
    await expect(page.getByText("Chegou mais animada hoje")).toBeVisible()
  })

  test("não abre assistido sem relação com o voluntário", async ({ page }) => {
    await page.goto("/painel/assistidos/usr-inexistente")
    await expect(page.getByText("Assistido não encontrado")).toBeVisible()
  })
})

test.describe("certificados", () => {
  test("responsável libera e os dois lados baixam", async ({ page, context }) => {
    await entrarComo(page, "voluntario")
    await page.goto("/painel/certificados")
    await expect(page.getByText("Informática Básica")).toBeVisible()
    await page.locator("li", { hasText: "Informática Básica" }).getByRole("link", { name: "Abrir chamada para liberar" }).click()
    await page.getByRole("button", { name: "Liberar certificados" }).click()
    await page.getByRole("dialog").getByRole("button", { name: "Liberar" }).click()
    await expect(page.getByText("Liberados", { exact: true })).toBeVisible()
    await page.goto("/painel/certificados")
    await page.locator("li", { hasText: "Informática Básica" }).getByRole("link", { name: "Baixar meu certificado" }).click()
    await expect(page.getByRole("heading", { name: "Certificado de Trabalho Voluntário" })).toBeVisible()
    await expect(page.getByText(/Vitor Leal/).first()).toBeVisible()
    await context.clearCookies()
  })

  test("atividade sem certificado ou não liberada não mostra o botão", async ({ page }) => {
    await entrarComo(page, "assistido")
    await page.goto("/painel/inscricoes")
    const assistencia = page.locator("li", { hasText: "Acompanhamento Social" }).first()
    await expect(assistencia).toBeVisible()
    await expect(assistencia.getByRole("link", { name: "Baixar certificado" })).toHaveCount(0)
    await expect(page.getByRole("link", { name: "Baixar certificado" }).first()).toBeVisible()
  })

  test("formulário pergunta se emite certificado", async ({ page }) => {
    await entrarComo(page, "admin")
    await page.goto("/portal/oficinas/novo")
    await expect(page.getByText("Esta atividade emite certificado?")).toBeVisible()
    await page.getByRole("radio", { name: "Sim" }).click()
    await expect(page.getByRole("radio", { name: "Sim" })).toHaveAttribute("aria-checked", "true")
  })
})
