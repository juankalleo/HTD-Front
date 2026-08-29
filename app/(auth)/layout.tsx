import { fetchConfiguracaoInstitucional, urlAbsoluta } from "@/services/api-institucional";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const config = await fetchConfiguracaoInstitucional();
  const imagemFundo = urlAbsoluta(config.imagem_fundo_login_url);

  return (
    <div
      className="min-h-screen bg-base-200 bg-cover bg-center"
      style={imagemFundo ? { backgroundImage: `url(${imagemFundo})` } : undefined}
    >
      {children}
    </div>
  );
}
