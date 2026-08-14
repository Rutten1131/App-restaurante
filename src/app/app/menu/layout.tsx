import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menú Digital & Carta Italiana",
  description:
    "Explora nuestro menú interactivo de pizzas al horno de leña, pastas frescas, paninos, vinos y postres artesanales en Loja, Ecuador.",
  openGraph: {
    title: "Menú Digital & Carta Italiana | Roma Pizzería Loja",
    description:
      "Explora nuestro menú interactivo de pizzas al horno de leña, pastas frescas, paninos, vinos y postres artesanales en Loja, Ecuador.",
    images: [
      {
        url: "/images/hero-pizza.jpg",
        width: 1200,
        height: 630,
        alt: "Menú y Carta Roma Pizzería",
      },
    ],
  },
};

export default function AppMenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
