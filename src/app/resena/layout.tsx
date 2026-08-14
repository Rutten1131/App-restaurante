import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Califica tu Experiencia & Opiniones",
  description:
    "Déjanos tu opinión sobre Roma Restaurante Pizzería en Loja. Tu valoración nos ayuda a ofrecerte siempre la mejor experiencia italiana.",
  openGraph: {
    title: "Califica tu Experiencia & Opiniones | Roma Pizzería Loja",
    description:
      "Déjanos tu opinión sobre Roma Restaurante Pizzería en Loja. Tu valoración nos ayuda a ofrecerte siempre la mejor experiencia italiana.",
    images: [
      {
        url: "/images/hero-pizza.jpg",
        width: 1200,
        height: 630,
        alt: "Calificaciones y Reseñas Roma Pizzería",
      },
    ],
  },
};

export default function ResenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
