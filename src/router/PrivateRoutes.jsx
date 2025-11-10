import { Outlet, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

export default function PrivateRoutes() {
  const { status } = useSelector((state) => state.auth)

  if (status === 'not-authenticated') return <Navigate to="/login" />

  return <Outlet />
}