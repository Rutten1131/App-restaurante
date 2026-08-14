"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LiveAutoRefresh() {
  const router = useRouter();
  const [segundos, setSegundos] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setSegundos((prev) => {
        if (prev <= 1) {
          router.refresh();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <span className="text-xs bg-[#2e7d32]/15 text-[#2e7d32] border border-[#2e7d32]/30 px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full bg-[#2e7d32] animate-pulse" />
      <span>Cocina en Vivo · Refresco auto ({segundos}s)</span>
    </span>
  );
}
