"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import QRCode from "qrcode"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Modelo único de certificado: paisagem, uma página, com verificação por QR Code. */
export default function ModeloCertificado({ titulo, nome, area, codigo, children }: { titulo: string; nome: string; area: string; codigo: string; children: React.ReactNode }) {
  const [qr, setQr] = useState("")
  useEffect(() => {
    QRCode.toDataURL(`${window.location.origin}/verificar/${encodeURIComponent(codigo)}`, { width: 160, margin: 1 }).then(setQr)
  }, [codigo])

  return (
    <div className="space-y-4">
      <style>{`@media print { @page { size: A4 landscape; margin: 0 } .certificado { width: 297mm !important; height: 209mm !important; max-width: none !important; border-radius: 0 !important; box-shadow: none !important; margin: 0 !important; aspect-ratio: auto !important } }`}</style>
      <div className="nao-imprimir flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground">No computador, escolha “Salvar como PDF” na janela de impressão.</p>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4" aria-hidden /> Imprimir ou salvar PDF</Button>
      </div>

      <article className="certificado mx-auto aspect-[297/210] w-full max-w-5xl overflow-hidden rounded-xl bg-white text-slate-900 shadow-lg" style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}>
        <div className="relative flex h-full flex-col p-[2.2%]">
          <div className="absolute inset-x-0 top-0 h-[2.2%] bg-[#0b3aa8]" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 h-[2.2%] bg-[#f59e0b]" aria-hidden />
          <div className="flex h-full flex-col items-center justify-between border-2 border-[#0b3aa8]/30 px-[6%] py-[3%] text-center">
            <header className="flex flex-col items-center gap-1">
              <Image src="/logo-evailton.png" alt="Casa de Cultura Evailton Vilela" width={84} height={84} className="h-[clamp(3rem,9vw,5.25rem)] w-auto print:h-[26mm]" />
              <p className="text-[clamp(0.6rem,1.3vw,0.875rem)] font-semibold uppercase tracking-[0.25em] text-[#0b3aa8] print:text-[11pt]">Casa de Cultura Evailton Vilela</p>
            </header>

            <div className="space-y-[1.5vw] print:space-y-[5mm]">
              <h1 className="text-[clamp(1.4rem,4.4vw,3.25rem)] font-bold leading-none text-[#0b3aa8] print:text-[40pt]">{titulo}</h1>
              <p className="text-[clamp(0.7rem,1.5vw,1.05rem)] print:text-[14pt]">Certificamos que</p>
              <p className="border-b-2 border-[#f59e0b] px-6 pb-1 text-[clamp(1.2rem,3.2vw,2.4rem)] font-semibold print:text-[30pt]">{nome}</p>
              <p className="mx-auto max-w-3xl text-[clamp(0.7rem,1.5vw,1.05rem)] leading-relaxed print:max-w-none print:text-[14pt]">{children}</p>
            </div>

            <footer className="grid w-full grid-cols-3 items-end gap-4 text-[clamp(0.55rem,1.1vw,0.8rem)] print:text-[10pt]">
              <div className="text-left">
                <p>Juiz de Fora, {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}.</p>
                <p className="mt-1 text-slate-600">Área: {area}</p>
              </div>
              <div>
                <div className="mx-auto w-4/5 border-t border-slate-500 pt-1 font-medium">Coordenação</div>
                <p className="text-slate-600">Casa de Cultura Evailton Vilela</p>
              </div>
              <div className="flex items-end justify-end gap-2 text-right">
                <p className="text-slate-600">Verifique a autenticidade<br />pelo QR Code</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {qr && <img src={qr} alt="QR Code para verificar este certificado" className="h-[clamp(2.75rem,7vw,5rem)] w-auto print:h-[22mm]" />}
              </div>
            </footer>
          </div>
        </div>
      </article>
    </div>
  )
}
