import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandApi } from "../api/brandApi";

export function useBrandsQuery(page = 1) {
  return useQuery({
    queryKey: ["brands", page],
    queryFn: () => brandApi.getBrands(page),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useBrandQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["brand", id],
    queryFn: () => brandApi.getBrandById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateBrandMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brandApi.createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["activeBrands"] });
    },
  });
}

export function useUpdateBrandMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, status }) => brandApi.updateBrand(id, name, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["brand", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeBrands"] });
    },
  });
}

export function useUpdateBrandStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => brandApi.updateBrandStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["brand", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeBrands"] });
    },
  });
}

export function useActiveBrandsQuery() {
  return useQuery({
    queryKey: ["activeBrands"],
    queryFn: brandApi.getActiveBrands,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
