import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { galleryApi } from "../api/galleryApi";

export function useGalleryListQuery() {
  return useQuery({
    queryKey: ["gallery-list"],
    queryFn: galleryApi.getGalleryList,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useGalleryQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["gallery-item", id],
    queryFn: () => galleryApi.getGalleryById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateGalleryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: galleryApi.createGallery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-list"] });
    },
  });
}

export function useUpdateGalleryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => galleryApi.updateGallery(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gallery-list"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-item", variables.id] });
    },
  });
}
