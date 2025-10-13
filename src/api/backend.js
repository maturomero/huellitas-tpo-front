import axios from "axios";

export const backend = axios.create({
    baseURL: "http://localhost:4002"
})

backend.interceptors.request.use((config) => {
    const userData = window.localStorage.getItem('user')
    const userDataParsed = userData ? JSON.parse(userData) : null

    if (userDataParsed?.accessToken) {
        config.headers.Authorization = `Bearer ${userDataParsed?.accessToken.trim()}`
    }

    return config
},
    (error) => Promise.reject(error)
)