"use client";

import { useEffect, useState } from "react";

const s = { width: "1em", height: "1em", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };

function IcDownload({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
function IcExternalLink({ className }: { className?: string }) {
  return <svg {...s} className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;
}

interface QRCodeCardProps {
  restauranteSlug?: string;
  restauranteNombre?: string;
}

export default function QRCodeCard({
  restauranteSlug = "roma",
  restauranteNombre = "Roma Pizzería",
}: QRCodeCardProps) {
  const [origin, setOrigin] = useState("https://app-restaurante-rose.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setOrigin(window.location.origin);
    }
  }, []);

  const targetUrl = `${origin}/r/${restauranteSlug}/fidelizacion`;
  const qrPreviewUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;
  const qrDownloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(targetUrl)}`;

  return (
    <div className="bg-[#141210] border border-white/10 p-6 rounded-3xl flex flex-col items-center text-center space-y-4 shadow-xl">
      <div className="w-44 h-44 bg-white p-3 rounded-2xl shadow-inner flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrPreviewUrl}
          alt={`QR Oficial Fidelización y Reseñas ${restauranteNombre}`}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="w-full space-y-2">
        <div className="text-[11px] font-mono text-[#c9a84c] bg-black/60 px-3 py-1.5 rounded-xl border border-white/5 truncate" title={targetUrl}>
          {targetUrl}
        </div>
        <div className="flex gap-2">
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 bg-[#c9a84c] text-[#0a0908] font-bold text-xs rounded-xl hover:brightness-110 transition-all text-center flex items-center justify-center gap-1"
          >
            <span>Probar</span>
            <IcExternalLink className="w-3 h-3" />
          </a>
          <a
            href={qrDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`QR_${restauranteSlug}_Fidelizacion_Mesas.png`}
            className="flex-1 py-2 bg-white/10 text-white font-semibold text-xs rounded-xl hover:bg-white/20 transition-all text-center flex items-center justify-center gap-1"
          >
            <IcDownload className="w-3 h-3" />
            <span>Descargar HD</span>
          </a>
        </div>
      </div>
    </div>
  );
}
