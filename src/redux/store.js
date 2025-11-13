import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './authSlice'
import productsReducer from './productsSlice'
import attributesReducer from './attributesSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        products: productsReducer.reducer,
        attributes: attributesReducer
    }
})