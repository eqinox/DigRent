"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createEquipment,
  updateEquipment,
} from "@/store/thunks/fetchEquipments";
import {
  equipmentSchema,
  type EquipmentFormData,
} from "@/validation/equipment";

type FormMode = "create" | "edit";

type EquipmentFormProps = {
  mode?: FormMode;
  subCategoryId?: string;
  equipmentId?: string;
  initialData?: Partial<EquipmentFormData>;
  onSuccessRedirect?: (params: { name: string; mode: FormMode }) => void;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Return full data URL for images array
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function EquipmentForm({
  mode = "create",
  subCategoryId,
  equipmentId,
  initialData,
  onSuccessRedirect,
}: EquipmentFormProps) {
  const isEditMode = mode === "edit";
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isLoading = useAppSelector(
    (state: RootState) => state.equipments.isLoading
  );

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      subCategoryId: subCategoryId || initialData?.subCategoryId || "",
      pricePerDay: initialData?.pricePerDay ?? 0,
      available: initialData?.available ?? true,
      locationId: initialData?.locationId ?? "",
      images: initialData?.images ?? [],
    },
  });

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? "",
        description: initialData.description ?? "",
        subCategoryId: subCategoryId || initialData.subCategoryId || "",
        pricePerDay: initialData.pricePerDay ?? 0,
        available: initialData.available ?? true,
        locationId: initialData.locationId ?? "",
        images: initialData.images ?? [],
      });

      // Set preview URLs from initial data
      if (initialData.images && Array.isArray(initialData.images)) {
        const urls = initialData.images.map((img) => {
          if (typeof img === "string") {
            // If it's already a data URL, use it directly
            if (img.startsWith("data:")) {
              return img;
            }
            // Otherwise, it might be a URL path
            return img;
          }
          return "";
        });
        setPreviewUrls(urls.filter(Boolean));
      }
    } else if (!isEditMode && subCategoryId) {
      form.reset({
        name: "",
        description: "",
        subCategoryId: subCategoryId,
        pricePerDay: 0,
        available: true,
        locationId: "",
        images: [],
      });
    }
  }, [initialData, form, isEditMode, subCategoryId]);

  const imagesValue = form.watch("images");

  useEffect(() => {
    if (Array.isArray(imagesValue) && imagesValue.length > 0) {
      const urls = imagesValue.map((img) => {
        if (img instanceof File) {
          return URL.createObjectURL(img);
        } else if (typeof img === "string") {
          return img;
        }
        return "";
      });
      const validUrls = urls.filter(Boolean);
      setPreviewUrls(validUrls);

      // Cleanup function for object URLs
      return () => {
        validUrls.forEach((url) => {
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });
      };
    } else {
      setPreviewUrls([]);
    }
  }, [imagesValue]);

  const handleImageChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      form.setValue("images", fileArray as any, { shouldValidate: true });
    } else {
      form.setValue("images", [], { shouldValidate: true });
    }
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images");
    if (Array.isArray(currentImages)) {
      const newImages = currentImages.filter((_, i) => i !== index);
      form.setValue("images", newImages, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: EquipmentFormData) => {
    try {
      // Convert images to base64
      const imagePromises = values.images.map(async (img) => {
        if (img instanceof File) {
          return await fileToBase64(img);
        } else if (typeof img === "string") {
          // If it's already a base64 string, return it
          return img;
        }
        return "";
      });

      const base64Images = (await Promise.all(imagePromises)).filter(Boolean);

      if (base64Images.length === 0) {
        toast.error("Поне едно изображение е задължително");
        return;
      }

      const payload: EquipmentFormData = {
        name: values.name,
        description: values.description,
        subCategoryId: subCategoryId || values.subCategoryId,
        pricePerDay: values.pricePerDay,
        available: values.available ?? true,
        locationId: values.locationId,
        images: base64Images,
      };

      if (isEditMode) {
        const equipmentIdToUpdate = equipmentId || (initialData as any)?.id;
        if (!equipmentIdToUpdate) {
          toast.error("Липсва ID на оборудването");
          return;
        }

        dispatch(
          updateEquipment({
            equipmentId: equipmentIdToUpdate,
            data: payload,
            onSuccess: (message: string) => {
              toast.success(message);
              onSuccessRedirect?.({ name: payload.name, mode: "edit" });
            },
            onError: (message: string) => {
              toast.error(message);
            },
          })
        );
      } else {
        dispatch(
          createEquipment({
            data: payload,
            onSuccess: (message: string) => {
              toast.success(message);
              onSuccessRedirect?.({ name: payload.name, mode: "create" });
            },
            onError: (message: string) => {
              toast.error(message);
            },
          })
        );
      }
    } catch (error) {
      toast.error("Възникна грешка при обработка на изображенията");
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Редактиране на оборудване" : "Добавяне на оборудване"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEditMode
            ? "Актуализирайте данните на оборудването"
            : "Въведете данните за новото оборудване"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Име на оборудването</FormLabel>
                <FormControl>
                  <Input placeholder="Въведете име" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Описание</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Въведете описание"
                    {...field}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pricePerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Цена на ден (лв)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Локация ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Въведете локация ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value ?? true}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Налично за наемане</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Снимки на оборудването</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) =>
                        handleImageChange(event.target.files)
                      }
                    />
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {previewUrls.map((url, index) => (
                          <div
                            key={index}
                            className="relative h-32 w-full overflow-hidden rounded-md border"
                          >
                            <Image
                              src={url}
                              alt={`Преглед ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute right-2 top-2 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                            >
                              Премахни
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {previewUrls.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Изберете поне едно изображение (формат JPG/PNG)
                      </p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Обработване..."
                : isEditMode
                ? "Запази промените"
                : "Създай оборудване"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Отказ
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
