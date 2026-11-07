import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = { robots: { index: false, follow: false } }

/** Endereço de entrada da administração. Não aparece na página inicial. */
export default function AdministracaoPage() {
  redirect("/auth?perfil=admin")
}
