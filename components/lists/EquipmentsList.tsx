"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BASE_URL } from "@/constants";
import { EquipmentResponseDto } from "@/dto/equipment.dto";
import {
  RootState,
  deleteEquipment,
  fetchEquipmentsBySubCategoryId,
} from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EquipmentsListProps {
  subCategoryId: string;
}

export default function EquipmentsList({ subCategoryId }: EquipmentsListProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const equipments = useAppSelector(
    (state: RootState) => state.equipments.equipments
  );
  const isLoading = useAppSelector(
    (state: RootState) => state.equipments.isLoading
  );
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (subCategoryId) {
      dispatch(fetchEquipmentsBySubCategoryId(subCategoryId));
    }
  }, [dispatch, subCategoryId]);

  const handleEquipmentPress = (equipmentId: string) => {
    router.push(`/equipment/${equipmentId}`);
  };

  const handleEditEquipment = (e: React.MouseEvent, equipmentId: string) => {
    e.stopPropagation();
    router.push(`/equipment/edit/${equipmentId}`);
  };

  const handleRemoveEquipment = (e: React.MouseEvent, equipmentId: string) => {
    e.stopPropagation();
    setEquipmentToDelete(equipmentId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteEquipment = async () => {
    if (!equipmentToDelete) return;

    dispatch(
      deleteEquipment({
        equipmentId: equipmentToDelete,
        onSuccess: (message: string) => {
          toast.success(message);
          cancelDeleteEquipment();
          // Refresh equipments after deletion
          dispatch(fetchEquipmentsBySubCategoryId(subCategoryId));
        },
        onError: (message: string) => {
          toast.error(message);
        },
      })
    );
  };

  const cancelDeleteEquipment = () => {
    setShowDeleteDialog(false);
    setEquipmentToDelete(null);
  };

  const isAdmin = user?.role === "admin";
  console.log("isAdmin", isAdmin);
  return (
    <>
      <div className="container mx-auto p-4 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center">Оборудване</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div>Зареждане...</div>
          </div>
        ) : equipments.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-center">Няма налично оборудване</p>
          </div>
        ) : (
          <div className="flex w-full max-w-4xl flex-col gap-4">
            {equipments.map((equipment: EquipmentResponseDto) => (
              <Card
                key={equipment.id}
                className="cursor-pointer transition-colors hover:bg-accent/50"
                onClick={() => handleEquipmentPress(equipment.id)}
              >
                <div className="flex flex-row">
                  {equipment.images && equipment.images.length > 0 && (
                    <div className="relative h-48 w-48 shrink-0 overflow-hidden">
                      <Image
                        src={`${BASE_URL}/${equipment.images[0].original}`}
                        alt={equipment.name}
                        width={192}
                        height={192}
                        loading="eager"
                        unoptimized={true}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-lg font-bold">
                        {equipment.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pb-2">
                      <p className="text-base">
                        {equipment.pricePerDay} лв/ден
                      </p>
                      <CardDescription className="pt-2 text-sm">
                        {equipment.description}
                      </CardDescription>
                    </CardContent>
                    {isAdmin && (
                      <CardFooter className="p-0 pt-2">
                        <div className="flex gap-2">
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={(e) =>
                              handleEditEquipment(e, equipment.id)
                            }
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) =>
                              handleRemoveEquipment(e, equipment.id)
                            }
                            className="flex-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на оборудване</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете това оборудване? Това
              действие не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteEquipment}>
              Отказ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEquipment}
              className="bg-red-500 hover:bg-red-600"
            >
              Изтрий
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
