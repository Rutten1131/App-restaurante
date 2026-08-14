import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservar Mesa & Celebraciones",
  description:
    "Reserva tu mesa en Roma Restaurante Pizzería en Loja. Ideal para cenas románticas, cumpleaños, aniversarios y reuniones familiares.",
  openGraph: {
    title: "Reservar Mesa & Celebraciones | Roma Pizzería Loja",
    description:
      "Reserva tu mesa en Roma Restaurante Pizzería en Loja. Ideal para cenas románticas, cumpleaños, aniversarios y reuniones familiares.",
    images: [
      {
        url: "/images/chef-oven.jpg",
        width: 1200,
        height: 630,
        alt: "Reservas Roma Pizzería",
      },
    ],
  },
};

export default function ReservaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
