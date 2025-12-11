"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import SubCategoryForm from "@/components/forms/SubCategoryForm";

export default function AddSubCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  useEffect(() => {
    if (!categoryId) {
      router.push("/categories");
    }
  }, [categoryId, router]);

  const handleSuccess = ({ type }: { type: string; mode: "create" }) => {
    router.push(
      `/sub-category/success?mode=create&type=${encodeURIComponent(type)}`
    );
  };

  if (!categoryId) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <p className="text-center text-muted-foreground">
          Липсва ID на категорията. Моля, изберете категория отново.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <SubCategoryForm
        mode="create"
        categoryId={categoryId}
        onSuccessRedirect={handleSuccess}
      />
    </div>
  );
}

