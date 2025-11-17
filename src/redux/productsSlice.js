

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { backend } from '../api/backend'


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
  imageSrc: p.file,
  raw: p,
})

const URL = '/products'

const returnProductsWithImage = async (products = []) => {
  const productImages = await Promise.all(products.map(async item => {
    if (!item?.productImages?.[0]?.id) {
      return { id: item.id, file: '' }
    }

    const imageItem = await backend.get(`/products/images`, {
      params: { id: item?.productImages?.[0]?.id }
    })

    const mime = imageItem.data?.file.startsWith("iVBORw0K")
      ? "image/png"
      : "image/jpeg";

    return { id: item.id, file: `data:${mime};base64,${imageItem.data?.file}` }
  }))
  
  return products.map(item => {
    const productImage = productImages.find(productImage => productImage.id == item.id)
    return mapProduct({
      ...item,
      file: productImage.file
    })
  })
}


export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const { data } = await backend.get(`${URL}?sinStock=1`)
  const productsWithImages = await returnProductsWithImage(data)
  return productsWithImages
})

export const createProduct = createAsyncThunk('products/createProduct', async (newProduct) => {
  
  const { data } = await backend.post(URL, newProduct)
  const productWithImage = await returnProductsWithImage([data])
  return productWithImage[0]
})

export const updateProduct = createAsyncThunk('products/updateProduct', async ({ id, changes }) => {
  await backend.patch(`${URL}/${id}`, changes)
  const { data } = await backend.get(`${URL}/${id}`) 
  const productWithImage = await returnProductsWithImage([data])
  return productWithImage[0]
})

export const deleteProduct = createAsyncThunk('products/deleteProduct', async (id) => {
  await backend.delete(`${URL}/${id}`)
  return id
})

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
    const productWithImage = await returnProductsWithImage([data])

    return productWithImage[0]
  }
)


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
      state.currentProduct = action.payload.raw
        ? state.items.find(item => item.id == action.payload.id).raw
        : state.items.find(item => item.id == action.payload.id)
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = {}
    },
    decrementProductStockById: (state, action) => {
      const { id, units } = action.payload

      state.items = state.items.map(item => {
        if (item.id == id) {
          const updatedStock = item.stock - units
          return {
            ...item,
            stock: updatedStock > 0 ? updatedStock : 0,
            raw: {
              ...item.raw,
              stock: updatedStock > 0 ? updatedStock : 0,
            }
          }
        }

        return item
      })
    }
  },
  extraReducers: (builder) => {
    builder

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


      .addCase(createProduct.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items]
      })


      .addCase(updateProduct.fulfilled, (state, action) => {
        const i = state.items.findIndex(p => p.id === action.payload.id)
        if (i !== -1) state.items[i] = action.payload
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload)
      })

      .addCase(uploadProductImages.fulfilled, (state, action) => {
        const i = state.items.findIndex(p => p.id === action.payload.id)
        if (i !== -1) state.items[i] = action.payload
      })
  },
})

export default productsSlice
