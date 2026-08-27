import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "../api/blogApi";

/**
 * Blog hooks — TanStack Query.
 *
 * Conventions match the rest of the codebase (see modules/service/hooks):
 *   • 5-minute staleTime
 *   • refetchOnWindowFocus disabled
 *   • retry once
 *   • mutations invalidate the relevant list / detail keys
 */

const LIST_KEY = ["blogs"];
const ITEM_KEY = (id) => ["blog", id];
const ACTIVE_SERVICES_KEY = ["activeServices"];

export function useBlogsQuery(page = 1) {
  return useQuery({
    queryKey: [...LIST_KEY, page],
    queryFn: () => blogApi.getBlogs(page),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useBlogQuery(id, enabled = true) {
  return useQuery({
    queryKey: ITEM_KEY(id),
    queryFn: () => blogApi.getBlogById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blogApi.createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

export function useUpdateBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => blogApi.updateBlog(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ITEM_KEY(variables.id) });
    },
  });
}

export function useUpdateBlogStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => blogApi.updateBlogStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ITEM_KEY(variables.id) });
    },
  });
}

/**
 * Reused for the `blog_categories_ids` multi-select.
 * Pulls from the same /activeServices endpoint used by the service module.
 */
export function useActiveServicesQuery() {
  return useQuery({
    queryKey: ACTIVE_SERVICES_KEY,
    queryFn: blogApi.getActiveServices,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
