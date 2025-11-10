import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useSelector, useDispatch } from 'react-redux'
import { register } from "../redux/authSlice";

export const RegisterPage = () => {
  const { status } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") return <Navigate to="/" />;

  const passwordsMatch = password.length > 0 && password === repeat;
  const canSubmit =
    fullName.length > 0 &&
    email.length > 0 &&
    password.length > 0 &&
    repeat.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ⚠️ Validaciones mínimas con notificación
    if (!canSubmit) {
      const msg = !passwordsMatch
        ? "Completá todos los campos."
        : "Las contraseñas no coinciden.";
      setError(msg);
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(register({ fullName, email, password }));
      toast.success("Cuenta creada con éxito");
      // Redirección la maneja <Navigate /> cuando status cambia a 'authenticated'
    } catch (err) {
      // Mensaje que viene del backend (tu AuthContext hace throw)
      const backendMessage = err?.response?.data?.message || "";

      // Detectar “cuenta ya existe” (ajustá los includes si tu backend usa otro texto)
      const isEmailIssue = /email|existe|existente|registrad/i.test(backendMessage);

      const msg = isEmailIssue
        ? (backendMessage || "Ese email ya está registrado.")
        : (backendMessage || "Ese email ya está registrado.");

      setError(msg);
      toast.error(msg);
      console.error("Error en registro:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="h-[calc(100vh-96px-169px)] flex justify-center items-center max-w-96 mx-auto"
    >
      <div className="flex flex-col gap-6 justify-center items-center w-full">
        <h2 className="font-bold text-3xl">Crear cuenta</h2>

        {error && <p className="text-sm text-red-600 -mt-2">{error}</p>}

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

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">Email</label>
          <input
            className={`text-sm border ${
              error.toLowerCase().includes("email")
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

        <div className="flex flex-col gap-1 w-full">
          <label className="text-sm">Repetir contraseña</label>
          <input
            className={`text-sm border ${
              repeat && password !== repeat ? "border-red-500" : "border-gray-300"
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
          disabled={submitting}
          className="bg-[#1cc44c] w-full py-2 rounded font-medium text-sm cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-60"
        >
          {submitting ? "Creando..." : "Crear cuenta"}
        </button>

        <Link to="/login" className="text-gray-500 text-xs underline">
          ¿Ya tienes una cuenta? Iniciar sesión
        </Link>
      </div>
    </form>
  );
};

