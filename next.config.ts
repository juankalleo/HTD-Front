import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Cabeçalhos estáticos (mesmo valor em toda página) — o CSP em si
        // é dinâmico (precisa do nonce por requisição) e fica em
        // `middleware.ts`, não aqui. Ver docs/SEGURANCA-FRONTEND.md.
        source: "/:path*",
        headers: [
          // Reforça frame-ancestors (CSP) contra clickjacking em navegador
          // sem suporte a CSP nível 3.
          { key: "X-Frame-Options", value: "DENY" },
          // Impede o navegador de "adivinhar" o content-type de uma
          // resposta (MIME sniffing) — vetor clássico de XSS via upload.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Nunca manda a URL completa (com querystring) como referrer pra
          // origem diferente — só a origem, quando cross-origin.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // HSTS: força HTTPS por 2 anos, incluindo subdomínios. Sem
          // efeito sobre HTTP puro (dev) — só passa a valer atrás de um
          // domínio real servido em HTTPS.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Nenhuma tela do projeto usa câmera/microfone/geolocalização —
          // nega os três de propósito.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
