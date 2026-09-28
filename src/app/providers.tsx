"use client";

import * as React from "react";
import { AuthProvider } from "@/lib/auth";
import { ToastContainer } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ToastContainer />
    </AuthProvider>
  );
}
