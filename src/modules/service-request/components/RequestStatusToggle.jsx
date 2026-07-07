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
import { useUpdateRequestStatusMutation } from "../hooks/useRequest";

const RequestStatusToggle = ({ initialStatus, id, onSuccess }) => {
  const [status, setStatus] = useState(initialStatus || "Pending");
  const updateStatusMutation = useUpdateRequestStatusMutation();
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
    normalizedStatus === "approved"
      ? "pill-approved"
      : normalizedStatus === "cancel" || normalizedStatus === "rejected" || normalizedStatus === "cancelled"
        ? "pill-rejected"
        : "pill-pending";

  return (
    <div className="flex items-center gap-2">
      {loading && <RefreshCcw className="h-3.5 w-3.5 animate-spin text-[var(--primary-color)]" />}

      <Select
        onValueChange={(value) => handleToggle(value)}
        disabled={loading}
      >
        {normalizedStatus === "pending" ? (
          <SelectTrigger
            className={`pill ${statusStyle} !flex h-8 w-[125px] items-center justify-between border-0 shadow-none hover:scale-[1.04] transition-all cursor-pointer`}
          >
            <SelectValue placeholder={status} />
          </SelectTrigger>
        ) : (
          <div
            className={`pill ${statusStyle} h-8 w-[125px] !flex items-center justify-center`}
          >
            {normalizedStatus === "cancel" || normalizedStatus === "cancelled" ? "Cancelled" : status}
          </div>
        )}

        <SelectContent>
          <SelectItem value="Approved" className="text-green-700 font-medium">
            Approved
          </SelectItem>

          <SelectItem value="Cancel" className="text-red-700 font-medium">
            Cancel
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RequestStatusToggle;
