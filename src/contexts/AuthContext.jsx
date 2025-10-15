import { createContext, useState, useContext, useEffect } from "react"
import { backend } from "../api/backend";

export const AuthContext = createContext()

export const useAuthContext = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [status, setStatus] = useState('checking')
  const [user, setUser] = useState(window.localStorage.getItem('user') ? JSON.parse(window.localStorage.getItem('user')) : null)

  useEffect(() => {
    validateSession()
  }, [])

  const validateSession = () => {
    if (!user?.accessToken) {
      return logout()
    }

    setStatus('authenticated')
  }

  const login = async (email, password) => {
    try {
      setStatus('checking')

      const response = await backend.post('/auth/authenticate', { email, password })

      const userData = {
        userId: response.data.userId,
        accessToken: response.data.access_token,
        profile: null
      }

      window.localStorage.setItem("user", JSON.stringify(userData))

      const responseUserData = await backend.get(`/users/${userData.userId}`)
      userData.profile = responseUserData.data

      window.localStorage.setItem("user", JSON.stringify(userData))

      setUser(userData)
      setStatus("authenticated")
    } catch (error) {
      logout()
    }
  }

  const register = async ({ fullName, email, password }) => {
    try {
      setStatus("checking");

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

      window.localStorage.setItem("user", JSON.stringify(userData))

      const responseUserData = await backend.get(`/users/${userData.userId}`)
      userData.profile = responseUserData.data

      window.localStorage.setItem("user", JSON.stringify(userData))

      setUser(userData)
      setStatus("authenticated")
    } catch (error) {
      setStatus("not-authenticated");
      throw error;
    }
  };

  const logout = () => {
    window.localStorage.removeItem("user");
    setUser(null);
    setStatus("not-authenticated");
  };

  return (
    <AuthContext.Provider value={{ status, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}