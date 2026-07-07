import React, { useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateComplaintStatusMutation } from "../hooks/useComplaint";

const ComplaintStatusToggle = ({ initialStatus, id, onSuccess }) => {
  const [status, setStatus] = useState(initialStatus || "Pending");
  const updateStatusMutation = useUpdateComplaintStatusMutation();
  const loading = updateStatusMutation.isPending;

  useEffect(() => {
    setStatus(initialStatus || "Pending");
  }, [initialStatus]);

  const handleToggle = async (action) => {
    try {
      const res = await updateStatusMutation.mutateAsync({
        id,
        status: action,
      });

      if (res?.code === 200 || res?.code === 201 || res?.status === true) {
        setStatus(action);
        onSuccess?.();
        toast.success(res.message || `Status changed to ${action}`);
      } else {
        toast.error(res?.message || "Unable to update status");
      }
    } catch (err) {
      toast.error(err?.message || "Unable to update status");
    }
  };

  const normalizedStatus = status?.toLowerCase();
  const statusStyle =
    normalizedStatus === "resolved" || normalizedStatus === "approved"
      ? "bg-green-100 text-green-700 border-green-200"
      : normalizedStatus === "cancel" || normalizedStatus === "rejected" || normalizedStatus === "cancelled"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-yellow-100 text-yellow-700 border-yellow-200";

  return (
    <div className="flex items-center gap-2">
      {loading && <RefreshCcw className="h-4 w-4 animate-spin text-blue-500" />}

      <Select
        onValueChange={(value) => handleToggle(value)}
        disabled={loading}
      >
        {normalizedStatus === "pending" ? (
          <SelectTrigger
            className={`h-8 w-[150px] text-sm rounded-xl border hover:scale-[1.04] transition-all duration-200 ${statusStyle}`}
          >
            <SelectValue placeholder={status} />
          </SelectTrigger>
        ) : (
          <div
            className={`h-8 w-[150px] text-sm rounded-xl border flex px-3 justify-start items-center ${statusStyle}`}
          >
            {status}
          </div>
        )}

        <SelectContent>
          <SelectItem value="Resolved" className="text-green-700">
            Resolved
          </SelectItem>

          <SelectItem value="Cancel" className="text-red-700">
            Cancel
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ComplaintStatusToggle;
