import React, { useEffect } from "react";
import useProducts from "../hooks/useProducts";
import { HeroSection } from "../components/home/HeroSection";
import { ProductsGrid } from "../components/ProductsGrid";
import { Link } from "react-router-dom";
import NewProductButton from "../components/NewProductButton";
import { useSelector } from 'react-redux'

export const HomePage = () => {
  const { products, getProducts } = useProducts();
  const { user } = useSelector((state) => state.auth)
  const isAdmin = user?.profile?.role === "ADMIN" || user?.role === "ADMIN";

  useEffect(() => {
    getProducts();
  }, []);

  const featured = (products ?? []).slice(0, 4);

  return (
    <>
      <HeroSection />
      <NewProductButton topClass="top-[90%]" />
      <ProductsGrid products={featured} getProducts={getProducts} />
    </>
  );
};

export default HomePage;
