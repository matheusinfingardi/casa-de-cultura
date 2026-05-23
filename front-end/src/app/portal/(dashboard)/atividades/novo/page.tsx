"use client"

<<<<<<< HEAD
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NovaAtividadePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    
    // Estados dos campos simples
    const [nome, setNome] = useState("")
    const [responsavel, setResponsavel] = useState("")
    const [local, setLocal] = useState("")
    const [tipoRecorrencia, setTipoRecorrencia] = useState("Unica")
    
    // Estados para os detalhes de horário/data
    const [dataUnica, setDataUnica] = useState("")
    const [inicio, setInicio] = useState("08:00")
    const [fim, setFim] = useState("10:00")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        // Monta o objeto de recorrência conforme a lógica do expandRecorrencia
        const payload = {
            nome,
            responsavel,
            local,
            recorrencia: tipoRecorrencia === "Unica" ? {
                tipo: "Unica",
                data: dataUnica,
                horarioInicio: inicio,
                horarioFim: fim
            } : {
                tipo: "Semanal",
                horarios: {
                    "Segunda-feira": { horarioInicio: inicio, horarioFim: fim } // Exemplo simplificado
                }
            }
        }

        try {
            const res = await fetch("http://localhost:8000/activities/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                // Redireciona de volta para a listagem e força a atualização dos dados
                router.push("/portal/atividades")
                router.refresh()
            } else {
                alert("Erro ao salvar a atividade no servidor.")
            }
        } catch (err) {
            console.error("Erro de rede:", err)
            alert("Não foi possível conectar ao servidor Python.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Cadastrar Nova Atividade</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-lg text-black">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome da Atividade</label>
                    <input 
                        type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={nome} onChange={(e) => setNome(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Responsável</label>
                    <input 
                        type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={responsavel} onChange={(e) => setResponsavel(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Local</label>
                    <input 
                        type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={local} onChange={(e) => setLocal(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Agendamento</label>
                    <select 
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        value={tipoRecorrencia} onChange={(e) => setTipoRecorrencia(e.target.value)}
                    >
                        <option value="Unica">Data Única</option>
                        <option value="Semanal">Semanal (Ex: Toda Segunda)</option>
                    </select>
                </div>

                {tipoRecorrencia === "Unica" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data do Evento</label>
                        <input 
                            type="date" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={dataUnica} onChange={(e) => setDataUnica(e.target.value)}
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Horário Início</label>
                        <input 
                            type="time" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={inicio} onChange={(e) => setInicio(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Horário Fim</label>
                        <input 
                            type="time" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={fim} onChange={(e) => setFim(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-6 flex gap-4">
                    <button 
                        type="button" onClick={() => router.back()}
                        className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-200"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" disabled={loading}
                        className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Salvando..." : "Confirmar Cadastro"}
                    </button>
                </div>
            </form>
        </div>
    )
=======

import FormAtividades from "@/components/portal/formularios/form-atividades"


export default function NovaAtividade() {
  return (
    <FormAtividades />
  )
>>>>>>> 53261b57bdd70ca5ae292e37bb110ba71b42eac8
}