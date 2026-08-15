import type { Metadata } from "next";
import SiteLayoutWrapper from "@/components/SiteLayoutWrapper";
import "./globals.css";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://app-restaurante-rose.vercel.app";
};

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Roma Restaurante Pizzería | Tradición Italiana en Loja",
    template: "%s | Roma Pizzería Loja",
  },
  description:
    "Pizzas artesanales al horno de leña, pastas frescas diarias, paninos y especialidades de la auténtica cocina italiana en Loja, Ecuador. Más de 20 años de tradición familiar.",
  keywords: [
    "Pizzería en Loja",
    "Restaurante Italiano Loja",
    "Pizzas al Horno de Leña",
    "Comida Italiana Loja",
    "Pastas Artesanales",
    "Roma Restaurante Pizzería",
  ],
  authors: [{ name: "Roma Restaurante Pizzería" }],
  creator: "Roma Restaurante Pizzería",
  publisher: "Roma Restaurante Pizzería",
  icons: {
    icon: [
      { url: "/images/logo-roma.jpg" },
      { url: "/images/logo-roma.jpg", type: "image/jpeg" },
    ],
    shortcut: "/images/logo-roma.jpg",
    apple: "/images/logo-roma.jpg",
  },
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: baseUrl,
    siteName: "Roma Restaurante Pizzería",
    title: "Roma Restaurante Pizzería | Tradición Italiana en Loja",
    description:
      "Pizzas artesanales al horno de leña, pastas frescas y la auténtica tradición italiana en Loja, Ecuador. La mesa a la que siempre quieres volver.",
    images: [
      {
        url: "/images/hero-pizza.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Pizzas al Horno de Leña - Roma Restaurante Pizzería",
      },
      {
        url: "/images/logo-roma.jpg",
        width: 800,
        height: 800,
        type: "image/jpeg",
        alt: "Logo Oficial Roma Restaurante Pizzería",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roma Restaurante Pizzería | Tradición Italiana en Loja",
    description:
      "Pizzas artesanales al horno de leña, pastas frescas y tradición italiana en Loja, Ecuador.",
    images: ["/images/hero-pizza.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased dark">
      <head>
        <link rel="icon" href="/images/logo-roma.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/images/logo-roma.jpg" />
        <link rel="apple-touch-icon" href="/images/logo-roma.jpg" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0908] text-[#f5f0e8]">
        <SiteLayoutWrapper>{children}</SiteLayoutWrapper>
      </body>
    </html>
  );
}
