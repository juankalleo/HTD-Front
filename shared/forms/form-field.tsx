import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

/**
 * Campo de formulário padrão: label + input + mensagem de erro. Espera ser
 * usado com `{...register("campo")}` do React Hook Form — o resto das props
 * (id, type, autoComplete, etc.) repassa direto pro <input>. Cor vem dos
 * tokens do DaisyUI (`input`, `input-error`), não de cinza fixo — troca de
 * tema em features/sistema/temas reflete aqui sozinho.
 */
export function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-base-content" htmlFor={id}>
        {label}
      </label>
      <input id={id} className={`input w-full ${error ? "input-error" : ""}`} {...inputProps} />
      {error && <p className="text-xs font-medium text-error">{error}</p>}
    </div>
  );
}
