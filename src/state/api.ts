import { UserFormData } from "@/app/(account)/users/CreateUserModal";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  photo: string | null;
  categoryId?: string;
  sku?: string;
  location?: string;
  supplier?: string;
  createdAt?: string;
}

export interface Category {
  categoryId: string;
  name: string;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  categoryId?: string;
  photo?: string | null;
  sku?: string;
  location?: string;
  supplier?: string;
}

export interface UpdateProduct {
  productId: string;
  name?: string;
  price?: number;
  rating?: number;
  stockQuantity?: number;
  categoryId?: string;
  photo?: string | null;
  sku?: string;
  location?: string;
  supplier?: string;
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummarId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface UpdateProductBody {
  productId: string;
  formData: FormData;
}

export interface User {
  userId: string;
  name: string;
  email: string;
}

interface ProductParams {
  search?: string;
  categoryId?: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  reducerPath: "api",
  tagTypes: ["DashboardMetrics", "Products", "Users", "Expenses", "Categories"],
  endpoints: (build) => ({
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => "/dashboard",
      providesTags: ["DashboardMetrics"],
    }),
    getProducts: build.query<Product[], ProductParams>({
      query: ({ search, categoryId }) => ({
        url: "/products",
        params: { search, categoryId },
      }),
      providesTags: ["Products"],
    }),
    getCategories: build.query<Category[], string | void>({
      query: () => ({
        url: "/products/categories",
      }),
      providesTags: ["Categories"],
    }),
    createProduct: build.mutation<Product, FormData>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation<Product, UpdateProductBody>({
      query: ({ productId, formData }) => ({
        url: `/products/${productId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
    deleteUser: build.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
    uploadProductImage: build.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: "/upload/product-image",
        method: "POST",
        body: formData,
      }),
    }),
    createUser: build.mutation<UserFormData, UserFormData>({
      query: (newUser) => ({
        url: "/users",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["Users"],
    }),
    getUsers: build.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useCreateUserMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useGetUsersQuery,
  useGetExpensesByCategoryQuery,
  useGetCategoriesQuery,
  useDeleteUserMutation,
} = api;
