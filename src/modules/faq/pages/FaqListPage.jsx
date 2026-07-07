import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Plus, Search, HelpCircle } from "lucide-react";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import ToggleStatus from "@/components/toogle/status-toogle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/common/page-header";
import { useFaqsQuery } from "../hooks/useFaq";

const FaqListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: responseData, isLoading, isError, refetch } = useFaqsQuery();

  const faqList = responseData?.data ?? [];

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return faqList;
    return faqList.filter((faq) =>
      (faq?.page_two_name ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [faqList, searchTerm]);

  if (isLoading) return <LoadingBar />;
  if (isError) return <ApiErrorPage onRetry={refetch} />;

  const isEmpty = filteredData.length === 0;

  return (
    <div className="px-5">
      <PageHeader
        icon={HelpCircle}
        title="FAQs"
        description="Configure Frequently Asked Questions for client pages"
        rightContent={
          <Button onClick={() => navigate("/faq-list/create")} className="gap-2">
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 my-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search FAQs by page name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      {isEmpty ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No FAQs found" : "No FAQs yet"}
            </h3>
            <p className="text-gray-600 text-center max-w-sm">
              {searchTerm
                ? "Try adjusting your search terms or filters"
                : "Get started by creating your first FAQ to help your users"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredData.map((faq) => (
            <Card
              key={faq.id}
              className="overflow-hidden transition-all duration-300 hover:shadow-lg group"
            >
              <CardContent className="p-6 flex flex-col h-full justify-between gap-4">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 transition flex-grow">
                  {faq.page_two_name}
                </h3>

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <ToggleStatus
                    initialStatus={faq.faq_status}
                    apiUrl={`/faqs/${faq.id}/status`}
                    payloadKey="faq_status"
                    onSuccess={refetch}
                    method="patch"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-accent hover:text-accent/95 hover:bg-accent/20"
                    onClick={() => navigate(`/faq-list/edit/${faq.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isEmpty && (
        <div className="mt-8 text-center text-sm text-gray-600">
          Showing {filteredData.length} of {faqList.length} FAQs
        </div>
      )}
    </div>
  );
};

export default FaqListPage;
