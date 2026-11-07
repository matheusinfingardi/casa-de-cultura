# ADR 0001: modo demonstração no front-end

**Situação:** aceita.

**Contexto:** várias telas dependem de tabelas que ainda não existem, e o banco compartilhado tem dados de teste. A equipe precisa ver e validar os fluxos dos três perfis agora.

**Decisão:** criar um cliente em `src/lib/demo/` que imita a API do Supabase e guarda os dados no navegador. `src/lib/supabase.ts` escolhe o cliente a cada acesso. A pessoa entra na demonstração pelos botões da página inicial; uma faixa no topo avisa que os dados são fictícios.

**Consequências:**
- Nada é gravado no banco real durante a demonstração, e o login real continua funcionando.
- Recursos sem tabela aparecem só na demonstração; na conta real, `SoDemo` mostra um aviso.
- Os dados da demonstração ficam em cada navegador e podem ser restaurados pela faixa do topo.
- Quando o back-end criar as tabelas, basta remover o `SoDemo` das telas correspondentes.
