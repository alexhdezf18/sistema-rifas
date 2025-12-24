"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";

// Definimos los tipos de props para flexibilidad
type ProvidersProps = {
  children: React.ReactNode;
  themeProps?: React.ComponentProps<typeof NextThemesProvider>;
};

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        {...themeProps}
      >
        {children}
        <Toaster richColors position="top-center" />
      </NextThemesProvider>
    </SessionProvider>
  );
}
