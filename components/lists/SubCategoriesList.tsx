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
import { BASE_URL } from "@/constants";
import { SubCategoryResponseDto } from "@/dto/subCategory.dto";
import { RootState, deleteSubCategory, fetchSubCategories } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Item,
  ItemActions,
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
  const subCategoriesByCategory = useAppSelector(
    (state: RootState) => state.subCategories.subCategoriesByCategory
  );
  const subCategories = subCategoriesByCategory[categoryId] || [];
  const isLoading = useAppSelector(
    (state: RootState) => state.subCategories.isLoading
  );
  const loadingCategoryId = useAppSelector(
    (state: RootState) => state.subCategories.loadingCategoryId
  );
  const isCurrentCategoryLoading =
    isLoading && loadingCategoryId === categoryId;
  const deletingSubCategoryId = useAppSelector(
    (state: RootState) => state.subCategories.deletingSubCategoryId
  );
  const hasFetchedSubCategoriesByCategory = useAppSelector(
    (state: RootState) => state.subCategories.hasFetchedSubCategoriesByCategory
  );
  const hasFetchedSubCategories =
    hasFetchedSubCategoriesByCategory[categoryId] || false;
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [subCategoryToDelete, setSubCategoryToDelete] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (categoryId && !hasFetchedSubCategories) {
      dispatch(fetchSubCategories(categoryId));
    }
  }, [dispatch, categoryId, hasFetchedSubCategories]);

  const handleSubCategoryPress = (subCategoryId: string) => {
    router.push(`/equipments/${subCategoryId}`);
  };

  const handleEditSubCategory = (subCategoryId: string) => {
    router.push(`/sub-category/edit/${subCategoryId}`);
  };

  const handleRemoveSubCategory = (subCategoryId: string) => {
    setSubCategoryToDelete(subCategoryId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteSubCategory = async () => {
    if (!subCategoryToDelete) return;

    dispatch(
      deleteSubCategory({
        subCategoryId: subCategoryToDelete,
        onSuccess: (message: string) => {
          toast.success(message);
          cancelDeleteSubCategory();
        },
        onError: (message: string) => {
          toast.error(message);
        },
      })
    );
  };

  const cancelDeleteSubCategory = () => {
    setShowDeleteDialog(false);
    setSubCategoryToDelete(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="p-4 pb-20 w-full text-center items-center flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center">Подкатегории</h1>
      </div>

      {isCurrentCategoryLoading && subCategories.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div>Зареждане...</div>
        </div>
      ) : subCategories.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-center">Няма налични подкатегории</p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-6">
          <ItemGroup className="flex flex-row flex-wrap justify-center mx-auto gap-4">
            {subCategories.map((subCategory: SubCategoryResponseDto) => {
              const isDeleting = deletingSubCategoryId === subCategory.id;
              return (
                <Item
                  key={subCategory.id}
                  variant="outline"
                  className={`w-48 flex flex-col cursor-pointer relative ${
                    isDeleting ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {isDeleting && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-md">
                      <div className="text-sm">Изтриване...</div>
                    </div>
                  )}
                  <ItemContent>
                    <ItemTitle>{subCategory.type}</ItemTitle>
                  </ItemContent>
                  <ItemDescription
                    className={isDeleting ? "" : "cursor-pointer"}
                    onClick={() =>
                      !isDeleting && handleSubCategoryPress(subCategory.id)
                    }
                  >
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
                  <ItemActions className="w-full flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleSubCategoryPress(subCategory.id)}
                      disabled={isDeleting}
                    >
                      Виж
                    </Button>
                    {isAdmin && (
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="warning"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditSubCategory(subCategory.id)}
                          disabled={isDeleting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            handleRemoveSubCategory(subCategory.id)
                          }
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </ItemActions>
                </Item>
              );
            })}
          </ItemGroup>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на подкатегория</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете тази подкатегория? Това
              действие не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteSubCategory}>
              Отказ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSubCategory}
              className="bg-red-500 hover:bg-red-600"
            >
              Изтрий
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
