import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../api/categoryApi";

export function useCategoriesQuery(page = 1) {
  return useQuery({
    queryKey: ["categories", page],
    queryFn: () => categoryApi.getCategories(page),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCategoryQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => categoryApi.getCategoryById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["activeCategories"] });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, status }) => categoryApi.updateCategory(id, name, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeCategories"] });
    },
  });
}

export function useUpdateCategoryStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => categoryApi.updateCategoryStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeCategories"] });
    },
  });
}

export function useActiveCategoriesQuery() {
  return useQuery({
    queryKey: ["activeCategories"],
    queryFn: categoryApi.getActiveCategories,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
