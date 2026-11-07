import type { Page } from "@playwright/test"

const USUARIOS = { admin: "usr-marina", voluntario: "usr-carlos", assistido: "usr-ana" }

/** Abre o app no modo demonstração, já com o perfil escolhido. */
export async function entrarComo(page: Page, perfil: keyof typeof USUARIOS) {
  await page.addInitScript((u) => {
    localStorage.setItem("cc-demo", "1")
    localStorage.setItem("cc-demo-usuario", u)
  }, USUARIOS[perfil])
}
