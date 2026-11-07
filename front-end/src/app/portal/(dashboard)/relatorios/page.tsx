import type { Metadata } from "next"
import Relatorios from "@/components/portal/relatorios/relatorios"

export const metadata: Metadata = { title: "Relatórios" }

export default function Page() {
  return <Relatorios />
}
