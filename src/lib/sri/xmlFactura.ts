/**
 * Generador de XML Factura v1.1.0 oficial para SRI Ecuador.
 */

export interface ItemFacturaXML {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  tarifaIva?: number; // 15
}

export interface FacturaXMLParams {
  ambiente: "1" | "2"; // 1 = Pruebas, 2 = Producción
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  claveAcceso: string;
  establecimiento: string;
  puntoEmision: string;
  secuencial: string;
  dirMatriz: string;
  dirEstablecimiento?: string;
  contribuyenteEspecial?: string;
  obligadoContabilidad?: "SI" | "NO";
  fechaEmision: string; // dd/mm/aaaa
  tipoIdentificacionComprador: "04" | "05" | "06" | "07"; // 04=RUC, 05=Cédula, 06=Pasaporte, 07=Consumidor Final
  razonSocialComprador: string;
  identificacionComprador: string;
  direccionComprador?: string;
  emailComprador?: string;
  totalSinImpuestos: number;
  totalDescuento: number;
  subtotal15: number;
  subtotal0: number;
  iva15: number;
  importeTotal: number;
  formaPago?: string; // 01 = Sin utilizacion del sistema financiero (Efectivo), 19 = Tarjeta de Credito, 20 = Otros con utilizacion del sistema financiero (Deuna / Transferencia)
  items: ItemFacturaXML[];
}

export function generarXMLFacturaSRI(p: FacturaXMLParams): string {
  const itemsXML = p.items
    .map((it) => {
      const precioTotalSinImpuesto = (it.cantidad * it.precioUnitario).toFixed(2);
      const ivaItem = ((it.cantidad * it.precioUnitario * (it.tarifaIva ?? 15)) / 100).toFixed(2);

      return `
    <detalle>
      <codigoPrincipal>${it.codigo}</codigoPrincipal>
      <descripcion>${escapeXML(it.descripcion)}</descripcion>
      <cantidad>${it.cantidad.toFixed(2)}</cantidad>
      <precioUnitario>${it.precioUnitario.toFixed(2)}</precioUnitario>
      <descuento>${(it.descuento || 0).toFixed(2)}</descuento>
      <precioTotalSinImpuesto>${precioTotalSinImpuesto}</precioTotalSinImpuesto>
      <impuestos>
        <impuesto>
          <codigo>2</codigo>
          <codigoPorcentaje>4</codigoPorcentaje>
          <tarifa>${it.tarifaIva ?? 15}.00</tarifa>
          <baseImponible>${precioTotalSinImpuesto}</baseImponible>
          <valor>${ivaItem}</valor>
        </impuesto>
      </impuestos>
    </detalle>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<factura id="comprobante" version="1.1.0">
  <infoTributaria>
    <ambiente>${p.ambiente}</ambiente>
    <tipoEmision>1</tipoEmision>
    <razonSocial>${escapeXML(p.razonSocial)}</razonSocial>
    <nombreComercial>${escapeXML(p.nombreComercial)}</nombreComercial>
    <ruc>${p.ruc}</ruc>
    <claveAcceso>${p.claveAcceso}</claveAcceso>
    <codDoc>01</codDoc>
    <estab>${p.establecimiento}</estab>
    <ptoEmi>${p.puntoEmision}</ptoEmi>
    <secuencial>${p.secuencial}</secuencial>
    <dirMatriz>${escapeXML(p.dirMatriz)}</dirMatriz>
  </infoTributaria>
  <infoFactura>
    <fechaEmision>${p.fechaEmision}</fechaEmision>
    <dirEstablecimiento>${escapeXML(p.dirEstablecimiento || p.dirMatriz)}</dirEstablecimiento>
    <obligadoContabilidad>${p.obligadoContabilidad || "NO"}</obligadoContabilidad>
    <tipoIdentificacionComprador>${p.tipoIdentificacionComprador}</tipoIdentificacionComprador>
    <razonSocialComprador>${escapeXML(p.razonSocialComprador)}</razonSocialComprador>
    <identificacionComprador>${p.identificacionComprador}</identificacionComprador>
    ${p.direccionComprador ? `<direccionComprador>${escapeXML(p.direccionComprador)}</direccionComprador>` : ""}
    <totalSinImpuestos>${p.totalSinImpuestos.toFixed(2)}</totalSinImpuestos>
    <totalDescuento>${p.totalDescuento.toFixed(2)}</totalDescuento>
    <totalConImpuestos>
      <totalImpuesto>
        <codigo>2</codigo>
        <codigoPorcentaje>4</codigoPorcentaje>
        <baseImponible>${p.subtotal15.toFixed(2)}</baseImponible>
        <tarifa>15.00</tarifa>
        <valor>${p.iva15.toFixed(2)}</valor>
      </totalImpuesto>
    </totalConImpuestos>
    <propina>0.00</propina>
    <importeTotal>${p.importeTotal.toFixed(2)}</importeTotal>
    <moneda>DOLAR</moneda>
    <pagos>
      <pago>
        <formaPago>${p.formaPago || "01"}</formaPago>
        <total>${p.importeTotal.toFixed(2)}</total>
      </pago>
    </pagos>
  </infoFactura>
  <detalles>${itemsXML}
  </detalles>
  <infoAdicional>
    <campoAdicional nombre="Email">${escapeXML(p.emailComprador || "cliente@roma.com")}</campoAdicional>
    <campoAdicional nombre="Restaurante">Roma Pizzeria Loja</campoAdicional>
  </infoAdicional>
</factura>`;
}

function escapeXML(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
