import { useQuery } from "@tanstack/react-query";
import { systemApi } from "../api/systemApi";

export function useCheckStatusQuery(options = {}) {
  return useQuery({
    queryKey: ["system-status"],
    queryFn: systemApi.checkStatus,
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useFetchDotenvQuery(options = {}) {
  return useQuery({
    queryKey: ["system-dotenv"],
    queryFn: systemApi.fetchDotenv,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}
