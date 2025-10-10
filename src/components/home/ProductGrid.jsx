import { ProductCard } from "../ProductCard";

const products = [
  {
    id: 1,
    name: "Comida Premium para Perro",
    price: "$25.99",
    image: "/src/assets/images/home/comida.jpg",
  },
  {
    id: 2,
    name: "Juguete para Morder",
    price: "$9.99",
    image: "/src/assets/images/home/juguete.jpg",
  },
  {
    id: 3,
    name: "Cama Cómoda para Mascota",
    price: "$45.00",
    image: "/src/assets/images/home/cama.jpg",
  },
  {
    id: 4,
    name: "Collar de Cuero",
    price: "$15.50",
    image: "/src/assets/images/home/collar.jpg",
  },
];

export const ProductGrid = () => {
  return (
    <section className="py-16 bg-background-light">
      <h2 className="text-3xl font-bold text-center mb-12 text-text-light">
        Nuestros Productos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
