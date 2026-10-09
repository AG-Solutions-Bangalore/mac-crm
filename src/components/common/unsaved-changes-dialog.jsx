import React from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * UnsavedChangesDialog — pure shadcn AlertDialog (no native confirm/alert).
 * SPA navigation (sidebar / Back / Cancel / browser-back) par yahi khulta hai.
 * Note: browser refresh / tab-close par browser khud native prompt dikhata hai,
 * us jagah koi custom/shadcn UI render karna browsers allow nahi karte.
 */
const UnsavedChangesDialog = ({
  open,
  onStay,
  onLeaveWithoutSaving,
  onSaveAndLeave,
  isSaving = false,
}) => {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        // Overlay click / Ctrl+W jaisi dismiss koshish par Stay hi karo —
        // bina choice ke dialog band mat hone do (jab tak saving na ho).
        if (!next && !isSaving) onStay?.();
      }}
    >
      <AlertDialogContent
        data-unsaved-dialog="true"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-amber-500" />
            Unsaved changes
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes on this quotation. If you leave now, all
            your work will be lost. Do you want to save before leaving?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onStay}
            disabled={isSaving}
          >
            Stay
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onLeaveWithoutSaving}
            disabled={isSaving}
          >
            Leave without saving
          </Button>
          <Button type="button" onClick={onSaveAndLeave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save & Leave"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnsavedChangesDialog;
