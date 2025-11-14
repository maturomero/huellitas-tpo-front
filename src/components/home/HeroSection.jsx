import { Link } from 'react-router-dom'

export const HeroSection = () => {
  return (
    <section className="text-center py-20 bg-background-light">
      <h1 className="text-5xl font-bold text-text-light leading-tight">
        Todo lo que tu mascota necesita
      </h1>
      <p className="mt-4 text-lg text-subtext-light max-w-2xl mx-auto">
        Encuentra los mejores productos para el cuidado y la felicidad de tu compañero fiel.
      </p>
      <Link
        to="/productos"
        className="mt-8 inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
      >
        Ver Productos
      </Link>
    </section>
  );
};
