"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

import SubCategoryForm from "@/components/forms/SubCategoryForm";
import { RootState, findSubCategoryById } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function EditSubCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const subCategory = useAppSelector(
    (state: RootState) => state.subCategories.selectedSubCategory
  );
  const isLoading = useAppSelector(
    (state: RootState) => state.subCategories.isLoading
  );

  useEffect(() => {
    if (id) {
      dispatch(findSubCategoryById(id));
    }
  }, [dispatch, id]);

  const handleSuccess = ({
    type,
    mode,
  }: {
    type: string;
    mode: "create" | "edit";
  }) => {
    router.push(
      `/sub-category/success?mode=${mode}&type=${encodeURIComponent(type)}`
    );
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <SubCategoryForm
        mode="edit"
        subCategoryId={id}
        categoryId={subCategory?.categoryId}
        initialData={
          subCategory
            ? {
                id: subCategory.id,
                type: subCategory.type,
                minRange: subCategory.minRange,
                maxRange: subCategory.maxRange,
                image: subCategory.image?.original,
              }
            : undefined
        }
        onSuccessRedirect={handleSuccess}
      />
      {isLoading && !subCategory && (
        <p className="mt-4 text-sm text-muted-foreground">Зареждане...</p>
      )}
    </div>
  );
}

