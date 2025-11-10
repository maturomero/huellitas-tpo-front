import { Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

export default function PublicRoutes() {
  const { status } = useSelector((state) => state.auth)
  
  return <Outlet />
}