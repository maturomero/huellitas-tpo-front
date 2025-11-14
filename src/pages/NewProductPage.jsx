import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AnimalChipsSelector from "../components/AnimalChipsSelector";
import { useSelector, useDispatch } from 'react-redux'
import { createProduct, updateProduct, deleteProduct, uploadProductImages } from "../redux/productsSlice";
import productsSlice from "../redux/productsSlice";
import toast from "react-hot-toast"; // ✅ agregado

const ENDPOINTS = {
  animals: "/animals",
  categories: "/categories",
  products: "/products",
  byId: (id) => `/products/${id}`,
  uploadImage: (productId) => `/products/images/${productId}`,
};

const NewProductPage = () => {
  const { animals: animalsData, categories: categoriesData } = useSelector((state) => state.attributes)
  const { currentProduct } = useSelector((state) => state.products)

  const { productId: productUrlParamId } = useParams();
  const dispatch = useDispatch()
  const navigate = useNavigate();

  const isEditing = productUrlParamId?.length > 0;

  const [action, setAction] = useState(isEditing ? "editar" : "crear");
  const isCreate = action === "crear";
  const isEdit = action === "editar";
  const isDelete = action === "eliminar";

  const [productId, setProductId] = useState(isEditing ? productUrlParamId : "");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [animalIds, setAnimalIds] = useState([]);
  const [files, setFiles] = useState([]);

  const [animals, setAnimals] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        if (ignore) return;
        setAnimals((animalsData || []).map((x) => ({ id: x.id, name: x.name })));
        setCategories((categoriesData || []).map((x) => ({ id: x.id, name: x.description })));
      } catch {
        if (!ignore) setError("No se pudieron cargar animales/categorías.");
      }
    })();
    return () => {
      ignore = true;
    };
  }, [animalsData, categoriesData]);

  useEffect(() => {
    setName(currentProduct?.name ?? "");
    setPrice(String(currentProduct?.price ?? ""));
    setStock(String(currentProduct?.stock ?? ""));
    setCategoryId(currentProduct?.category?.id ?? "");
    setAnimalIds(Array.isArray(currentProduct?.animal) ? currentProduct.animal.map((a) => a.id) : []);
  }, [currentProduct])

  useEffect(() => {
    if (action === "editar") {
      loadProduct();
    }
  }, [productId]);

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

  const onFilesChange = (e) => {
    const picked = Array.from(e.target.files || [])
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 5);
    setFiles(picked);
  };

  const loadProduct = async () => {
    if (!productId) return;
    setError("");
    try {
      setLoading(true);
      dispatch(productsSlice.actions.getProductById({ id: productId, raw: true }))
    } catch {
      setError("No se pudo cargar el producto.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!canSubmit) {
      setError("Completá los campos obligatorios.");
      toast.error("Completá los campos obligatorios."); 
      return;
    }

    try {
      setSubmitting(true);

      if (isCreate) {
        const payload = {
          name: name.trim(),
          price: Number(price),
          stock: Number(stock),
          status: true,
          categoryId: Number(categoryId),
          animalId: animalIds.map(Number),
        };
        const { data: created } = await dispatch(createProduct(payload));
        const newId = Number(created?.id ?? created?.productId);
        if (!Number.isFinite(newId)) throw new Error("ID de producto inválido al crear.");

        dispatch(uploadProductImages({ id: idNum, files }))

        toast.success("Producto creado con éxito"); 
        navigate("/productos");
        return;
      }

      if (isEdit) {
        const idNum = Number(productId);
        if (!Number.isFinite(idNum)) throw new Error("ID inválido.");
        dispatch(updateProduct({
          id: idNum,
          changes: {
            name: name.trim(),
            price: Number(price),
            stock: Number(stock),
            status: true,
            categoryId: Number(categoryId),
            animalId: animalIds.map(Number),
          }
        }));

        if (files.length) {
          dispatch(uploadProductImages({ id: idNum, files }))
        }

        toast.success("Producto actualizado con éxito"); 
        navigate("/productos");
        return;
      }

      if (isDelete) {
        const idNum = Number(productId);
        if (!Number.isFinite(idNum)) throw new Error("ID inválido.");
        await dispatch(deleteProduct(idNum));
        toast.success("Producto eliminado con éxito 🗑️"); 
        navigate("/productos");
        return;
      }
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || "Operación fallida.";
      setError(msg);
      toast.error(msg); 
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-96px-169px)] bg-white">
      <div className="max-w-[960px] mx-auto px-4 md:px-10 py-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#64876e] mb-3 cursor-pointer"
        >
          ← Volver
        </button>
        <header className="py-2 md:py-4 mb-8">
          <h1 className="text-[#111713] text-[28px] md:text-[32px] font-bold leading-tight">
            Administración de Productos – Huellitas PetShop
          </h1>
          {isEditing ? (
            <p className="mt-2">
              Editando producto <b>{name}</b>
            </p>
          ) : (
            <p className="mt-2">
              Estás creando un nuevo producto <b>{name}</b>
            </p>
          )}
        </header>

        <form onSubmit={handleSubmit} className="grid gap-3 md:gap-4 max-w-[520px]">
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
                  className="h-12 md:h-14 rounded-lg border border-[#dce5de] px-3 bg-white cursor-pointer"
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
                <label className="flex flex-col cursor-pointer">
                  <span className="text-sm md:text-base font-medium pb-2">Imágen</span>
                  <div className="rounded-lg border-2 border-dashed border-[#dce5de] p-6">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onFilesChange}
                      className="block w-full text-sm"
                    />
                    <p className="text-xs text-gray-600 mt-2">Elegí archivo</p>

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
                {submitting
                  ? isEdit
                    ? "Guardando…"
                    : "Creando…"
                  : isEdit
                  ? "Guardar cambios"
                  : "Crear"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProductPage;

