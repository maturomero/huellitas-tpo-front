import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        total: 0.0,
    },
    reducers: {
        handleAddProduct: (state, action) => {
            const product = action.payload.product
            const units = action.payload.units

            state.items = [{ ...product, units }, ...state.items]
            state.total += product.price
        },
        
        handleDeleteProduct: (state, action) => {
            const productId = action.payload
            const product = state.items.find(item => item.id === productId)

            state.total -= product.price
            state.items = state.items.filter(item => item.id !== productId)
        }
    }
})