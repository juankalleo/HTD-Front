"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/shared/forms/form-field";
import { MAX_STRING_LENGTH } from "@/lib/form-limits";
import { Toast } from "@/shared/ui";

// Code splitting: react-easy-crop (a dependência pesada por trás do modal) só
// entra no bundle quando alguém realmente escolhe um arquivo — não no
// carregamento inicial da tela de Identidade institucional, onde a maioria
// das visitas nem chega a trocar a imagem.
const ImageCropperModal = dynamic(
  () => import("@/shared/ui/sistema/image-cropper-modal").then((modulo) => modulo.ImageCropperModal),
  { ssr: false },
);
import { urlAbsoluta } from "@/services/api-institucional";
import { useConfiguracaoInstitucional } from "@/shared/hooks/use-configuracao-institucional";
import { useUpdateConfiguracaoInstitucional } from "../hooks/use-update-configuracao-institucional";
import { identidadeFormSchema, type IdentidadeFormValues } from "../schemas/identidade.schema";
import { TAMANHO_MAXIMO_ARQUIVO_MB, ICONE_SISTEMA_RECORTE, IMAGEM_FUNDO_LOGIN_RECORTE } from "../constants/imagem";

function ImagemInput({
  label,
  descricao,
  previewAtual,
  formato,
  aspect,
  dimensoesMaximas,
  nomeArquivoSaida,
  onChange,
}: {
  label: string;
  descricao?: string;
  previewAtual: string | null;
  formato: "quadrado" | "paisagem";
  aspect: number;
  dimensoesMaximas: { width: number; height: number };
  nomeArquivoSaida: string;
  onChange: (arquivo: File | null) => void;
}) {
  const [previewNovo, setPreviewNovo] = useState<string | null>(null);
  const [arquivoParaRecortar, setArquivoParaRecortar] = useState<File | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0] ?? null;
    event.target.value = ""; // permite escolher o mesmo arquivo de novo depois de cancelar

    if (!arquivo) return;

    if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO_MB * 1024 * 1024) {
      void Toast.error({
        title: "Arquivo muito grande",
        description: `Escolha uma imagem de até ${TAMANHO_MAXIMO_ARQUIVO_MB}MB.`,
      });
      return;
    }

    setArquivoParaRecortar(arquivo);
  }

  function handleRecorteConfirmado(arquivoRecortado: File) {
    setPreviewNovo(URL.createObjectURL(arquivoRecortado));
    onChange(arquivoRecortado);
    setArquivoParaRecortar(null);
  }

  const preview = previewNovo ?? previewAtual;
  const classeMoldura = formato === "quadrado" ? "h-20 w-20" : "h-32 w-full";

  return (
    <div className="h-full space-y-2 rounded-lg border border-base-300 p-4">
      <label className="text-sm font-semibold text-base-content">{label}</label>
      {descricao && <p className="text-xs text-base-content/60">{descricao}</p>}
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- vem da API (host dinâmico via NEXT_PUBLIC_API_URL), next/image exige domínio fixo em next.config
        <img src={preview} alt={label} className={`${classeMoldura} rounded-lg border border-base-300 object-cover`} />
      ) : (
        <div
          className={`${classeMoldura} flex items-center justify-center rounded-lg border border-dashed border-base-300 text-xs text-base-content/40`}
        >
          Sem imagem
        </div>
      )}
      <input type="file" accept="image/*" className="file-input file-input-sm w-full" onChange={handleChange} />
      <p className="text-[11px] text-base-content/50">
        Até {TAMANHO_MAXIMO_ARQUIVO_MB}MB · sai em até {dimensoesMaximas.width}×{dimensoesMaximas.height}px
      </p>

      <ImageCropperModal
        arquivo={arquivoParaRecortar}
        aspect={aspect}
        dimensoesMaximas={dimensoesMaximas}
        nomeArquivoSaida={nomeArquivoSaida}
        onConfirmar={handleRecorteConfirmado}
        onCancelar={() => setArquivoParaRecortar(null)}
      />
    </div>
  );
}

export function IdentidadeForm() {
  const { data: config, isLoading } = useConfiguracaoInstitucional();
  const { mutateAsync, isPending } = useUpdateConfiguracaoInstitucional();
  const [imagemFundoLogin, setImagemFundoLogin] = useState<File | null>(null);
  const [iconeSistema, setIconeSistema] = useState<File | null>(null);

  const form = useForm<IdentidadeFormValues>({
    resolver: zodResolver(identidadeFormSchema),
    defaultValues: { nome_sistema: "" },
  });

  useEffect(() => {
    if (config) form.reset({ nome_sistema: config.nome_sistema });
  }, [config, form]);

  const {
    register,
    formState: { errors },
  } = form;

  const onSubmit = form.handleSubmit(async (valores) => {
    if (!config?.id) return;

    const formData = new FormData();
    formData.append("c_configuracao[nome_sistema]", valores.nome_sistema);
    if (imagemFundoLogin) formData.append("c_configuracao[imagem_fundo_login]", imagemFundoLogin);
    if (iconeSistema) formData.append("c_configuracao[icone_sistema]", iconeSistema);

    await mutateAsync({ id: config.id, formData });
    setImagemFundoLogin(null);
    setIconeSistema(null);
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
    <form onSubmit={onSubmit} className="w-full max-w-4xl space-y-6">
      <div className="max-w-sm">
        <FormField
          label="Nome do sistema"
          id="nome_sistema"
          placeholder="Sistema Municipal de Gestão"
          maxLength={MAX_STRING_LENGTH}
          error={errors.nome_sistema?.message}
          {...register("nome_sistema")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ImagemInput
          label="Ícone do sistema"
          descricao="Aparece ao lado do nome do sistema, no topo do menu lateral."
          formato="quadrado"
          aspect={ICONE_SISTEMA_RECORTE.aspect}
          dimensoesMaximas={ICONE_SISTEMA_RECORTE.dimensoesMaximas}
          nomeArquivoSaida="icone-sistema.png"
          previewAtual={urlAbsoluta(config.icone_sistema_url)}
          onChange={setIconeSistema}
        />

        <ImagemInput
          label="Imagem de fundo da tela de login"
          descricao="Aparece atrás do formulário de login, antes de entrar."
          formato="paisagem"
          aspect={IMAGEM_FUNDO_LOGIN_RECORTE.aspect}
          dimensoesMaximas={IMAGEM_FUNDO_LOGIN_RECORTE.dimensoesMaximas}
          nomeArquivoSaida="fundo-login.png"
          previewAtual={urlAbsoluta(config.imagem_fundo_login_url)}
          onChange={setImagemFundoLogin}
        />
      </div>

      <button type="submit" disabled={isPending} className="btn btn-primary">
        {isPending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
