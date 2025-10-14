import { Outlet } from "react-router-dom"
import { useAuthContext } from "../contexts/AuthContext"

export default function PublicRoutes() {
  const { status } = useAuthContext()

  return <Outlet />
}