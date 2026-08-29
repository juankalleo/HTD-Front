---
sidebar_label: Tecnologias
---

# Tecnologias do sistema

Pasta viva — um arquivo por tecnologia, alimentada conforme cada fase do
[`ROADMAP.md`](../ROADMAP.md) entra em uso de verdade no `base-front`. Isso é
a fonte pra documentação real da wiki (How to Dev, "Padrão Frontend"): cada
arquivo aqui segue o mesmo molde e vira uma página lá.

Molde de cada arquivo:

- **O que é** — uma frase.
- **Por que essa** — motivo real da escolha (não genérico).
- **Versão** — a que está no `package.json` agora.
- **Como importar** — instalação/import de verdade.
- **Exemplo** — código real do projeto (não inventado), copiável.

## Índice

| Tecnologia | Usada em |
|---|---|
| [Next.js (App Router)](nextjs.md) | Base de todo o projeto |
| [Tailwind CSS](tailwind.md) | Estilização |
| [DaisyUI](daisyui.md) | Componentes (botão, input, tabela, modal, drawer...) |
| [shadcn/ui](shadcn-ui.md) | Avaliado, **não adotado** — ver `relatorios/ARQUITETURA.md` |
| [TanStack Table](tanstack-table.md) | Estado/comportamento das tabelas (por cima do DaisyUI) |
| [ECharts / EvilCharts](echarts-evilcharts.md) | Gráficos dos relatórios |
| [MUI X Charts](mui-x-charts.md) | Avaliado, **não adotado** — ver `relatorios/ARQUITETURA.md` |
| [lucide-react](lucide-react.md) | Ícones |
| [TanStack React Query](react-query.md) | Estado assíncrono / cache de dados |
| [React Hook Form + Zod](react-hook-form-zod.md) | Todos os formulários |
| [SweetAlert2](sweetalert2.md) | Feedback de sucesso/erro (toast) |
| [clsx + tailwind-merge](clsx-tailwind-merge.md) | className condicional (`cn()`) |
| [Puppeteer](puppeteer.md) | Automação Chromium e geração de PDF de relatório |
| [react-easy-crop](react-easy-crop.md) | Recorte/posicionamento de imagem antes do upload (ver [`../UPLOAD-DE-IMAGEM.md`](../UPLOAD-DE-IMAGEM.md)) |
