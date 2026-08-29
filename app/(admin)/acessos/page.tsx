import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

/** "/acessos" virou duas rotas próprias — mantém o link antigo vivo. */
export default function AcessosPage() {
  redirect(ROUTES.a_papeis_path);
}
