import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { HomePage } from "../pages/HomePage";
import { ProductsPage } from "../pages/ProductsPage";
import { ProductPage } from "../pages/ProductPage";
import { OrderPage } from "../pages/OrderPage";
import { RegisterPage } from "../pages/RegisterPage";
import NewProductPage from "../pages/NewProductPage";
import { EditProductPage } from "../pages/EditProductPage";
import { Layout } from "../components/Layout";
import PublicRoutes from './PublicRoutes'
import PrivateRoutes from './PrivateRoutes'
import AdminRoutes from './AdminRoutes'
import { useAuthContext } from "../contexts/AuthContext";
import LoadingPage from "../pages/LoadingPage";

export default function AppRouter() {
  const { status } = useAuthContext()

  if (status === 'checking') {
    return <LoadingPage />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<PublicRoutes />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/productos/:productId" element={<ProductPage />} />
        </Route>

        <Route element={<PrivateRoutes />}>
          <Route path="/orden" element={<OrderPage />} />

          <Route element={<AdminRoutes />}>
            <Route path="/productos/:productId/editar" element={<NewProductPage />} />
            <Route path="/productos/nuevo" element={<NewProductPage />} />
          </Route>
        </Route>

        <Route element={<Navigate to="/" />} path="/*" />
      </Route>
    </Routes>
  );
}
