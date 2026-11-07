export type Tema = "sistema" | "claro" | "escuro"
export type Fonte = "normal" | "grande" | "maior"
export type Preferencias = { tema: Tema; fonte: Fonte }

const CHAVE = "cc-prefs"
export const ESCALA: Record<Fonte, number> = { normal: 1, grande: 1.125, maior: 1.25 }

export function lerPreferencias(): Preferencias {
  try {
    return { tema: "claro", fonte: "normal", ...JSON.parse(localStorage.getItem(CHAVE) ?? "{}") }
  } catch {
    return { tema: "claro", fonte: "normal" }
  }
}

export function aplicarPreferencias(p: Preferencias) {
  const escuro = p.tema === "escuro" || (p.tema === "sistema" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", escuro)
  document.documentElement.style.setProperty("--escala-fonte", String(ESCALA[p.fonte]))
}

export function salvarPreferencias(p: Preferencias) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(p))
  } catch {
    /* sem armazenamento: vale só nesta visita */
  }
  aplicarPreferencias(p)
}

/** Roda antes da página aparecer, para não piscar o tema errado. */
export const SCRIPT_PREFERENCIAS = `try{var p=JSON.parse(localStorage.getItem("${CHAVE}")||"{}");var e={normal:1,grande:1.125,maior:1.25};if(p.tema==="escuro"||(p.tema==="sistema"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark");if(p.fonte)document.documentElement.style.setProperty("--escala-fonte",e[p.fonte]||1)}catch(_){}`
