import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, HelpCircle } from "lucide-react";
import PageHeader from "@/components/common/page-header";
import { GroupButton } from "@/components/group-button";
import LoadingBar from "@/components/loader/loading-bar";
import ApiErrorPage from "@/components/api-error/api-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useFaqQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  usePageTwoDropdownQuery,
} from "../hooks/useFaq";
import FaqSubForm from "../components/FaqSubForm";
import MemoizedSelect from "@/components/common/memoized-select";

const EMPTY_FAQ = {
  id: null,
  faq_sort: "",
  faq_heading: "",
  faq_que: "",
  faq_ans: "",
  faq_status: "Active",
};

const FaqFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [faqFor, setFaqFor] = useState({
    faq_for: "",
    faq_status: "Active",
  });

  const [faqItems, setFaqItems] = useState([{ ...EMPTY_FAQ }]);
  const [errors, setErrors] = useState([]);
  const [pageOptions, setPageOptions] = useState([]);

  // Queries & Mutations
  const { data: fetchedFaq, isLoading: isFaqLoading, isError: isFaqError } = useFaqQuery(id, isEdit);
  const { data: pageData } = usePageTwoDropdownQuery();
  const createMutation = useCreateFaqMutation();
  const updateMutation = useUpdateFaqMutation();

  const loading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (pageData?.data) {
      setPageOptions(pageData.data);
    }
  }, [pageData]);

  useEffect(() => {
    if (!isEdit) return;

    if (fetchedFaq?.data) {
      const d = fetchedFaq.data;
      setFaqFor({
        faq_for: d.faq_for || "",
        faq_status: d.faq_status || "Active",
      });

      setFaqItems(
        (d.web_faq_subs || []).map((s) => ({
          id: s.id,
          faq_sort: s.faq_sort ?? "",
          faq_heading: s.faq_heading ?? "",
          faq_que: s.faq_que ?? "",
          faq_ans: s.faq_ans ?? "",
          faq_status: s.faq_status ?? "Active",
        }))
      );
    }
  }, [isEdit, id, fetchedFaq]);

  const handleItemChange = (i, field, value) => {
    const copy = [...faqItems];
    copy[i][field] = value;
    setFaqItems(copy);

    if (errors[i]?.[field]) {
      const errCopy = [...errors];
      errCopy[i][field] = "";
      setErrors(errCopy);
    }
  };

  const addFaq = () => setFaqItems([...faqItems, { ...EMPTY_FAQ }]);

  const removeFaq = (i) => {
    if (faqItems.length === 1) return;
    setFaqItems(faqItems.filter((_, idx) => idx !== i));
    setErrors(errors.filter((_, idx) => idx !== i));
  };

  const moveFaq = (i, dir) => {
    const copy = [...faqItems];
    const swap = dir === "up" ? i - 1 : i + 1;
    [copy[i], copy[swap]] = [copy[swap], copy[i]];
    setFaqItems(copy);
  };

  const syncAllSubStatus = (status) => {
    setFaqItems((prev) =>
      prev.map((item) => ({
        ...item,
        faq_status: status,
      }))
    );
  };

  const validate = () => {
    let valid = true;
    const err = [];

    if (!faqFor.faq_for) {
      toast.error("Page selection is required");
      return false;
    }

    faqItems.forEach((f, i) => {
      const e = {};
      if (!f.faq_sort) e.faq_sort = "Required";
      if (!f.faq_que) e.faq_que = "Required";
      if (!f.faq_ans) e.faq_ans = "Required";
      if (Object.keys(e).length) valid = false;
      err[i] = e;
    });

    setErrors(err);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      faq_for: faqFor.faq_for,
      faq_status: faqFor.faq_status,
      faq: faqItems.map((f) => ({
        id: f.id,
        faq_sort: f.faq_sort,
        faq_heading: f.faq_heading,
        faq_que: f.faq_que,
        faq_ans: f.faq_ans,
        faq_status: f.faq_status,
      })),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success("FAQs updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("FAQs created successfully");
      }
      navigate("/faq-list");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Something went wrong");
    }
  };

  if (isEdit && isFaqLoading) return <LoadingBar />;
  if (isEdit && isFaqError) return <ApiErrorPage onRetry={navigate} />;

  return (
    <div className="px-5">
      <PageHeader
        icon={HelpCircle}
        title={isEdit ? "Edit FAQ" : "Create FAQs"}
        rightContent={
          <Button variant="outline" onClick={() => navigate("/faq-list")}>
            Back
          </Button>
        }
      />

      <Card className="mt-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className={`grid gap-4 ${
                isEdit ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
              }`}
            >
              <div className={isEdit ? "md:col-span-2" : ""}>
                <Label>Page *</Label>
                <MemoizedSelect
                  options={pageOptions.map((p) => ({
                    value: p.page_two_url,
                    label: p.page_two_name,
                  })) || []}
                  value={faqFor.faq_for}
                  onChange={(option) =>
                    setFaqFor((p) => ({ ...p, faq_for: option ? option.value : "" }))
                  }
                  placeholder="Select page"
                />
              </div>

              {isEdit && (
                <div>
                  <Label className="mb-2 block">Status</Label>
                  <GroupButton
                    className="w-fit"
                    value={faqFor.faq_status}
                    onChange={(v) => {
                      setFaqFor((p) => ({ ...p, faq_status: v }));
                      syncAllSubStatus(v);
                    }}
                    options={[
                      { label: "Active", value: "Active" },
                      { label: "Inactive", value: "Inactive" },
                    ]}
                  />
                </div>
              )}
            </div>

            <FaqSubForm
              isEdit={isEdit}
              faqItems={faqItems}
              error={errors}
              addFaq={addFaq}
              removeFaq={removeFaq}
              moveFaq={moveFaq}
              handleItemChange={handleItemChange}
            />

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={loading} className="gap-2">
                {loading && <Loader2 className="animate-spin h-4 w-4" />}
                {isEdit ? "Update FAQ" : "Create FAQs"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaqFormPage;
