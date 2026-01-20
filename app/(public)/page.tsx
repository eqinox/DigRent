"use client";

import type { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

  return null;
}