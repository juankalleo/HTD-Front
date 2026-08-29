"use client";

import { useEffect, useState } from "react";
import { Search } from "@/theme/icons";

/**
 * Campo de busca padrão das listas admin — debounce embutido (350ms) pra
 * não disparar uma request por tecla. `valor`/`onChange` são o termo já
 * "assentado" (pós-debounce); o componente guarda o rascunho localmente
 * enquanto o usuário digita.
 */
export function SearchInput({
  valor,
  onChange,
  placeholder = "Buscar...",
}: {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}) {
  const [rascunho, setRascunho] = useState(valor);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setRascunho(valor));
    return () => window.cancelAnimationFrame(frame);
  }, [valor]);

  useEffect(() => {
    if (rascunho === valor) return;
    const timeout = window.setTimeout(() => onChange(rascunho), 350);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage ao rascunho; incluir onChange/valor recriaria o timer a cada render
  }, [rascunho]);

  return (
    <label className="input input-sm w-full max-w-xs">
      <Search className="size-4 text-base-content/50" strokeWidth={1.9} />
      <input
        type="search"
        value={rascunho}
        onChange={(event) => setRascunho(event.target.value)}
        placeholder={placeholder}
        className="grow"
      />
    </label>
  );
}
