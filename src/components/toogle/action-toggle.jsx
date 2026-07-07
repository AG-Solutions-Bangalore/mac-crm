import { useApiMutation } from "@/hooks/useApiMutation";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ToggleAction = ({
  initialStatus,
  apiUrl,
  payloadKey = "services_request_status",
  method = "patch",
  onSuccess,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const { trigger, loading } = useApiMutation();

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleToggle = async (action) => {
    const formData = new FormData();
    formData.append(payloadKey, action);

    try {
      const res = await trigger({
        url: apiUrl,
        method,
        data: formData,
        // headers: {
        //   "Content-Type": "multipart/form-data",
        // },
      });

      if (res?.code === 200 || res?.code === 201) {
        setStatus(action);
        onSuccess?.();

        toast.success(res.message, {
          description: `Status changed to ${action}`,
        });
      } else {
        toast.error(res?.message || "Unable to update status");
      }
    } catch (err) {
      toast.error(err?.message || "Unable to update status");
    }
  };

  const statusStyle =
    status === "Approved"
      ? "pill-approved"
      : status === "Cancel" || status === "Rejected"
        ? "pill-rejected"
        : "pill-pending";

  return (
    <div className={`flex items-center gap-2`}>
      {loading && <RefreshCcw className="h-3.5 w-3.5 animate-spin text-[var(--primary-color)]" />}

      <Select
        onValueChange={(value) => handleToggle(value)}
        disabled={loading}
      >
        {status === "Pending" ? (
          <SelectTrigger
            className={`pill ${statusStyle} !flex h-8 w-[125px] items-center justify-between border-0 shadow-none hover:scale-[1.04] transition-all cursor-pointer`}
          >
            <SelectValue placeholder={status} />
          </SelectTrigger>
        ) : (
          <div
            className={`pill ${statusStyle} h-8 w-[125px] !flex items-center justify-center`}
          >
            {status === "Cancel" ? "Cancelled" : status}
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

export default ToggleAction;
