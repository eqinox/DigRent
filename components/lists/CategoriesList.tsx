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

export default function CategoriesList() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(
    (state: RootState) => state.categories.categories
  );
  const isLoading = useAppSelector(
    (state: RootState) => state.categories.isLoading
  );
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

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
          // Refresh categories after deletion
          dispatch(fetchCategories());
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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div>Зареждане...</div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-center">Няма налични категории</p>
          </div>
        ) : (
          <div className="flex w-full gap-6">
            <ItemGroup className="flex flex-row flex-wrap justify-center gap-4">
              {categories.map((category: CategoryResponseDto) => (
                <Item key={category.id} variant="outline" className="w-48">
                  <ItemContent>
                    <ItemTitle>{category.name}</ItemTitle>
                  </ItemContent>
                  <ItemDescription
                    className="cursor-pointer"
                    onClick={() => handleCategoryPress(category.id)}
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
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRemoveCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </div>

          // <div className="flex flex-wrap justify-center gap-6">
          //   {categories.map((category: CategoryResponseDto) => (
          //     <div
          //       key={category.id}
          //       className="flex flex-col items-center space-y-2"
          //     >
          //       <div
          //         className="bg-primary flex h-48 w-48 cursor-pointer items-center justify-center overflow-hidden rounded-lg shadow-md"
          //         onClick={() => handleCategoryPress(category.id)}
          //       >
          //         {category.image ? (
          //           <Image
          //             src={`${BASE_URL}/${category.image.small}`}
          //             alt={category.name}
          //             width={192}
          //             height={192}
          //             loading="eager"
          //             unoptimized={true}
          //             className="h-full w-full object-cover"
          //           />
          //         ) : (
          //           <div className="flex h-full w-full items-center justify-center bg-muted">
          //             <span className="text-muted-foreground">
          //               Няма изображение
          //             </span>
          //           </div>
          //         )}
          //       </div>

          //       {isAdmin && (
          //         <div className="flex gap-2">
          //           <Button
          //             variant="ghost"
          //             size="sm"
          //             onClick={() => handleEditCategory(category.id)}
          //             className="bg-yellow-500 p-2 hover:bg-yellow-600"
          //           >
          //             <Edit className="h-4 w-4 text-white" />
          //           </Button>
          //           <Button
          //             variant="ghost"
          //             size="sm"
          //             onClick={() => handleRemoveCategory(category.id)}
          //             className="bg-red-500 p-2 hover:bg-red-600"
          //           >
          //             <Trash2 className="h-4 w-4 text-white" />
          //           </Button>
          //         </div>
          //       )}

          //       <p className="max-w-48 text-center text-sm font-medium">
          //         {category.name}
          //       </p>
          //     </div>
          //   ))}
          // </div>
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
