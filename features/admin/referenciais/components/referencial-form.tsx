"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { FormField } from "@/shared/forms/form-field";
import {
  getReferencialDefaultValues,
  getReferencialOptionSources,
  REFERENCIAIS,
} from "../config";
import { useCreateReferencial, useReferencialOptionsMap, useUpdateReferencial } from "../hooks/use-referenciais";
import { buildReferencialSchema } from "../schemas/referencial.schema";
import type { ReferencialFormValues, ReferencialKey, ReferencialRecord } from "../types";

export function ReferencialForm({
  recurso,
  record,
  onDone,
}: {
  recurso: ReferencialKey;
  record?: ReferencialRecord;
  onDone: () => void;
}) {
  const config = REFERENCIAIS[recurso];
  const { optionsBySource, isLoading: isLoadingOptions } = useReferencialOptionsMap(getReferencialOptionSources(config));
  const { createReferencial, isPending: isCreating } = useCreateReferencial(recurso);
  const { updateReferencial, isPending: isUpdating } = useUpdateReferencial(recurso);
  const isSubmitting = isCreating || isUpdating;

  const form = useForm<ReferencialFormValues>({
    resolver: zodResolver(buildReferencialSchema(config)) as Resolver<ReferencialFormValues>,
    defaultValues: getReferencialDefaultValues(config, record),
  });

  const {
    register,
    formState: { errors },
  } = form;

  const onSubmit = form.handleSubmit(async (values) => {
    if (record) {
      await updateReferencial(record.id, values);
    } else {
      await createReferencial(values);
    }
    onDone();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {config.fields.map((field) => {
        const error = errors[field.name]?.message;

        if (field.kind === "select") {
          const options = field.source ? optionsBySource[field.source] ?? [] : [];
          return (
            <div key={field.name} className="space-y-1.5">
              <label className="text-sm font-semibold text-base-content" htmlFor={field.name}>
                {field.label}
              </label>
              <select
                id={field.name}
                className={`select w-full ${error ? "select-error" : ""}`}
                disabled={isSubmitting || isLoadingOptions}
                {...register(field.name)}
              >
                <option value="">{field.required === false ? "Não informado" : "Selecione..."}</option>
                {options.map((option) => (
                  <option key={option.valor} value={option.valor}>
                    {option.label}
                  </option>
                ))}
              </select>
              {error && <p className="text-xs font-medium text-error">{String(error)}</p>}
            </div>
          );
        }

        return (
          <FormField
            key={field.name}
            id={field.name}
            label={field.label}
            type={field.kind === "number" ? "number" : "text"}
            inputMode={field.kind === "number" ? "numeric" : undefined}
            maxLength={field.maxLength}
            placeholder={field.placeholder}
            error={error ? String(error) : undefined}
            {...register(field.name)}
          />
        );
      })}

      <div className="modal-action md:col-span-2 xl:col-span-3">
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting || isLoadingOptions} className="btn btn-primary">
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
