import { ExternalLink, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Mapa do Google incorporado por endereço. Não precisa de chave nem tem custo. */
export default function MapaLocal({ endereco }: { endereco: string }) {
  if (!endereco) return null
  const q = encodeURIComponent(endereco)
  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Como chegar</h2>
          <p className="flex gap-1.5 text-muted-foreground"><MapPin className="mt-1 h-4 w-4 shrink-0" aria-hidden />{endereco}</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" aria-hidden /> Abrir no Google Maps
          </a>
        </Button>
      </div>
      <iframe
        title={`Mapa: ${endereco}`}
        src={`https://www.google.com/maps?q=${q}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-64 w-full border-0 bg-muted"
      />
    </section>
  )
}
