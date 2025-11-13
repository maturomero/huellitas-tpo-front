import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { backend } from '../api/backend'

export const fetchAnimals = createAsyncThunk('products/fetchAnimals', async () => {
    const { data } = await backend.get('/animals')
    return data
})

export const fetchCategories = createAsyncThunk('products/fetchCategories', async () => {
    const { data } = await backend.get('/categories')
    return data
})

const attributesSlice = createSlice({
    name: 'attributes',
    initialState: {
        animals: [],
        categories: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAnimals.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchAnimals.fulfilled, (state, action) => {
                state.loading = false
                state.animals = action.payload
            })
            .addCase(fetchAnimals.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false
                state.categories = action.payload
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })
    }
})

export default attributesSlice.reducer