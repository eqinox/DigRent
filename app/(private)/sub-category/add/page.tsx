"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import SubCategoryForm from "@/components/forms/SubCategoryForm";
import { FormMode } from "@/dto/common.dto";

export default function AddSubCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  useEffect(() => {
    if (!categoryId) {
      router.push("/categories");
    }
  }, [categoryId, router]);

  const handleSuccess = (params: { type: string; mode: FormMode }) => {
    router.push(
      `/sub-category/success?mode=${params.mode}&name=${encodeURIComponent(
        params.type
      )}`
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
    <div className="mx-auto p-4 pb-20">
      <SubCategoryForm
        mode="create"
        categoryId={categoryId}
        onSuccessRedirect={handleSuccess}
      />
    </div>
  );
}
