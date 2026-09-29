import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { notificationApi } from "../api/notificationApi";

export function useNotificationsQuery(page = 1, search = "") {
  return useQuery({
    queryKey: ["notifications", page, search],
    queryFn: () => notificationApi.getNotifications(page, search),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useNotificationQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["notification", id],
    queryFn: () => notificationApi.getNotificationById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-dropdown"] });
    },
  });
}

export function useUpdateNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => notificationApi.updateNotification(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["notification-dropdown"] });
    },
  });
}

export function useUpdateNotificationStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => notificationApi.updateNotificationStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["notification-dropdown"] });
    },
  });
}
