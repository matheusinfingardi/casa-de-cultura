export default function PortalDashboard() {
  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Visão Geral
      </h1>

      <div className="grid md:grid-cols-4 gap-4">

        <div className="p-4 border rounded-xl">
          Eventos
        </div>

        <div className="p-4 border rounded-xl">
          Atividades
        </div>

        <div className="p-4 border rounded-xl">
          Oficinas
        </div>

        <div className="p-4 border rounded-xl">
          Assistência
        </div>

      </div>

    </div>
  )
}