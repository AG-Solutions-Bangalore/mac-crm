import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronDown,
  Pencil,
  Plus,
  Users,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateSalesTeamMemberMutation,
  useUpdateSalesTeamMemberMutation,
} from "../../../sales-team/hooks/useSalesTeam";

const EMPTY_FORM = { name: "", email: "", mobile: "" };

export default function PreparedByPicker({
  value,
  options = [],
  onChange,
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dialogMode, setDialogMode] = useState(null); // 'add' | 'edit'
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const createMutation = useCreateSalesTeamMemberMutation();
  const updateMutation = useUpdateSalesTeamMemberMutation();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const selected = options.find((p) => String(p.id) === String(value));

  const searchTerm = query.trim().toLowerCase();
  const filteredOptions = searchTerm
    ? options.filter((p) =>
        [p.name, p.phone, p.email]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(searchTerm))
      )
    : options;

  const openAdd = () => {
    setErrors({});
    setEditingMember(null);
    setForm(EMPTY_FORM);
    setDialogMode("add");
    setOpen(false);
  };

  const openEdit = (member) => {
    setErrors({});
    setEditingMember(member);
    setForm({
      name: member.name || "",
      email: member.email || "",
      mobile: member.mobile || member.phone || "",
    });
    setDialogMode("edit");
    setOpen(false);
  };

  const closeDialog = () => {
    if (isSaving) return;
    setDialogMode(null);
    setEditingMember(null);
    setErrors({});
  };

  const validate = () => {
    const nextErrors = {};
    const email = form.email.trim();
    const mobileDigits = form.mobile.replace(/\D/g, "");

    if (!form.name.trim()) nextErrors.name = "Name is required";
    // Email is optional — validate format only when filled
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!form.mobile.trim()) {
      nextErrors.mobile = "Mobile number is required";
    } else if (
      !/^[\d\s()+-]+$/.test(form.mobile.trim()) ||
      mobileDigits.length < 10 ||
      mobileDigits.length > 13
    ) {
      nextErrors.mobile = "Enter a valid mobile number (10–13 digits)";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
    };

    try {
      if (dialogMode === "edit" && editingMember) {
        await updateMutation.mutateAsync({
          id: editingMember.id,
          data: { ...payload, status: editingMember.status || "Active" },
        });
        toast.success("Member updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Member added successfully");
      }
      setDialogMode(null);
      setEditingMember(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save member"
      );
    }
  };

  const updateField = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            title="Prepared by — search, add or edit members"
            className="w-full flex h-[46px] shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[11px] font-semibold outline-none transition-colors hover:border-sky-400 focus:border-sky-400"
          >
            <span className="max-w-[220px] truncate text-xs font-bold text-foreground">
              {selected ? `${selected.name} · ${selected.phone}` : "Select member"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-[320px] p-0">
          {/* Search */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search member..."
              className="h-7 w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Member list */}
          <div className="max-h-[260px] overflow-y-auto p-1">
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Sales Team
            </div>
            {filteredOptions.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                No member found.
              </p>
            ) : (
              filteredOptions.map((p) => {
                const isSelected = String(p.id) === String(value);
                const canEdit = p.isApiMember === true;
                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      onChange?.(p.id);
                      setOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChange?.(p.id);
                        setOpen(false);
                      }
                    }}
                    className="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 outline-none hover:bg-muted focus:bg-muted"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold">
                          {p.name}
                        </span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                        )}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {[p.phone, p.email].filter(Boolean).join(" · ")}
                      </div>
                    </div>

                    {canEdit && (
                      <button
                        type="button"
                        title={`Edit ${p.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(p);
                        }}
                        className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground group-hover:opacity-100 focus:opacity-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick actions */}
          <div className="border-t p-1">
            <button
              type="button"
              onClick={openAdd}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <Plus className="h-3.5 w-3.5 text-sky-600" />
              Add member
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/sales-team-list");
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <Users className="h-3.5 w-3.5 text-sky-600" />
              Manage sales team
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog
        open={Boolean(dialogMode)}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "edit" ? "Edit Member" : "Add Member"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "edit"
                ? "Update this member's details."
                : "This member will appear in the Prepared By dropdown."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="prepared-name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prepared-name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Mr. Vinod Kumar"
                className={
                  errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
                }
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prepared-email">
                Email
              </Label>
              <Input
                id="prepared-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="e.g. vinod@makcautomations.com"
                className={
                  errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                }
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prepared-mobile">
                Mobile <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prepared-mobile"
                value={form.mobile}
                onChange={(e) => updateField("mobile", e.target.value)}
                placeholder="e.g. 7338504441"
                className={
                  errors.mobile ? "border-red-500 focus-visible:ring-red-500" : ""
                }
              />
              {errors.mobile && (
                <p className="text-xs text-red-500">{errors.mobile}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
