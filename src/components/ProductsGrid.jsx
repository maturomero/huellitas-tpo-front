import ProductCard from "./ProductCard";

 
export const ProductsGrid = ({products, children}) => {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-center mb-12 text-text-light">
        Nuestros Productos
      </h2>

      {children}

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 lg:px-8">
        {products.length > 0 ? (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <li className="col-span-full text-center text-gray-500">
            No se encontraron productos.
          </li>
        )}
      </ul>
    </section>
  );
}