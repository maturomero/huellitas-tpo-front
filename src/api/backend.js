import axios from "axios";

export const backend = axios.create({
    baseURL: "http://localhost:4002"
})

export const injectAuth = (store) => {
    backend.interceptors.request.use((config) => {
        const auth = store.getState().auth
        const token = auth?.user?.accessToken
    
        if (token) {
            config.headers.Authorization = `Bearer ${token.trim()}`
        }
    
        return config
    },
        (error) => Promise.reject(error)
    )
}