"use client";

import { BASE_URL } from "@/constants";
import { SubCategoryResponseDto } from "@/dto/subCategory.dto";
import { RootState, fetchSubCategories } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";

interface SubCategoriesListProps {
  categoryId: string;
}

export default function SubCategoriesList({
  categoryId,
}: SubCategoriesListProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const subCategories = useAppSelector(
    (state: RootState) => state.subCategories.subCategories
  );
  const isLoading = useAppSelector(
    (state: RootState) => state.subCategories.isLoading
  );

  useEffect(() => {
    if (categoryId) {
      dispatch(fetchSubCategories(categoryId));
    }
  }, [dispatch, categoryId]);

  const handleSubCategoryPress = (subCategoryId: string) => {
    router.push(`/equipments/${subCategoryId}`);
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center">Подкатегории</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div>Зареждане...</div>
        </div>
      ) : subCategories.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-center">Няма налични подкатегории</p>
        </div>
      ) : (
        <div className="flex w-full max-w-xl flex-col gap-6">
          <ItemGroup className="grid grid-cols-3 gap-4">
            {subCategories.map((subCategory: SubCategoryResponseDto) => (
              <Item
                key={subCategory.id}
                variant="outline"
                className="cursor-pointer"
                onClick={() => handleSubCategoryPress(subCategory.id)}
              >
                <ItemContent>
                  <ItemTitle>{subCategory.type}</ItemTitle>
                </ItemContent>
                <ItemDescription className="cursor-pointer">
                  {subCategory.image ? (
                    <span className="relative h-30 w-full overflow-hidden block">
                      <Image
                        src={`${BASE_URL}/${subCategory.image.small}`}
                        alt={subCategory.type}
                        width={192}
                        height={192}
                        loading="eager"
                        unoptimized={true}
                        className="h-full w-full object-fill"
                      />
                    </span>
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-muted">
                      <span className="text-muted-foreground">
                        Няма изображение
                      </span>
                    </div>
                  )}
                </ItemDescription>
                <div className="text-center text-xs text-muted-foreground">
                  {subCategory.minRange} - {subCategory.maxRange}
                </div>
              </Item>
            ))}
          </ItemGroup>
        </div>
      )}
    </div>
  );
}
