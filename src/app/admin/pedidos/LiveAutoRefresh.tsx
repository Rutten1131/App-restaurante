"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LiveAutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 4000);

    return () => clearInterval(timer);
  }, [router]);

  // Refresco silencioso en segundo plano
  return null;
}
