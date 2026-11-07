// O QR Code guarda só o identificador da pessoa, sem dados pessoais.
const PREFIXO = "CASADECULTURA:"

export const codigoDaPessoa = (id: string) => `${PREFIXO}${id}`
export const codigoCurto = (id: string) => id
/** Aceita o conteúdo do QR Code ou o código digitado. */
export const lerCodigo = (texto: string) => texto.trim().replace(PREFIXO, "")
