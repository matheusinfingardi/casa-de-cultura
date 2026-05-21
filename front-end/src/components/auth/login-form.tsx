import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginForm() {
  return (
    <form className="space-y-5">
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
          placeholder="Digite sua senha"
        />
      </div>
      <Button className="w-full h-11">
        Entrar
      </Button>
    </form>
  )
}