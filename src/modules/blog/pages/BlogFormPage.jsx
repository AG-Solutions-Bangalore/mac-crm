import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Hash,
  Link2,
  Loader2,
  Save,
  Star,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CKEditor } from "ckeditor4-react";
import PageHeader from "@/components/common/page-header";
import RedStar from "@/components/RedStar";
import ImageUpload from "@/components/image-upload/image-upload";
import { GroupButton } from "@/components/group-button";
import { MemoizedSelect } from "@/components/common/memoized-select";
import LoadingBar from "@/components/loader/loading-bar";
import { getImageBaseUrl, getNoImageUrl } from "@/utils/imageUtils";
import {
  useActiveServicesQuery,
  useBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
} from "../hooks/useBlog";

/* ---------- helpers ---------- */

const generateSlug = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const toOneOrZero = (v) => {
  if (v === true || v === 1 || v === "1") return 1;
  return 0;
};

const toYesOrNo = (v) => {
  if (v === true || v === 1 || v === "1") return "Yes";
  if (typeof v === "string" && v.toLowerCase() === "yes") return "Yes";
  return "No";
};

/* ---------- component ---------- */

const BlogFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    blog_slug: "",
    blog_index: "Yes",
    blog_title: "",
    blog_short_description: "",
    blog_description: "",
    blog_banner_image: null,
    blog_banner_image_alt: "",
    blog_meta_title: "",
    blog_meta_description: "",
    blog_meta_keywords: "",
    blog_front: 0,
    blog_featured: "No",
    blog_status: "Active",
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const editorInstanceRef = useRef(null);

  // queries / mutations
  const { data: fetchedData, isLoading: isFetching, isError } = useBlogQuery(id, isEdit);
  const { data: activeServicesData, isLoading: isLoadingServices } = useActiveServicesQuery();
  const createMutation = useCreateBlogMutation();
  const updateMutation = useUpdateBlogMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const categoryOptions = useMemo(() => {
    const list = Array.isArray(activeServicesData?.data?.data)
      ? activeServicesData.data.data
      : Array.isArray(activeServicesData?.data)
      ? activeServicesData.data
      : Array.isArray(activeServicesData)
      ? activeServicesData
      : [];
    return list.map((s) => ({
      value: s.id,
      label: s.service_name || s.name || `Service #${s.id}`,
    }));
  }, [activeServicesData]);

  // hydrate on edit
  useEffect(() => {
    if (!isEdit || !fetchedData) return;

    let blog = fetchedData?.data;
    if (Array.isArray(blog)) {
      blog = blog[0];
    } else if (blog && typeof blog === "object" && "data" in blog) {
      blog = Array.isArray(blog.data) ? blog.data[0] : blog.data;
    }
    if (!blog || typeof blog !== "object") return;

    const IMAGE_FOR = "Blog";
    const baseUrl = blog.blog_url || getImageBaseUrl(fetchedData?.image_url, IMAGE_FOR);
    const noImg = getNoImageUrl(fetchedData?.image_url);

    const description = blog.blog_description || "";

    setFormData({
      blog_slug: blog.blog_slug || "",
      blog_index: toYesOrNo(blog.blog_index),
      blog_title: blog.blog_title || "",
      blog_short_description: blog.blog_short_description || "",
      blog_description: description,
      blog_banner_image: blog.blog_banner_image || null,
      blog_banner_image_alt: blog.blog_banner_image_alt || "",
      blog_meta_title: blog.blog_meta_title || "",
      blog_meta_description: blog.blog_meta_description || "",
      blog_meta_keywords: blog.blog_meta_keywords || "",
      blog_front: toOneOrZero(blog.blog_front),
      blog_featured: toYesOrNo(blog.blog_featured),
      blog_status: blog.blog_status || "Active",
    });

    if (editorInstanceRef.current && description) {
      if (editorInstanceRef.current.getData() !== description) {
        editorInstanceRef.current.setData(description);
      }
    }

    if (blog.blog_banner_image && (baseUrl || blog.blog_url)) {
      setPreviewImage(`${baseUrl}${blog.blog_banner_image}?t=${Date.now()}`);
    } else if (noImg) {
      setPreviewImage(noImg);
    }

    // Pre-fill selected categories from all possible backend fields
    const rawCategories =
      blog.blog_categories ??
      blog.blog_categories_ids ??
      blog.blog_category_ids ??
      blog.blog_category_id ??
      blog.blog_categories_id ??
      blog.blog_category ??
      blog.categories ??
      blog.category_ids ??
      blog.category_id ??
      blog.services ??
      blog.service_ids;

    if (rawCategories !== undefined && rawCategories !== null && rawCategories !== "") {
      let parsedItems = [];
      if (Array.isArray(rawCategories)) {
        parsedItems = rawCategories;
      } else if (typeof rawCategories === "string") {
        const trimmed = rawCategories.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          try {
            parsedItems = JSON.parse(trimmed);
          } catch {
            parsedItems = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
          }
        } else {
          parsedItems = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
        }
      } else if (typeof rawCategories === "number") {
        parsedItems = [rawCategories];
      }

      const mapped = parsedItems
        .map((item) => {
          if (item && typeof item === "object") {
            const val = item.value ?? item.id ?? item.service_id ?? item;
            const lbl = item.label ?? item.service_name ?? item.name ?? String(val);
            const found = categoryOptions.find(
              (opt) =>
                String(opt.value) === String(val) ||
                opt.label?.toLowerCase() === String(lbl).toLowerCase(),
            );
            return found || { value: val, label: lbl };
          }

          const strVal = String(item).trim();
          if (!strVal) return null;
          const found = categoryOptions.find(
            (opt) =>
              String(opt.value) === strVal ||
              opt.label?.toLowerCase() === strVal.toLowerCase(),
          );
          return found || { value: item, label: strVal };
        })
        .filter(Boolean);

      setSelectedCategories(mapped);
    }
  }, [isEdit, fetchedData, categoryOptions]);

  /* ---------- handlers ---------- */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    // auto-generate slug from title on create (until the user edits slug manually)
    if (name === "blog_title" && !isEdit && !formData.blog_slug) {
      setFormData((prev) => ({ ...prev, blog_slug: generateSlug(value) }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, blog_banner_image: "" }));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewImage("");
    setFormData((prev) => ({ ...prev, blog_banner_image: null }));
  };

  /* ---------- validation ---------- */

  const validateForm = () => {
    const newErrors = {};
    if (!formData.blog_title.trim()) {
      newErrors.blog_title = "Blog title is required";
    }
    if (!formData.blog_slug.trim()) {
      newErrors.blog_slug = "Blog slug is required";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.blog_slug.trim())) {
      newErrors.blog_slug = "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    if (!formData.blog_description.trim()) {
      newErrors.blog_description = "Blog description is required";
    }
    if (!isEdit && !selectedFile) {
      newErrors.blog_banner_image = "Banner image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------- submit ---------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const fd = new FormData();
    fd.append("blog_slug", formData.blog_slug);
    fd.append("blog_index", formData.blog_index);
    fd.append("blog_title", formData.blog_title);
    fd.append("blog_short_description", formData.blog_short_description);
    fd.append("blog_description", formData.blog_description);
    fd.append("blog_banner_image_alt", formData.blog_banner_image_alt);
    fd.append("blog_meta_keywords", formData.blog_meta_keywords);
    fd.append("blog_front", String(formData.blog_front));
    fd.append("blog_featured", formData.blog_featured);
    fd.append("blog_status", formData.blog_status);

    if (selectedFile) {
      fd.append("blog_banner_image", selectedFile);
    } else if (isEdit && formData.blog_banner_image) {
      // keep existing image on backend if no new file is provided
      fd.append("existing_blog_banner_image", formData.blog_banner_image);
    }

    const categoriesValue = selectedCategories.map((c) => c.value).join(",");
    fd.append("blog_categories", categoriesValue);
    fd.append("blog_categories_ids", categoriesValue);

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, data: fd });
        toast.success("Blog updated successfully");
      } else {
        await createMutation.mutateAsync(fd);
        toast.success("Blog created successfully");
      }
      navigate("/blog-list");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.msg ||
          error?.message ||
          "Something went wrong",
      );
    }
  };

  /* ---------- loading / error states ---------- */

  if (isEdit && isFetching) return <LoadingBar />;
  if (isEdit && isError) {
    return (
      <div className="p-5 text-center">
        <p className="text-red-500 font-semibold">Failed to load blog details.</p>
        <Button onClick={() => navigate("/blog-list")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  /* ---------- view ---------- */

  return (
    <div className="w-full px-5">
      <PageHeader
        icon={BookOpen}
        title={isEdit ? "Edit Blog" : "Add Blog"}
        description={
          isEdit
            ? "Update an existing blog post"
            : "Create a new blog post for the portal"
        }
        rightContent={
          <Button variant="outline" onClick={() => navigate("/blog-list")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        }
      />

      <Card className="mt-4">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="blog_title" className="flex items-center gap-1">
                  <Type className="h-4 w-4" /> Blog Title <RedStar />
                </Label>
                <Input
                  id="blog_title"
                  name="blog_title"
                  value={formData.blog_title}
                  onChange={handleChange}
                  placeholder="Enter blog title"
                />
                {errors.blog_title && (
                  <p className="text-xs text-red-500">{errors.blog_title}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="blog_slug" className="flex items-center gap-1">
                  <Link2 className="h-4 w-4" /> Blog Slug <RedStar />
                </Label>
                <Input
                  id="blog_slug"
                  name="blog_slug"
                  value={formData.blog_slug}
                  onChange={handleChange}
                  placeholder="blog-slug-here"
                />
                {errors.blog_slug && (
                  <p className="text-xs text-red-500">{errors.blog_slug}</p>
                )}
                <p className="text-xs text-gray-500">
                  Auto-generates from title. Use lowercase letters, numbers, and hyphens.
                </p>
              </div>

              {/* Index */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Hash className="h-4 w-4" /> Blog Index
                </Label>
                <GroupButton
                  className="w-fit"
                  value={formData.blog_index}
                  onChange={(v) => setFormData((p) => ({ ...p, blog_index: v }))}
                  options={[
                    { label: "Yes", value: "Yes" },
                    { label: "No", value: "No" },
                  ]}
                />
              </div>

              {/* Short description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="blog_short_description">Short Description</Label>
                <Textarea
                  id="blog_short_description"
                  name="blog_short_description"
                  value={formData.blog_short_description}
                  onChange={handleChange}
                  placeholder="Brief summary shown in listings"
                  rows={2}
                />
              </div>

              {/* Full description */}
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-1">
                  Full Article Content <RedStar />
                </Label>
                <div
                  className={`rounded overflow-hidden ${
                    errors.blog_description ? "border border-red-500" : ""
                  }`}
                >
                  <CKEditor
                    key={isEdit ? `edit-${id}` : "create"}
                    initData={formData.blog_description || ""}
                    onInstanceReady={(event) => {
                      editorInstanceRef.current = event.editor;
                      const initialDesc =
                        formData.blog_description ||
                        fetchedData?.data?.blog_description ||
                        "";
                      if (initialDesc) {
                        event.editor.setData(initialDesc);
                      }
                    }}
                    config={{
                      versionCheck: false,
                      toolbar: [
                        {
                          name: "basicstyles",
                          items: ["Bold", "Italic", "Strike"],
                        },
                        {
                          name: "paragraph",
                          items: [
                            "NumberedList",
                            "BulletedList",
                            "-",
                            "Outdent",
                            "Indent",
                          ],
                        },
                        {
                          name: "links",
                          items: ["Link", "Unlink"],
                        },
                        {
                          name: "insert",
                          items: ["Image", "Table"],
                        },
                        {
                          name: "styles",
                          items: ["Styles", "Format"],
                        },
                        { name: "tools", items: ["Maximize"] },
                      ],
                      height: 250,
                      removePlugins: "elementspath",
                      resize_enabled: false,
                    }}
                    onChange={(event) => {
                      const editorData = event.editor.getData();
                      setFormData((prev) => ({
                        ...prev,
                        blog_description: editorData,
                      }));
                      if (errors.blog_description) {
                        setErrors((prev) => ({
                          ...prev,
                          blog_description: "",
                        }));
                      }
                    }}
                  />
                </div>
                {errors.blog_description && (
                  <p className="text-xs text-red-500">{errors.blog_description}</p>
                )}
              </div>

              {/* Banner image */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Banner Image {!isEdit && <RedStar />}
                </Label>
                <ImageUpload
                  id="blog_banner_image"
                  label=""
                  selectedFile={selectedFile}
                  previewImage={previewImage}
                  onFileChange={handleImageChange}
                  onRemove={handleRemoveImage}
                  format="WEBP"
                  allowedExtensions={["webp"]}
                  maxSize={5}
                />
                {errors.blog_banner_image && (
                  <p className="text-xs text-red-500">{errors.blog_banner_image}</p>
                )}
              </div>

              {/* Banner alt */}
              <div className="space-y-2">
                <Label htmlFor="blog_banner_image_alt">Banner Image Alt Text</Label>
                <Input
                  id="blog_banner_image_alt"
                  name="blog_banner_image_alt"
                  value={formData.blog_banner_image_alt}
                  onChange={handleChange}
                  placeholder="Describe the banner image"
                />
              </div>

              {/* Categories (multi-select from /activeServices) */}
              <div className="space-y-2 md:col-span-2">
                <Label>Blog Categories</Label>
                <MemoizedSelect
                  isMulti
                  options={categoryOptions}
                  value={selectedCategories}
                  onChange={setSelectedCategories}
                  placeholder={
                    isLoadingServices
                      ? "Loading categories..."
                      : "Search and select categories"
                  }
                  isLoading={isLoadingServices}
                />
                <p className="text-xs text-gray-500">
                  Categories are sourced from the active services list.
                </p>
              </div>

              {/* Meta keywords */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="blog_meta_keywords">Meta Keywords</Label>
                <Input
                  id="blog_meta_keywords"
                  name="blog_meta_keywords"
                  value={formData.blog_meta_keywords}
                  onChange={handleChange}
                  placeholder="Comma-separated keywords"
                />
              </div>

              {/* Front */}
              <div className="space-y-2">
                <Label>Show on Front?</Label>
                <GroupButton
                  className="w-fit"
                  value={formData.blog_front}
                  onChange={(v) => setFormData((p) => ({ ...p, blog_front: v }))}
                  options={[
                    { label: "1 (Yes)", value: 1 },
                    { label: "0 (No)", value: 0 },
                  ]}
                />
              </div>

              {/* Featured */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Star className="h-4 w-4" /> Featured
                </Label>
                <GroupButton
                  className="w-fit"
                  value={formData.blog_featured}
                  onChange={(v) => setFormData((p) => ({ ...p, blog_featured: v }))}
                  options={[
                    { label: "Yes", value: "Yes" },
                    { label: "No", value: "No" },
                  ]}
                />
              </div>

              {/* Status (edit only — create defaults to Active) */}
              {isEdit && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <GroupButton
                    className="w-fit"
                    value={formData.blog_status}
                    onChange={(v) => setFormData((p) => ({ ...p, blog_status: v }))}
                    options={[
                      { label: "Active", value: "Active" },
                      { label: "Inactive", value: "Inactive" },
                    ]}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/blog-list")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />{" "}
                    {isEdit ? "Update Blog" : "Save Blog"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogFormPage;
