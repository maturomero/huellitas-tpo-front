import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './authSlice'
import productsSlice from './productsSlice'
import attributesReducer from './attributesSlice'
import cartSlice from './cartSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        products: productsSlice.reducer,
        attributes: attributesReducer,
        cart: cartSlice.reducer,
    }
})