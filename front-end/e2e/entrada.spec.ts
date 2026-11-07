import { expect, test } from "@playwright/test"

test("a página inicial não mostra demonstração nem administração", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Como você quer entrar?")).toBeVisible()
  await expect(page.getByText(/demonstração/i)).toHaveCount(0)
  await expect(page.getByText("Administração")).toHaveCount(0)
  await page.goto("/auth?perfil=assistido")
  await expect(page.getByText(/demonstração|12345678/i)).toHaveCount(0)
})

test("a rota /administracao leva ao login da administração", async ({ page }) => {
  await page.goto("/administracao")
  await expect(page).toHaveURL(/perfil=admin/)
})

test("a demonstração abre cada portal pela rota escondida", async ({ page }) => {
  for (const [botao, url, texto] of [
    ["Entrar como assistido", /\/painel$/, /Seu próximo compromisso|Nada marcado/],
    ["Entrar como voluntário", /\/painel$/, /Dia a dia/],
    ["Entrar como administração", /\/portal$/, /Agenda da semana/],
  ] as const) {
    await page.goto("/demonstracao")
    await page.getByRole("button", { name: botao, exact: true }).click()
    await page.waitForURL(url)
    await expect(page.getByText(texto).first()).toBeVisible()
    await page.getByRole("button", { name: "Sair da demonstração" }).click()
    await page.waitForURL(/\/$/)
    await expect(page.getByText("Como você quer entrar?")).toBeVisible()
  }
})

test("demonstração não mostra e-mails nem senhas de teste", async ({ page }) => {
  await page.goto("/demonstracao")
  await expect(page.getByRole("button", { name: "Entrar como voluntário" })).toBeVisible()
  await expect(page.getByText(/12345678|admin@admin\.com/)).toHaveCount(0)
})

test("pedido de voluntário tem formulário fora da demonstração", async ({ page }) => {
  await page.goto("/quero-ser-voluntario")
  await expect(page.getByLabel("Nome completo")).toBeVisible()
  await expect(page.getByText("Em breve")).toHaveCount(0)
})

test("cadastro exige aceite dos termos e não pede conta de robô", async ({ page }) => {
  await page.goto("/auth?perfil=assistido&mode=register")
  await page.getByLabel("Nome").fill("Teste")
  await page.getByLabel("E-mail").fill("t@t.com")
  await page.getByLabel("Senha").fill("123456")
  await expect(page.getByLabel(/quanto é/)).toHaveCount(0)
  await page.getByRole("button", { name: "Criar conta" }).click()
  await expect(page.getByText("É preciso aceitar para criar a conta")).toBeVisible()
})

test("página inexistente mostra aviso amigável", async ({ page }) => {
  await page.goto("/nao-existe")
  await expect(page.getByText("Página não encontrada")).toBeVisible()
})

test("contas de teste entram pelo formulário de login", async ({ page }) => {
  for (const [perfil, email, url, texto] of [
    ["admin", "admin@admin.com", /\/portal$/, /Agenda da semana/],
    ["voluntario", "voluntario@voluntario.com", /\/painel$/, /Dia a dia/],
    ["assistido", "assistido@assistido.com", /\/painel$/, /Olá, Ana/],
  ] as const) {
    await page.goto(`/auth?perfil=${perfil}`)
    await page.getByLabel("E-mail").fill(email)
    await page.getByLabel("Senha").fill("12345678")
    await page.locator("form").getByRole("button", { name: "Entrar" }).click()
    await page.waitForURL(url)
    await expect(page.getByText(texto).first()).toBeVisible()
    await page.getByRole("button", { name: "Sair da demonstração" }).first().click()
    await page.waitForURL(/\/$/)
  }
})

test("senha errada na conta de teste não entra", async ({ page }) => {
  await page.goto("/auth?perfil=admin")
  await page.getByLabel("E-mail").fill("admin@admin.com")
  await page.getByLabel("Senha").fill("errada")
  await page.locator("form").getByRole("button", { name: "Entrar" }).click()
  await expect(page.getByRole("alert").first()).toBeVisible()
  await expect(page).toHaveURL(/\/auth/)
})
