"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubCategoryResponseDto } from "@/dto/subCategory.dto";
import { handleFetchBaseQueryError } from "@/lib/helpers";
import { RootState, fetchCategories } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { apiSlice } from "@/store/slices/apiSlice";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AddEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddEquipmentDialog({
  open,
  onOpenChange,
}: AddEquipmentDialogProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const categories = useAppSelector(
    (state: RootState) => state.categories.categories
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] =
    useState<string>("");
  const [subCategories, setSubCategories] = useState<SubCategoryResponseDto[]>(
    []
  );
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);

  useEffect(() => {
    if (open && categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [open, categories.length, dispatch]);

  useEffect(() => {
    if (selectedCategoryId) {
      setIsLoadingSubCategories(true);
      setSubCategories([]);
      setSelectedSubCategoryId("");

      dispatch(
        apiSlice.endpoints.authenticatedGet.initiate(
          `/categories/${selectedCategoryId}/sub-categories`
        )
      )
        .then((result) => {
          if ("data" in result) {
            setSubCategories(result.data as SubCategoryResponseDto[]);
          } else if ("error" in result) {
            const errorMessage = handleFetchBaseQueryError(
              result.error as FetchBaseQueryError
            );
            console.error("Failed to fetch sub-categories:", errorMessage);
          }
        })
        .finally(() => {
          setIsLoadingSubCategories(false);
        });
    } else {
      setSubCategories([]);
      setSelectedSubCategoryId("");
    }
  }, [selectedCategoryId, dispatch]);

  const handleClose = () => {
    onOpenChange(false);
    setSelectedCategoryId("");
    setSelectedSubCategoryId("");
    setSubCategories([]);
  };

  const handleContinue = () => {
    if (selectedSubCategoryId) {
      router.push(`/equipment/add?subCategoryId=${selectedSubCategoryId}`);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Избери категория и подкатегория</DialogTitle>
          <DialogDescription>
            Изберете категория и подкатегория, към която да добавите оборудване
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="equipment-category-select">Категория</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger id="equipment-category-select">
                <SelectValue placeholder="Изберете категория" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="equipment-subcategory-select">Подкатегория</Label>
            <Select
              value={selectedSubCategoryId}
              onValueChange={setSelectedSubCategoryId}
              disabled={!selectedCategoryId || isLoadingSubCategories}
            >
              <SelectTrigger id="equipment-subcategory-select">
                <SelectValue
                  placeholder={
                    isLoadingSubCategories
                      ? "Зареждане..."
                      : selectedCategoryId
                      ? "Изберете подкатегория"
                      : "Първо изберете категория"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {subCategories.map((subCategory) => (
                  <SelectItem key={subCategory.id} value={subCategory.id}>
                    {subCategory.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отказ
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedSubCategoryId || isLoadingSubCategories}
          >
            Продължи
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
