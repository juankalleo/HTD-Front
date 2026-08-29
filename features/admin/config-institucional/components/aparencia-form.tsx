"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThemePicker } from "@/features/sistema/temas/components/theme-picker";
import type { TemaValor } from "@/features/sistema/temas/constants";
import { FONTES_INSTITUCIONAIS, ESCALAS_INSTITUCIONAIS, TAMANHOS_TITULO_PAGINA } from "@/theme/fonts";
import { useConfiguracaoInstitucional } from "@/shared/hooks/use-configuracao-institucional";
import { useUpdateConfiguracaoInstitucional } from "../hooks/use-update-configuracao-institucional";
import { aparenciaFormSchema, type AparenciaFormValues } from "../schemas/aparencia.schema";
import { AppShellPreview } from "./app-shell-preview";
import { FonteOverrideField, CorOverrideField } from "./estilo-sidebar-topbar-fields";

const LARGURA_SIDEBAR_RANGE = { min: 220, max: 360 };
const ALTURA_TOPBAR_RANGE = { min: 48, max: 88 };

/**
 * Nomes de campo do form ↔ atributo da api/ (`CConfiguracao::OVERRIDES_ESTILO`)
 * são sempre iguais — 1:1, sem tradução no meio. Isso é o que faz achar
 * "onde é definido cada coisa" ser mecânico: o nome do campo já é a busca.
 */
const CAMPOS_VAZIOS_ESTILO: Pick<
  AparenciaFormValues,
  | "fonte_sidebar"
  | "fonte_titulos_sidebar"
  | "fonte_topbar"
  | "cor_titulos_sidebar"
  | "cor_sidebar"
  | "cor_rotas_sidebar"
  | "cor_topbar"
  | "cor_borda_sistema"
  | "cor_borda_tabela"
  | "cor_texto_sistema"
> = {
  fonte_sidebar: "",
  fonte_titulos_sidebar: "",
  fonte_topbar: "",
  cor_titulos_sidebar: "",
  cor_sidebar: "",
  cor_rotas_sidebar: "",
  cor_topbar: "",
  cor_borda_sistema: "",
  cor_borda_tabela: "",
  cor_texto_sistema: "",
};

export function AparenciaForm() {
  const { data: config, isLoading } = useConfiguracaoInstitucional();
  const { mutateAsync, isPending } = useUpdateConfiguracaoInstitucional();
  const [larguraSidebar, setLarguraSidebar] = useState(288);
  const [alturaTopbar, setAlturaTopbar] = useState(64);

  const form = useForm<AparenciaFormValues>({
    resolver: zodResolver(aparenciaFormSchema),
    defaultValues: { tema: "light", fonte: "geist", escala: "100", tamanho_titulo_pagina: "2xl", ...CAMPOS_VAZIOS_ESTILO },
  });

  useEffect(() => {
    if (!config) return;
    form.reset({
      tema: config.tema,
      fonte: config.fonte,
      escala: String(config.escala),
      tamanho_titulo_pagina: config.tamanho_titulo_pagina,
      fonte_sidebar: config.fonte_sidebar ?? "",
      fonte_titulos_sidebar: config.fonte_titulos_sidebar ?? "",
      fonte_topbar: config.fonte_topbar ?? "",
      cor_titulos_sidebar: config.cor_titulos_sidebar ?? "",
      cor_sidebar: config.cor_sidebar ?? "",
      cor_rotas_sidebar: config.cor_rotas_sidebar ?? "",
      cor_topbar: config.cor_topbar ?? "",
      cor_borda_sistema: config.cor_borda_sistema ?? "",
      cor_borda_tabela: config.cor_borda_tabela ?? "",
      cor_texto_sistema: config.cor_texto_sistema ?? "",
    });
    const frame = window.requestAnimationFrame(() => {
      setLarguraSidebar(config.largura_sidebar);
      setAlturaTopbar(config.altura_topbar);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [config, form]);

  const {
    register,
    control,
    formState: { errors },
  } = form;

  const temaAtual = useWatch({ control, name: "tema" }) as TemaValor;
  // Um watch só pros 7 overrides — mais barato que 7 useWatch separados, e
  // são sempre lidos/escritos juntos (mesma seção do form, mesmo setValue).
  const estilo = useWatch({ control }) as AparenciaFormValues;

  function setEstilo(campo: keyof typeof CAMPOS_VAZIOS_ESTILO, valor: string) {
    form.setValue(campo, valor, { shouldDirty: true });
  }

  const onSubmit = form.handleSubmit(async (valores) => {
    if (!config?.id) return;

    const formData = new FormData();
    formData.append("c_configuracao[tema]", valores.tema);
    formData.append("c_configuracao[fonte]", valores.fonte);
    formData.append("c_configuracao[escala]", valores.escala);
    formData.append("c_configuracao[largura_sidebar]", String(larguraSidebar));
    formData.append("c_configuracao[altura_topbar]", String(alturaTopbar));
    formData.append("c_configuracao[tamanho_titulo_pagina]", valores.tamanho_titulo_pagina);
    for (const campo of Object.keys(CAMPOS_VAZIOS_ESTILO) as (keyof typeof CAMPOS_VAZIOS_ESTILO)[]) {
      formData.append(`c_configuracao[${campo}]`, valores[campo]);
    }

    await mutateAsync({ id: config.id, formData });
  });

  if (isLoading) {
    return <p className="text-sm text-base-content/60">Carregando...</p>;
  }

  if (!config?.id) {
    return (
      <p role="alert" className="rounded-lg bg-warning/10 px-3.5 py-2.5 text-sm font-medium text-warning">
        Nenhuma configuração institucional encontrada pro seu tenant ainda — fale com o suporte pra criar a primeira.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-4xl space-y-8">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <span className="text-sm font-semibold text-base-content">Tema institucional</span>
            <ThemePicker
              value={temaAtual}
              onSelect={(valor) => form.setValue("tema", valor, { shouldValidate: true, shouldDirty: true })}
            />
            {errors.tema && <p className="text-xs font-medium text-error">{errors.tema.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content" htmlFor="fonte">
              Fonte do sistema
            </label>
            <select id="fonte" className="select w-full" {...register("fonte")}>
              {FONTES_INSTITUCIONAIS.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.label}
                </option>
              ))}
            </select>
            {errors.fonte && <p className="text-xs font-medium text-error">{errors.fonte.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-base-content" htmlFor="escala">
              Escala do sistema
            </label>
            <select id="escala" className="select w-full" {...register("escala")}>
              {ESCALAS_INSTITUCIONAIS.map((valor) => (
                <option key={valor} value={valor}>
                  {valor}%
                </option>
              ))}
            </select>
            {errors.escala && <p className="text-xs font-medium text-error">{errors.escala.message}</p>}
          </div>
        </div>
        <p className="text-xs text-base-content/60">
          Tema e escala aplicam pra todo mundo — cada usuário ainda pode trocar o próprio tema em Configurações. Escala
          redimensiona o conteúdo das telas, não a sidebar/topbar (essas têm o tamanho próprio logo abaixo).
        </p>
      </div>

      <AppShellPreview
        larguraSidebar={larguraSidebar}
        alturaTopbar={alturaTopbar}
        larguraMin={LARGURA_SIDEBAR_RANGE.min}
        larguraMax={LARGURA_SIDEBAR_RANGE.max}
        alturaMin={ALTURA_TOPBAR_RANGE.min}
        alturaMax={ALTURA_TOPBAR_RANGE.max}
        onChangeLargura={setLarguraSidebar}
        onChangeAltura={setAlturaTopbar}
        corSidebar={estilo?.cor_sidebar}
        corTitulosSidebar={estilo?.cor_titulos_sidebar}
        corRotasSidebar={estilo?.cor_rotas_sidebar}
        corTopbar={estilo?.cor_topbar}
      />

      <div className="space-y-4 rounded-lg border border-base-300 p-4">
        <div>
          <h2 className="text-sm font-semibold text-base-content">Sidebar e topbar</h2>
          <p className="mt-0.5 text-xs text-base-content/60">
            Overrides por cima do tema — só valem pra sidebar/topbar, nunca pro resto da tela. Sem escolher nada aqui,
            os dois seguem 100% o tema institucional acima.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-base-content/50 uppercase">Fontes</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FonteOverrideField
              id="fonte_sidebar"
              label="Fonte da sidebar"
              value={estilo?.fonte_sidebar ?? ""}
              onChange={(valor) => setEstilo("fonte_sidebar", valor)}
            />
            <FonteOverrideField
              id="fonte_titulos_sidebar"
              label="Fonte dos títulos da sidebar"
              value={estilo?.fonte_titulos_sidebar ?? ""}
              onChange={(valor) => setEstilo("fonte_titulos_sidebar", valor)}
            />
            <FonteOverrideField
              id="fonte_topbar"
              label="Fonte da topbar"
              value={estilo?.fonte_topbar ?? ""}
              onChange={(valor) => setEstilo("fonte_topbar", valor)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-base-content/50 uppercase">Cores</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <CorOverrideField
              id="cor_sidebar"
              label="Cor da sidebar"
              value={estilo?.cor_sidebar ?? ""}
              onChange={(valor) => setEstilo("cor_sidebar", valor)}
            />
            <CorOverrideField
              id="cor_titulos_sidebar"
              label="Cor dos títulos"
              value={estilo?.cor_titulos_sidebar ?? ""}
              onChange={(valor) => setEstilo("cor_titulos_sidebar", valor)}
            />
            <CorOverrideField
              id="cor_rotas_sidebar"
              label="Cor das rotas"
              value={estilo?.cor_rotas_sidebar ?? ""}
              onChange={(valor) => setEstilo("cor_rotas_sidebar", valor)}
            />
            <CorOverrideField
              id="cor_topbar"
              label="Cor da topbar"
              value={estilo?.cor_topbar ?? ""}
              onChange={(valor) => setEstilo("cor_topbar", valor)}
            />
          </div>
          {(errors.cor_sidebar || errors.cor_titulos_sidebar || errors.cor_rotas_sidebar || errors.cor_topbar) && (
            <p className="text-xs font-medium text-error">Alguma cor está num formato inválido.</p>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-base-300 p-4">
        <div>
          <h2 className="text-sm font-semibold text-base-content">Sistema</h2>
          <p className="mt-0.5 text-xs text-base-content/60">
            Overrides pro resto da tela (fora da sidebar/topbar) — título de página, borda e texto. Cor de borda/texto
            sobrescreve o mesmo token que o tema já usa em tudo, então vale pra qualquer tela sem precisar configurar
            cada uma.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-base-content" htmlFor="tamanho_titulo_pagina">
              Tamanho do título de página
            </label>
            <select id="tamanho_titulo_pagina" className="select select-sm w-full" {...register("tamanho_titulo_pagina")}>
              {TAMANHOS_TITULO_PAGINA.map((valor) => (
                <option key={valor} value={valor}>
                  {valor.toUpperCase()}
                </option>
              ))}
            </select>
            {errors.tamanho_titulo_pagina && <p className="text-xs font-medium text-error">{errors.tamanho_titulo_pagina.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CorOverrideField
            id="cor_borda_sistema"
            label="Cor de borda do sistema"
            value={estilo?.cor_borda_sistema ?? ""}
            onChange={(valor) => setEstilo("cor_borda_sistema", valor)}
          />
          <CorOverrideField
            id="cor_borda_tabela"
            label="Cor de borda das tabelas"
            value={estilo?.cor_borda_tabela ?? ""}
            onChange={(valor) => setEstilo("cor_borda_tabela", valor)}
          />
          <CorOverrideField
            id="cor_texto_sistema"
            label="Cor de texto do sistema"
            value={estilo?.cor_texto_sistema ?? ""}
            onChange={(valor) => setEstilo("cor_texto_sistema", valor)}
          />
        </div>
        {(errors.cor_borda_sistema || errors.cor_borda_tabela || errors.cor_texto_sistema) && (
          <p className="text-xs font-medium text-error">Alguma cor está num formato inválido.</p>
        )}
      </div>

      <button type="submit" disabled={isPending} className="btn btn-primary">
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
