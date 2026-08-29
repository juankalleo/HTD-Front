"use client";

import { useRecursos } from "../hooks/use-recursos";
import { useAcoes } from "../hooks/use-acoes";
import { usePermissoes } from "../hooks/use-permissoes";
import { usePapelPermissoes } from "../hooks/use-papel-permissoes";
import { useTogglePapelPermissao } from "../hooks/use-toggle-papel-permissao";
import { useCreatePermissao } from "../hooks/use-create-permissao";

/**
 * Matriz recurso × ação pro papel. Marcar uma combinação que ainda não tem
 * `a_permissao` cria a permissão e o vínculo do papel juntos (sem tela
 * separada de cadastro de permissão) — desmarcar só apaga o vínculo do papel,
 * a permissão em si fica (outros papéis podem usá-la).
 */
export function PapelPermissoesMatrix({ papelId }: { papelId: number }) {
  const { data: recursos, isLoading: carregandoRecursos } = useRecursos();
  const { data: acoes, isLoading: carregandoAcoes } = useAcoes();
  const { data: permissoes, isLoading: carregandoPermissoes } = usePermissoes();
  const { data: papelPermissoes, isLoading: carregandoPapelPermissoes } = usePapelPermissoes(papelId);
  const { conceder, revogar, isPending: isToggling } = useTogglePapelPermissao(papelId);
  const { createPermissao, isPending: isCreatingPermissao } = useCreatePermissao();

  const carregando = carregandoRecursos || carregandoAcoes || carregandoPermissoes || carregandoPapelPermissoes;
  const isPending = isToggling || isCreatingPermissao;

  if (carregando) {
    return <p className="text-sm text-base-content/60">Carregando matriz de permissões...</p>;
  }

  function encontrarPermissao(recursoId: number, acaoId: number) {
    return permissoes?.items.find((p) => p.a_recurso_id === recursoId && p.a_acao_id === acaoId);
  }

  function encontrarPapelPermissao(permissaoId: number) {
    return papelPermissoes?.items.find((pp) => pp.a_permissao?.id === permissaoId);
  }

  async function alternar(recursoId: number, acaoId: number, recursoDescricao: string, acaoDescricao: string) {
    const permissao = encontrarPermissao(recursoId, acaoId);

    if (!permissao) {
      const nova = await createPermissao(recursoId, acaoId, `${recursoDescricao} - ${acaoDescricao}`);
      conceder(nova.id);
      return;
    }

    const papelPermissao = encontrarPapelPermissao(permissao.id);
    if (papelPermissao) {
      revogar(papelPermissao.id);
    } else {
      conceder(permissao.id);
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-base-300">
      <table className="table">
        <thead>
          <tr>
            <th>Recurso</th>
            {acoes?.items.map((acao) => (
              <th key={acao.id} className="text-center">
                {acao.descricao}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {recursos?.items.map((recurso) => (
            <tr key={recurso.id}>
              <td>{recurso.descricao}</td>
              {acoes?.items.map((acao) => {
                const permissao = encontrarPermissao(recurso.id, acao.id);
                const concedida = permissao ? Boolean(encontrarPapelPermissao(permissao.id)) : false;
                return (
                  <td key={acao.id} className="text-center">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      disabled={isPending}
                      checked={concedida}
                      onChange={() => void alternar(recurso.id, acao.id, recurso.descricao, acao.descricao)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
