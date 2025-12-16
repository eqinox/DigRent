import { SubCategoryResponseDto } from "@/dto/subCategory.dto";
import { createSlice } from "@reduxjs/toolkit";
import {
  createSubCategory,
  deleteSubCategory,
  editSubCategory,
  fetchSubCategories,
  findSubCategoryById,
} from "../thunks/fetchSubCategories";

export interface SubCategoriesState {
  subCategoriesByCategory: Record<string, SubCategoryResponseDto[]>;
  isLoading: boolean;
  loadingCategoryId: string | null;
  error: string | null;
  selectedSubCategory: SubCategoryResponseDto | null;
  message: string;
  deletingSubCategoryId: string | null;
  hasFetchedSubCategoriesByCategory: Record<string, boolean>;
}

const initialState: SubCategoriesState = {
  subCategoriesByCategory: {},
  isLoading: false,
  loadingCategoryId: null,
  error: null,
  selectedSubCategory: null,
  message: "",
  deletingSubCategoryId: null,
  hasFetchedSubCategoriesByCategory: {},
};

export const subCategoriesSlice = createSlice({
  name: "subCategories",
  initialState,
  reducers: {
    resetSelectedSubCategory: (state) => {
      state.selectedSubCategory = null;
    },
  },
  extraReducers(builder) {
    // Fetch subCategories
    builder.addCase(fetchSubCategories.pending, (state, action) => {
      state.isLoading = true;
      state.loadingCategoryId = action.meta.arg as string;
      state.error = null;
      state.message = "";
    });
    builder.addCase(fetchSubCategories.fulfilled, (state, action) => {
      state.isLoading = false;
      state.loadingCategoryId = null;
      const payload = action.payload as {
        subCategories: SubCategoryResponseDto[];
        categoryId: string;
      };
      state.subCategoriesByCategory[payload.categoryId] = payload.subCategories;
      state.hasFetchedSubCategoriesByCategory[payload.categoryId] = true;
      state.error = null;
    });
    builder.addCase(fetchSubCategories.rejected, (state, action) => {
      state.isLoading = false;
      state.loadingCategoryId = null;
      state.error = action.error.message || "Failed to fetch subCategories";
      state.message = "";
    });

    // Create subCategory
    builder.addCase(createSubCategory.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createSubCategory.fulfilled, (state, action) => {
      state.isLoading = false;
      const newSubCategory = action.payload as SubCategoryResponseDto;
      const categoryId = newSubCategory.categoryId;
      if (!state.subCategoriesByCategory[categoryId]) {
        state.subCategoriesByCategory[categoryId] = [];
      }
      state.subCategoriesByCategory[categoryId].push(newSubCategory);
      state.error = null;
    });
    builder.addCase(createSubCategory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to create subCategory";
      state.message = "";
    });

    // Edit subCategory
    builder.addCase(editSubCategory.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(editSubCategory.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedSubCategory = action.payload as SubCategoryResponseDto;
      const categoryId = updatedSubCategory.categoryId;
      if (state.subCategoriesByCategory[categoryId]) {
        state.subCategoriesByCategory[categoryId] =
          state.subCategoriesByCategory[categoryId].map((subCategory) =>
            subCategory.id === updatedSubCategory.id
              ? updatedSubCategory
              : subCategory
          );
      }
      state.error = null;
    });
    builder.addCase(editSubCategory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to edit subCategory";
      state.message = "";
    });

    // Find subCategory by id
    builder.addCase(findSubCategoryById.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(findSubCategoryById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedSubCategory = action.payload as SubCategoryResponseDto;
      state.error = null;
    });
    builder.addCase(findSubCategoryById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to find subCategory by id";
      state.message = "";
    });

    // Delete subCategory
    builder.addCase(deleteSubCategory.pending, (state, action) => {
      state.deletingSubCategoryId = action.meta.arg.subCategoryId;
      state.error = null;
      state.message = "";
    });
    builder.addCase(deleteSubCategory.fulfilled, (state, action) => {
      state.deletingSubCategoryId = null;
      const deletedSubCategoryId = action.payload as string;
      // Find and remove from the appropriate category
      for (const categoryId in state.subCategoriesByCategory) {
        state.subCategoriesByCategory[categoryId] =
          state.subCategoriesByCategory[categoryId].filter(
            (subCategory) => subCategory.id !== deletedSubCategoryId
          );
      }
      state.error = null;
    });
    builder.addCase(deleteSubCategory.rejected, (state, action) => {
      state.deletingSubCategoryId = null;
      state.error = action.error.message || "Failed to delete subCategory";
      state.message = "";
    });
  },
});

export const subCategoriesReducer = subCategoriesSlice.reducer;
export const { resetSelectedSubCategory } = subCategoriesSlice.actions;
