import { Outlet, Navigate } from "react-router-dom"
import { useAuthContext } from "../contexts/AuthContext"

export default function PrivateRoutes() {
  const { status } = useAuthContext()

  if (status === 'not-authenticated') return <Navigate to="/login" />

  return <Outlet />
}