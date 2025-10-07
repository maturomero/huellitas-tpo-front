import { Route } from "react-router";
import { Routes } from "react-router";
import { LoginPage } from "../pages/LoginPage";
import { HomePage } from "../pages/HomePage";
import { ProductsPage } from "../pages/ProductsPage";
import { ProductPage } from "../pages/ProductPage";
import { OrderPage } from "../pages/OrderPage";
import { RegisterPage } from "../pages/RegisterPage";
import { NewProductPage } from "../pages/NewProductPage";
import { EditProductPage } from "../pages/EditProductPage";
import { Layout } from "../components/Layout";

export default function AppRouter() {
    return (
        <Routes>
            <Route element={<Layout/>}>
                <Route path="/register" element={<RegisterPage/>} />
                <Route path="/login" element={<LoginPage/>} />
                <Route path="/" element={<HomePage/>} />
                <Route path="/productos" element={<ProductsPage/>} />
                <Route path="/productos/:productId" element={<ProductPage/>} />
                <Route path="/productos/editar/:productId" element={<EditProductPage/>} />
                <Route path="/productos/nuevo" element={<NewProductPage/>} />
                <Route path="/orden" element={<OrderPage/>} /> 
            </Route>
        </Routes>
    )
} 