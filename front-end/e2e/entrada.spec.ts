import { expect, test } from "@playwright/test"

test("a demonstração abre cada portal pela página inicial", async ({ page }) => {
  for (const [botao, url, texto] of [
    ["Assistido", /\/painel$/, /Seu próximo compromisso|Nada marcado/],
    ["Voluntário", /\/painel$/, /Todos os meus compromissos/],
    ["Administração", /\/portal$/, /Agenda da semana/],
  ] as const) {
    await page.goto("/")
    await page.getByRole("button", { name: botao, exact: true }).click()
    await page.waitForURL(url)
    await expect(page.getByText(texto).first()).toBeVisible()
    await page.getByRole("button", { name: "Sair da demonstração" }).click()
    await page.waitForURL(/\/$/)
    await expect(page.getByText("Como você quer entrar?")).toBeVisible()
  }
})

test("cadastro exige aceite dos termos e a resposta certa", async ({ page }) => {
  await page.goto("/auth?perfil=assistido&mode=register")
  await page.getByLabel("Nome").fill("Teste")
  await page.getByLabel("E-mail").fill("t@t.com")
  await page.getByLabel("Senha").fill("123456")
  await page.getByLabel(/quanto é/).fill("999")
  await page.getByRole("button", { name: "Criar conta" }).click()
  await expect(page.getByText("É preciso aceitar para criar a conta")).toBeVisible()
  await expect(page.getByText("Resposta incorreta")).toBeVisible()
})

test("página inexistente mostra aviso amigável", async ({ page }) => {
  await page.goto("/nao-existe")
  await expect(page.getByText("Página não encontrada")).toBeVisible()
})

test("contas de teste entram pelo formulário de login", async ({ page }) => {
  for (const [perfil, email, url, texto] of [
    ["admin", "admin@admin.com", /\/portal$/, /Agenda da semana/],
    ["voluntario", "voluntario@voluntario.com", /\/painel$/, /Todos os meus compromissos/],
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
