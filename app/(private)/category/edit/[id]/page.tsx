"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

import CategoryForm from "@/components/forms/CategoryForm";
import { FormMode } from "@/dto/common.dto";
import { RootState, findCategoryById } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const category = useAppSelector(
    (state: RootState) => state.categories.selectedCategory
  );
  const isLoading = useAppSelector(
    (state: RootState) => state.categories.isLoading
  );

  useEffect(() => {
    if (id) {
      dispatch(findCategoryById(id));
    }
  }, [dispatch, id]);

  const handleSuccess = (params: { name: string; mode: FormMode }) => {
    router.push(
      `/category/success?mode=${params.mode}&name=${encodeURIComponent(
        params.name
      )}`
    );
  };

  return (
    <div className="mx-auto p-4 pb-20">
      <CategoryForm
        mode="edit"
        categoryId={id}
        initialData={
          category
            ? {
                id: category.id,
                name: category.name,
                image: category.image?.original,
              }
            : undefined
        }
        onSuccessRedirect={handleSuccess}
      />
      {isLoading && !category && (
        <p className="mt-4 text-sm text-muted-foreground">Зареждане...</p>
      )}
    </div>
  );
}
