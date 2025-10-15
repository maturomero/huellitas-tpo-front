import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { backend } from "../api/backend"; // <-- ajusta si tu archivo está en otra ruta
import AnimalChipsSelector from "../components/AnimalChipsSelector";

const ENDPOINTS = {
  animals: "/animals",
  categories: "/categories",
  products: "/products",
  byId: (id) => `/products/${id}`,
  uploadImage: (productId) => `/products/images/${productId}`, // POST multipart { file }
};

const NewProductPage = () => {
  const { productId: productUrlParamId } = useParams()
  const navigate = useNavigate();

  const isEditing = productUrlParamId?.length > 0

  // Acción: crear | editar | eliminar
  const [action, setAction] = useState(isEditing ? "editar" : "crear");
  const isCreate = action === "crear";
  const isEdit = action === "editar";
  const isDelete = action === "eliminar";

  // Form state
  const [productId, setProductId] = useState(isEditing ? productUrlParamId : "");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [animalIds, setAnimalIds] = useState([]); // multi

  // Imágenes
  const [files, setFiles] = useState([]);

  // Combos
  const [animals, setAnimals] = useState([]);
  const [categories, setCategories] = useState([]);

  // UI
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Cargo combos
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const [aRes, cRes] = await Promise.all([
          backend.get(ENDPOINTS.animals),
          backend.get(ENDPOINTS.categories),
        ]);
        if (ignore) return;
        setAnimals((aRes.data || []).map((x) => ({ id: x.id, name: x.name })));
        setCategories((cRes.data || []).map((x) => ({ id: x.id, name: x.description })));
      } catch {
        if (!ignore) setError("No se pudieron cargar animales/categorías.");
      }
    })();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    console.log('intentando editar')
    if (action === 'editar') {
      console.log('cargando producto', productId)
      loadProduct()
    }
  }, [productId])

  // Habilitación del botón
  const canSubmit = useMemo(() => {
    if (isCreate)
      return (
        name.trim() &&
        Number(price) > 0 &&
        Number(stock) >= 0 &&
        categoryId &&
        animalIds.length > 0
      );
    if (isEdit || isDelete) return !!productId;
    return false;
  }, [isCreate, isEdit, isDelete, name, price, stock, categoryId, animalIds, productId]);

  // Files
  const onFilesChange = (e) => {
    const picked = Array.from(e.target.files || [])
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 5);
    setFiles(picked);
  };

  // Cargar producto (editar)
  const loadProduct = async () => {
    if (!productId) return;
    setError("");
    try {
      setLoading(true);
      const { data: p } = await backend.get(ENDPOINTS.byId(productId));
      setName(p?.name ?? "");
      setPrice(String(p?.price ?? ""));
      setStock(String(p?.stock ?? ""));
      setCategoryId(p?.category?.id ?? "");
      setAnimalIds(Array.isArray(p?.animal) ? p.animal.map((a) => a.id) : []);
    } catch {
      setError("No se pudo cargar el producto.");
    } finally {
      setLoading(false);
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!canSubmit) {
      setError("Completá los campos obligatorios.");
      return;
    }

    try {
      setSubmitting(true);

      if (isCreate) {
        // 1) Crear
        const payload = {
          name: name.trim(),
          price: Number(price),
          stock: Number(stock),
          status: true,
          categoryId: Number(categoryId),
          animalId: animalIds.map(Number),
        };
        const { data: created } = await backend.post(ENDPOINTS.products, payload);
        const newId = Number(created?.id ?? created?.productId);
        if (!Number.isFinite(newId)) throw new Error("ID de producto inválido al crear.");

        // 2) Subir imágenes
        for (const file of files) {
          const fd = new FormData();
          fd.append("file", file); // nombre que espera tu back
          await backend.post(ENDPOINTS.uploadImage(newId), fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        navigate("/productos");
        return;
      }

      if (isEdit) {
        const idNum = Number(productId);
        if (!Number.isFinite(idNum)) throw new Error("ID inválido.");
        await backend.patch(ENDPOINTS.byId(idNum), {
          name: name.trim(),
          price: Number(price),
          stock: Number(stock),
          status: true,
          categoryId: Number(categoryId),
          animalId: animalIds.map(Number),
        });

        if (files.length) {
          for (const file of files) {
            const fd = new FormData();
            fd.append("file", file);
            await backend.post(ENDPOINTS.uploadImage(idNum), fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }
        }

        navigate("/productos");
        return;
      }

      if (isDelete) {
        const idNum = Number(productId);
        if (!Number.isFinite(idNum)) throw new Error("ID inválido.");
        await backend.delete(ENDPOINTS.byId(idNum));
        navigate("/productos");
        return;
      }
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Operación fallida.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px-169px)] bg-white">
      <div className="max-w-[960px] mx-auto px-4 md:px-10 py-6">
        <header className="py-2 md:py-4 mb-8">
          <h1 className="text-[#111713] text-[28px] md:text-[32px] font-bold leading-tight">
            Administración de Productos – Huellitas PetShop
          </h1>
          {isEditing
            ? <p className="mt-2">Editando producto <b>{name}</b></p>
            : <p className="mt-2">Estás creando un nuevo producto <b>{name}</b></p>
          }
          
        </header>

        <form onSubmit={handleSubmit} className="grid gap-3 md:gap-4 max-w-[520px]">
          {/* Acción */}
          {/* Campos (no en eliminar) */}
          {!isDelete && (
            <>
              <label className="flex flex-col">
                <span className="text-sm md:text-base font-medium pb-2">Nombre</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre"
                  className="h-12 md:h-14 rounded-lg border border-[#dce5de] px-3"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm md:text-base font-medium pb-2">Precio</span>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Precio"
                  className="h-12 md:h-14 rounded-lg border border-[#dce5de] px-3"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm md:text-base font-medium pb-2">Stock</span>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Stock"
                  className="h-12 md:h-14 rounded-lg border border-[#dce5de] px-3"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm md:text-base font-medium pb-2">Categoría</span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-12 md:h-14 rounded-lg border border-[#dce5de] px-3 bg-white"
                >
                  <option value="">Seleccionar…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <AnimalChipsSelector
                options={animals}
                value={animalIds}
                onChange={setAnimalIds}
              />

              <p className="text-sm md:text-base">Estado: Activo</p>

              <div className="flex flex-col gap-4">
                <label className="flex flex-col">
                  <span className="text-sm md:text-base font-medium pb-2">
                    Imágen
                  </span>
                  <div className="rounded-lg border-2 border-dashed border-[#dce5de] p-6">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onFilesChange}
                      className="block w-full text-sm"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Elegí archivo
                    </p>

                    {files.length > 0 && (
                      <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {files.map((f, i) => (
                          <li
                            key={i}
                            className="aspect-[4/3] bg-gray-50 rounded-md overflow-hidden border"
                          >
                            <img
                              src={URL.createObjectURL(f)}
                              alt={`preview-${i}`}
                              className="w-full h-full object-cover"
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </label>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/productos")}
              className="h-10 px-4 rounded-lg bg-gray-100 text-sm font-bold hover:bg-gray-200"
            >
              Cancelar
            </button>

            {isDelete ? (
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="h-10 px-4 rounded-lg bg-red-600 text-white text-sm font-bold disabled:opacity-60"
              >
                {submitting ? "Eliminando…" : "Eliminar"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="h-10 px-4 rounded-lg bg-[#1cc44c] text-[#111713] text-sm font-bold disabled:opacity-60"
              >
                {submitting ? (isEdit ? "Guardando…" : "Creando…") : (isEdit ? "Guardar cambios" : "Crear")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProductPage;
