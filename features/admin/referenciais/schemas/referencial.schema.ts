import { z } from "zod";
import type { ReferencialConfig } from "../config";

export function buildReferencialSchema(config: ReferencialConfig) {
  const shape: Record<string, z.ZodType<string>> = {};

  for (const field of config.fields) {
    let schema: z.ZodType<string> = z.string().trim();

    if (field.required !== false) {
      schema = schema.refine((value) => value.length > 0, {
        message: field.kind === "select" ? `Selecione ${field.label.toLowerCase()}` : `Informe ${field.label.toLowerCase()}`,
      });
    }

    if (field.kind === "number") {
      schema = schema.refine((value) => value === "" || Number.isInteger(Number(value)), {
        message: "Informe um número válido",
      });
    }

    if (field.maxLength) {
      schema = schema.refine((value) => value.length <= field.maxLength!, {
        message: `Máximo de ${field.maxLength} caracteres`,
      });
    }

    shape[field.name] = schema;
  }

  return z.object(shape);
}
