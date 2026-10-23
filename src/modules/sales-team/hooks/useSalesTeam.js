import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { salesTeamApi } from "../api/salesTeamApi";

export function useSalesTeamMembersQuery(page = 1, search = "") {
  return useQuery({
    queryKey: ["sales-team", page, search],
    queryFn: () => salesTeamApi.getMembers(page, search),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useSalesTeamMemberQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["sales-team-member", id],
    queryFn: () => salesTeamApi.getMemberById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useActiveSalesTeamQuery() {
  return useQuery({
    queryKey: ["sales-team-active"],
    queryFn: salesTeamApi.getActiveMembers,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateSalesTeamMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: salesTeamApi.createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-team"] });
      queryClient.invalidateQueries({ queryKey: ["sales-team-active"] });
    },
  });
}

export function useUpdateSalesTeamMemberMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => salesTeamApi.updateMember(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-team"] });
      queryClient.invalidateQueries({ queryKey: ["sales-team-active"] });
      queryClient.invalidateQueries({
        queryKey: ["sales-team-member", variables.id],
      });
    },
  });
}
