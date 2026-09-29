import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { galleryApi } from "../api/galleryApi";

/**
 * Gallery hooks — TanStack Query.
 *
 * Conventions match the rest of the codebase (see modules/service/hooks):
 *   • 5-minute staleTime
 *   • refetchOnWindowFocus disabled
 *   • retry once
 *   • mutations invalidate the relevant list / detail keys
 */

const LIST_KEY = ["galleries"];
const ITEM_KEY = (id) => ["gallery", id];
const ACTIVE_GALLERIES_KEY = ["activeGalleries"];

export function useGalleriesQuery(page = 1, search = "") {
  return useQuery({
    queryKey: [...LIST_KEY, page, search],
    queryFn: () => galleryApi.getGalleries(page, search),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useGalleryQuery(id, enabled = true) {
  return useQuery({
    queryKey: ITEM_KEY(id),
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
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVE_GALLERIES_KEY });
    },
  });
}

export function useUpdateGalleryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => galleryApi.updateGallery(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ITEM_KEY(variables.id) });
      queryClient.invalidateQueries({ queryKey: ACTIVE_GALLERIES_KEY });
    },
  });
}

export function useUpdateGalleryStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => galleryApi.updateGalleryStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      queryClient.invalidateQueries({ queryKey: ITEM_KEY(variables.id) });
      queryClient.invalidateQueries({ queryKey: ACTIVE_GALLERIES_KEY });
    },
  });
}

export function useActiveGalleriesQuery() {
  return useQuery({
    queryKey: ACTIVE_GALLERIES_KEY,
    queryFn: galleryApi.getActiveGalleries,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
