import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { propertyApi } from "../api/propertyApi";

export function usePropertiesQuery(page = 1, search = "") {
  return useQuery({
    queryKey: ["properties", page, search],
    queryFn: () => propertyApi.getProperties(page, search),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function usePropertyQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyApi.getPropertyById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreatePropertyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertyApi.createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["activeProperties"] });
    },
  });
}

export function useUpdatePropertyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => propertyApi.updateProperty(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeProperties"] });
    },
  });
}

export function useUpdatePropertyStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => propertyApi.updatePropertyStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeProperties"] });
    },
  });
}

export function useActivePropertiesQuery() {
  return useQuery({
    queryKey: ["activeProperties"],
    queryFn: propertyApi.getActiveProperties,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
