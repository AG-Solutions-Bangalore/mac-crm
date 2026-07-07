import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintApi } from "../api/complaintApi";

export function useComplaintsQuery(page = 1) {
  return useQuery({
    queryKey: ["complaints", page],
    queryFn: () => complaintApi.getComplaints(page),
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
