import {
  LayoutDashboard,
  Settings,
  Tags,
  Users,
  KeyRound,
  Shield,
  Palette,
  Building2,
  FileText,
  Database,
  History,
  Landmark,
  MapPin,
  type LucideIcon,
} from "@/theme/icons";
import { ROUTES } from "@/lib/routes";

export type NavChildItem = { href: string; label: string };
export type NavItem = { href: string; label: string; icon: LucideIcon; children?: NavChildItem[] };
export type NavSection = { title: string; items: NavItem[] };

/**
 * Sidebar organizada por área, igual o padrão da otica
 * (lib/constants/navigation.ts): "Principal" pro dia a dia, "Administração"
 * pros cadastros de RBAC, "Sistema" pra configuração pessoal.
 */
export const SIDEBAR_SECTIONS: NavSection[] = [
  {
    title: "Principal",
    items: [{ href: ROUTES.dashboard_path, label: "Início", icon: LayoutDashboard }],
  },
  {
    title: "Administração",
    items: [
      { href: ROUTES.m_usuarios_path, label: "Usuários", icon: Users },
      { href: ROUTES.a_tipo_usuarios_path, label: "Tipos de usuário", icon: Tags },
      { href: ROUTES.a_papeis_path, label: "Papéis", icon: Shield },
      { href: ROUTES.a_permissoes_path, label: "Permissões", icon: KeyRound },
      { href: ROUTES.logs_path, label: "Logs de auditoria", icon: History },
    ],
  },
  {
    title: "Relatórios",
    items: [
      { href: ROUTES.relatorios_usuarios_path, label: "Usuários", icon: FileText },
      { href: ROUTES.relatorios_orgaos_path, label: "Órgãos", icon: Landmark },
      { href: ROUTES.relatorios_unidades_path, label: "Unidades", icon: MapPin },
    ],
  },
  {
    title: "Referenciais",
    items: [
      {
        href: ROUTES.admin_referenciais_path,
        label: "Referenciais",
        icon: Database,
        children: [
          { href: ROUTES.g_paises_path, label: "Países" },
          { href: ROUTES.g_estados_path, label: "Estados" },
          { href: ROUTES.g_municipios_path, label: "Municípios" },
          { href: ROUTES.a_tenants_path, label: "Tenants" },
          { href: ROUTES.a_orgaos_path, label: "Órgãos" },
          { href: ROUTES.a_tipos_unidade_path, label: "Tipos de unidade" },
          { href: ROUTES.a_unidades_path, label: "Unidades" },
        ],
      },
    ],
  },
  {
    title: "Institucional",
    items: [
      { href: ROUTES.config_institucional_aparencia_path, label: "Aparência", icon: Palette },
      { href: ROUTES.config_institucional_identidade_path, label: "Identidade", icon: Building2 },
    ],
  },
  {
    title: "Sistema",
    items: [{ href: ROUTES.config_path, label: "Configurações", icon: Settings }],
  },
];
