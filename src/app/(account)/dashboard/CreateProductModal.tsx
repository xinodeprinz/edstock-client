import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  useRef,
} from "react";
import { v4 } from "uuid";
import Header from "@/app/(components)/Header";
import { Category } from "@/state/api";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import Rating from "@/app/(components)/Rating";
import Image from "next/image";

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
  categoryId: string;
  productId?: string;
  sku?: string;
  location?: string;
  supplier?: string;
  photo?: string | null | File;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: ProductFormData) => void;
  categories: Category[];
  initialData?: any; // Product data for edit mode
  isEditMode?: boolean;
};

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
  categories,
  initialData = null,
  isEditMode = false,
}: CreateProductModalProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    productId: v4(),
    name: "",
    price: 0,
    stockQuantity: 0,
    rating: 0,
    categoryId: "",
    sku: "",
    location: "",
    supplier: "",
    photo: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate a SKU
  const generateSku = () => {
    return `SKU-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;
  };

  // Reset form or populate with initial data when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialData) {
        setFormData({
          productId: initialData.productId,
          name: initialData.name || "",
          price: initialData.price || 0,
          stockQuantity: initialData.stockQuantity || 0,
          rating: initialData.rating || 0,
          categoryId: initialData.categoryId || "",
          sku: initialData.sku || generateSku(),
          location: initialData.location || "",
          supplier: initialData.supplier || "",
          photo: initialData.photo || null,
        });

        // Set preview if photo exists
        if (initialData.photo) {
          setPreviewUrl(initialData.photo);
        } else {
          setPreviewUrl(null);
        }
      } else {
        setFormData({
          productId: v4(),
          name: "",
          price: 0,
          stockQuantity: 0,
          rating: 0,
          categoryId: "",
          sku: generateSku(),
          location: "",
          supplier: "",
          photo: null,
        });
        setPreviewUrl(null);
      }
    }
  }, [isOpen, initialData, isEditMode]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "stockQuantity"
          ? parseFloat(value)
          : value,
    });
  };

  const handleRatingChange = (newRating: number) => {
    setFormData({ ...formData, rating: newRating });
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Here in a real implementation, you would upload the file to your server/cloud storage
      // and get back a URL. For now, we'll create a local object URL for preview.
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // In a real implementation, you'd store the URL returned from your upload service
      // For now, we'll simulate this by storing the file name
      setFormData({
        ...formData,
        photo: file, // This is simplified - in reality you'd use the URL from your upload service
      });
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreate(formData);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  const labelCssStyles = "block text-sm font-medium text-gray-700 mb-1";
  const inputCssStyles =
    "block w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20 flex items-center justify-center">
      <div className="relative mx-auto p-6 border w-full max-w-3xl shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <Header
            name={isEditMode ? "Edit Inventory Item" : "Add New Inventory Item"}
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-2 text-gray-700 border-b pb-1">
                Basic Information
              </h3>
            </div>

            {/* Photo Upload */}
            <div className="md:col-span-2 mb-4">
              <label className={labelCssStyles}>Item Photo</label>
              <div className="flex items-start space-x-4">
                <div
                  className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                  onClick={triggerFileInput}
                >
                  {previewUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={previewUrl}
                        alt="Product preview"
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500">Click to upload</p>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">
                    Upload a product image (optional)
                  </p>
                  <p className="text-xs text-gray-500">
                    Recommended: Square JPG or PNG, max 2MB
                  </p>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Browse files
                  </button>
                </div>
              </div>
            </div>

            {/* PRODUCT NAME */}
            <div className="mb-4">
              <label htmlFor="name" className={labelCssStyles}>
                Item Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Product name"
                onChange={handleChange}
                value={formData.name}
                className={inputCssStyles}
                required
              />
            </div>

            {/* SKU */}
            <div className="mb-4">
              <label htmlFor="sku" className={labelCssStyles}>
                SKU *
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                placeholder="Stock Keeping Unit"
                onChange={handleChange}
                value={formData.sku}
                className={inputCssStyles}
                required
              />
            </div>

            {/* PRICE */}
            <div className="mb-4">
              <label htmlFor="price" className={labelCssStyles}>
                Price (XAF) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                placeholder="0.00"
                min="0"
                step="0.01"
                onChange={handleChange}
                value={formData.price}
                className={inputCssStyles}
                required
              />
            </div>

            {/* STOCK QUANTITY */}
            <div className="mb-4">
              <label htmlFor="stockQuantity" className={labelCssStyles}>
                Stock Quantity *
              </label>
              <input
                type="number"
                id="stockQuantity"
                name="stockQuantity"
                placeholder="0"
                min="0"
                onChange={handleChange}
                value={formData.stockQuantity}
                className={inputCssStyles}
                required
              />
            </div>

            {/* Additional Information */}
            <div className="md:col-span-2 mt-2">
              <h3 className="text-lg font-semibold mb-2 text-gray-700 border-b pb-1">
                Additional Information
              </h3>
            </div>

            {/* CATEGORY_ID */}
            <div className="mb-4">
              <label htmlFor="categoryId" className={labelCssStyles}>
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                onChange={handleChange}
                value={formData.categoryId}
                className={inputCssStyles}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="mb-4">
              <label htmlFor="location" className={labelCssStyles}>
                Storage Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="e.g., Warehouse A, Shelf B4"
                onChange={handleChange}
                value={formData.location}
                className={inputCssStyles}
              />
            </div>

            {/* Supplier */}
            <div className="mb-4">
              <label htmlFor="supplier" className={labelCssStyles}>
                Supplier
              </label>
              <input
                type="text"
                id="supplier"
                name="supplier"
                placeholder="e.g., ABC Suppliers Ltd."
                onChange={handleChange}
                value={formData.supplier}
                className={inputCssStyles}
              />
            </div>

            {/* RATING */}
            <div className="mb-4">
              <label htmlFor="rating" className={labelCssStyles}>
                Rating
              </label>
              <div className="flex items-center">
                <Rating
                  rating={formData.rating}
                  onRatingChange={handleRatingChange}
                  editable={true}
                />
                <span className="ml-2 text-gray-600">
                  {formData.rating} of 5
                </span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-2 mt-6 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isEditMode ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
