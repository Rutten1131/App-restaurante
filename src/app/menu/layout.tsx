import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menú Digital & Carta",
  description:
    "Carta digital interactiva de Roma Restaurante Pizzería en Loja. Pizzas al horno de leña, pastas y especialidades italianas.",
  openGraph: {
    title: "Menú Digital & Carta | Roma Pizzería Loja",
    description:
      "Carta digital interactiva de Roma Restaurante Pizzería en Loja. Pizzas al horno de leña, pastas y especialidades italianas.",
    images: [
      {
        url: "/images/hero-pizza.jpg",
        width: 1200,
        height: 630,
        alt: "Menú Roma Pizzería",
      },
    ],
  },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
