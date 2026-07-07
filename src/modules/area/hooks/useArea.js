import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { areaApi } from "../api/areaApi";

export function useAreasQuery(page = 1) {
  return useQuery({
    queryKey: ["areas", page],
    queryFn: () => areaApi.getAreas(page),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useAreaQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["area", id],
    queryFn: () => areaApi.getAreaById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateAreaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: areaApi.createArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      queryClient.invalidateQueries({ queryKey: ["activeAreas"] });
    },
  });
}

export function useUpdateAreaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, status }) => areaApi.updateArea(id, name, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      queryClient.invalidateQueries({ queryKey: ["area", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeAreas"] });
    },
  });
}

export function useUpdateAreaStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => areaApi.updateAreaStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      queryClient.invalidateQueries({ queryKey: ["area", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeAreas"] });
    },
  });
}

export function useActiveAreasQuery() {
  return useQuery({
    queryKey: ["activeAreas"],
    queryFn: areaApi.getActiveAreas,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
