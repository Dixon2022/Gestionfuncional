"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const AUTO_LOGOUT_TIME = 15 * 60 * 1000; // 15 minutos

export function AutoLogout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowLogoutMessage(true); // Mostrar mensaje
      setTimeout(() => setShowLogoutMessage(false), 8000); // Ocultar mensaje después de 3s
      setTimeout(() => {
        logout();
        router.push("/login");
      }, 3000); // Espera 3 segundos antes de cerrar sesión
    }, AUTO_LOGOUT_TIME);
  };

  useEffect(() => {
    if (!user) return;

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("scroll", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [user]);

  return (
    <>
      {showLogoutMessage && (
        <div
          className={cn(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
            "bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg",
            "text-sm sm:text-base font-semibold animate-pulse"
          )}
        >
          ¡Sesión cerrada por inactividad!
        </div>
      )}
      {children}
    </>
  );
}
