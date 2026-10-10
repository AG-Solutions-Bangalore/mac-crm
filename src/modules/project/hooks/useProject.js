import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { projectApi } from "../api/projectApi";

export function useProjectsQuery(page = 1, search = "", status = "all") {
  return useQuery({
    queryKey: ["projects", page, search, status],
    queryFn: () => projectApi.getProjects(page, search, status),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useProjectQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => projectApi.getProjectById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => projectApi.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
    },
  });
}

export function useUpdateProjectStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => projectApi.updateProjectStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
    },
  });
}

export function useDeleteProjectSubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectApi.deleteProjectSub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
