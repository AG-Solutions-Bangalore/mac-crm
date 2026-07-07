import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lectureApi } from "../api/lectureApi";

// Lecture Hooks
export function useLecturesQuery() {
  return useQuery({
    queryKey: ["lecture-youtube-list"],
    queryFn: lectureApi.getLectures,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useLectureQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["lecture-youtube-item", id],
    queryFn: () => lectureApi.getLectureById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateLectureMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lectureApi.createLecture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecture-youtube-list"] });
    },
  });
}

export function useUpdateLectureMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => lectureApi.updateLecture(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lecture-youtube-list"] });
      queryClient.invalidateQueries({ queryKey: ["lecture-youtube-item", variables.id] });
    },
  });
}

// Playlist Hooks
export function usePlaylistsQuery() {
  return useQuery({
    queryKey: ["lecture-youtube-playlist-list"],
    queryFn: lectureApi.getPlaylists,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreatePlaylistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: lectureApi.createPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecture-youtube-playlist-list"] });
      queryClient.invalidateQueries({ queryKey: ["activeplaytlist-dropdown"] });
    },
  });
}

export function useUpdatePlaylistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => lectureApi.updatePlaylist(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lecture-youtube-playlist-list"] });
      queryClient.invalidateQueries({ queryKey: ["activeplaytlist-dropdown"] });
    },
  });
}

export function useActivePlaylistsQuery() {
  return useQuery({
    queryKey: ["activeplaytlist-dropdown"],
    queryFn: lectureApi.getActivePlaylists,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

// Utility Dropdowns
export function useYoutubeForQuery() {
  return useQuery({
    queryKey: ["youtubeFor"],
    queryFn: lectureApi.getYoutubeFor,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useCoursesQuery() {
  return useQuery({
    queryKey: ["courses-dropdown"],
    queryFn: lectureApi.getCourses,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}
