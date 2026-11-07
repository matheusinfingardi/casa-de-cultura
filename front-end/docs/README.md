# Documentação do Front-end

| Documento | Para quem | O que é |
|---|---|---|
| [ROADMAP.md](ROADMAP.md) | Toda a equipe | Visão, versões e próximos passos |
| [guias/GUIA-ASSISTIDO.md](guias/GUIA-ASSISTIDO.md) | Assistidos / suporte | Passo a passo do portal do assistido |
| [guias/GUIA-VOLUNTARIO.md](guias/GUIA-VOLUNTARIO.md) | Voluntários / suporte | Passo a passo do portal do voluntário |
| [guias/GUIA-ADMINISTRACAO.md](guias/GUIA-ADMINISTRACAO.md) | Administração | Passo a passo do portal administrativo |
| [comunicados/](comunicados/) | Grupo do projeto | Resumo de cada atualização (use o `TEMPLATE.md`) |

As imagens dos guias estão em `img/`. As novidades também aparecem dentro do sistema em **Atualizações** (arquivo `src/components/portal/atualizacoes/dados.ts`).

## A cada entrega
1. Acrescente a novidade no topo de `CHANGELOG` em `dados.ts` e atualize `APP_VERSAO` em `src/lib/config.ts`.
2. Crie o comunicado a partir de `comunicados/TEMPLATE.md`.
3. Se uma tela mudou, atualize o guia correspondente (e as imagens).
