import { http, authToken } from './http'

// Types
export interface Link {
    id: number
    ShortCode: string
    DestinationUrl: string
    UserId: number
    ClickCount: number
    LastAccessedAt: string | null
    ExpiresAt: string | null
    created_at?: string
    updated_at?: string
}

export interface LinkStats {
    id: number
    ShortCode: string
    DestinationUrl: string
    ClickCount: number
    LastAccessedAt: string | null
    ExpiresAt: string | null
    created_at?: string
}

export interface CreateLinkRequest {
    destinationurl: string
    expiresat?: string
}

export interface AuthResponse {
    token: string
    user: {
        id: number
        email: string
        name: string
    }
}

export interface DailyClickCount {
    day: string
    clicks: number
}

export interface AnalyticsData {
    totalClicks: number
    totalLinks: number
    activeLinks: number
    topLinks: Link[]
    dailyClicks: DailyClickCount[]
}

// API methods
export const api = {
    // Auth
    signup: (email: string, password: string, name: string) =>
        http.post<AuthResponse>('/auth/signup', { email, password, name }),

    login: (email: string, password: string) =>
        http.post<AuthResponse>('/auth/login', { email, password }),

    // Links
    getLinks: () => http.get<{ data: Link[] }>('/links').then(res => res.data),

    getLink: (id: number) => http.get<{ data: Link }>(`/links/${id}`).then(res => res.data),

    createLink: (data: CreateLinkRequest) => http.post<{ data: Link }>('/links', data).then(res => res.data),

    updateLink: (id: number, data: Partial<CreateLinkRequest>) =>
        http.put<{ data: Link }>(`/links/${id}`, { id, ...data }).then(res => res.data),

    deleteLink: (id: number) => http.delete<void>(`/links/${id}`),

    getLinkStats: (id: number) => http.get<{ data: LinkStats }>(`/links/${id}/stats`).then(res => res.data),

    getAnalytics: () => http.get<{ data: AnalyticsData }>('/analytics').then(res => res.data),

    // Token management
    setToken: (token: string | null) => {
        if (token) {
            authToken.set(token)
        } else {
            authToken.remove()
        }
    },

    getToken: () => authToken.get(),
}
