import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronUp,
  MinusCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useDeleteFaqSubMutation } from "../hooks/useFaq";

const FaqSubForm = ({
  faqItems,
  error,
  addFaq,
  removeFaq,
  moveFaq,
  handleItemChange,
  isEdit,
}) => {
  const deleteSubMutation = useDeleteFaqSubMutation();

  const handleDeleteFaq = async (index, faqId) => {
    if (!faqId) {
      removeFaq(index);
      return;
    }

    try {
      const res = await deleteSubMutation.mutateAsync(faqId);
      if (res?.code === 200 || res?.status === true) {
        toast.success(res?.msg || "FAQ deleted successfully");
        removeFaq(index);
      } else {
        toast.error(res?.msg || "Failed to delete FAQ");
      }
    } catch (err) {
      toast.error(err?.message || "Failed to delete FAQ");
    }
  };

  return (
    <div>
      <Card className="mt-2">
        <CardContent>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="border rounded-lg p-3 mt-3 space-y-2">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">FAQ {i + 1}</h4>
                  <div className="flex gap-2 items-center">
                    {isEdit && (
                      <div className="flex items-center gap-1 mr-2">
                        <span className="text-xs text-muted-foreground select-none">
                          {item.faq_status === "Active" ? "Active" : "Inactive"}
                        </span>
                        <Switch
                          checked={item.faq_status === "Active"}
                          onCheckedChange={(checked) =>
                            handleItemChange(
                              i,
                              "faq_status",
                              checked ? "Active" : "Inactive"
                            )
                          }
                        />
                      </div>
                    )}
                    {i > 0 && (
                      <ChevronUp
                        onClick={() => moveFaq(i, "up")}
                        className="cursor-pointer h-5 w-5 text-gray-500 hover:text-gray-800"
                      />
                    )}
                    {i < faqItems.length - 1 && (
                      <ChevronDown
                        onClick={() => moveFaq(i, "down")}
                        className="cursor-pointer h-5 w-5 text-gray-500 hover:text-gray-800"
                      />
                    )}
                    {item.id ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Trash2 className="cursor-pointer text-red-500 h-5 w-5 hover:text-red-700" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the FAQ.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleDeleteFaq(i, item.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <MinusCircle
                        className="cursor-pointer text-red-500 h-5 w-5 hover:text-red-700"
                        onClick={() => removeFaq(i)}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Input
                      placeholder="Sort Order *"
                      value={item.faq_sort}
                      onChange={(e) =>
                        handleItemChange(i, "faq_sort", e.target.value)
                      }
                      className={error[i]?.faq_sort ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {error[i]?.faq_sort && (
                      <p className="text-xs text-red-500 mt-1">{error[i].faq_sort}</p>
                    )}
                  </div>
                  <Input
                    placeholder="Heading"
                    value={item.faq_heading}
                    onChange={(e) =>
                      handleItemChange(i, "faq_heading", e.target.value)
                    }
                  />

                  <div>
                    <Textarea
                      placeholder="Question *"
                      value={item.faq_que}
                      onChange={(e) =>
                        handleItemChange(i, "faq_que", e.target.value)
                      }
                      className={error[i]?.faq_que ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {error[i]?.faq_que && (
                      <p className="text-xs text-red-500 mt-1">{error[i].faq_que}</p>
                    )}
                  </div>
                  <div>
                    <Textarea
                      placeholder="Answer *"
                      value={item.faq_ans}
                      onChange={(e) =>
                        handleItemChange(i, "faq_ans", e.target.value)
                      }
                      className={error[i]?.faq_ans ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {error[i]?.faq_ans && (
                      <p className="text-xs text-red-500 mt-1">{error[i].faq_ans}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addFaq} className="mt-2">
              <Plus className="mr-2 h-4 w-4" />
              Add FAQ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaqSubForm;
