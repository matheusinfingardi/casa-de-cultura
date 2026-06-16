export function traduzirErro(mensagem: string): string {
  const msg = mensagem.toLowerCase()
  if (msg.includes("invalid login credentials")) return "E-mail ou senha incorretos"
  if (msg.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar"
  if (msg.includes("user already registered")) return "E-mail já cadastrado"
  if (msg.includes("password should be at least")) return "A senha é muito curta"
  if (msg.includes("unable to validate email address") || msg.includes("invalid email"))
    return "E-mail inválido"
  if (msg.includes("email rate limit") || msg.includes("rate limit"))
    return "Muitas tentativas. Tente novamente em alguns minutos."
  return mensagem || "Ocorreu um erro. Tente novamente."
}
