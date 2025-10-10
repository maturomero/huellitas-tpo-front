import React, { useEffect } from "react";
import useProducts from "../hooks/useProducts";
import { ProductCard } from "../components/ProductCard";

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
      {/* HERO */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-text-light dark:text-text-dark leading-tight">
          Todo lo que tu mascota necesita
        </h1>
        <p className="mt-4 text-lg text-subtext-light dark:text-subtext-dark max-w-2xl mx-auto">
          Encuentra los mejores productos para el cuidado y la felicidad de tu compañero fiel.
        </p>
        <a
          href="/productos"
          className="inline-block mt-8 bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all duration-300"
        >
          Ver Productos
        </a>
      </section>

      {/* NUESTROS PRODUCTOS (datos reales) */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-text-light dark:text-text-dark">
          Nuestros Productos
        </h2>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 lg:px-8">
          {featured.length > 0 ? (
            featured.map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <li className="col-span-full text-center text-gray-500">
              Cargando productos…
            </li>
          )}
        </ul>
      </section>
    </>
  );
};

export default HomePage;
