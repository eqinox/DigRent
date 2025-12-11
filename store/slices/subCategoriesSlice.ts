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
  subCategories: SubCategoryResponseDto[];
  isLoading: boolean;
  error: string | null;
  selectedSubCategory: SubCategoryResponseDto | null;
  message: string;
}

const initialState: SubCategoriesState = {
  subCategories: [],
  isLoading: false,
  error: null,
  selectedSubCategory: null,
  message: "",
};

export const subCategoriesSlice = createSlice({
  name: "subCategories",
  initialState,
  reducers: {},
  extraReducers(builder) {
    // Fetch subCategories
    builder.addCase(fetchSubCategories.pending, (state, action) => {
      state.isLoading = true;
      state.subCategories = [];
      state.error = null;
      state.message = "";
    });
    builder.addCase(fetchSubCategories.fulfilled, (state, action) => {
      state.isLoading = false;
      state.subCategories = action.payload as SubCategoryResponseDto[];
      state.error = null;
    });
    builder.addCase(fetchSubCategories.rejected, (state, action) => {
      state.isLoading = false;
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
      state.subCategories.push(action.payload as SubCategoryResponseDto);
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
      state.subCategories = state.subCategories.map((subCategory) =>
        subCategory.id === action.payload?.id
          ? (action.payload as SubCategoryResponseDto)
          : subCategory
      );
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
      state.isLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(deleteSubCategory.fulfilled, (state, action) => {
      state.isLoading = false;
      state.subCategories = state.subCategories.filter(
        (subCategory) => subCategory.id !== action.payload
      );
      state.error = null;
    });
    builder.addCase(deleteSubCategory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to delete subCategory";
      state.message = "";
    });
  },
});

export const subCategoriesReducer = subCategoriesSlice.reducer;
