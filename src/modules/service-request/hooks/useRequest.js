import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestApi } from "../api/requestApi";

export function useRequestsQuery(page = 1) {
  return useQuery({
    queryKey: ["requests", page],
    queryFn: () => requestApi.getRequests(page),
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
