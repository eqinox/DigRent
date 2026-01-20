"use client";

import AuthenticationForm from "@/components/forms/AuthenticationForm";
import type { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function AuthPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);

  // Redirect to categories when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/categories");
    }
  }, [isAuthenticated]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<div>Зареждане...</div>}>
        <AuthenticationForm />
      </Suspense>
    </div>
  );
}

