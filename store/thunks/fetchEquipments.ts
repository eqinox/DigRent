import {
  EquipmentDeleteResponseDto,
  EquipmentResponseDto,
} from "@/dto/equipment.dto";
import { handleFetchBaseQueryError } from "@/lib/helpers";
import { EquipmentFormData } from "@/validation/equipment";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { apiSlice } from "../slices/apiSlice";
import CallbackHandlers from "./callback-type";

// Interface for common callback parameters

const fetchEquipmentsBySubCategoryId = createAsyncThunk(
  "equipments/fetchBySubCategoryId",
  async (subCategoryId: string, { dispatch }) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedGet.initiate(
        `/equipment/sub-category/${subCategoryId}`
      )
    )) as { data: EquipmentResponseDto[] } | { error: FetchBaseQueryError };

    if ("data" in result) {
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      throw new Error(errorMessage);
    }
  }
);

const createEquipment = createAsyncThunk(
  "equipments/create",
  async (
    {
      data,
      onSuccess,
      onError,
    }: {
      data: EquipmentFormData;
    } & CallbackHandlers,
    { dispatch }
  ) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedPost.initiate({
        url: "/equipment",
        data,
      })
    )) as { data: EquipmentResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      onSuccess?.("Оборудването е създадено успешно");
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

const deleteEquipment = createAsyncThunk(
  "equipments/delete",
  async (
    {
      equipmentId,
      onSuccess,
      onError,
    }: {
      equipmentId: string;
    } & CallbackHandlers,
    { dispatch }
  ) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedDelete.initiate(
        `/equipment/${equipmentId}`
      )
    )) as { data: EquipmentDeleteResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      onSuccess?.(result.data.message);
      return equipmentId;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

const findEquipmentById = createAsyncThunk(
  "equipments/findById",
  async (equipmentId: string, { dispatch }) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedGet.initiate(`/equipment/${equipmentId}`)
    )) as { data: EquipmentResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      throw new Error(errorMessage);
    }
  }
);

const fetchEquipmentsByOwnerId = createAsyncThunk(
  "equipments/fetchByOwnerId",
  async (ownerId: string, { dispatch }) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedGet.initiate(
        `/equipment/owner/${ownerId}`
      )
    )) as { data: EquipmentResponseDto[] } | { error: FetchBaseQueryError };

    if ("data" in result) {
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      throw new Error(errorMessage);
    }
  }
);

const updateEquipment = createAsyncThunk(
  "equipments/update",
  async (
    {
      equipmentId,
      data,
      onSuccess,
      onError,
    }: {
      equipmentId: string;
      data: EquipmentFormData;
    } & CallbackHandlers,
    { dispatch }
  ) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedPut.initiate({
        url: `/equipment/${equipmentId}`,
        data: JSON.stringify(data),
      })
    )) as { data: EquipmentResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      onSuccess?.("Оборудването е обновено успешно");
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

export {
  createEquipment,
  deleteEquipment,
  fetchEquipmentsByOwnerId,
  fetchEquipmentsBySubCategoryId,
  findEquipmentById,
  updateEquipment,
};
