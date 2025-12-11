import {
  LoginResponseDto,
  LogoutResponseDto,
  RegisterResponseDto,
} from "@/dto/auth.dto";
import { handleFetchBaseQueryError } from "@/lib/helpers";
import { LoginFormData, SignupFormData } from "@/validation/authentication";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { apiSlice } from "../slices/apiSlice";
import CallbackHandlers from "./callback-type";

const login = createAsyncThunk(
  "auth/login",
  async (loginData: LoginFormData, { dispatch }) => {
    const result = (await dispatch(
      apiSlice.endpoints.post.initiate({
        url: "/auth/signin",
        data: loginData,
      })
    )) as { data: LoginResponseDto } | { error: FetchBaseQueryError };
    
    if ("data" in result) {
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      throw new Error(errorMessage);
    }
  }
);

const register = createAsyncThunk(
  "auth/register",
  async (signupData: SignupFormData, { dispatch }) => {
    // Exclude confirmPassword when sending to API
    const { confirmPassword, ...registerData } = signupData;

    const result = (await dispatch(
      apiSlice.endpoints.post.initiate({
        url: "/auth/signup",
        data: registerData,
      })
    )) as { data: RegisterResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      throw new Error(errorMessage);
    }
  }
);

const logout = createAsyncThunk(
  "auth/logout",
  async ({ onSuccess, onError }: CallbackHandlers, { dispatch }) => {
    const result = (await dispatch(
      apiSlice.endpoints.authenticatedGet.initiate("/auth/logout")
    )) as { data: LogoutResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      onSuccess?.(result.data.message);
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      onError?.(errorMessage);
      throw new Error(errorMessage);
    }
  }
);

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch }) => {
    // Use the apiSlice's refresh endpoint to get a new token
    // This will use the HTTP-only cookie to refresh the token
    const result = (await dispatch(
      apiSlice.endpoints.get.initiate("/auth/refresh")
    )) as { data: LoginResponseDto } | { error: FetchBaseQueryError };

    if ("data" in result) {
      return result.data;
    } else if ("error" in result) {
      const errorMessage = handleFetchBaseQueryError(result.error);
      throw new Error(errorMessage);
    }
  }
);

export { login, logout, register };
