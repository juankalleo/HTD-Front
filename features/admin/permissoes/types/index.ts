import type { APapel } from "@/features/admin/papeis/types";

export type { APapel };

/** Espelha os serializers em api/app/serializers/a_{recurso,acao,permissao,papel_permissao}_serializer.rb */
export type ARecurso = { id: number; descricao: string };
export type AAcao = { id: number; descricao: string };
/** `a_recurso_id`/`a_acao_id` são IDs soltos — o serializer não aninha os objetos. */
export type APermissao = { id: number; a_recurso_id: number; a_acao_id: number; descricao?: string | null };
export type APapelPermissao = { id: number; a_papel?: APapel; a_permissao?: APermissao };
