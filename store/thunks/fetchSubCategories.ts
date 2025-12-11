import {
  SubCategoryDeleteResponseDto,
  SubCategoryResponseDto,
} from "@/dto/subCategory.dto";
import { handleFetchBaseQueryError } from "@/lib/helpers";
import {
  SubCategoryCreateData,
  SubCategoryUpdateData,
} from "@/validation/subCategory";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { apiSlice } from "../slices/apiSlice";
import CallbackHandlers from "./callback-type";

const fetchSubCategories = createAsyncThunk(
  "subCategories/fetch",
  async (categoryId: string, { dispatch }) => {
    console.log("fetching sub categories");
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedGet.initiate(
        `/categories/${categoryId}/sub-categories`
      )
    )) as { data: SubCategoryResponseDto[] } | { error: FetchBaseQueryError };

    if ("data" in result) {
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      throw new Error(errorMessage);
    }
  }
);

const createSubCategory = createAsyncThunk(
  "subCategories/create",
  async (
    {
      data,
      onSuccess,
      onError,
    }: {
      data: SubCategoryCreateData;
    } & CallbackHandlers,
    { dispatch }
  ) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedPost.initiate({
        url: "/sub-categories",
        data: data,
      })
    )) as { data: SubCategoryResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      onSuccess?.("Подкатегорията е създадена успешно");
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

const editSubCategory = createAsyncThunk(
  "subCategories/edit",
  async (
    {
      data,
      onSuccess,
      onError,
    }: {
      data: SubCategoryUpdateData;
    } & CallbackHandlers,
    { dispatch }
  ) => {
    // Grab everything from data except 'id'
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...payload } = data;

    const result = (await dispatch(
      apiSlice.endpoints.authenticatedPatch.initiate({
        url: `/sub-categories/${id}`,
        data: payload,
      })
    )) as { data: SubCategoryResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      onSuccess?.("Подкатегорията е редактирана успешно");
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

const findSubCategoryById = createAsyncThunk(
  "subCategories/findById",
  async (subCategoryId: string, { dispatch }) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedGet.initiate(
        `/sub-categories/${subCategoryId}`
      )
    )) as { data: SubCategoryResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      throw new Error(errorMessage);
    }
  }
);

const deleteSubCategory = createAsyncThunk(
  "subCategories/delete",
  async (
    {
      subCategoryId,
      onSuccess,
      onError,
    }: {
      subCategoryId: string;
    } & CallbackHandlers,
    { dispatch }
  ) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedDelete.initiate(
        `/sub-categories/${subCategoryId}`
      )
    )) as
      | { data: SubCategoryDeleteResponseDto }
      | { error: FetchBaseQueryError };

    if ("data" in result) {
      onSuccess?.("Подкатегорията е изтрита успешно");
      return subCategoryId;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

export {
  createSubCategory,
  deleteSubCategory,
  editSubCategory,
  fetchSubCategories,
  findSubCategoryById,
};
