export const logsKeys = {
  all: ["admin", "logs"] as const,
  list: (page: number, itemType: string, event: string) => [...logsKeys.all, "list", page, itemType, event] as const,
};
