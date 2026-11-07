"use client"

import { useEffect, useRef, useState } from "react"
import jsQR from "jsqr"
import { Camera, CameraOff } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Liga a câmera e avisa cada QR Code lido. O mesmo código só é aceito de novo depois de 4 segundos. */
export default function LeitorQr({ onLer }: { onLer: (texto: string) => void }) {
  const [estado, setEstado] = useState<"desligada" | "ligada" | "indisponivel">("desligada")
  const video = useRef<HTMLVideoElement>(null)
  const callback = useRef(onLer)
  useEffect(() => { callback.current = onLer }, [onLer])

  useEffect(() => {
    if (estado !== "ligada") return
    let parar = false
    let stream: MediaStream | null = null
    let ultimo = ""
    const tela = document.createElement("canvas")
    ;(async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        if (parar || !video.current) return
        video.current.srcObject = stream
        await video.current.play()
        const quadro = () => {
          if (parar || !video.current) return
          const v = video.current
          if (v.videoWidth) {
            tela.width = v.videoWidth; tela.height = v.videoHeight
            const ctx = tela.getContext("2d", { willReadFrequently: true })
            ctx?.drawImage(v, 0, 0)
            const img = ctx?.getImageData(0, 0, tela.width, tela.height)
            const qr = img && jsQR(img.data, img.width, img.height)
            if (qr?.data && qr.data !== ultimo) {
              ultimo = qr.data
              callback.current(qr.data)
              setTimeout(() => { ultimo = "" }, 4000)
            }
          }
          requestAnimationFrame(quadro)
        }
        quadro()
      } catch {
        setEstado("indisponivel")
      }
    })()
    return () => { parar = true; stream?.getTracks().forEach((t) => t.stop()) }
  }, [estado])

  if (estado === "ligada") {
    return (
      <div className="space-y-2">
        <video ref={video} playsInline muted className="aspect-video w-full rounded-xl bg-black object-cover" aria-label="Imagem da câmera" />
        <Button variant="outline" onClick={() => setEstado("desligada")}><CameraOff className="h-4 w-4" aria-hidden /> Desligar câmera</Button>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      <Button onClick={() => setEstado("ligada")}><Camera className="h-4 w-4" aria-hidden /> Ler QR Code</Button>
      {estado === "indisponivel" && <p role="alert" className="text-sm text-amber-800 dark:text-amber-300">Não foi possível usar a câmera. Permita o acesso no navegador ou digite o código ao lado.</p>}
    </div>
  )
}
