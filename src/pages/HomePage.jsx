import React, { useEffect } from "react";
import useProducts from "../hooks/useProducts";
import { ProductCard } from "../components/ProductCard";
import { HeroSection } from "../components/home/HeroSection";
import { ProductsGrid } from "../components/ProductsGrid";

export const HomePage = () => {
  const { products, getProducts } = useProducts();

  // Traigo productos al montar
  useEffect(() => {
    getProducts();
  }, []);

  // Muestro los primeros 4 en la home
  const featured = products.slice(0, 4);

  return (
    <>
      <HeroSection/>

      <ProductsGrid products={featured}/> 
    </>
  );
};

export default HomePage;
