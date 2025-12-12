"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import EquipmentForm from "@/components/forms/EquipmentForm";

export default function AddEquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subCategoryId = searchParams.get("subCategoryId");

  useEffect(() => {
    if (!subCategoryId) {
      router.push("/categories");
    }
  }, [subCategoryId, router]);

  const handleSuccess = ({ name }: { name: string; mode: "create" }) => {
    router.push(
      `/equipment/success?mode=create&name=${encodeURIComponent(name)}`
    );
  };

  if (!subCategoryId) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <p className="text-center text-muted-foreground">
          Липсва ID на подкатегорията. Моля, изберете подкатегория отново.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <EquipmentForm
        mode="create"
        subCategoryId={subCategoryId}
        onSuccessRedirect={handleSuccess}
      />
    </div>
  );
}
