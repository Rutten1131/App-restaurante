/**
 * Normaliza un número de teléfono ecuatoriano a formato consistente: 09XXXXXXXX (10 dígitos).
 *
 * Ejemplos:
 *   "593967491847"  → "0967491847"
 *   "+593967491847" → "0967491847"
 *   "0967491847"    → "0967491847"
 *   "967491847"     → "0967491847"
 *   "09 6749 1847"  → "0967491847"
 *   null / ""       → null
 */
export function normalizarTelefono(input: string | null | undefined): string | null {
  if (!input) return null;

  // Eliminar todo lo que no sea dígito
  let digits = input.replace(/\D/g, "");

  if (!digits || digits.length < 7) return null;

  // Si empieza con 593 (código Ecuador), quitar el prefijo
  if (digits.startsWith("593") && digits.length >= 12) {
    digits = digits.slice(3);
  }

  // Si no empieza con 0, agregar el 0
  if (!digits.startsWith("0") && digits.length === 9) {
    digits = "0" + digits;
  }

  // Validación: debe quedar como 09XXXXXXXX o 07XXXXXXXX (10 dígitos celular ecuatoriano)
  if (digits.length === 10 && digits.startsWith("0")) {
    return digits;
  }

  // Si no encaja en formato ecuatoriano, devolver los dígitos limpios tal cual
  return digits;
}
