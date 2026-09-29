import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { complaintApi } from "../api/complaintApi";

export function useComplaintsQuery(page = 1, search = "") {
  return useQuery({
    queryKey: ["complaints", page, search],
    queryFn: () => complaintApi.getComplaints(page, search),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useUpdateComplaintStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => complaintApi.updateComplaintStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
}
