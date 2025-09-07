"use client"

// ============================================================================
// COMPONENTE: ENCABEZADO PRINCIPAL DE LA APLICACIÓN
// ============================================================================
// Este componente proporciona:
// - Logo y nombre de la aplicación
// - Navegación principal
// - Menú de usuario con opciones de perfil
// - Cambio de tema (claro/oscuro)
// - Notificaciones
// - Cierre de sesión automático por inactividad
// ============================================================================

import { Menu, Settings, User, BookOpen } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import React from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsPopover } from "./notifications-popover"

// ============================================================================
// COMPONENTE PRINCIPAL: ENCABEZADO
// ============================================================================
export function Header() {
  const router = useRouter();

  // ============================================================================
  // EFECTO: CIERRE DE SESIÓN AUTOMÁTICO POR INACTIVIDAD
  // ============================================================================
  // Configura un temporizador de 5 minutos que se reinicia con cada interacción
  // del usuario. Si no hay actividad, se cierra la sesión automáticamente.
  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        handleLogout();
      }, 5 * 60 * 1000); // 5 minutos de inactividad
    };

    // Eventos que reinician el temporizador
    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Iniciar el temporizador
    resetTimer();

    // Limpieza al desmontar el componente
    return () => {
      clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);

  // ============================================================================
  // FUNCIÓN: MANEJAR CIERRE DE SESIÓN
  // ============================================================================
  // Cierra la sesión del usuario, limpia el localStorage y redirige al login
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Silenciar errores de logout
    }

    // Limpiar datos del usuario
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Notificar cambio de usuario
    window.dispatchEvent(new Event("userChanged"));

    // Redirigir al login
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo y nombre de la aplicación */}
        <div className="flex items-center gap-2 md:gap-4">
          <img
            src="/logo_cagpu_sintexto.png"
            alt="CAGPU Logo"
            className="h-8 w-8 object-contain !cursor-pointer"
          />
          <span className="font-semibold text-foreground hidden md:inline-block text-sm md:text-base">
            CAGPU
          </span>
          <span className="text-xs text-muted-foreground hidden lg:inline-block">
            Catálogo de Atención Generalizada a la Población Usuaria
          </span>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center gap-2">
          {/* Enlace a documentación */}
          <Link
            href="/documentacion"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Documentación"
          >
            <BookOpen className="h-5 w-5" />
          </Link>

          {/* Cambio de tema */}
          <ThemeToggle />

          {/* Notificaciones */}
          <NotificationsPopover />

          {/* Menú de usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full !cursor-pointer">
                <User className="h-5 w-5 text-foreground/60" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Opción de perfil */}
              <DropdownMenuItem asChild className="!cursor-pointer">
                <Link href="/perfil" className={"!cursor-pointer"}>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>

              {/* Opción de configuración */}
              <DropdownMenuItem asChild className="!cursor-pointer">
                <Link href="/configuracion" className={"!cursor-pointer"}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Opción de cerrar sesión */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="!cursor-pointer bg-red-600 text-white hover:bg-red-700 hover:text-white focus:bg-red-700 focus:text-white dark:bg-red-600 dark:hover:bg-red-700 dark:focus:bg-red-700"
              >
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

// ============================================================================
// COMPONENTE: PESTAÑAS DE NAVEGACIÓN
// ============================================================================
// Componente adicional para navegación por pestañas (actualmente no utilizado)
export function NavigationTabs() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  // Obtener rol del usuario desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('role'));
    }
  }, []);

  // Definir pestañas según el rol del usuario
  const allTabs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Servicios", href: "/dashboard" },
    { label: "Analíticas", href: "/dashboard" },
    { label: "Administrador", href: "/dashboard" },
    { label: "Cambios Recientes", href: "/dashboard" },
    { label: "Auditoría", href: "/dashboard" },
  ];

  const userTabs = [
    { label: "Servicios", href: "/dashboard" },
  ];

  // Seleccionar pestañas según el rol
  const tabs = role === 'user' ? userTabs : allTabs;

  return (
    <div className="tabs">
      {tabs.map(tab => (
        <Link
          key={tab.href + tab.label}
          href={tab.href}
          className={pathname === tab.href ? "tab-active" : "tab"}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
