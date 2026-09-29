import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { buyerApi } from "../api/buyerApi";

export function useBuyersQuery(page = 1, search = "") {
  return useQuery({
    queryKey: ["buyers", page, search],
    queryFn: () => buyerApi.getBuyers(page, search),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useBuyerQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["buyer", id],
    queryFn: () => buyerApi.getBuyerById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateBuyerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: buyerApi.createBuyer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      queryClient.invalidateQueries({ queryKey: ["activeBuyers"] });
    },
  });
}

export function useUpdateBuyerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => buyerApi.updateBuyer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      queryClient.invalidateQueries({ queryKey: ["buyer", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeBuyers"] });
    },
  });
}

export function useUpdateBuyerStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => buyerApi.updateBuyerStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["buyers"] });
      queryClient.invalidateQueries({ queryKey: ["buyer", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["activeBuyers"] });
    },
  });
}

export function useActiveBuyersQuery() {
  return useQuery({
    queryKey: ["activeBuyers"],
    queryFn: buyerApi.getActiveBuyers,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
