export function formatMesa(mesa?: string | null): string {
  if (!mesa) return "Para Llevar";
  const clean = mesa.trim();
  // Corregir duplicados si existen en base de datos
  if (clean.toLowerCase().startsWith("mesa mesa")) {
    return clean.replace(/^mesa\s+mesa\s*/i, "Mesa ");
  }
  if (clean.toLowerCase().startsWith("mesa")) {
    return clean;
  }
  if (clean === "Local" || clean === "Para Llevar" || clean === "Delivery") {
    return clean;
  }
  return `Mesa ${clean}`;
}
