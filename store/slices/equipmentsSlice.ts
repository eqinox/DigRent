import { EquipmentResponseDto } from "@/dto/equipment.dto";
import { createSlice } from "@reduxjs/toolkit";
import {
  createEquipment,
  deleteEquipment,
  fetchEquipmentsByOwnerId,
  fetchEquipmentsBySubCategoryId,
  findEquipmentById,
  updateEquipment,
} from "../thunks/fetchEquipments";

export interface EquipmentsState {
  equipments: EquipmentResponseDto[];
  isLoading: boolean;
  error: string | null;
  selectedEquipment: EquipmentResponseDto | null;
  message: string;
}

const initialState: EquipmentsState = {
  equipments: [],
  isLoading: false,
  error: null,
  selectedEquipment: null,
  message: "",
};

export const equipmentsSlice = createSlice({
  name: "equipments",
  initialState,
  reducers: {},
  extraReducers(builder) {
    // Fetch equipments
    builder.addCase(fetchEquipmentsBySubCategoryId.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(
      fetchEquipmentsBySubCategoryId.fulfilled,
      (state, action) => {
        state.isLoading = false;
        state.equipments = action.payload as EquipmentResponseDto[];
        state.error = null;
      }
    );
    builder.addCase(
      fetchEquipmentsBySubCategoryId.rejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch equipments";
        state.message = "";
      }
    );

    // Create equipment
    builder.addCase(createEquipment.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(createEquipment.fulfilled, (state, action) => {
      state.isLoading = false;
      state.equipments.push(action.payload as EquipmentResponseDto);
      state.error = null;
    });
    builder.addCase(createEquipment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to create equipment";
      state.message = "";
    });

    // Delete equipment
    builder.addCase(deleteEquipment.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(deleteEquipment.fulfilled, (state, action) => {
      state.isLoading = false;
      state.equipments = state.equipments.filter(
        (equipment) => equipment.id !== action.payload
      );
      state.error = null;
    });
    builder.addCase(deleteEquipment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to delete equipment";
      state.message = "";
    });

    // Find equipment by ID
    builder.addCase(findEquipmentById.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(findEquipmentById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedEquipment = action.payload as EquipmentResponseDto;
      state.error = null;
    });
    builder.addCase(findEquipmentById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to fetch equipment";
      state.message = "";
    });

    // Fetch equipments by owner ID
    builder.addCase(fetchEquipmentsByOwnerId.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(fetchEquipmentsByOwnerId.fulfilled, (state, action) => {
      state.isLoading = false;
      state.equipments = action.payload as EquipmentResponseDto[];
      state.error = null;
    });
    builder.addCase(fetchEquipmentsByOwnerId.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to fetch equipments";
      state.message = "";
    });

    // Update equipment
    builder.addCase(updateEquipment.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.message = "";
    });
    builder.addCase(updateEquipment.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedEquipment = action.payload as EquipmentResponseDto;
      const index = state.equipments.findIndex(
        (eq) => eq.id === updatedEquipment.id
      );
      if (index !== -1) {
        state.equipments[index] = updatedEquipment;
      }
      if (state.selectedEquipment?.id === updatedEquipment.id) {
        state.selectedEquipment = updatedEquipment;
      }
      state.error = null;
    });
    builder.addCase(updateEquipment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to update equipment";
      state.message = "";
    });
  },
});

export const equipmentsReducer = equipmentsSlice.reducer;
