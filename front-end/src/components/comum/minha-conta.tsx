"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Download, KeyRound, Moon, ShieldCheck, Sun, Trash2, Type } from "lucide-react"
import QRCode from "qrcode"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { useDemo } from "@/hooks/use-demo"
import { baixarArquivo } from "@/lib/ics"
import { notify } from "@/lib/notify"
import { lerPreferencias, salvarPreferencias, type Fonte, type Preferencias, type Tema } from "@/lib/preferencias"
import { alterarNome, alterarSenha, sair } from "@/lib/services/auth"
import { buscarConsentimento, buscarFicha, buscarSeguranca, excluirMinhaConta, exportarMeusDados, salvarFicha, salvarSeguranca, type Ficha } from "@/lib/services/extras"
import { mascararTelefone } from "@/lib/formatar"
import { gerarSegredo, uriTotp, validarTotp } from "@/lib/totp"
import { Campo, Secao } from "./campo"
import Confirmar from "./confirmar"
import PageHeader from "./page-header"

function Opcoes<T extends string>({ rotulo, valor, opcoes, onChange }: { rotulo: string; valor: T; opcoes: { v: T; r: string; icon?: typeof Sun }[]; onChange: (v: T) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{rotulo}</p>
      <div className="inline-flex flex-wrap gap-1 rounded-xl border bg-card p-1" role="group" aria-label={rotulo}>
        {opcoes.map((o) => (
          <button key={o.v} type="button" aria-pressed={valor === o.v} onClick={() => onChange(o.v)} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${valor === o.v ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
            {o.icon && <o.icon className="h-4 w-4" aria-hidden />}{o.r}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MinhaConta({ admin }: { admin?: boolean }) {
  const router = useRouter()
  const { user } = useAuth()
  const demo = useDemo()
  const [nome, setNome] = useState((user?.user_metadata?.nome as string) ?? "")
  const [senha, setSenha] = useState("")
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [prefs, setPrefs] = useState<Preferencias>(lerPreferencias)
  const [consentimento, setConsentimento] = useState<{ aceito_em: string } | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  // Verificação em duas etapas
  const [totpAtivo, setTotpAtivo] = useState(false)
  const [novoSegredo, setNovoSegredo] = useState<string | null>(null)
  const [qr, setQr] = useState("")
  const [codigo, setCodigo] = useState("")

  useEffect(() => {
    if (!demo || !user) return
    buscarFicha(user.id).then(setFicha)
    buscarConsentimento(user.id).then(setConsentimento)
    buscarSeguranca(user.id).then((s) => setTotpAtivo(!!s.totp_segredo))
  }, [demo, user])

  function atualizarPrefs(p: Partial<Preferencias>) {
    const nova = { ...prefs, ...p }
    setPrefs(nova)
    salvarPreferencias(nova)
  }

  async function ativar2fa() {
    const s = gerarSegredo()
    setNovoSegredo(s)
    setQr(await QRCode.toDataURL(uriTotp(s, user?.email ?? "conta"), { width: 200, margin: 1 }))
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader titulo="Minha conta" descricao="Seus dados, a aparência do sistema e sua segurança." />

      <Secao titulo="Aparência" descricao="Deixe o sistema confortável para os seus olhos.">
        <Opcoes<Tema> rotulo="Tema" valor={prefs.tema} onChange={(tema) => atualizarPrefs({ tema })} opcoes={[{ v: "claro", r: "Claro", icon: Sun }, { v: "escuro", r: "Escuro", icon: Moon }, { v: "sistema", r: "Igual ao aparelho" }]} />
        <Opcoes<Fonte> rotulo="Tamanho das letras" valor={prefs.fonte} onChange={(fonte) => atualizarPrefs({ fonte })} opcoes={[{ v: "normal", r: "Normal", icon: Type }, { v: "grande", r: "Grande" }, { v: "maior", r: "Maior" }]} />
      </Secao>

      <Secao titulo="Dados pessoais">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const { error } = await alterarNome(nome)
            if (error) return notify.error("Não foi possível salvar")
            if (ficha) await salvarFicha(ficha)
            notify.success("Dados salvos")
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="Nome">{(p) => <Input {...p} autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} />}</Campo>
            <Campo label="E-mail" dica="Para trocar o e-mail, fale com o Suporte.">{(p) => <Input {...p} value={user?.email ?? ""} disabled />}</Campo>
            {ficha && <Campo label="Telefone">{(p) => <Input {...p} type="tel" autoComplete="tel" value={ficha.telefone} onChange={(e) => setFicha({ ...ficha, telefone: mascararTelefone(e.target.value) })} />}</Campo>}
            {ficha && <Campo label="Data de nascimento">{(p) => <Input {...p} type="date" value={ficha.nascimento} onChange={(e) => setFicha({ ...ficha, nascimento: e.target.value })} />}</Campo>}
          </div>
          {ficha && <Campo label="Endereço">{(p) => <Input {...p} autoComplete="street-address" value={ficha.endereco} onChange={(e) => setFicha({ ...ficha, endereco: e.target.value })} />}</Campo>}
          <Button type="submit">Salvar dados</Button>
        </form>
      </Secao>

      <Secao titulo="Senha">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={async (e) => {
            e.preventDefault()
            if (senha.length < 6) return notify.error("Use pelo menos 6 caracteres")
            const { error } = await alterarSenha(senha)
            if (error) return notify.error("Não foi possível alterar a senha")
            setSenha("")
            notify.success("Senha alterada")
          }}
        >
          <Campo label="Nova senha" className="flex-1">{(p) => <Input {...p} type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />}</Campo>
          <Button type="submit" variant="outline"><KeyRound className="h-4 w-4" aria-hidden /> Alterar senha</Button>
        </form>
      </Secao>

      {admin && demo && (
        <Secao titulo="Verificação em duas etapas" descricao="Além da senha, pede um código do celular ao entrar. Recomendado para administradores.">
          {totpAtivo ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300"><ShieldCheck className="h-5 w-5" aria-hidden /> Ativada</p>
              <Button variant="outline" onClick={async () => { if (user) await salvarSeguranca({ id: user.id, totp_segredo: null }); setTotpAtivo(false); notify.success("Verificação desativada") }}>Desativar</Button>
            </div>
          ) : novoSegredo ? (
            <div className="flex flex-col gap-5 sm:flex-row">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {qr && <img src={qr} alt="QR Code para o aplicativo autenticador" className="h-48 w-48 rounded-xl border bg-white" />}
              <form
                className="flex-1 space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!(await validarTotp(novoSegredo, codigo))) return notify.error("Código incorreto. Tente o próximo que aparecer no aplicativo.")
                  if (user) await salvarSeguranca({ id: user.id, totp_segredo: novoSegredo })
                  sessionStorage.setItem("cc-2fa-ok", "1")
                  setTotpAtivo(true); setNovoSegredo(null); setCodigo("")
                  notify.success("Verificação em duas etapas ativada")
                }}
              >
                <p>1. Leia o código com um aplicativo como Google Authenticator.</p>
                <p className="break-all text-sm text-muted-foreground">Ou digite a chave: {novoSegredo}</p>
                <Campo label="2. Digite o código de 6 números">{(p) => <Input {...p} inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={codigo} onChange={(e) => setCodigo(e.target.value)} />}</Campo>
                <Button type="submit">Confirmar</Button>
              </form>
            </div>
          ) : (
            <Button variant="outline" onClick={ativar2fa}><ShieldCheck className="h-4 w-4" aria-hidden /> Ativar</Button>
          )}
        </Secao>
      )}

      {demo && (
        <Secao titulo="Meus dados (LGPD)" descricao="Você tem direito de ver e pedir a exclusão do que guardamos sobre você.">
          {consentimento && <p className="text-muted-foreground">Termos aceitos em {new Date(consentimento.aceito_em).toLocaleDateString("pt-BR")}.</p>}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={async () => { if (user) baixarArquivo("meus-dados.json", JSON.stringify(await exportarMeusDados(user.id), null, 2), "application/json") }}><Download className="h-4 w-4" aria-hidden /> Baixar meus dados</Button>
            <Button variant="outline" className="text-red-700 dark:text-red-300" onClick={() => setExcluindo(true)}><Trash2 className="h-4 w-4" aria-hidden /> Excluir minha conta</Button>
          </div>
        </Secao>
      )}

      <Confirmar
        aberto={excluindo}
        onFechar={() => setExcluindo(false)}
        titulo="Excluir sua conta?"
        descricao="Suas inscrições e dados serão apagados. Isso não pode ser desfeito."
        confirmarLabel="Excluir conta"
        perigoso
        onConfirmar={async () => {
          if (user) await excluirMinhaConta(user.id)
          await sair()
          router.push("/")
        }}
      />
    </div>
  )
}
