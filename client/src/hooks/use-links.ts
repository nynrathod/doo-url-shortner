import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type CreateLinkRequest } from '@/lib/api'

// Query keys
export const linkKeys = {
    all: ['links'] as const,
    detail: (id: number) => ['links', id] as const,
    stats: (id: number) => ['links', id, 'stats'] as const,
}

// Get all links
export function useLinks() {
    return useQuery({
        queryKey: linkKeys.all,
        queryFn: () => api.getLinks(),
    })
}

// Get single link
export function useLink(id: number) {
    return useQuery({
        queryKey: linkKeys.detail(id),
        queryFn: () => api.getLink(id),
        enabled: !!id,
    })
}

// Get link stats
export function useLinkStats(id: number) {
    return useQuery({
        queryKey: linkKeys.stats(id),
        queryFn: () => api.getLinkStats(id),
        enabled: !!id,
    })
}

// Create link
export function useCreateLink() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateLinkRequest) => api.createLink(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: linkKeys.all })
        },
    })
}

// Update link
export function useUpdateLink() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateLinkRequest> }) =>
            api.updateLink(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: linkKeys.all })
            queryClient.invalidateQueries({ queryKey: linkKeys.detail(id) })
        },
    })
}

// Delete link
export function useDeleteLink() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => api.deleteLink(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: linkKeys.all })
        },
    })
}
