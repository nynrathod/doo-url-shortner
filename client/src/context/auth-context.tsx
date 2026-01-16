import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { queryClient } from '@/App'

interface User {
    id: number
    email: string
    name: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    login: (email: string, password: string) => Promise<void>
    signup: (email: string, password: string, name: string) => Promise<void>
    logout: () => void
    clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'auth_data'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // Initialize form local storage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                const { user: storedUser, token: storedToken } = JSON.parse(stored)
                if (storedToken) {
                    api.setToken(storedToken)
                    setUser(storedUser)
                    setToken(storedToken)
                }
            } catch (e) {
                console.error('Failed to parse auth storage', e)
                localStorage.removeItem(STORAGE_KEY)
            }
        }
        setIsLoading(false)
    }, [])

    const saveAuthData = (user: User, token: string) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
        api.setToken(token)
        setUser(user)
        setToken(token)
        setError(null)
    }

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await api.login(email, password)
            // Unwrap if needed, similar to previous zustand store
            const data = (response as any).data || response
            saveAuthData(data.user, data.token)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const signup = async (email: string, password: string, name: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await api.signup(email, password, name)
            const data = (response as any).data || response
            saveAuthData(data.user, data.token)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Signup failed')
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem(STORAGE_KEY)
        api.setToken(null)
        setUser(null)
        setToken(null)
        // Clear all React Query cache to prevent stale data on next login
        queryClient.clear()
    }

    const clearError = () => setError(null)

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        error,
        login,
        signup,
        logout,
        clearError,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
