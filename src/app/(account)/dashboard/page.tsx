"use client";

import {
  useCreateProductMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  Product,
} from "@/state/api";
import {
  PlusCircleIcon,
  SearchIcon,
  Pencil,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import { useState, useMemo } from "react";
import Header from "@/app/(components)/Header";
import CreateProductModal from "./CreateProductModal";
import Image from "next/image";
import { getPhoto, getUser } from "@/app/lib/helpers";

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
  photo?: string;
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const user = getUser();
  const canPerform = !!(
    user &&
    ["SUPER_ADMIN", "INVENTORY_MANAGER", "WAREHOUSE_STAFF"].includes(user.role)
  );

  const { data: categories } = useGetCategoriesQuery();

  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useGetProductsQuery({ search: searchTerm, categoryId });

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // Sort products based on the selected field and direction
  const sortedProducts = useMemo(() => {
    if (!products) return [];

    return [...products].sort((a, b) => {
      let aValue = a[sortField as keyof Product];
      let bValue = b[sortField as keyof Product];

      // Handle special cases
      if (sortField === "category") {
        aValue =
          categories?.find((c) => c.categoryId === a.categoryId)?.name || "";
        bValue =
          categories?.find((c) => c.categoryId === b.categoryId)?.name || "";
      }

      // For string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // For number comparison
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [products, sortField, sortDirection, categories]);

  const handleCreateProduct = async (productData: ProductFormData) => {
    // Add SKU if it doesn't exist
    if (!productData.sku) {
      productData.sku = `SKU-${Math.floor(Math.random() * 10000)}`;
    }

    // Prepare form data
    const formData = new FormData();
    Object.entries(productData).map(([key, value]) =>
      formData.append(key, value)
    );

    await createProduct(formData);
    setIsModalOpen(false);
    refetch();
  };

  const handleEditClick = (product: Product) => {
    setCurrentProduct(product);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleUpdateProduct = async (productData: ProductFormData) => {
    // Prepare form data
    const formData = new FormData();
    Object.entries(productData).map(([key, value]) =>
      formData.append(key, value)
    );

    if (productData.productId) {
      await updateProduct({ productId: productData.productId, formData });
      setIsModalOpen(false);
      setIsEditMode(false);
      setCurrentProduct(null);
      refetch();
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(productId);
      refetch();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentProduct(null);
  };

  const handleFormSubmit = (productData: ProductFormData) => {
    if (isEditMode) {
      handleUpdateProduct(productData);
    } else {
      handleCreateProduct(productData);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Format date - this would normally come from the API
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !products) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch inventory items
      </div>
    );
  }

  return (
    <div className="mx-auto pb-5 w-full">
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row gap-5 justify-between items-center mb-6">
        <Header name="Inventory" />
        {categories && categories.length > 0 && (
          <select
            className="p-2 border border-gray-300 w-52 rounded bg-white focus:outline-none focus:border-blue-500"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option value={c.categoryId} key={c.categoryId}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        {canPerform && (
          <button
            className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
            onClick={() => {
              setIsEditMode(false);
              setCurrentProduct(null);
              setIsModalOpen(true);
            }}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Add Item
          </button>
        )}
      </div>

      {/* INVENTORY TABLE */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("productId")}
              >
                <div className="flex items-center">
                  ID
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("sku")}
              >
                <div className="flex items-center">
                  SKU
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Name
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center">
                  Price
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("stockQuantity")}
              >
                <div className="flex items-center">
                  Stock
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("location")}
              >
                <div className="flex items-center">
                  Location
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  Date Added
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              {canPerform && (
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="h-12 w-12 flex-shrink-0">
                      <Image
                        src={
                          product.photo
                            ? getPhoto(product.photo)
                            : `/assets/products/${
                                Math.floor(Math.random() * 16) + 1
                              }.png`
                        }
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                    {product.productId.substring(0, 8)}...
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                    {product.sku || `SKU-${Math.floor(Math.random() * 10000)}`}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">
                      {product.price.toLocaleString()} XAF
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stockQuantity > 10
                          ? "bg-green-100 text-green-800"
                          : product.stockQuantity > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                    {categories?.find(
                      (c) => c.categoryId === product.categoryId
                    )?.name || "Uncategorized"}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                    {product.location || "Warehouse A"}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(product.createdAt || "01/01/2025")}
                  </td>
                  {canPerform && (
                    <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit item"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.productId)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-6 text-center text-gray-500">
                  No inventory items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <CreateProductModal
        categories={categories || []}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={handleFormSubmit}
        initialData={isEditMode ? currentProduct : null}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default Products;
