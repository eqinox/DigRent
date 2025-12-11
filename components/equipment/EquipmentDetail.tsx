"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BASE_URL } from "@/constants";
import { ImageDto } from "@/dto/common.dto";
import { RootState, findEquipmentById } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Image from "next/image";
import { useEffect } from "react";

interface EquipmentDetailProps {
  equipmentId: string;
}

export default function EquipmentDetail({ equipmentId }: EquipmentDetailProps) {
  const dispatch = useAppDispatch();
  const equipment = useAppSelector(
    (state: RootState) => state.equipments.selectedEquipment
  );
  const isLoading = useAppSelector(
    (state: RootState) => state.equipments.isLoading
  );
  const error = useAppSelector((state: RootState) => state.equipments.error);

  useEffect(() => {
    if (equipmentId) {
      dispatch(findEquipmentById(equipmentId));
    }
  }, [dispatch, equipmentId]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center justify-center py-12">
          <div>Зареждане...</div>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-center text-destructive">
            {error || "Оборудването не е намерено"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center">
          Детайли за оборудване
        </h1>
      </div>

      <div className="flex w-full max-w-4xl flex-col gap-6">
        {/* Image Gallery */}
        {equipment.images && equipment.images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Снимки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row gap-4">
                {equipment.images.map((image: ImageDto, index: string) => (
                  <div
                    key={index}
                    className="relative aspect-square w-30 overflow-hidden rounded-lg"
                  >
                    <Image
                      src={`${BASE_URL}/${image.original}`}
                      alt={`${equipment.name} - Снимка ${index + 1}`}
                      fill
                      loading="eager"
                      unoptimized={true}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{equipment.name}</CardTitle>
            <CardDescription className="text-lg">
              {equipment.pricePerDay} лв/ден
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Описание</h3>
              <p className="text-muted-foreground">{equipment.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Статус:</h3>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  equipment.available
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {equipment.available ? "Налично" : "Недостъпно"}
              </span>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">Собственик</h3>
              <p className="text-muted-foreground">{equipment.owner}</p>
            </div>

            {equipment.locationId && (
              <div>
                <h3 className="mb-2 text-lg font-semibold">Локация</h3>
                <p className="text-muted-foreground">
                  ID: {equipment.locationId}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>
                Създадено на:{" "}
                {new Date(equipment.createdAt).toLocaleDateString("bg-BG")}
              </p>
              <p>
                Обновено на:{" "}
                {new Date(equipment.updatedAt).toLocaleDateString("bg-BG")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
