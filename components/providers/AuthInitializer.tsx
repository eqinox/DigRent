"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeAuth } from "@/store/thunks/fetchAuthentication";
import type { RootState } from "@/store";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state: RootState) => state.auth.isLoading);
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state when the app starts
    dispatch(initializeAuth());
  }, [dispatch]);

  // Track when authentication initialization is complete
  useEffect(() => {
    if (!isLoading) {
      setAuthInitialized(true);
    }
  }, [isLoading]);

  // Show loading screen while checking authentication or until auth is fully initialized
  if (isLoading || !authInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4">Зареждане...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}









