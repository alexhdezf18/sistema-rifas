import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"; // <--- 1. IMPORTAR ESTO

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Rifas",
  description: "Participa y gana premios increíbles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        {/* 2. AGREGAR EL COMPONENTE AQUÍ (antes de cerrar body) */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
