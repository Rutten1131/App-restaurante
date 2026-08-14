import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ubicación & Contacto",
  description:
    "Encuéntranos en Av. Eugenio Espejo 200-100 y Shuaras, Loja, Ecuador. Teléfono: 098 767 0140. Horarios, mapa y atención personalizada.",
  openGraph: {
    title: "Ubicación & Contacto | Roma Pizzería Loja",
    description:
      "Encuéntranos en Av. Eugenio Espejo 200-100 y Shuaras, Loja, Ecuador. Teléfono: 098 767 0140. Horarios, mapa y atención personalizada.",
    images: [
      {
        url: "/images/hero-pizza.jpg",
        width: 1200,
        height: 630,
        alt: "Ubicación Roma Restaurante Pizzería Loja",
      },
    ],
  },
};

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
