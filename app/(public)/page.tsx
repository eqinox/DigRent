"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state: RootState) => state.auth.isLoading);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/categories");
      } else {
        router.push("/auth");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Зареждане...</div>
      </div>
    );
  }

  return null;
}