"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  // For protected routes
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/signin");
    }
  }, []);

  return <div>{children}</div>;
};

export default AccountLayout;
