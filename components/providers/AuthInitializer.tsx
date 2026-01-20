"use client";

import { useAppDispatch } from "@/store/hooks";
import { initializeAuth } from "@/store/thunks/fetchAuthentication";
import { useEffect, useState } from "react";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state when the app starts
    dispatch(initializeAuth());
  }, [dispatch]);

  // Track when authentication initialization is complete
  useEffect(() => {
    setAuthInitialized(true);
  }, []);

  // Show loading screen while checking authentication or until auth is fully initialized
  if (!authInitialized) {
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









