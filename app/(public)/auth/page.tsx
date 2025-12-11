"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import AuthenticationForm from "@/components/forms/AuthenticationForm";
import { useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store";

export default function AuthPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state: RootState) => state.auth.isLoading);

  // Redirect to categories when authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/categories");
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<div>Зареждане...</div>}>
        <AuthenticationForm />
      </Suspense>
    </div>
  );
}

