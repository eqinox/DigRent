"use client";

import { useRouter } from "next/navigation";

import CategoryForm from "@/components/forms/CategoryForm";
import { FormMode } from "@/dto/common.dto";

export default function AddCategoryPage() {
  const router = useRouter();

  const handleSuccess = (params: { name: string; mode: FormMode }) => {
    router.push(
      `/category/success?mode=create&name=${encodeURIComponent(params.name)}`
    );
  };

  return (
    <div className="mx-auto p-4 pb-20">
      <CategoryForm mode="create" onSuccessRedirect={handleSuccess} />
    </div>
  );
}
