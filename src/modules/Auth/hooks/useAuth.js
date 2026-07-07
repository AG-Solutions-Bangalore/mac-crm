import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ username, password }) => authApi.login(username, password),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: ({ username, email }) => authApi.forgotPassword(username, email),
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: ({ username, oldPassword, newPassword }) =>
      authApi.changePassword(username, oldPassword, newPassword),
  });
}

export function useFetchProfileQuery(enabled = true) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: authApi.fetchProfile,
    enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
