"use client";

import { useEffect } from "react";

/**
 * Substitui o layout raiz inteiro quando o próprio root layout quebra — por
 * isso precisa declarar <html>/<body> própria e não pode depender do CSS
 * global (Tailwind não carrega aqui, ver docs do Next.js sobre global-error).
 * Estilo inline de propósito.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#0f172a",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Não conseguimos abrir a aplicação</h1>
        <p style={{ maxWidth: 380, fontSize: 14, color: "#64748b", margin: 0 }}>
          Um erro mais amplo interrompeu a interface. Tente recarregar a tela.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          style={{
            borderRadius: 8,
            background: "#0f172a",
            color: "#fff",
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
