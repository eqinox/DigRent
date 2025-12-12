import EquipmentsList from "@/components/lists/EquipmentsList";
import { use } from "react";

export default function EquipmentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <EquipmentsList subCategoryId={id} />;
}
