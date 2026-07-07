import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { faqApi } from "../api/faqApi";

export function useFaqsQuery() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: faqApi.getFaqs,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useFaqQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["faq", id],
    queryFn: () => faqApi.getFaqById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateFaqMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: faqApi.createFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}

export function useUpdateFaqMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => faqApi.updateFaq(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      queryClient.invalidateQueries({ queryKey: ["faq", variables.id] });
    },
  });
}

export function useUpdateFaqStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => faqApi.updateFaqStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      queryClient.invalidateQueries({ queryKey: ["faq", variables.id] });
    },
  });
}

export function useDeleteFaqSubMutation() {
  return useMutation({
    mutationFn: (faqSubId) => faqApi.deleteFaqSub(faqSubId),
  });
}

export function usePageTwoDropdownQuery() {
  return useQuery({
    queryKey: ["page-two-dropdown"],
    queryFn: faqApi.getPageTwoDropdown,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}
