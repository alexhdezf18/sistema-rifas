"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar error de hidratación (esperar a que cargue en cliente)
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8" />; // Placeholder invisible

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
      aria-label="Cambiar tema"
    >
      {resolvedTheme === "dark" ? (
        <SunIcon className="w-6 h-6 text-yellow-500" />
      ) : (
        <MoonIcon className="w-6 h-6 text-blue-600" />
      )}
    </button>
  );
}
