import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portafolio de Desarrollador 3D",
  description:
    "Desarrollador Full-Stack. Construyo productos web rápidos, escalables y con experiencias interactivas en 3D.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
