import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { requestApi } from "../api/requestApi";

export function useRequestsQuery(page = 1, search = "") {
  return useQuery({
    queryKey: ["requests", page, search],
    queryFn: () => requestApi.getRequests(page, search),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useUpdateRequestStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => requestApi.updateRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}
