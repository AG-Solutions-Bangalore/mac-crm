import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { quotationApi } from "../api/quotationApi";

export function useGetProductsForQuotationQuery(categoryIds, serviceIds, enabled = true) {
  return useQuery({
    queryKey: ["products-for-quotation", categoryIds, serviceIds],
    queryFn: () => quotationApi.getProductsForQuotation(categoryIds, serviceIds),
    enabled: !!categoryIds && !!serviceIds && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useQuotationsQuery(page = 1, search = "", status = "all") {
  return useQuery({
    queryKey: ["quotations", page, search, status],
    queryFn: () => quotationApi.getQuotations(page, search, status),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useQuotationQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["quotation", id],
    queryFn: () => quotationApi.getQuotationById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationApi.createQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
}

export function useUpdateQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => quotationApi.updateQuotation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.id] });
    },
  });
}

export function useUpdateQuotationStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => quotationApi.updateQuotationStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.id] });
    },
  });
}

export function useUpdateQuotationFinishWorkDateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, finishWorkDate }) =>
      quotationApi.updateQuotationFinishWorkDate(id, finishWorkDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.id] });
    },
  });
}

export function useDeleteQuotationSubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationApi.deleteQuotationSub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
}

export function useRevQuotationsQuery(quotationId, page = 1, search = "", enabled = true) {
  return useQuery({
    queryKey: ["rev-quotations", quotationId, page, search],
    queryFn: () => quotationApi.getRevQuotations(quotationId, page, search),
    enabled: !!quotationId && enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useRevQuotationQuery(id, enabled = true) {
  return useQuery({
    queryKey: ["rev-quotation", id],
    queryFn: () => quotationApi.getRevQuotationById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useCreateRevQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationApi.createRevQuotation,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rev-quotations", variables.quotation_id] });
    },
  });
}

export function useUpdateRevQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => quotationApi.updateRevQuotation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rev-quotations"] });
      queryClient.invalidateQueries({ queryKey: ["rev-quotation", variables.id] });
    },
  });
}

export function useUpdateRevQuotationStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => quotationApi.updateRevQuotationStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rev-quotations"] });
      queryClient.invalidateQueries({ queryKey: ["rev-quotation", variables.id] });
    },
  });
}

export function useDeleteRevQuotationSubMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationApi.deleteRevQuotationSub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rev-quotations"] });
    },
  });
}

export function useApproveRevQuotationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationApi.approveRevQuotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["rev-quotations"] });
    },
  });
}
