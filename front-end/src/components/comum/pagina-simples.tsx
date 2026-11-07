import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

/** Moldura das páginas públicas: termos, privacidade, recuperação de senha etc. */
export default function PaginaSimples({ titulo, descricao, largura = "max-w-md", children }: { titulo: string; descricao?: string; largura?: string; children: React.ReactNode }) {
  return (
    <main id="conteudo" className="min-h-screen px-4 py-10">
      <div className={`mx-auto ${largura} space-y-6`}>
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo-evailton.png" alt="" width={48} height={48} className="h-12 w-12 rounded-full bg-white" />
          <span className="font-semibold">Casa de Cultura Evailton Vilela</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{titulo}</h1>
          {descricao && <p className="mt-1 text-muted-foreground">{descricao}</p>}
        </div>
        {children}
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar ao início
        </Link>
      </div>
    </main>
  )
}
