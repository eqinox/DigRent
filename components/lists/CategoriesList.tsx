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
import { CategoryResponseDto } from "@/dto/category.dto";
import { RootState, deleteCategory, fetchCategories } from "@/store";
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
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesList() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(
    (state: RootState) => state.categories.categories
  );
  const isLoading = useAppSelector(
    (state: RootState) => state.categories.isLoading
  );
  const deletingCategoryId = useAppSelector(
    (state: RootState) => state.categories.deletingCategoryId
  );
  const hasFetchedCategories = useAppSelector(
    (state: RootState) => state.categories.hasFetchedCategories
  );
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!hasFetchedCategories) {
      dispatch(fetchCategories());
    }
  }, [dispatch, hasFetchedCategories]);

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/sub-category/${categoryId}`);
  };

  const handleEditCategory = (categoryId: string) => {
    router.push(`/category/edit/${categoryId}`);
  };

  const handleRemoveCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    dispatch(
      deleteCategory({
        categoryId: categoryToDelete,
        onSuccess: (message: string) => {
          toast.success(message);
          cancelDeleteCategory();
        },
        onError: (message: string) => {
          toast.error(message);
        },
      })
    );
  };

  const cancelDeleteCategory = () => {
    setShowDeleteDialog(false);
    setCategoryToDelete(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <>
      <div className="w-full mx-auto p-4 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center">Категории</h1>
        </div>

        {isLoading && categories.length === 0 ? (
          <div className="flex w-full gap-6">
            <ItemGroup className="flex flex-row flex-wrap justify-center mx-auto gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Item key={index} variant="outline" className="w-48">
                  <ItemContent>
                    <ItemTitle>
                      <Skeleton className="h-5 w-32" />
                    </ItemTitle>
                  </ItemContent>
                  <ItemDescription>
                    <Skeleton className="h-32 w-full" />
                  </ItemDescription>
                  <ItemActions className="w-full flex-col gap-2">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-center">Няма налични категории</p>
          </div>
        ) : (
          <div className="flex w-full gap-6">
            <ItemGroup className="flex flex-row flex-wrap justify-center mx-auto gap-4">
              {categories.map((category: CategoryResponseDto) => {
                const isDeleting = deletingCategoryId === category.id;
                return (
                  <Item
                    key={category.id}
                    variant="outline"
                    className={`w-48 flex flex-col relative ${
                      isDeleting ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {isDeleting && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded-md">
                        <div className="text-sm">Изтриване...</div>
                      </div>
                    )}
                    <ItemContent>
                      <ItemTitle>{category.name}</ItemTitle>
                    </ItemContent>
                    <ItemDescription
                      className={isDeleting ? "" : "cursor-pointer"}
                      onClick={() =>
                        !isDeleting && handleCategoryPress(category.id)
                      }
                    >
                      <span className="relative h-32 w-full overflow-hidden block">
                        <Image
                          src={`${BASE_URL}/${category.image.small}`}
                          alt={category.name}
                          width={192}
                          height={192}
                          loading="eager"
                          unoptimized={true}
                          className="h-full w-full object-fill"
                        />
                      </span>
                    </ItemDescription>
                    <ItemActions className="w-full flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleCategoryPress(category.id)}
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
                            onClick={() => handleEditCategory(category.id)}
                            disabled={isDeleting}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleRemoveCategory(category.id)}
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Изтриване на категория</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете тази категория? Това
              действие не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteCategory}>
              Отказ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className="bg-red-500 hover:bg-red-600"
            >
              Изтрий
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
