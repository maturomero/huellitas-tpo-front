import { useEffect, useState } from "react";
import useProducts from "../hooks/useProducts";
import { ProductCard } from "../components/ProductCard";
import { ProductsGrid } from "../components/ProductsGrid";

export const ProductsPage = () => {
  const { products, getProductsByName, getProducts } = useProducts();
  const [search, setSearch] = useState("");

  // cargo todo al entrar + filtro por nombre con un debounce corto
  useEffect(() => {
    if (!search) {
      getProducts();
      return;
    }
    const t = setTimeout(() => getProductsByName(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <ProductsGrid products={products}>

      <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="Buscador de productos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary px-5 py-3 outline-none bg-white"
          />
        </div>
        
    </ProductsGrid>
  );
};

export default ProductsPage;


