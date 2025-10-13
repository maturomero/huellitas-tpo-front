import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuthContext } from '../contexts/AuthContext'

export const LoginPage = () => {
  const { login, status } = useAuthContext()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  if (status === 'authenticated') return <Navigate to="/" />

  const handleSubmit = () => {
    if (email.length > 0 && password.length > 0) {
      login(email, password)
    }
  }

  return (
    <div className="h-[calc(100vh-96px-169px)] flex justify-center items-center max-w-96 mx-auto">
      <div className="flex flex-col gap-6 justify-center items-center w-full"> 
        <h2 className="font-bold text-3xl">Iniciar sesión</h2>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">
            Email
          </label>

          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="text-sm border border-gray-300 px-4 py-3 rounded w-full focus:outline-2 focus:outline-[#1cc44c]" 
            type="email" 
            placeholder="Ingresa tu email" 
          />
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">
            Contraseña
          </label>
          
          <input 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="text-sm border border-gray-300 px-4 py-3 rounded w-full focus:outline-2 focus:outline-[#1cc44c]" 
            type="password" 
            placeholder="Ingresa tu contraseña"
          />
        </div>
        
        <button onClick={handleSubmit} className="text-sm bg-[#1cc44c] w-full py-2 rounded font-medium cursor-pointer hover:opacity-95 transition-opacity">Iniciar sesión</button>
        <Link to="/register" className="text-gray-500 text-xs underline">¿No tienes una cuenta? Crear cuenta</Link>
      </div>
    </div>
  )
}
