"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

import CategoryForm from "@/components/forms/CategoryForm";
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
  console.log("id", id);
  useEffect(() => {
    if (id) {
      dispatch(findCategoryById(id));
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
      `/category/success?mode=${mode}&name=${encodeURIComponent(name)}`
    );
  };

  return (
    <div className="container mx-auto p-4 pb-20">
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
