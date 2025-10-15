import React from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

/**
 * Botón flotante para admins.
 * Props:
 * - to: ruta destino (default: "/productos/nuevo")
 * - title: tooltip/label (default: "Nuevo producto")
 * - topClass: clase Tailwind para la posición vertical (default: "top-[45%]")
 * - hideOnMobile: true para ocultar en mobile (default: false)
 * - className: clases extra
 */
export default function AdminFab({
  to = "/productos/nuevo",
  title = "Nuevo producto",
  topClass = "top-[45%]",
  hideOnMobile = false,
  className = "",
}) {
  const { user } = useAuthContext();
  const isAdmin = user?.profile?.role === "ADMIN" || user?.role === "ADMIN";
  if (!isAdmin) return null;

  return (
    <Link
      to={to}
      aria-label={title}
      title={title}
      className={[
        "fixed right-6",         // a la derecha
        topClass,                // altura (ej: 'top-1/2' o 'top-[45%]')
        "-translate-y-1/2",
        "z-40 inline-flex items-center justify-center",
        "w-11 h-11 rounded-full bg-primary text-white",
        "shadow-lg ring-1 ring-black/5",
        "hover:opacity-90 hover:scale-105",
        "focus:outline-none focus:ring-2 focus:ring-primary/40",
        hideOnMobile ? "hidden md:inline-flex" : "",
        className,
      ].join(" ")}
    >
      <span className="text-2xl leading-none">+</span>
    </Link>
  );
}
