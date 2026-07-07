import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceApi } from "../api/serviceApi";

export function useServicesQuery(page = 1) {
  return useQuery({
    queryKey: ["services", page],
    queryFn: () => serviceApi.getServices(page),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useServiceQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["service", id],
    queryFn: () => serviceApi.getServiceById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serviceApi.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["activeServices"] });
    },
  });
}

export function useUpdateServiceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => serviceApi.updateService(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeServices"] });
    },
  });
}

export function useUpdateServiceStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => serviceApi.updateServiceStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeServices"] });
    },
  });
}

export function useDeleteServiceSubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subId) => serviceApi.deleteServiceSub(subId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service"] });
    },
  });
}

export function useActiveServicesQuery() {
  return useQuery({
    queryKey: ["activeServices"],
    queryFn: serviceApi.getActiveServices,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
