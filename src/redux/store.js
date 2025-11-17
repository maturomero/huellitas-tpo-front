import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './authSlice'
import productsSlice from './productsSlice'
import attributesReducer from './attributesSlice'
import cartSlice from './cartSlice'
import { injectAuth } from '../api/backend'
import ordersReducer from './orderSlice'

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        products: productsSlice.reducer,
        attributes: attributesReducer,
        cart: cartSlice.reducer,
        orders: ordersReducer.reducer,
    }
})

injectAuth(store)