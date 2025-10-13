import { Outlet, Navigate } from "react-router"
import { useAuthContext } from "../contexts/AuthContext"

export default function AdminRoutes() {
  const { user } = useAuthContext()
  
  if (user?.profile?.role !== 'ADMIN') return <Navigate to="/" />

  return <Outlet />
}