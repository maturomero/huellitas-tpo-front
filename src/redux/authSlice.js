import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { backend } from '../api/backend'

export const login = createAsyncThunk(
    "auth/login",
    async ({ email, password }) => {
        const response = await backend.post('/auth/authenticate', { email, password })

        const userData = {
            userId: response.data.userId,
            accessToken: response.data.access_token,
            profile: null
        }

        const responseUserData = await backend.get(`/users/${userData.userId}`)
        userData.profile = responseUserData.data

        return {
            user: userData,
            status: 'authenticated'
        }
    }
)

export const register = createAsyncThunk(
    "auth/register",
    async ({ fullName, email, password }) => {
        const response = await backend.post("/auth/register", {
            fullName,
            email,
            password,
            role: 'USER',
        });

        const userData = {
            userId: response.data.userId,
            accessToken: response.data.access_token,
            profile: null
        }

        const responseUserData = await backend.get(`/users/${userData.userId}`)
        userData.profile = responseUserData.data

        return {
            user: userData,
            status: 'authenticated'
        }
    }
)

const clearSession = (state) => {
    state.status = "not-authenticated"
    state.user = null
}

export const authSlice = createSlice({
    name: "auth",
    initialState: {
        status: "not-authenticated",
        user: null
    },
    reducers: {
        logout: (state) => {
            clearSession(state)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.status = 'checking'
            })
            .addCase(login.fulfilled, (state, action) => {
                console.log(action, state)
                state.status = action.payload.status
                state.user = action.payload.user
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'not-authenticated'
                state.user = null
            })

        builder
            .addCase(register.pending, (state) => {
                state.status = 'checking'
            })
            .addCase(register.fulfilled, (state, action) => {
                state.status = action.payload.status
                state.user = action.payload.user
            })
            .addCase(register.rejected, (state, action) => {
                state.status = 'not-authenticated'
                state.user = null
            })
    }
})