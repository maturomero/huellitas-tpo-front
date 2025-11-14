// src/redux/productsSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { backend } from '../api/backend'

//  mismo mapeo que usabas en el hook para no romper la UI
const mapProduct = (p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  imageIds: Array.isArray(p.productImages) ? p.productImages.map(img => img.id) : [],
  stock: p.stock,
  status: p.status,
  priceWithTransferDiscount: p.priceWithTransferDiscount ?? p.price_with_transfer_discount,
  animals: p.animal,
  animal: Array.isArray(p.animal) && p.animal.length ? p.animal[0].name : "",
  category: p.category?.description || p.category?.name || p.categoryName || "",
  raw: p,
})

const URL = '/products'

// =============== Thunks (igual de simples que el ejemplo) ===============
export const fetchProducts = createAsyncThunk('products/fetchProducts', async ({ isAdmin }) => {
  // versión básica (como el hook para usuarios NO admin)
  
  const { data } = await backend.get(`${URL}?sinStock=${isAdmin ? 1 : 0}`)
  return data.map(mapProduct)
})

export const createProduct = createAsyncThunk('products/createProduct', async (newProduct) => {
  // espera { name, price, stock, status, categoryId, animalId: number[] }
  const { data } = await backend.post(URL, newProduct)
  return mapProduct(data)
})

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, changes }) => {
  await backend.patch(`${URL}/${id}`, changes)
  const { data } = await backend.get(`${URL}/${id}`) // devolvemos el actualizado
  return mapProduct(data)
})

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id) => {
  await backend.delete(`${URL}/${id}`)
  return id
})

// (opcional) subir imágenes con FormData
export const uploadProductImages = createAsyncThunk(
  'products/uploadProductImages',
  async ({ id, files }) => {
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      await backend.post(`${URL}/images/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    const { data } = await backend.get(`${URL}/${id}`)
    return mapProduct(data)
  }
)

// =============== Slice ===============
const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: {},
    loading: false,
    error: null,
  },
  reducers: {
    getProductById: (state, action) => {
      console.log(action, state.items)
      state.currentProduct = action.payload.raw
        ? state.items.find(item => item.id == action.payload.id).raw
        : state.items.find(item => item.id == action.payload.id)
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.items = []
        state.error = action.error.message
      })

      // create
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items]
      })

      // update
      .addCase(updateProduct.fulfilled, (state, action) => {
        const i = state.items.findIndex(p => p.id === action.payload.id)
        if (i !== -1) state.items[i] = action.payload
      })

      // delete
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload)
      })

      // upload images (opcional)
      .addCase(uploadProductImages.fulfilled, (state, action) => {
        const i = state.items.findIndex(p => p.id === action.payload.id)
        if (i !== -1) state.items[i] = action.payload
      })
  },
})

export default productsSlice
