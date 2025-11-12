import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './authSlice'
import productsReducer from './productsSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        products: productsReducer,
    }
})