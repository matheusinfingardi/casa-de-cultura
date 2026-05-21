import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterForm() {
  return (
    <form className="space-y-5">
      <div className="space-y-2">
        <Label>Nome</Label>
        <Input
          placeholder="Digite seu nome"
        />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          placeholder="Digite seu email"
        />
      </div>
      <div className="space-y-2">
        <Label>Senha</Label>
        <Input
          type="password"
          placeholder="Crie uma senha"
        />
      </div>
      <Button className="w-full h-11">
        Criar Conta
      </Button>
    </form>
  )
}