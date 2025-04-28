"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axiosApi from "@/state/axios";
import { AxiosError } from "axios";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // For protected routes
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/dashboard");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Replace with your actual authentication logic
      const res = await axiosApi.post("/users/signin", { email, password });

      // Store data in local storage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err: any) {
      console.log(err);
      if (err instanceof AxiosError) {
        setError(err.response?.data.message);
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Brand section */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 flex-col justify-center items-center p-12">
        <div className="max-w-md">
          <div className="flex items-center mb-8">
            <Image
              src="/assets/logo.png"
              alt="EDSTOCK Logo"
              width={48}
              height={48}
              className="mr-3"
            />
            <h1 className="text-3xl font-bold text-white">EDSTOCK</h1>
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">
            Manage your inventory with confidence
          </h2>
          <p className="text-blue-100 text-lg">
            Track your products, monitor sales, and grow your business with our
            comprehensive inventory management solution.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center mb-8 lg:hidden">
            <Image
              src="/assets/logo.png"
              alt="EDSTOCK Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            <h1 className="text-2xl font-bold text-blue-600">EDSTOCK</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back
          </h2>
          <p className="text-gray-600 mb-8">
            Please enter your credentials to sign in
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
