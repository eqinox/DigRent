"use client";

import Navigation from "@/components/Navigation";
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const isLoading = useAppSelector((state: RootState) => state.auth.isLoading);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
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

  return (
    <div className="flex flex-col items-center">
      {children}
      <Navigation />
    </div>
  );
}
