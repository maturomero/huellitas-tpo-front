import { Outlet, Navigate } from "react-router"
import { useSelector } from 'react-redux'

export default function AdminRoutes() {
  const { user } = useSelector((state) => state.auth)
  
  if (user?.profile?.role !== 'ADMIN') return <Navigate to="/" />

  return <Outlet />
}