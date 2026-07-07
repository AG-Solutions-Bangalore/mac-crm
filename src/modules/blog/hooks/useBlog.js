import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "../api/blogApi";

export function useBlogsQuery() {
  return useQuery({
    queryKey: ["blog-list"],
    queryFn: blogApi.getBlogs,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useBlogQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["blog-item", id],
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
      queryClient.invalidateQueries({ queryKey: ["blog-list"] });
    },
  });
}

export function useUpdateBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => blogApi.updateBlog(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blog-list"] });
      queryClient.invalidateQueries({ queryKey: ["blog-item", variables.id] });
    },
  });
}

export function useDeleteBlogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blogApi.deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-list"] });
    },
  });
}

export function useDeleteBlogSubMutation() {
  return useMutation({
    mutationFn: blogApi.deleteBlogSub,
  });
}

export function useDeleteBlogRelatedMutation() {
  return useMutation({
    mutationFn: blogApi.deleteBlogRelated,
  });
}

export function useBlogsDropdownQuery() {
  return useQuery({
    queryKey: ["blogs-dropdown"],
    queryFn: blogApi.getBlogsDropdown,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useCoursesQuery() {
  return useQuery({
    queryKey: ["courses-dropdown"],
    queryFn: blogApi.getCourses,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}
