import { useApiMutation } from "@/hooks/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const ToggleStatus = ({
  initialStatus,
  apiUrl,
  payloadKey = "status",
  activeValue = "Active",
  inactiveValue = "Inactive",
  method = "PUT",
  onSuccess,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const { trigger, loading } = useApiMutation();
  const queryClient = useQueryClient();

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleToggle = async () => {
    const newStatus = status === activeValue ? inactiveValue : activeValue;

    try {
      const res = await trigger({
        url: apiUrl,
        method,
        data: {
          [payloadKey]: newStatus,
        },
      });

      if (res?.code === 200 || res?.code === 201) {
        setStatus(newStatus);
        queryClient.invalidateQueries();
        onSuccess?.();

        toast.success(res.message, {
          description: `Status changed to ${newStatus}`,
        });
      } else {
        toast.error(res?.message || "Unable to update status");
      }
    } catch (err) {
      toast.error(err?.message || "Unable to update status");
    }
  };

  return (
    <div className="flex items-center gap-3 px-1 py-1 min-w-[120px]">
      <Switch
        checked={status === activeValue}
        onCheckedChange={handleToggle}
        disabled={loading}
        className="shrink-0"
      />
      <span className={`text-xs font-bold leading-none select-none w-[55px] inline-block shrink-0 ${
        status === activeValue
          ? "text-[var(--success)]"
          : "text-[var(--ink-soft)]"
      }`}>
        {status}
      </span>
      <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
        {loading && <RefreshCcw className="h-3 w-3 animate-spin text-[var(--ink-soft)]" />}
      </div>
    </div>
  );
};

export default ToggleStatus;
