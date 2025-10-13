import React from 'react'
import { Link, Navigate } from 'react-router'
import { useAuthContext } from '../contexts/AuthContext'

export const RegisterPage = () => {
  const { login, status } = useAuthContext()

  if (status === 'authenticated') return <Navigate to="/" />

  return (
    <div className="h-[calc(100vh-96px-169px)] flex justify-center items-center max-w-96 mx-auto">
      <div className="flex flex-col gap-6 justify-center items-center w-full">
        <h2 className="font-bold text-3xl">Crear cuenta</h2>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">
            Nombre Completo
          </label>
          <input className="text-sm border border-gray-300 px-4 py-3 rounded w-full focus:outline-2 focus:outline-[#1cc44c]" type="name" placeholder="Ingresa tu nombre completo" />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">
            Email
          </label>
          <input className="text-sm border border-gray-300 px-4 py-3 rounded w-full focus:outline-2 focus:outline-[#1cc44c]" type="email" placeholder="Ingresa tu email" />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">
            Contraseña
          </label>
          <input className="text-sm border border-gray-300 px-4 py-3 rounded w-full focus:outline-2 focus:outline-[#1cc44c]" type="password" placeholder="Ingresa tu contraseña" />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">
            Repetir contraseña
          </label>
          <input className="text-sm border border-gray-300 px-4 py-3 rounded w-full focus:outline-2 focus:outline-[#1cc44c]" type="password" placeholder="Ingresa tu contraseña" />
        </div>

        <button className="bg-[#1cc44c] w-full py-2 rounded font-medium text-sm cursor-pointer hover:opacity-95 transition-opacity">Crear cuenta</button>
        <Link to="/login" className="text-gray-500 text-xs underline">¿Ya tienes una cuenta? Iniciar sesión</Link>
      </div>
    </div>
  )
}

