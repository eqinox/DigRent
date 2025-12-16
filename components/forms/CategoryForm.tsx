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
import { FormMode } from "@/dto/common.dto";
import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetSelectedCategory } from "@/store/slices/categoriesSlice";
import { createCategory, editCategory } from "@/store/thunks/fetchCategories";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  type CategoryCreateData,
  type CategoryUpdateData,
} from "@/validation/category";

type CategoryFormProps = {
  mode?: FormMode;
  categoryId?: string;
  initialData?: Partial<CategoryUpdateData>;
  onSuccessRedirect?: (params: { name: string; mode: FormMode }) => void;
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

export default function CategoryForm({
  mode = "create",
  categoryId,
  initialData,
  onSuccessRedirect,
}: CategoryFormProps) {
  const isEditMode = mode === "edit";
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isLoading = useAppSelector(
    (state: RootState) => state.categories.isLoading
  );
  const schema = useMemo(
    () => (isEditMode ? categoryUpdateSchema : categoryCreateSchema),
    [isEditMode]
  );

  const form = useForm<CategoryCreateData | CategoryUpdateData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      image: initialData?.image ?? null,
      ...(isEditMode
        ? { id: categoryId || (initialData as any)?.id || "" }
        : {}),
    } as any,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      dispatch(resetSelectedCategory());
    };
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? "",
        image: initialData.image ?? null,
        ...(isEditMode
          ? { id: categoryId || (initialData as any)?.id || "" }
          : {}),
      } as any);

      if (initialData.image && typeof initialData.image === "string") {
        setPreviewUrl(`${BASE_URL}/${initialData.image}`);
      } else if (
        typeof initialData.image === "object" &&
        (initialData.image as any)?.original
      ) {
        setPreviewUrl(`${BASE_URL}/${(initialData.image as any).original}`);
      }
    }
  }, [initialData, form, isEditMode, categoryId]);

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

  const onSubmit = async (values: CategoryCreateData | CategoryUpdateData) => {
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
            (values as CategoryUpdateData).id ||
            categoryId ||
            (initialData as any)?.id ||
            "",
          name: values.name,
        };

        // Only add image to payload if a new file was selected
        if (hasNewImage && base64Image) {
          payload.image = base64Image;
        }

        dispatch(
          editCategory({
            data: payload as CategoryUpdateData,
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

        const payload: CategoryCreateData = {
          name: values.name,
          image: base64Image,
        };

        dispatch(
          createCategory({
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
      toast.error("Възникна грешка при обработка на изображението");
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Редактиране на категория" : "Добавяне на категория"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEditMode
            ? "Актуализирайте данните на категорията"
            : "Въведете данните за новата категория"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Име на категорията</FormLabel>
                <FormControl>
                  <Input placeholder="Въведете име" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Снимка на категорията</FormLabel>
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
                : "Създай категория"}
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
