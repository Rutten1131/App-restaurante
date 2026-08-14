/**
 * Generador oficial de Clave de Acceso de 49 dígitos para comprobantes electrónicos del SRI Ecuador.
 * Estructura de 49 dígitos:
 * 1. Fecha de Emisión (8 dígitos): ddmmaaaa
 * 2. Tipo de Comprobante (2 dígitos): 01 = Factura, 04 = Nota de Crédito, etc.
 * 3. Número de RUC del Emisor (13 dígitos)
 * 4. Tipo de Ambiente (1 dígito): 1 = Pruebas, 2 = Producción
 * 5. Serie (6 dígitos): Establecimiento (3) + Punto de Emisión (3) -> ej. 001001
 * 6. Número Secuencial del comprobante (9 dígitos) -> ej. 000000001
 * 7. Código Numérico de seguridad (8 dígitos)
 * 8. Tipo de Emisión (1 dígito): 1 = Normal
 * 9. Dígito Verificador Módulo 11 (1 dígito)
 */

export function calcularDigitoModulo11(cadena48: string): number {
  const factores = [2, 3, 4, 5, 6, 7];
  let suma = 0;
  let factorIndex = 0;

  // Se recorre de derecha a izquierda
  for (let i = cadena48.length - 1; i >= 0; i--) {
    const digito = parseInt(cadena48[i], 10);
    const factor = factores[factorIndex];
    suma += digito * factor;
    factorIndex = (factorIndex + 1) % factores.length;
  }

  const residuo = suma % 11;
  let digitoVerificador = 11 - residuo;

  if (digitoVerificador === 11) {
    return 0;
  } else if (digitoVerificador === 10) {
    return 1;
  }

  return digitoVerificador;
}

export function generarClaveAccesoSRI(params: {
  fechaEmision: Date;
  tipoComprobante?: string; // '01' para factura
  ruc: string;
  ambiente?: "1" | "2"; // 1 = Pruebas, 2 = Producción
  establecimiento?: string; // '001'
  puntoEmision?: string; // '001'
  secuencial: number | string;
  codigoNumerico?: string;
}): { claveAcceso: string; fechaFormato: string; secuencialFormato: string } {
  const d = params.fechaEmision;
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = String(d.getFullYear());
  const fechaStr = `${dia}${mes}${anio}`;

  const tipoComp = (params.tipoComprobante || "01").padStart(2, "0");
  const rucStr = params.ruc.padEnd(13, "0").slice(0, 13);
  const ambStr = params.ambiente || "1";
  const estabStr = (params.establecimiento || "001").padStart(3, "0");
  const ptoEmiStr = (params.puntoEmision || "001").padStart(3, "0");
  const secStr = String(params.secuencial).padStart(9, "0");
  const codNum = (params.codigoNumerico || "12345678").padStart(8, "0").slice(0, 8);
  const tipoEmision = "1"; // Normal

  const base48 = `${fechaStr}${tipoComp}${rucStr}${ambStr}${estabStr}${ptoEmiStr}${secStr}${codNum}${tipoEmision}`;
  const digitoVerificador = calcularDigitoModulo11(base48);

  const claveAcceso = `${base48}${digitoVerificador}`;

  return {
    claveAcceso,
    fechaFormato: `${dia}/${mes}/${anio}`,
    secuencialFormato: `${estabStr}-${ptoEmiStr}-${secStr}`,
  };
}
