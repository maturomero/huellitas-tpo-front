import { useEffect, useMemo, useState } from "react";
import useProducts from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";

export const ProductsPage = () => {
  const { products, getProducts } = useProducts();

  // Filtros
  const [q, setQ] = useState("");
  const [animal, setAnimal] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    getProducts(); // trae todo del back
  }, []);

  // ====== Helpers para leer datos con distintos formatos ======
  const getAnimalNames = (p) => {
    // p.animals: [{name:'Perro'}] o ['Perro'] | p.animal: {name:'Perro'} o 'Perro'
    const list = [];
    if (Array.isArray(p?.animals)) {
      for (const a of p.animals) {
        if (typeof a === "string") list.push(a);
        else if (a?.name) list.push(a.name);
      }
    }
    if (p?.animal) {
      if (typeof p.animal === "string") list.push(p.animal);
      else if (p.animal?.name) list.push(p.animal.name);
    }
    return Array.from(new Set(list));
  };

  const getCategoryName = (p) =>
    p?.category?.name ?? p?.category ?? p?.categoryName ?? "";

  const getPriceNumber = (p) => {
    const raw =
      p?.price ??
      p?.priceWithTransferDiscount ??
      p?.price_with_transfer_discount;
    const n = Number(raw);
    return isNaN(n) ? null : n;
  };

  // ====== Opciones dinámicas para los selects ======
  const animalOptions = useMemo(() => {
    const set = new Set();
    products.forEach((p) => getAnimalNames(p).forEach((n) => n && set.add(n)));
    return Array.from(set).sort();
  }, [products]);

  const categoryOptions = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const c = getCategoryName(p);
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [products]);

  // ====== Filtrado ======
  const filtered = useMemo(() => {
    const qNorm = q.trim().toLowerCase();

    return products.filter((p) => {
      // nombre
      const name = (p?.name || "").toLowerCase();
      if (qNorm && !name.includes(qNorm)) return false;

      // animal
      if (animal) {
        const names = getAnimalNames(p).map((s) => s.toLowerCase());
        if (!names.includes(animal.toLowerCase())) return false;
      }

      // categoría
      if (category) {
        const c = getCategoryName(p);
        if (!c || c.toLowerCase() !== category.toLowerCase()) return false;
      }

      // rango de precio
      const price = getPriceNumber(p);
      if (price != null) {
        if (minPrice !== "" && price < Number(minPrice)) return false;
        if (maxPrice !== "" && price > Number(maxPrice)) return false;
      }

      return true;
    });
  }, [products, q, animal, category, minPrice, maxPrice]);

  const clearFilters = () => {
    setQ("");
    setAnimal("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ====== SIDEBAR ====== */}
        <aside className="md:col-span-3">
          <div className="sticky top-4">
            <h2 className="text-xl font-bold mb-4">Filtrar</h2>

            {/* Buscar */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Buscar productos
              </label>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ej: hueso, cama…"
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            {/* Categoría */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-white"
              >
                <option value="">Todas</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Animal */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Animal</label>
              <select
                value={animal}
                onChange={(e) => setAnimal(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-white"
              >
                <option value="">Todos</option>
                {animalOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Rango de precio */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Precio (mín–máx)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Desde"
                  className="w-1/2 border rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Hasta"
                  className="w-1/2 border rounded-md px-3 py-2"
                />
              </div>
            </div>

            {/* Limpiar */}
            <button
              onClick={clearFilters}
              className="w-full border rounded-md px-3 py-2 font-medium hover:bg-gray-50"
            >
              Limpiar filtros
            </button>
          </div>
        </aside>

        {/* ====== LISTA ====== */}
        <section className="md:col-span-9">
          <div className="flex items-baseline justify-between mb-4">
            <h1 className="text-2xl font-bold">Productos</h1>
            <span className="text-sm text-gray-600">
              {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
            </span>
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-600">
              No se encontraron productos con esos filtros.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductsPage;
