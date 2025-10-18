import React from "react";
import { useAuthContext } from '../contexts/AuthContext'
//import { Outlet } from "react-router"; chat gpt recomendia el de abajo je;

import { BrowserRouter, Routes, Route, Outlet, NavLink, useNavigate } from "react-router-dom";

import logo from "../assets/images/LOGO.jpg";

export const Layout = () => {
  const { status, user, logout } = useAuthContext()
  // arriba del return, dentro del componente Layout
const EMAIL = "petshophuellitas04@gmail.com";      // ← cambialo por el tuyo
const subject = encodeURIComponent("Consulta desde la web");
const body = encodeURIComponent("Hola Huellitas, tengo una consulta sobre...");

  return (
    <div className="bg-background-light font-sans min-h-screen flex flex-col">
      <div className="container mx-auto px-4 flex-1 flex flex-col">
        {/* HEADER */}
        <header className="py-6 flex justify-between items-center">
          {/* Izquierda: logo + marca */}
          <div className="flex items-center space-x-3">
            <a href = "/">
            <img
              src={logo}
              alt="Huellitas PetShop"
              className="w-12 h-12 rounded-full object-cover"
            />
            </a>
            <a href = "/">
            <span className="text-2xl font-bold text-primary">Huellitas PetShop</span>
            </a>
          </div>

          {/* Centro/Derecha: nav + carrito */}
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex space-x-8">
              <NavLink to="/" className={({ isActive }) => `hover:text-primary transition-colors ${isActive ? 'text-primary font-semibold' : 'text-text-light'}`}>
                Inicio
              </NavLink>
              <NavLink end to="/productos" className={({ isActive }) => `hover:text-primary transition-colors ${isActive ? 'text-primary font-semibold' : 'text-text-light'}`}>
                Productos
              </NavLink>

              {status === 'not-authenticated' && (
                <NavLink to="/login" className={({ isActive }) => `hover:text-primary transition-colors ${isActive ? 'text-primary font-semibold' : 'text-text-light'}`}>
                  Iniciar sesión
                </NavLink>
              )}

              {user?.profile?.role === 'USER' && (
                <NavLink end to="/orden" className={({ isActive }) => `hover:text-primary transition-colors ${isActive ? 'text-primary font-semibold' : 'text-text-light'}`}>
                  Ordenes
                </NavLink>
              )}
            </nav>



            {/*<button className="relative text-text-light">
              <span className="material-icons">shopping_cart</span>
              {/* badge opcional
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                0
              </span>
              </button>
              */}
            
            {status === 'authenticated' && (
              <>
                <p className="text-sm text-gray-600">Hola {user.profile.fullname}!</p>
                <button onClick={logout}>
                  Salir
                </button>
              </>
            )}

          </div>

          {/* Menú móvil */}
          <button className="md:hidden text-text-light">
            <span className="material-icons">menu</span>
          </button>
        </header>

        {/* CONTENIDO */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* FOOTER */}
        <footer className="text-center py-8 border-t border-gray-200">
          <p className="text-subtext-light">
            © 2025 Huellitas PetShop. Todos los derechos reservados.
          </p>

          <div className="flex justify-center space-x-4 mt-4">
            {/* Facebook - abre en pestaña nueva */}
            <a
              href="https://www.facebook.com/profile.php?id=61581743836499"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-subtext-light hover:text-primary transition-colors"
              title="Facebook"
            >
              <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                />
              </svg>
            </a>

            {/* Correo - reemplaza el "Twitter" por un mailto */}
            <a
              href={`mailto:${EMAIL}?subject=${subject}&body=${body}`}
              aria-label="Enviar correo"
              className="text-subtext-light hover:text-primary transition-colors"
              title={`Escribir a ${EMAIL}`}
            >
              {/* Ícono de sobre (email) */}
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M1.5 8.67V18A2.25 2.25 0 003.75 20.25h16.5A2.25 2.25 0 0022.5 18V8.67l-9.33 5.6a2.25 2.25 0 01-2.34 0L1.5 8.67z"/>
                <path d="M22.5 6.75v-.008A2.25 2.25 0 0020.25 4.5H3.75A2.25 2.25 0 001.5 6.742v.008l9.33 5.6a2.25 2.25 0 002.34 0l9.33-5.6z"/>
              </svg>
            </a>

            {/* Instagram - abre en pestaña nueva */}
            <a
              href="https://www.instagram.com/petshophuellitas04/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-subtext-light hover:text-primary transition-colors"
              title="Instagram"
            >
              <svg aria-hidden="true" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.148 2 12.315 2zM12 6.873a5.127 5.127 0 100 10.254 5.127 5.127 0 000-10.254zm0 8.002a2.875 2.875 0 110-5.75 2.875 2.875 0 010 5.75zM18.25 6.4a1.44 1.44 0 100-2.88 1.44 1.44 0 000 2.88z"
                />
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;


