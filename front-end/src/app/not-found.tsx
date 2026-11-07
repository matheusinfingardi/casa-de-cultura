import Link from "next/link"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"><Compass className="h-7 w-7" aria-hidden /></span>
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-muted-foreground">O endereço pode ter mudado ou não existe. Volte ao início e escolha por onde quer entrar.</p>
      <Button asChild><Link href="/">Ir para o início</Link></Button>
    </main>
  )
}
