import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { floorApi } from "../api/floorApi";

export function useFloorsQuery(page = 1, search = "") {
  return useQuery({
    queryKey: ["floors", page, search],
    queryFn: () => floorApi.getFloors(page, search),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useFloorQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["floor", id],
    queryFn: () => floorApi.getFloorById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateFloorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: floorApi.createFloor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["activeFloors"] });
    },
  });
}

export function useUpdateFloorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => floorApi.updateFloor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["floor", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeFloors"] });
    },
  });
}

export function useUpdateFloorStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => floorApi.updateFloorStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["floors"] });
      queryClient.invalidateQueries({ queryKey: ["floor", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeFloors"] });
    },
  });
}

export function useActiveFloorsQuery() {
  return useQuery({
    queryKey: ["activeFloors"],
    queryFn: floorApi.getActiveFloors,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
