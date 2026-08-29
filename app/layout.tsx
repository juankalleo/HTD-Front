import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  Geist,
  Geist_Mono,
  Inter,
  Roboto,
  Open_Sans,
  Lato,
  Montserrat,
  Poppins,
  Source_Sans_3,
  Nunito,
  Work_Sans,
  Rubik,
  Raleway,
  IBM_Plex_Sans,
} from "next/font/google";
import { QueryProvider } from "@/shared/query/query-provider";
import { fetchConfiguracaoInstitucional, urlAbsoluta } from "@/services/api-institucional";
import { cssVarDaFonte, cssVarDoTamanhoTitulo, fatorDaEscala } from "@/theme/fonts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const openSans = Open_Sans({ variable: "--font-open-sans", subsets: ["latin"] });
const lato = Lato({ variable: "--font-lato", subsets: ["latin"], weight: ["400", "700"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "700"] });
const sourceSans = Source_Sans_3({ variable: "--font-source-sans", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const workSans = Work_Sans({ variable: "--font-work-sans", subsets: ["latin"] });
const rubik = Rubik({ variable: "--font-rubik", subsets: ["latin"] });
const raleway = Raleway({ variable: "--font-raleway", subsets: ["latin"] });
const ibmPlexSans = IBM_Plex_Sans({ variable: "--font-ibm-plex-sans", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchConfiguracaoInstitucional();
  return {
    title: { default: config.nome_sistema, template: `%s | ${config.nome_sistema}` },
    description: "Base do padrão de front-end.",
    icons: urlAbsoluta(config.icone_sistema_url) ? { icon: urlAbsoluta(config.icone_sistema_url)! } : undefined,
  };
}

// Roda antes da hidratação pra evitar flash de tema errado: respeita a
// escolha pessoal salva (`features/sistema/temas`) por cima do `data-theme`
// que o servidor já mandou (o padrão institucional, `config.tema` acima) —
// na ausência de escolha pessoal, o institucional prevalece. A chave
// "theme" aqui precisa bater com THEME_STORAGE_KEY em
// features/sistema/temas/constants/index.ts.
const THEME_SCRIPT = `
(function () {
  try {
    var stored = window.localStorage.getItem("theme");
    if (stored) document.documentElement.setAttribute("data-theme", stored);
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const config = await fetchConfiguracaoInstitucional();
  // Nonce gerado por requisição em middleware.ts — o CSP (Content-Security-
  // Policy) só libera este script inline porque ele carrega esse mesmo
  // nonce. Ver docs/SEGURANCA-FRONTEND.md.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="pt-BR"
      data-theme={config.tema}
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${roboto.variable} ${openSans.variable} ${lato.variable} ${montserrat.variable} ${poppins.variable} ${sourceSans.variable} ${nunito.variable} ${workSans.variable} ${rubik.variable} ${raleway.variable} ${ibmPlexSans.variable} h-full antialiased`}
      style={
        {
          "--font-sans": cssVarDaFonte(config.fonte),
          "--app-scale": fatorDaEscala(config.escala),
          "--sidebar-width": `${config.largura_sidebar}px`,
          "--topbar-height": `${config.altura_topbar}px`,
          "--page-title-size": cssVarDoTamanhoTitulo(config.tamanho_titulo_pagina),
          // Cor de borda/texto do sistema — sobrescreve direto o token
          // DaisyUI (--color-base-300/--color-base-content), já usado em
          // tudo (ver docs/APARENCIA-AVANCADA.md). Sem valor definido, a
          // propriedade nem é escrita aqui, e a regra [data-theme=X] do
          // DaisyUI (mais específica que "sem propriedade nenhuma") segue
          // valendo sozinha — nada muda de comportamento.
          ...(config.cor_borda_sistema ? { "--color-base-300": config.cor_borda_sistema } : {}),
          ...(config.cor_texto_sistema ? { "--color-base-content": config.cor_texto_sistema } : {}),
        } as CSSProperties
      }
      suppressHydrationWarning
    >
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
