// Configurações do app que dependem do ambiente. Valores públicos (NEXT_PUBLIC_*).

/** E-mail do T.I. que recebe os chamados de suporte. Defina NEXT_PUBLIC_SUPORTE_EMAIL na Vercel. */
export const SUPORTE_EMAIL = process.env.NEXT_PUBLIC_SUPORTE_EMAIL ?? "ti@casadecultura.example"

/** (Opcional) número de WhatsApp do T.I. com DDI, só dígitos. Ex.: 5532999999999 */
export const SUPORTE_WHATSAPP = process.env.NEXT_PUBLIC_SUPORTE_WHATSAPP ?? ""

export const SUPORTE_CONFIGURADO = !!process.env.NEXT_PUBLIC_SUPORTE_EMAIL

export const APP_VERSAO = "1.6.0"
