import { useEffect, useState } from "react";
import useProducts from "../hooks/useProducts";
import { ProductCard } from "../components/ProductCard";

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
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-text-light dark:text-text-dark">
          Nuestros Productos
        </h2>

        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="Buscador de productos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md rounded-full border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary px-5 py-3 outline-none bg-white"
          />
        </div>

        {products.length === 0 ? (
          <p className="text-center text-gray-500">No se encontraron productos.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;


