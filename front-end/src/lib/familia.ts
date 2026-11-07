import type { Dependente, Ficha } from "@/lib/services/extras"

const GRUPOS: [string[], string, string][] = [
  [["Filho", "Filha"], "filho", "filhos"],
  [["Neto", "Neta"], "neto", "netos"],
  [["Sobrinho", "Sobrinha"], "sobrinho", "sobrinhos"],
]

/** Quem depende da pessoa, em poucas palavras. Ex.: "2 filhos", "1 filha e 1 neto". */
export function resumoFamilia(todos: Dependente[]): string | null {
  // Parente adulto com conta própria (irmã, mãe) não é dependente.
  const deps = todos.filter((d) => !d.parente_id || GRUPOS.some(([nomes]) => nomes.includes(d.parentesco)))
  if (!deps.length) return null
  const partes: string[] = []
  for (const [nomes, um, varios] of GRUPOS) {
    const doGrupo = deps.filter((d) => nomes.includes(d.parentesco))
    if (doGrupo.length === 1) partes.push(`1 ${doGrupo[0].parentesco.toLowerCase()}`)
    else if (doGrupo.length > 1) partes.push(`${doGrupo.length} ${varios || um}`)
  }
  if (partes.length) return partes.join(" e ")
  return deps.length === 1 ? `1 ${deps[0].parentesco.toLowerCase()}` : `${deps.length} dependentes`
}

/** A pessoa cuida de uma criança ou de outro dependente? */
/** Só quem de fato depende da pessoa. */
export const soDependentes = (todos: Dependente[]) => todos.filter((d) => !d.parente_id || GRUPOS.some(([nomes]) => nomes.includes(d.parentesco)))

export const ehResponsavelFamiliar = (deps: Dependente[]) => deps.some((d) => GRUPOS.some(([nomes]) => nomes.includes(d.parentesco)))

/** Cuidados anotados na ficha. `comSaude: false` esconde saúde: o voluntário vê só o que ajuda a acolher. */
export function cuidadosDaPessoa(f: Ficha | undefined | null, { comSaude = true } = {}): string[] {
  if (!f) return []
  const out: string[] = []
  if (f.deficiencia) out.push(f.deficiencia)
  else if (f.acessibilidade) out.push(f.acessibilidade)
  if (comSaude && f.saude) out.push(`Saúde: ${f.saude}`)
  if (f.alergias) out.push(`Alergia: ${f.alergias}`)
  return out
}

export type CuidadoFamiliar = { nome: string; parentesco: string; texto: string }
export function cuidadosDaFamilia(deps: Dependente[]): CuidadoFamiliar[] {
  return deps
    .filter((d) => d.deficiencia || d.cuidados)
    .map((d) => ({ nome: d.nome.split(" ")[0], parentesco: d.parentesco.toLowerCase(), texto: d.deficiencia || d.cuidados || "" }))
}
