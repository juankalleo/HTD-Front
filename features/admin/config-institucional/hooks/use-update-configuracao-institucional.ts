"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Toast } from "@/shared/ui";
import { updateConfiguracaoInstitucionalAdmin, ConfiguracaoInstitucionalApiError } from "@/services/api-institucional";
import { configInstitucionalKeys } from "@/shared/hooks/use-configuracao-institucional";

export function useUpdateConfiguracaoInstitucional() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => updateConfiguracaoInstitucionalAdmin(id, formData),
    onSuccess: () => {
      void Toast.success({ title: "Configuração institucional atualizada" });
      qc.invalidateQueries({ queryKey: configInstitucionalKeys.atual });
    },
    onError: (erro) =>
      void Toast.error({
        title: "Não foi possível salvar",
        description: erro instanceof ConfiguracaoInstitucionalApiError ? erro.message : "Tente novamente.",
      }),
  });
}
