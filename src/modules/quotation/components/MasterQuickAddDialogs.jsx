import React, { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import SelectWithAdd from "@/components/common/select-with-add";

// Generic 1-field quick-add (Floor / Area / Brand) — name only, auto-select after save.
export function QuickNameDialog({
  open,
  onClose,
  onSave,
  saving = false,
  title = "Add New",
  label = "Name",
  placeholder = "Enter name",
  initialName = "",
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialName || "");
      setError("");
    }
  }, [open, initialName]);

  const handleSave = (e) => {
    e?.preventDefault?.();
    if (!name.trim()) {
      setError(`${label} is required`);
      return;
    }
    onSave?.(name.trim());
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose?.()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Quickly add without leaving the quotation form. It will be auto-selected.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>
              {label} <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Add
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Full product quick-add — mirrors Product master create page exactly:
// no required markers (master has none), only price-if-present validation.
export function ProductQuickAddDialog({
  open,
  onClose,
  onSave,
  saving = false,
  services = [],
  categories = [],
  brands = [],
  initialName = "",
  initialServiceId = "",
  initialCategoryId = "",
  brandSaving = false,
  onAddBrand,
}) {
  const [form, setForm] = useState({
    product_name: "",
    service_id: "",
    category_id: "",
    brand_id: "",
    product_price: "",
    product_warranty: "",
    product_module: "",
  });
  const [errors, setErrors] = useState({});
  const [newBrand, setNewBrand] = useState("");
  const [showBrandAdd, setShowBrandAdd] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        product_name: initialName || "",
        service_id: initialServiceId || "",
        category_id: initialCategoryId || "",
        brand_id: "",
        product_price: "",
        product_warranty: "",
        product_module: "",
      });
      setErrors({});
      setNewBrand("");
      setShowBrandAdd(false);
    }
  }, [open, initialName, initialServiceId, initialCategoryId]);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const handleSaveBrand = async () => {
    if (!newBrand.trim() || !onAddBrand) return;
    const id = await onAddBrand(newBrand.trim());
    if (id) {
      set("brand_id", id);
      setNewBrand("");
      setShowBrandAdd(false);
    }
  };

  const handleSave = (e) => {
    e?.preventDefault?.();
    // Same as Product master: only price-if-present is validated.
    const errs = {};
    if (form.product_price && (isNaN(Number(form.product_price)) || Number(form.product_price) <= 0))
      errs.product_price = "Price must be a valid positive number";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    // Same payload shape as master (strings passthrough, blanks allowed).
    onSave?.({
      product_name: form.product_name.trim(),
      service_id: form.service_id || "",
      category_id: form.category_id || "",
      brand_id: form.brand_id || "",
      product_price: form.product_price || "",
      product_warranty: form.product_warranty?.trim() || "",
      product_module: form.product_module?.trim() || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose?.()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Quickly add a product without leaving the quotation. It will be auto-selected in the row.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Product Name</Label>
            <Input
              value={form.product_name}
              onChange={(e) => set("product_name", e.target.value)}
              placeholder="e.g. 8M - 1 Fan, 8 Control"
              autoFocus
            />
            {errors.product_name && <p className="text-xs text-red-500">{errors.product_name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Service</Label>
              <SelectWithAdd
                value={form.service_id}
                onChange={(o) => set("service_id", o ? o.value : "")}
                options={services.map((s) => ({
                  value: s.id?.toString(),
                  label: s.service_name,
                }))}
                placeholder="Select Service"
                showAddButton={false}
              />
              {errors.service_id && <p className="text-xs text-red-500">{errors.service_id}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <SelectWithAdd
                value={form.category_id}
                onChange={(o) => set("category_id", o ? o.value : "")}
                options={categories.map((c) => ({
                  value: c.id?.toString(),
                  label: c.category_name,
                }))}
                placeholder="Select Category"
                showAddButton={false}
              />
              {errors.category_id && <p className="text-xs text-red-500">{errors.category_id}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Brand</Label>
              <button
                type="button"
                onClick={() => setShowBrandAdd((v) => !v)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3.5 h-3.5" /> New Brand
              </button>
            </div>
            <SelectWithAdd
              value={form.brand_id}
              onChange={(o) => set("brand_id", o ? o.value : "")}
              options={brands.map((b) => ({
                value: b.id?.toString(),
                label: b.brand_name,
              }))}
              placeholder="Select Brand"
              addLabel="Add New Brand"
              renderAddLabel={(t) => (t?.trim() ? `Add "${t.trim()}" as New Brand` : "Add New Brand")}
              onAdd={(typed) => {
                setNewBrand((typed || "").trim());
                setShowBrandAdd(true);
              }}
            />
            {errors.brand_id && <p className="text-xs text-red-500">{errors.brand_id}</p>}
            {showBrandAdd && (
              <div className="flex gap-2">
                <Input
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="New brand name"
                  className="h-9"
                />
                <Button type="button" size="sm" className="h-9 shrink-0" onClick={handleSaveBrand} disabled={brandSaving || !newBrand.trim()}>
                  {brandSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Price (₹)</Label>
              <Input
                type="number"
                min="0"
                value={form.product_price}
                onChange={(e) => set("product_price", e.target.value)}
                placeholder="0"
              />
              {errors.product_price && <p className="text-xs text-red-500">{errors.product_price}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Warranty (In Years)</Label>
              <Input
                value={form.product_warranty}
                onChange={(e) => set("product_warranty", e.target.value)}
                placeholder="e.g. 5 Years"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Product Module</Label>
              <Input
                value={form.product_module}
                onChange={(e) => set("product_module", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Service quick-add — mirrors Service master create page exactly:
// name + logo + one sub-banner required (same messages), rest same payload.
export function ServiceQuickAddDialog({
  open,
  onClose,
  onSave,
  saving = false,
  initialName = "",
}) {
  const [serviceName, setServiceName] = useState("");
  const [serviceLogo, setServiceLogo] = useState(null);
  const [serviceBanner, setServiceBanner] = useState(null);
  const [serviceLink, setServiceLink] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setServiceName(initialName || "");
      setServiceLogo(null);
      setServiceBanner(null);
      setServiceLink("");
      setErrors({});
    }
  }, [open, initialName]);

  const handleSave = (e) => {
    e?.preventDefault?.();
    // Same validation + messages as Service master page.
    const errs = {};
    if (!serviceName.trim()) errs.service_name = "Service Name is required";
    if (!serviceLogo) errs.service_logo = "Service Logo is required";
    if (!serviceBanner) errs.service_sub_banner = "Sub banner is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill all required fields");
      return;
    }
    // Same FormData shape as master create.
    const fd = new FormData();
    fd.append("service_name", serviceName.trim());
    fd.append("service_url", "");
    fd.append("service_status", "Active");
    fd.append("service_logo", serviceLogo);
    fd.append("subs[0][service_sub_banner]", serviceBanner);
    fd.append("subs[0][service_sub_link]", serviceLink.trim());
    fd.append("subs[0][service_sub_status]", "Active");
    onSave?.(fd);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose?.()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
          <DialogDescription>
            Same fields as Service master. It will be auto-selected in the row.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>
              Service Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. CCTV & Security"
              autoFocus
            />
            {errors.service_name && <p className="text-xs text-red-500">{errors.service_name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>
              Service Logo <span className="text-red-500">*</span>
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setServiceLogo(e.target.files?.[0] || null)}
            />
            {serviceLogo && <p className="text-xs text-slate-500">{serviceLogo.name}</p>}
            {errors.service_logo && <p className="text-xs text-red-500">{errors.service_logo}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>
              Sub Banner <span className="text-red-500">*</span>
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setServiceBanner(e.target.files?.[0] || null)}
            />
            {serviceBanner && <p className="text-xs text-slate-500">{serviceBanner.name}</p>}
            {errors.service_sub_banner && <p className="text-xs text-red-500">{errors.service_sub_banner}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Sub Link</Label>
            <Input
              value={serviceLink}
              onChange={(e) => setServiceLink(e.target.value)}
              placeholder="Optional link"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Add Service
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
