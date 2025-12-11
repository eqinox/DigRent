import {
  CategoryDeleteResponseDto,
  CategoryResponseDto,
} from "@/dto/category.dto";
import { handleFetchBaseQueryError } from "@/lib/helpers";
import { CategoryCreateData, CategoryUpdateData } from "@/validation/category";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { apiSlice } from "../slices/apiSlice";
import CallbackHandlers from "./callback-type";

const fetchCategories = createAsyncThunk(
  "categories/fetch",
  async (_, { dispatch }) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedGet.initiate("/categories")
    )) as { data: CategoryResponseDto[] } | { error: FetchBaseQueryError };

    if ("data" in result) {
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      throw new Error(errorMessage);
    }
  }
);

const createCategory = createAsyncThunk(
  "categories/create",
  async (
    {
      data,
      onSuccess,
      onError,
    }: {
      data: CategoryCreateData;
    } & CallbackHandlers,
    { dispatch }
  ) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedPost.initiate({
        url: "/categories",
        data: data,
      })
    )) as { data: CategoryResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      onSuccess?.("Категорията е създадена успешно");
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

const editCategory = createAsyncThunk(
  "categories/edit",
  async (
    {
      data,
      onSuccess,
      onError,
    }: {
      data: CategoryUpdateData;
    } & CallbackHandlers,
    { dispatch }
  ) => {
    // Grab everything from data except 'id'
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...payload } = data;

    const result = (await dispatch(
      apiSlice.endpoints.authenticatedPatch.initiate({
        url: `/categories/${id}`,
        data: payload,
      })
    )) as { data: CategoryResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      onSuccess?.("Категорията е редактирана успешно");
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (
    {
      categoryId,
      onSuccess,
      onError,
    }: {
      categoryId: string;
    } & CallbackHandlers,
    { dispatch }
  ) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedDelete.initiate(
        `/categories/${categoryId}`
      )
    )) as { data: CategoryDeleteResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      onSuccess?.("Категорията е изтрита успешно");
      return categoryId;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

const findCategoryById = createAsyncThunk(
  "categories/findById",
  async (categoryId: string, { dispatch }) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedGet.initiate(`/categories/${categoryId}`)
    )) as { data: CategoryResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      throw new Error(errorMessage);
    }
  }
);

export {
  createCategory,
  deleteCategory,
  editCategory,
  fetchCategories,
  findCategoryById,
};
