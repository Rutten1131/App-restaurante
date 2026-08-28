"use client";

import { useState, useRef } from "react";

interface ImageUploadFieldProps {
  name: string;
  label: string;
  defaultValue?: string | null;
  placeholder?: string;
  aspectRatio?: "square" | "video" | "wide";
  maxDimension?: number;
  quality?: number;
  onChange?: (value: string) => void;
}

export default function ImageUploadField({
  name,
  label,
  defaultValue = "",
  placeholder = "Selecciona o arrastra una imagen...",
  aspectRatio = "wide",
  maxDimension = 1200,
  quality = 0.85,
  onChange,
}: ImageUploadFieldProps) {
  const [value, setValue] = useState<string>(defaultValue || "");
  const [modo, setModo] = useState<"upload" | "url">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateValue = (newValue: string) => {
    setValue(newValue);
    if (onChange) onChange(newValue);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP o SVG).");
      return;
    }

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;

      // Si es SVG, guardarlo directamente como data URI
      if (file.type.includes("svg")) {
        updateValue(result);
        setIsProcessing(false);
        return;
      }

      // Para JPG/PNG/WebP, optimizar y redimensionar con Canvas
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
          updateValue(compressedBase64);
        } else {
          updateValue(result);
        }
        setIsProcessing(false);
      };

      img.onerror = () => {
        updateValue(result);
        setIsProcessing(false);
      };

      img.src = result;
    };

    reader.onerror = () => {
      alert("Error al leer el archivo de imagen.");
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const isBase64 = value.startsWith("data:image/");
  const isHttpUrl = value.startsWith("http://") || value.startsWith("https://");
  const isLocalStatic = value.startsWith("/");

  const heightClass =
    aspectRatio === "square"
      ? "h-28 w-28"
      : aspectRatio === "video"
      ? "h-36 w-full"
      : "h-28 w-full";

  return (
    <div className="space-y-2">
      {/* Label y toggle de modo */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-white">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setModo(modo === "upload" ? "url" : "upload")}
          className="text-[10px] text-[#c9a84c] hover:underline"
        >
          {modo === "upload" ? "Pegar URL o ruta" : "Subir archivo"}
        </button>
      </div>

      {/* Input oculto para que viaje en FormData */}
      <input type="hidden" name={name} value={value} />

      {modo === "upload" ? (
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
            className="hidden"
          />

          {value ? (
            /* Vista previa con botón para cambiar o limpiar */
            <div className="flex items-center gap-3 p-3 bg-[#080706] border border-white/10 rounded-2xl">
              <div className={`relative ${aspectRatio === "square" ? "w-16 h-16" : "w-28 h-16"} rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white font-medium truncate">
                  {isBase64 ? "Imagen cargada en Base64 (Guardada en DB)" : value}
                </p>
                <p className="text-[10px] text-[#8a8078] mt-0.5">
                  {isBase64 ? "Se almacenará directamente en la base de datos" : "Ruta / URL externa"}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-medium transition-colors"
                >
                  Cambiar
                </button>
                <button
                  type="button"
                  onClick={() => updateValue("")}
                  className="p-1.5 text-[#8a8078] hover:text-[#ff6b6b] transition-colors text-xs"
                  title="Quitar imagen"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            /* Zona Drag & Drop para subir imagen */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#c9a84c] bg-[#c9a84c]/10"
                  : "border-white/15 bg-[#080706] hover:border-white/30 hover:bg-white/[0.02]"
              }`}
            >
              {isProcessing ? (
                <div className="py-3 text-xs text-[#c9a84c] flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>Optimizando y procesando imagen...</span>
                </div>
              ) : (
                <div className="py-2 space-y-1">
                  <div className="text-xl">📁</div>
                  <p className="text-xs text-white font-medium">
                    Haz clic para subir o arrastra tu imagen aquí
                  </p>
                  <p className="text-[10px] text-[#8a8078]">
                    PNG, JPG, WebP o SVG (Se guardará directamente en la base de datos)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Modo URL manual */
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => updateValue(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#080706] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#c9a84c] focus:outline-none font-mono"
          />
          {value && (
            <button
              type="button"
              onClick={() => updateValue("")}
              className="px-3 bg-white/5 hover:bg-white/10 text-[#8a8078] hover:text-white rounded-xl text-xs"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}
