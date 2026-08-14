import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Club Roma & Fidelización",
  description:
    "Únete al Club Roma, califica tu experiencia, obtén promociones y gana cupones de pizza gratis en Roma Restaurante Pizzería Loja.",
  openGraph: {
    title: "Club Roma & Fidelización | Roma Pizzería Loja",
    description:
      "Únete al Club Roma, califica tu experiencia, obtén promociones y gana cupones de pizza gratis en Roma Restaurante Pizzería Loja.",
    images: [
      {
        url: "/images/hero-pizza.jpg",
        width: 1200,
        height: 630,
        alt: "Club Roma y Fidelización",
      },
    ],
  },
};

export default function FidelizacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
