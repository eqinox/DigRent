import EquipmentDetail from "@/components/equipment/EquipmentDetail";
import { use } from "react";

export default function EquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="w-4xl max-w-4xl mx-auto p-4 pb-20">
      <EquipmentDetail equipmentId={id} />
    </div>
  );
}
