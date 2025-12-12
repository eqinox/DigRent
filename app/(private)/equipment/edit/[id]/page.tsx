"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

import EquipmentForm from "@/components/forms/EquipmentForm";
import { BASE_URL } from "@/constants";
import { RootState, findEquipmentById } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const equipment = useAppSelector(
    (state: RootState) => state.equipments.selectedEquipment
  );
  const isLoading = useAppSelector(
    (state: RootState) => state.equipments.isLoading
  );

  useEffect(() => {
    if (id) {
      dispatch(findEquipmentById(id));
    }
  }, [dispatch, id]);

  const handleSuccess = ({
    name,
    mode,
  }: {
    name: string;
    mode: "create" | "edit";
  }) => {
    router.push(
      `/equipment/success?mode=${mode}&name=${encodeURIComponent(name)}`
    );
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <EquipmentForm
        mode="edit"
        equipmentId={id}
        subCategoryId={equipment?.subCategoryId}
        initialData={
          equipment
            ? {
                name: equipment.name,
                description: equipment.description,
                subCategoryId: equipment.subCategoryId,
                pricePerDay: equipment.pricePerDay,
                available: equipment.available,
                locationId: equipment.locationId,
                images: equipment.images?.map((img) => `${BASE_URL}/${img.original}`) || [],
              }
            : undefined
        }
        onSuccessRedirect={handleSuccess}
      />
      {isLoading && !equipment && (
        <p className="mt-4 text-sm text-muted-foreground">Зареждане...</p>
      )}
    </div>
  );
}

