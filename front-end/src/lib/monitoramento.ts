// Registro simples dos últimos erros da tela. Para alertas por e-mail, ligar um serviço como o Sentry.
export type ErroTela = { mensagem: string; pagina: string; quando: string }
const CHAVE = "cc-erros"

export function registrarErro(mensagem: string) {
  try {
    const l: ErroTela[] = JSON.parse(localStorage.getItem(CHAVE) ?? "[]")
    l.unshift({ mensagem: mensagem.slice(0, 300), pagina: location.pathname, quando: new Date().toISOString() })
    localStorage.setItem(CHAVE, JSON.stringify(l.slice(0, 20)))
  } catch { /* sem armazenamento */ }
}
export function lerErros(): ErroTela[] {
  try { return JSON.parse(localStorage.getItem(CHAVE) ?? "[]") } catch { return [] }
}
export function limparErros() {
  try { localStorage.removeItem(CHAVE) } catch { /* ok */ }
}
