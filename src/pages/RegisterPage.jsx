
import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

export const RegisterPage = () => {
  const { register, status } = useAuthContext();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");

  const [error, setError] = useState("");

  if (status === "authenticated") return <Navigate to="/" />;

  const passwordsMatch = password.length > 0 && password === repeat;
  const canSubmit =
    fullName.length > 0 &&
    email.length > 0 &&
    password.length > 0 &&
    repeat.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");


    if (!canSubmit) {
      if (!passwordsMatch) setError("Las contraseñas no coinciden.");
      else setError("Completá todos los campos.");
      return;
    }

    try {
      await register({ fullName, email, password });
    } catch (err) {
      // tengo duda del espacio
      const backendMessage = err.response?.data?.message || "";

      if (backendMessage.toLowerCase().includes("email")) {

        setError(backendMessage);
      } else {
        setError("No se pudo crear la cuenta. Revisá los datos.");
      }

      console.error("Error en registro:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="h-[calc(100vh-96px-169px)] flex justify-center items-center max-w-96 mx-auto"
    >
      <div className="flex flex-col gap-6 justify-center items-center w-full">
        <h2 className="font-bold text-3xl">Crear cuenta</h2>

        {/* Error global */}
        {error && <p className="text-sm text-red-600 -mt-2">{error}</p>}

        {/* Nombre */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">Nombre Completo</label>
          <input
            className="text-sm border border-gray-300 px-4 py-3 rounded w-full focus:outline-2 focus:outline-[#1cc44c]"
            type="text"
            placeholder="Ingresa tu nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">Email</label>
          <input
            className={`text-sm border ${error.toLowerCase().includes("email")
                ? "border-red-500"
                : "border-gray-300"
              } px-4 py-3 rounded w-full focus:outline-2 focus:outline-[#1cc44c]`}
            type="email"
            placeholder="Ingresa tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error.toLowerCase().includes("email") && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>

        {/* Contraseña */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">Contraseña</label>
          <input
            className="text-sm border border-gray-300 px-4 py-3 rounded w-full focus:outline-2 focus:outline-[#1cc44c]"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Repetir contraseña */}
        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">Repetir contraseña</label>
          <input
            className={`text-sm border ${repeat && password !== repeat ? "border-red-500" : "border-gray-300"
              } px-4 py-3 rounded w-full focus:outline-2 focus:outline-[#1cc44c]`}
            type="password"
            placeholder="Ingresa tu contraseña"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
          />
          {repeat && password !== repeat && (
            <p className="text-xs text-red-600 mt-1">
              Las contraseñas no coinciden.
            </p>
          )}
        </div>

        <button
          type="submit"
          className="bg-[#1cc44c] w-full py-2 rounded font-medium text-sm cursor-pointer hover:opacity-95 transition-opacity"
        >
          Crear cuenta
        </button>

        <Link to="/login" className="text-gray-500 text-xs underline">
          ¿Ya tienes una cuenta? Iniciar sesión
        </Link>
      </div>
    </form>
  );
};

// <esto que onda>



