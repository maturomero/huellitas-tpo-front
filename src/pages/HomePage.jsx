import React, { useEffect, useCallback } from "react";
import { HeroSection } from "../components/home/HeroSection";
import { ProductsGrid } from "../components/ProductsGrid";
import { fetchProducts } from "../redux/productsSlice";
import NewProductButton from "../components/NewProductButton";
import { useSelector, useDispatch } from 'react-redux'

export const HomePage = () => {
  const products = useSelector((state) => state.products.items)
  const featured = (products ?? []).slice(0, 4);

  return (
    <>
      <HeroSection />
      <NewProductButton topClass="top-[90%]" />
      <ProductsGrid products={featured} />
    </>
  );
};

export default HomePage;
