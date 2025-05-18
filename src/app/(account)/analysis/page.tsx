"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/app/(components)/Header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  Product,
  Category,
  useGetProductsQuery,
  useGetCategoriesQuery,
} from "@/state/api";
import {
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Filter,
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
import { formatAmount } from "@/app/lib/helpers";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Papa from "papaparse";
import * as XLSX from "xlsx";

type AnalysisCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
};

type FilterOption = {
  label: string;
  value: string;
};

type TimeRange = "7days" | "30days" | "90days" | "year" | "all";

// Sample color palette
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
];
const RADIAN = Math.PI / 180;

const AnalysisCard = ({
  title,
  value,
  icon,
  change,
  changeType,
}: AnalysisCardProps) => {
  let changeColorClass = "text-gray-500";
  if (changeType === "positive") changeColorClass = "text-green-500";
  if (changeType === "negative") changeColorClass = "text-red-500";

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change && (
            <p className={`text-xs ${changeColorClass} mt-2`}>
              {change}{" "}
              {changeType === "positive"
                ? "↑"
                : changeType === "negative"
                ? "↓"
                : ""}
            </p>
          )}
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-md">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`tooltip-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function AnalysisPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("30days");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [showExportDropdown, setShowExportDropdown] = useState<boolean>(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Loading state is now derived from RTK Query loading states

  // Filters data
  const [supplierOptions, setSupplierOptions] = useState<FilterOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([]);

  // Use RTK Query hooks to fetch data
  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductsQuery({});
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useGetCategoriesQuery();

  useEffect(() => {
    if (productsData && categoriesData) {
      setProducts(productsData);
      setCategories(categoriesData);

      // Extract unique suppliers for filter
      const uniqueSuppliers = [
        ...new Set(productsData.map((p) => p.supplier).filter(Boolean)),
      ];
      setSupplierOptions([
        { label: "All Suppliers", value: "all" },
        ...uniqueSuppliers.map((supplier) => ({
          label: supplier as string,
          value: supplier as string,
        })),
      ]);

      // Prepare category options
      setCategoryOptions([
        { label: "All Categories", value: "all" },
        ...categoriesData.map((cat) => ({
          label: cat.name,
          value: cat.categoryId,
        })),
      ]);
    }
  }, [productsData, categoriesData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowExportDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter products based on selected filters
  const filteredProducts = products.filter((product) => {
    let matchesCategory =
      categoryFilter === "all" || product.categoryId === categoryFilter;
    let matchesSupplier =
      supplierFilter === "all" || product.supplier === supplierFilter;
    return matchesCategory && matchesSupplier;
  });

  // Calculate totals for summary cards
  const totalInventoryValue = filteredProducts.reduce(
    (sum, product) => sum + product.price * product.stockQuantity,
    0
  );
  const totalItems = filteredProducts.reduce(
    (sum, product) => sum + product.stockQuantity,
    0
  );
  const totalProducts = filteredProducts.length;
  const lowStockProducts = filteredProducts.filter(
    (product) => product.stockQuantity < 10
  ).length;

  // Data transformations for charts
  const categoryData = categories
    .map((category) => {
      const categoryProducts = filteredProducts.filter(
        (p) => p.categoryId === category.categoryId
      );
      return {
        name: category.name,
        value: categoryProducts.length,
        stockValue: categoryProducts.reduce(
          (sum, p) => sum + p.price * p.stockQuantity,
          0
        ),
      };
    })
    .filter((cat) => cat.value > 0);

  const stockByCategory = categories
    .map((category) => {
      const categoryProducts = filteredProducts.filter(
        (p) => p.categoryId === category.categoryId
      );
      return {
        name: category.name,
        stockQuantity: categoryProducts.reduce(
          (sum, p) => sum + p.stockQuantity,
          0
        ),
        value: categoryProducts.reduce(
          (sum, p) => sum + p.price * p.stockQuantity,
          0
        ),
      };
    })
    .filter((cat) => cat.stockQuantity > 0);

  const topProducts = [...filteredProducts]
    .sort((a, b) => b.price * b.stockQuantity - a.price * a.stockQuantity)
    .slice(0, 5)
    .map((product) => ({
      name:
        product.name.length > 20
          ? product.name.substring(0, 20) + "..."
          : product.name,
      value: product.price * product.stockQuantity,
    }));

  const supplierData = [...new Set(filteredProducts.map((p) => p.supplier))]
    .filter(Boolean)
    .map((supplier) => {
      const supplierProducts = filteredProducts.filter(
        (p) => p.supplier === supplier
      );
      return {
        name: supplier as string,
        count: supplierProducts.length,
        value: supplierProducts.reduce(
          (sum, p) => sum + p.price * p.stockQuantity,
          0
        ),
      };
    })
    .filter((sup) => sup.count > 0);

  // Mock time series data - in a real app, this would come from your database
  const generateTimeSeriesData = (days: number) => {
    const data = [];
    const today = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate some realistic-looking inventory movement data
      const stockIn = Math.floor(Math.random() * 50);
      const stockOut = Math.floor(Math.random() * 30);

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        stockIn,
        stockOut,
        netChange: stockIn - stockOut,
      });
    }

    return data;
  };

  // Generate appropriate time series data based on selected range
  const getTimeSeriesDataForRange = (range: TimeRange) => {
    switch (range) {
      case "7days":
        return generateTimeSeriesData(7);
      case "30days":
        return generateTimeSeriesData(30);
      case "90days":
        return generateTimeSeriesData(90);
      case "year":
        return generateTimeSeriesData(365);
      default:
        return generateTimeSeriesData(30);
    }
  };

  const timeSeriesData = getTimeSeriesDataForRange(timeRange);

  // For low stock alerts
  const lowStockItems = filteredProducts
    .filter((product) => product.stockQuantity < 10)
    .sort((a, b) => a.stockQuantity - b.stockQuantity)
    .slice(0, 5);

  // Export functions
  const exportAsPDF = async () => {
    if (!dashboardRef.current) return;

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 1,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add more pages if the content exceeds a single page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("inventory-analysis-report.pdf");

      // Hide loading notification
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }

    setShowExportDropdown(false);
  };

  const exportAsCSV = () => {
    try {
      // Prepare data for CSV export
      let csvData = [
        // Summary Data
        ["Inventory Analysis Report", ""],
        ["Date", new Date().toLocaleDateString()],
        ["Time Range", timeRange],
        [""],
        ["Summary Metrics", ""],
        ["Total Inventory Value", formatAmount(totalInventoryValue)],
        ["Total Items in Stock", totalItems.toString()],
        ["Total Products", totalProducts.toString()],
        ["Low Stock Items", lowStockProducts.toString()],
        [""],

        // Category Data
        ["Category Breakdown", ""],
        ["Category Name", "Stock Quantity", "Inventory Value"],
        ...stockByCategory.map((cat) => [
          cat.name,
          cat.stockQuantity.toString(),
          cat.value.toString(),
        ]),
        [""],

        // Top Products
        ["Top Products by Value", ""],
        ["Product Name", "Value"],
        ...topProducts.map((prod) => [prod.name, prod.value.toString()]),
        [""],

        // Low Stock Items
        ["Low Stock Items", ""],
        ["Product Name", "Current Stock", "Value"],
        ...lowStockItems.map((item) => [
          item.name,
          item.stockQuantity.toString(),
          (item.price * item.stockQuantity).toString(),
        ]),
      ];

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "inventory-analysis-report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export as CSV:", error);
    }

    setShowExportDropdown(false);
  };

  const exportAsExcel = () => {
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ["Inventory Analysis Report"],
        ["Date", new Date().toLocaleDateString()],
        ["Time Range", timeRange],
        [""],
        ["Summary Metrics"],
        ["Total Inventory Value", totalInventoryValue],
        ["Total Items in Stock", totalItems],
        ["Total Products", totalProducts],
        ["Low Stock Items", lowStockProducts],
      ];
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

      // Categories sheet
      const categoryHeaders = [
        "Category Name",
        "Stock Quantity",
        "Inventory Value",
      ];
      const categoryData = stockByCategory.map((cat) => [
        cat.name,
        cat.stockQuantity,
        cat.value,
      ]);
      const categoryWs = XLSX.utils.aoa_to_sheet([
        categoryHeaders,
        ...categoryData,
      ]);
      XLSX.utils.book_append_sheet(wb, categoryWs, "Categories");

      // Products sheet
      const productsData = filteredProducts.map((product) => [
        product.name,
        product.sku || "",
        product.categoryId || "",
        product.supplier || "",
        product.price,
        product.stockQuantity,
        product.price * product.stockQuantity,
      ]);
      const productsHeaders = [
        "Name",
        "SKU",
        "Category ID",
        "Supplier",
        "Price",
        "Stock",
        "Value",
      ];
      const productsWs = XLSX.utils.aoa_to_sheet([
        productsHeaders,
        ...productsData,
      ]);
      XLSX.utils.book_append_sheet(wb, productsWs, "Products");

      // Low stock sheet
      const lowStockData = lowStockItems.map((item) => [
        item.name,
        item.sku || "",
        item.stockQuantity,
        item.price,
        item.price * item.stockQuantity,
      ]);
      const lowStockHeaders = ["Name", "SKU", "Stock", "Price", "Value"];
      const lowStockWs = XLSX.utils.aoa_to_sheet([
        lowStockHeaders,
        ...lowStockData,
      ]);
      XLSX.utils.book_append_sheet(wb, lowStockWs, "Low Stock");

      // Write and download
      XLSX.writeFile(wb, "inventory-analysis-report.xlsx");
    } catch (error) {
      console.error("Failed to export as Excel:", error);
    }

    setShowExportDropdown(false);
  };

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
      ref={dashboardRef}
    >
      <div className="mb-5 flex justify-between items-center">
        <Header name="Inventory Analysis Dashboard" />

        {/* Export Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>

          {showExportDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={exportAsCSV}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </button>
                <button
                  onClick={exportAsExcel}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as Excel
                </button>
                <button
                  onClick={exportAsPDF}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoadingProducts || isLoadingCategories ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Filter Controls */}
          <div className="mb-8 bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-medium">Filters</h2>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Range
                  </label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                    className="block w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="year">Last Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>

                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <select
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                    className="block w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                  >
                    {supplierOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <AnalysisCard
              title="Total Inventory Value"
              value={formatAmount(totalInventoryValue)}
              icon={<BarChart3 className="w-6 h-6 text-blue-500" />}
              change="+12% from last month"
              changeType="positive"
            />
            <AnalysisCard
              title="Total Quantity in Stock"
              value={totalItems.toLocaleString()}
              icon={<BarChart3 className="w-6 h-6 text-green-500" />}
              change="+5% from last month"
              changeType="positive"
            />
            <AnalysisCard
              title="Total Items"
              value={totalProducts.toLocaleString()}
              icon={<PieChartIcon className="w-6 h-6 text-purple-500" />}
              change="No change"
              changeType="neutral"
            />
            <AnalysisCard
              title="Low Stock Items"
              value={lowStockProducts.toString()}
              icon={<LineChartIcon className="w-6 h-6 text-red-500" />}
              change="+2 from last week"
              changeType="negative"
            />
          </div>

          {/* Main Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Stock Value by Category */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">
                Inventory Value by Category
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stockByCategory}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Inventory Value (XAF)"
                      fill="#0088FE"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stock Movement Over Time */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">
                Stock Movement Over Time
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeSeriesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="stockIn"
                      name="Stock In"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="stockOut"
                      name="Stock Out"
                      stroke="#ff8042"
                      fill="#ff8042"
                      fillOpacity={0.3}
                    />
                    <Line
                      type="monotone"
                      dataKey="netChange"
                      name="Net Change"
                      stroke="#8884d8"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Products by Value */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">
                Top Products by Value
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topProducts}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="value" name="Value (XAF)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution by Supplier */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">
                Inventory by Supplier
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={supplierData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {supplierData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white p-4 rounded-lg shadow mb-8">
            <h3 className="text-lg font-medium mb-4">Low Stock Alerts</h3>
            {lowStockItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lowStockItems.map((product) => (
                      <tr key={product.productId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">
                          {product.stockQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sku ||
                            `SKU-${Math.floor(Math.random() * 10000)}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.location || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(
                            product.price * product.stockQuantity
                          ).toLocaleString()}{" "}
                          XAF
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No low stock items to display.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
