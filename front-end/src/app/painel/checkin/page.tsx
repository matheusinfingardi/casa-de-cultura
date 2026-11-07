"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import jsQR from "jsqr"
import { Camera, CameraOff, CheckCircle2, CircleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthGuard from "@/components/auth/auth-guard"
import { Campo, Secao } from "@/components/comum/campo"
import { CampoSelect } from "@/components/comum/campos"
import PageHeader from "@/components/comum/page-header"
import { lerCodigo } from "@/lib/checkin"
import { listarItensDoResponsavel, listarPresencasDoItem, matricularCliente, atualizarStatusPresenca, type ItemResponsavel } from "@/lib/services/presencas"
import { listarClientes } from "@/lib/services/usuarios"

type Resultado = { ok: boolean; texto: string } | null

function Checkin() {
  const [itens, setItens] = useState<ItemResponsavel[]>([])
  const [itemChave, setItemChave] = useState("")
  const [codigo, setCodigo] = useState("")
  const [resultado, setResultado] = useState<Resultado>(null)
  const [camera, setCamera] = useState<"desligada" | "ligada" | "indisponivel">("desligada")
  const video = useRef<HTMLVideoElement>(null)
  const ultimo = useRef("")

  useEffect(() => {
    listarItensDoResponsavel().then((l) => { setItens(l); if (l[0]) setItemChave(`${l[0].tipo}|${l[0].id}`) })
  }, [])

  const item = itens.find((i) => `${i.tipo}|${i.id}` === itemChave)

  const registrar = useCallback(async (texto: string) => {
    if (!item) return
    const id = lerCodigo(texto)
    const clientes = await listarClientes()
    const pessoa = clientes.find((c) => c.id === id)
    if (!pessoa) return setResultado({ ok: false, texto: "Código não encontrado. Confira e tente de novo." })
    const presencas = await listarPresencasDoItem(item.tipo, item.id)
    let inscricao = presencas.find((p) => p.cliente_id === id)
    if (!inscricao) {
      await matricularCliente(item.tipo, item.id, item.nome, id)
      inscricao = (await listarPresencasDoItem(item.tipo, item.id)).find((p) => p.cliente_id === id)
    }
    if (inscricao) await atualizarStatusPresenca(inscricao.id, "presente")
    setResultado({ ok: true, texto: `${pessoa.nome ?? pessoa.email}: presença registrada em ${item.nome}.` })
  }, [item])

  useEffect(() => {
    if (camera !== "ligada") return
    let parar = false
    let stream: MediaStream | null = null
    const tela = document.createElement("canvas")
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        if (parar || !video.current) return
        video.current.srcObject = stream
        await video.current.play()
        const lerQuadro = () => {
          if (parar || !video.current) return
          const v = video.current
          if (v.videoWidth) {
            tela.width = v.videoWidth; tela.height = v.videoHeight
            const ctx = tela.getContext("2d", { willReadFrequently: true })
            ctx?.drawImage(v, 0, 0)
            const img = ctx?.getImageData(0, 0, tela.width, tela.height)
            const qr = img && jsQR(img.data, img.width, img.height)
            if (qr?.data && qr.data !== ultimo.current) {
              ultimo.current = qr.data
              registrar(qr.data)
              setTimeout(() => { ultimo.current = "" }, 4000)
            }
          }
          requestAnimationFrame(lerQuadro)
        }
        lerQuadro()
      } catch {
        setCamera("indisponivel")
      }
    })()
    return () => { parar = true; stream?.getTracks().forEach((t) => t.stop()) }
  }, [camera, registrar])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader titulo="Check-in" descricao="Leia o QR Code do assistido para registrar a presença na hora." />

      <Secao titulo="1. Escolha o compromisso">
        <Campo label="Compromisso">
          {(p) => <CampoSelect {...p} valor={itemChave} onChange={setItemChave} opcoes={itens.map((i) => ({ valor: `${i.tipo}|${i.id}`, label: i.nome ?? "Item" }))} placeholder="Selecione" />}
        </Campo>
      </Secao>

      <Secao titulo="2. Leia o código">
        {camera === "ligada" ? (
          <>
            <video ref={video} playsInline muted className="aspect-video w-full rounded-xl bg-black object-cover" aria-label="Imagem da câmera" />
            <Button variant="outline" onClick={() => setCamera("desligada")}><CameraOff className="h-4 w-4" aria-hidden /> Desligar câmera</Button>
          </>
        ) : (
          <Button size="lg" onClick={() => setCamera("ligada")} disabled={!item}><Camera className="h-5 w-5" aria-hidden /> Ligar câmera</Button>
        )}
        {camera === "indisponivel" && <p role="alert" className="text-amber-800 dark:text-amber-300">Não foi possível usar a câmera. Permita o acesso no navegador ou digite o código abaixo.</p>}

        <form className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-end" onSubmit={(e) => { e.preventDefault(); registrar(codigo); setCodigo("") }}>
          <Campo label="Ou digite o código" className="flex-1">{(p) => <Input {...p} value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ex.: usr-ana" />}</Campo>
          <Button type="submit" variant="outline" disabled={!codigo.trim() || !item}>Registrar</Button>
        </form>
      </Secao>

      {resultado && (
        <p role="status" className={`flex items-center gap-2 rounded-2xl p-4 text-lg font-medium ${resultado.ok ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-50" : "bg-amber-100 text-amber-950 dark:bg-amber-900 dark:text-amber-50"}`}>
          {resultado.ok ? <CheckCircle2 className="h-6 w-6 shrink-0" aria-hidden /> : <CircleAlert className="h-6 w-6 shrink-0" aria-hidden />}
          {resultado.texto}
        </p>
      )}
    </div>
  )
}

export default function CheckinPage() {
  return <AuthGuard allow={["responsavel"]} redirectTo="/painel"><Checkin /></AuthGuard>
}
