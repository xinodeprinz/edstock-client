"use client";

import {
  useCreateProductMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "@/state/api";
import { PlusCircleIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";
import Image from "next/image";

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: categories } = useGetCategoriesQuery();

  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsQuery({ search: searchTerm, categoryId });

  const [createProduct] = useCreateProductMutation();
  const handleCreateProduct = async (productData: ProductFormData) => {
    await createProduct(productData);
  };

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !products) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
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
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Add Item
        </button>
      </div>

      {/* BODY PRODUCTS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg-grid-cols-3 gap-10 justify-between">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {products.length > 0 ? (
              <>
                {products?.map((product) => (
                  <div
                    key={product.productId}
                    className="border shadow rounded-md p-4 max-w-full w-full mx-auto"
                  >
                    <div className="flex flex-col items-center">
                      <Image
                        src={
                          product.photo ||
                          `/assets/products/${
                            Math.floor(Math.random() * 16) + 1
                          }.png`
                        }
                        alt={product.name}
                        width={150}
                        height={150}
                        className="mb-3 rounded-2xl w-36 h-36"
                      />
                      <h3 className="text-lg text-gray-900 font-semibold">
                        {product.name}
                      </h3>
                      <p className="text-gray-800">
                        {product.price.toLocaleString()} XAF
                      </p>
                      <div className="text-sm text-gray-600 mt-1">
                        Stock: {product.stockQuantity}
                      </div>
                      {product.rating && (
                        <div className="flex items-center mt-2">
                          <Rating rating={product.rating} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center col-span-2 p-4 text-gray-500">
                There are no items under this category or no results match your
                search
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />
    </div>
  );
};

export default Products;
