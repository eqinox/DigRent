"use client";

import { useRouter } from "next/navigation";

import CategoryForm from "@/components/forms/CategoryForm";

export default function AddCategoryPage() {
  const router = useRouter();

  const handleSuccess = ({ name }: { name: string; mode: "create" }) => {
    router.push(`/category/success?mode=create&name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <CategoryForm mode="create" onSuccessRedirect={handleSuccess} />
    </div>
  );
}




