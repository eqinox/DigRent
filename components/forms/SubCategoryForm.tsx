"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import { BASE_URL } from "@/constants";
import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createSubCategory,
  editSubCategory,
} from "@/store/thunks/fetchSubCategories";
import {
  subCategoryCreateSchema,
  subCategoryUpdateSchema,
  type SubCategoryCreateData,
  type SubCategoryUpdateData,
} from "@/validation/subCategory";

type FormMode = "create" | "edit";

type SubCategoryFormProps = {
  mode?: FormMode;
  categoryId?: string;
  subCategoryId?: string;
  initialData?: Partial<SubCategoryUpdateData>;
  onSuccessRedirect?: (params: { type: string; mode: FormMode }) => void;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function SubCategoryForm({
  mode = "create",
  categoryId,
  subCategoryId,
  initialData,
  onSuccessRedirect,
}: SubCategoryFormProps) {
  const isEditMode = mode === "edit";
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isLoading = useAppSelector(
    (state: RootState) => state.subCategories.isLoading
  );
  const schema = useMemo(
    () => (isEditMode ? subCategoryUpdateSchema : subCategoryCreateSchema),
    [isEditMode]
  );

  const form = useForm<SubCategoryCreateData | SubCategoryUpdateData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initialData?.type ?? "",
      minRange: initialData?.minRange ?? 0,
      maxRange: initialData?.maxRange ?? 0,
      image: initialData?.image ?? null,
      ...(isEditMode
        ? { id: subCategoryId || (initialData as any)?.id || "" }
        : { categoryId: categoryId || "" }),
    } as any,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      form.reset({
        type: initialData.type ?? "",
        minRange: initialData.minRange ?? 0,
        maxRange: initialData.maxRange ?? 0,
        image: initialData.image ?? null,
        ...(isEditMode
          ? { id: subCategoryId || (initialData as any)?.id || "" }
          : { categoryId: categoryId || "" }),
      } as any);

      if (initialData.image && typeof initialData.image === "string") {
        setPreviewUrl(`${BASE_URL}/${initialData.image}`);
      } else if (
        typeof initialData.image === "object" &&
        (initialData.image as any)?.original
      ) {
        setPreviewUrl(`${BASE_URL}/${(initialData.image as any).original}`);
      }
    } else if (!isEditMode && categoryId) {
      form.reset({
        type: "",
        minRange: 0,
        maxRange: 0,
        image: null,
        categoryId: categoryId,
      } as any);
    }
  }, [initialData, form, isEditMode, categoryId, subCategoryId]);

  const imageValue = form.watch("image");

  useEffect(() => {
    if (imageValue instanceof File) {
      const objectUrl = URL.createObjectURL(imageValue);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof imageValue === "string") {
      setPreviewUrl(
        imageValue.startsWith("http") ? imageValue : `${BASE_URL}/${imageValue}`
      );
    }
  }, [imageValue]);

  const handleImageChange = (file: File | null) => {
    form.setValue("image", file ?? null, { shouldValidate: true });
  };

  const onSubmit = async (
    values: SubCategoryCreateData | SubCategoryUpdateData
  ) => {
    try {
      if (isEditMode) {
        // In edit mode, only include image if a new file was selected
        const hasNewImage = values.image instanceof File;
        let base64Image: string | null = null;

        if (hasNewImage) {
          base64Image = await fileToBase64(values.image);
        }

        // Build payload - only include image if a new file was selected
        const payload: any = {
          id:
            (values as SubCategoryUpdateData).id ||
            subCategoryId ||
            (initialData as any)?.id ||
            "",
          type: values.type,
          minRange: values.minRange,
          maxRange: values.maxRange,
        };

        // Only add image to payload if a new file was selected
        if (hasNewImage && base64Image) {
          payload.image = base64Image;
        }

        dispatch(
          editSubCategory({
            data: payload as SubCategoryUpdateData,
            onSuccess: (message: string) => {
              toast.success(message);
              onSuccessRedirect?.({ type: payload.type, mode: "edit" });
            },
            onError: (message: string) => {
              toast.error(message);
            },
          })
        );
      } else {
        // In create mode, image is required
        let base64Image: string | null = null;
        if (values.image instanceof File) {
          base64Image = await fileToBase64(values.image);
        } else if (typeof values.image === "string" && values.image) {
          base64Image = values.image;
        }

        if (!base64Image) {
          toast.error("Снимката е задължителна");
          return;
        }

        const payload: SubCategoryCreateData = {
          categoryId: categoryId || (values as SubCategoryCreateData).categoryId,
          type: values.type,
          minRange: values.minRange,
          maxRange: values.maxRange,
          image: base64Image,
        };

        dispatch(
          createSubCategory({
            data: payload as SubCategoryCreateData,
            onSuccess: (message: string) => {
              toast.success(message);
              onSuccessRedirect?.({ type: payload.type, mode: "create" });
            },
            onError: (message: string) => {
              toast.error(message);
            },
          })
        );
      }
    } catch (error) {
      toast.error("Възникна грешка при обработка на изображението");
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isEditMode
            ? "Редактиране на подкатегория"
            : "Добавяне на подкатегория"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEditMode
            ? "Актуализирайте данните на подкатегорията"
            : "Въведете данните за новата подкатегория"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип на подкатегорията</FormLabel>
                <FormControl>
                  <Input placeholder="Въведете тип" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Минимален обхват</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
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
              name="maxRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Максимален обхват</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
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
          </div>

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Снимка на подкатегорията</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handleImageChange(event.target.files?.[0] ?? null)
                      }
                    />
                    {previewUrl ? (
                      <div className="relative h-32 w-32 overflow-hidden rounded-md border">
                        <Image
                          src={previewUrl}
                          alt="Преглед"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Изберете изображение (формат JPG/PNG)
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
                : "Създай подкатегория"}
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

