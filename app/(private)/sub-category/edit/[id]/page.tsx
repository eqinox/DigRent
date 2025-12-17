"use client";

import { useRouter } from "next/navigation";
import { use, useEffect } from "react";

import SubCategoryForm from "@/components/forms/SubCategoryForm";
import { FormMode } from "@/dto/common.dto";
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

  const handleSuccess = (params: { type: string; mode: FormMode; categoryId: string }) => {
    router.push(
      `/sub-category/success?mode=${params.mode}&type=${encodeURIComponent(
        params.type
      )}&categoryId=${encodeURIComponent(params.categoryId)}`
    );
  };

  return (
    <div className="mx-auto p-4 pb-20">
      <SubCategoryForm
        mode="edit"
        subCategoryId={id}
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
