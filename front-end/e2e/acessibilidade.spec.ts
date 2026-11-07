import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { entrarComo } from "./apoio"

const ROTAS: [string, "admin" | "voluntario" | "assistido" | null][] = [
  ["/", null], ["/auth?perfil=assistido&mode=register", null], ["/termos", null],
  ["/portal", "admin"], ["/portal/agenda", "admin"], ["/portal/eventos", "admin"], ["/portal/eventos/novo", "admin"],
  ["/portal/oficinas/ofi-info", "admin"], ["/portal/usuarios", "admin"], ["/portal/usuarios/usr-ana", "admin"], ["/portal/relatorios", "admin"],
  ["/portal/comunicados", "admin"], ["/portal/ajuda", "admin"], ["/portal/atualizacoes", "admin"], ["/portal/conta", "admin"], ["/portal/status", "admin"],
  ["/painel", "assistido"], ["/painel/explorar", "assistido"], ["/painel/item/oficina/ofi-teatro", "assistido"], ["/painel/agenda", "assistido"], ["/painel/familia", "assistido"],
  ["/painel", "voluntario"], ["/painel/presenca/oficina/ofi-info", "voluntario"], ["/painel/checkin", "voluntario"],
]

for (const [rota, perfil] of ROTAS) {
  test(`sem violações graves: ${rota} (${perfil ?? "público"})`, async ({ page }) => {
    if (perfil) await entrarComo(page, perfil)
    await page.goto(rota)
    await page.waitForLoadState("networkidle")
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
    const graves = violations.filter((v) => v.impact === "critical" || v.impact === "serious")
    expect(graves.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([])
  })
}
