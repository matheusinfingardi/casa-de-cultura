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
    await page.goto("/painel/certificados")
    await page.getByRole("link", { name: /Baixar certificado: Aula de Violão/ }).click()
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
    await page.getByRole("tab", { name: "Inscritos" }).click()
    await expect(page.getByRole("heading", { name: /Inscritos/ })).toBeVisible()
    await expect(page.getByRole("table")).toBeVisible()
    await page.getByRole("tab", { name: "Diário de presença" }).click()
    await expect(page.getByRole("heading", { name: "Diário de presença" })).toBeVisible()
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
  test("administração gera para um conjunto de atividades", async ({ page }) => {
    await entrarComo(page, "admin")
    await page.goto("/portal/certificados")
    await page.getByRole("button", { name: "Gerar certificados" }).click()
    await page.getByRole("checkbox", { name: /Capoeira Infantil/ }).check()
    await page.getByRole("checkbox", { name: /Teatro Comunitário/ }).check()
    await page.getByLabel(/Nome do conjunto/).fill("Trilha Corpo e Palco")
    await page.getByRole("button", { name: "Gerar agora" }).click()
    await expect(page.getByText("Trilha Corpo e Palco").first()).toBeVisible()
    await page.getByRole("link", { name: /Ver certificado de .*Trilha Corpo e Palco/ }).first().click()
    await expect(page.getByRole("heading", { name: /Certificado de/ })).toBeVisible()
    await expect(page.getByText(/que reúne/)).toBeVisible()
  })

  test("gera um certificado por presença, nos dias escolhidos", async ({ page }) => {
    await entrarComo(page, "voluntario")
    await page.goto("/painel/atividades/oficina/ofi-info?aba=certificados")
    await page.getByRole("button", { name: "Gerar certificados" }).click()
    await page.getByRole("radio", { name: /Dias escolhidos/ }).check()
    await page.getByRole("group", { name: "Dias" }).getByRole("button").first().click()
    await page.getByRole("radio", { name: /Um certificado por presença/ }).check()
    await page.getByRole("button", { name: "Gerar agora" }).click()
    await expect(page.getByRole("heading", { name: /Certificados gerados \([1-9]/ })).toBeVisible()
  })

  test("assistido baixa os seus na aba própria, e a página da inscrição não tem botão", async ({ page }) => {
    await entrarComo(page, "assistido")
    await page.goto("/painel/inscricoes")
    await expect(page.getByRole("link", { name: /certificado/i }).locator("visible=true").filter({ hasText: "Baixar" })).toHaveCount(0)
    await page.goto("/painel/certificados")
    await page.getByRole("link", { name: /Baixar certificado: Trilha de Artes/ }).click()
    await expect(page.getByRole("heading", { name: "Certificado de Participação" })).toBeVisible()
  })

  test("certificado aparece como válido e, cancelado, deixa de valer", async ({ page }) => {
    await entrarComo(page, "admin")
    await page.goto("/verificar/cert-1")
    await expect(page.getByText(/Certificado válido/)).toBeVisible()
    await page.goto("/verificar/nao-existe")
    await expect(page.getByText(/Não foi possível confirmar/)).toBeVisible()
  })

  test("item não mostra certificados na visão geral, só na aba", async ({ page }) => {
    await entrarComo(page, "admin")
    await page.goto("/portal/atividades/atv-violao")
    await expect(page.getByRole("button", { name: "Gerar certificados" })).toHaveCount(0)
    await page.getByRole("tab", { name: "Certificados" }).click()
    await expect(page.getByRole("button", { name: "Gerar certificados" })).toBeVisible()
  })

  test("formulário pergunta se emite certificado", async ({ page }) => {
    await entrarComo(page, "admin")
    await page.goto("/portal/oficinas/novo")
    await expect(page.getByText("Esta atividade emite certificado?")).toBeVisible()
    await page.getByRole("radio", { name: "Sim" }).click()
    await expect(page.getByRole("radio", { name: "Sim" })).toHaveAttribute("aria-checked", "true")
  })
})
