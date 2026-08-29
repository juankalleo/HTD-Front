/** Iniciais (até 2 letras) a partir de um nome, ignorando partículas. */
export function getInitials(name: string): string {
  const cleaned = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter((p) => !["da", "de", "do", "das", "dos", "e"].includes(p.toLowerCase()));
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];
  return `${first}${last ?? ""}`.toUpperCase() || "?";
}

const AVATAR_PALETTE = [
  { bg: "#E8EDF7", text: "#3B5BA4" },
  { bg: "#FBE8DD", text: "#A4592A" },
  { bg: "#E5F1EA", text: "#2E7A4F" },
  { bg: "#F6E6F0", text: "#9E3D72" },
  { bg: "#EFEBF8", text: "#5B4D9A" },
  { bg: "#FAEFD3", text: "#9E7A20" },
  { bg: "#E0EFF4", text: "#2E6F86" },
];

/** Cor estável (background + foreground) baseada em hash simples do nome. */
export function getAvatarColors(name: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const idx = hash % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx]!;
}
