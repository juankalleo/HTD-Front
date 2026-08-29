"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY, type TemaValor } from "../constants";

export function useTheme() {
  const [tema, setTemaState] = useState<TemaValor>("light");

  useEffect(() => {
    const atual = document.documentElement.getAttribute("data-theme") as TemaValor | null;
    if (!atual) return;
    const frame = window.requestAnimationFrame(() => setTemaState(atual));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function setTema(valor: TemaValor) {
    setTemaState(valor);
    document.documentElement.setAttribute("data-theme", valor);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, valor);
    } catch {
      // localStorage indisponível — troca só não persiste entre visitas.
    }
  }

  return { tema, setTema };
}
