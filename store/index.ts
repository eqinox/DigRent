import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import { authReducer } from "./slices/authSlice";
import { categoriesReducer } from "./slices/categoriesSlice";
import { equipmentsReducer } from "./slices/equipmentsSlice";
import { subCategoriesReducer } from "./slices/subCategoriesSlice";

export type RootState = ReturnType<typeof store.getState>;

const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    equipments: equipmentsReducer,
    subCategories: subCategoriesReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export * from "./slices/authSlice";
export * from "./thunks/fetchAuthentication";
export * from "./thunks/fetchCategories";
export * from "./thunks/fetchEquipments";
export * from "./thunks/fetchSubCategories";
export { store };
export type AppDispatch = typeof store.dispatch;
