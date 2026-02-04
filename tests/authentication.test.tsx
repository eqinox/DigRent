import AuthPage from "@/app/(public)/auth/page";
import AuthenticationForm from "@/components/forms/AuthenticationForm";
import Navigation from "@/components/Navigation";
import { LoginResponseDto } from "@/dto/auth.dto";
import { authReducer } from "@/store/slices/authSlice";
import { categoriesReducer } from "@/store/slices/categoriesSlice";
import { login, logout, register } from "@/store/thunks/fetchAuthentication";
import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { Provider } from "react-redux";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/store/thunks/fetchAuthentication", () => {
  const actual = jest.requireActual("@/store/thunks/fetchAuthentication");
  const mockLogin = jest.fn();
  const mockLogout = jest.fn();
  const mockRegister = jest.fn();
  Object.assign(mockLogin, actual.login);
  Object.assign(mockLogout, actual.logout);
  Object.assign(mockRegister, actual.register);
  return {
    ...actual,
    login: mockLogin,
    logout: mockLogout,
    register: mockRegister,
  };
});

const inputIds = {
  email: "email",
  password: "password",
  username: "username",
  confirmPassword: "confirmPassword",
} as const;

const submitButtonId = "submit";

describe("Authentication", () => {
  const renderLoginForm = () => {
    const store = configureStore({
      reducer: { auth: authReducer },
    });

    render(
      <Provider store={store}>
        <AuthPage />
      </Provider>
    );

    const emailInput = document.getElementById(inputIds.email) as HTMLInputElement | null;
    const passwordInput = document.getElementById(inputIds.password) as HTMLInputElement | null;

    return { emailInput, passwordInput };
  };

  describe("Login", () => {
    it("renders only email and password inputs in login mode", () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      render(
        <Provider store={store}>
          <AuthPage />
        </Provider>
      );

      const emailInput = document.getElementById(inputIds.email);
      const passwordInput = document.getElementById(inputIds.password);
      const usernameInput = document.getElementById(inputIds.username);
      const confirmPasswordInput = document.getElementById(inputIds.confirmPassword);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(usernameInput).not.toBeInTheDocument();
      expect(confirmPasswordInput).not.toBeInTheDocument();
    });

    it("shows validation errors when submitting empty login form", async () => {
      const { emailInput, passwordInput } = renderLoginForm();
      const loginButton = document.getElementById(submitButtonId);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(loginButton).toBeInTheDocument();

      const user = userEvent.setup();
      await user.click(loginButton as HTMLButtonElement);

      expect(emailInput).toHaveAttribute("aria-invalid", "true");
      expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    });

    it("shows validation error for invalid email", async () => {
      const { emailInput, passwordInput } = renderLoginForm();
      const loginButton = document.getElementById(submitButtonId);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(loginButton).toBeInTheDocument();

      const user = userEvent.setup();
      await user.type(emailInput as HTMLInputElement, "invalid");
      await user.type(passwordInput as HTMLInputElement, "pass123");
      await user.click(loginButton as HTMLButtonElement);

      expect(emailInput).not.toHaveAttribute("aria-invalid", "true");
      expect(passwordInput).not.toHaveAttribute("aria-invalid", "true");
    });

    it("shows validation error for short password", async () => {
      const { emailInput, passwordInput } = renderLoginForm();
      const loginButton = document.getElementById(submitButtonId);

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(loginButton).toBeInTheDocument();

      const user = userEvent.setup();
      await user.type(emailInput as HTMLInputElement, "user@test.com");
      await user.type(passwordInput as HTMLInputElement, "123");
      await user.click(loginButton as HTMLButtonElement);

      expect(emailInput).not.toHaveAttribute("aria-invalid", "true");
      expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    });

    it("redirects to /categories after successful login", async () => {
      const push = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push });

      type LoginArgs = Parameters<typeof login>[0];
      type LoginThunk = ReturnType<typeof login>;

      const mockedLogin = jest.mocked(login);
      const createMockLoginThunk = (arg: LoginArgs): LoginThunk => {
        const payload: LoginResponseDto = {
          access_token: "test-token",
          user: { id: "1", email: "user@test.com", role: "user" },
        };
        const thunk = (async (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
          const fulfilledAction = login.fulfilled(payload, "test-request", arg);
          dispatch(fulfilledAction);
          return fulfilledAction;
        }) as unknown as LoginThunk;

        return thunk;
      };

      mockedLogin.mockImplementation(createMockLoginThunk);

      const store = configureStore({
        reducer: { auth: authReducer },
      });

      render(
        <Provider store={store}>
          <AuthPage />
        </Provider>
      );

      const user = userEvent.setup();
      const emailInput = document.getElementById(inputIds.email) as HTMLInputElement | null;
      const passwordInput = document.getElementById(inputIds.password) as HTMLInputElement | null;
      const loginButton = document.getElementById(submitButtonId) as HTMLButtonElement | null;

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(loginButton).toBeInTheDocument();

      await user.type(emailInput as HTMLInputElement, "user@test.com");
      await user.type(passwordInput as HTMLInputElement, "pass123");
      await user.click(loginButton as HTMLButtonElement);

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith("/categories");
      });
    });
  });

  describe("Register", () => {
    it("renders email, username, password, and confirm password inputs in register mode", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      render(
        <Provider store={store}>
          <AuthenticationForm />
        </Provider>
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /Регистрация/i }));

      const emailInput = document.getElementById(inputIds.email);
      const usernameInput = document.getElementById(inputIds.username);
      const passwordInput = document.getElementById(inputIds.password);
      const confirmPasswordInput = document.getElementById(inputIds.confirmPassword);

      expect(emailInput).toBeInTheDocument();
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
    });

    it("shows validation errors for required and invalid register fields", async () => {
      const store = configureStore({
        reducer: { auth: authReducer },
      });

      render(
        <Provider store={store}>
          <AuthenticationForm />
        </Provider>
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /Регистрация/i }));

      const emailInput = document.getElementById(inputIds.email) as HTMLInputElement | null;
      const usernameInput = document.getElementById(inputIds.username) as HTMLInputElement | null;
      const passwordInput = document.getElementById(inputIds.password) as HTMLInputElement | null;
      const confirmPasswordInput = document.getElementById(
        inputIds.confirmPassword
      ) as HTMLInputElement | null;
      const registerButton = document.getElementById(submitButtonId) as HTMLButtonElement | null;

      expect(emailInput).toBeInTheDocument();
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(registerButton).toBeInTheDocument();

      const form = emailInput?.closest("form");
      form?.setAttribute("noValidate", "true");

      await user.click(registerButton as HTMLButtonElement);

      expect(emailInput).toHaveAttribute("aria-invalid", "true");
      expect(passwordInput).toHaveAttribute("aria-invalid", "true");
      expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "true");

      await user.type(emailInput as HTMLInputElement, "invalid");
      await user.type(passwordInput as HTMLInputElement, "pass123");
      await user.type(confirmPasswordInput as HTMLInputElement, "pass123");
      await user.click(registerButton as HTMLButtonElement);

      expect(emailInput).toHaveAttribute("aria-invalid", "true");

      await user.clear(passwordInput as HTMLInputElement);
      await user.clear(confirmPasswordInput as HTMLInputElement);
      await user.type(emailInput as HTMLInputElement, "user@test.com");
      await user.type(passwordInput as HTMLInputElement, "123");
      await user.type(confirmPasswordInput as HTMLInputElement, "123");
      await user.click(registerButton as HTMLButtonElement);

      expect(passwordInput).toHaveAttribute("aria-invalid", "true");

      await user.clear(passwordInput as HTMLInputElement);
      await user.clear(confirmPasswordInput as HTMLInputElement);
      await user.type(passwordInput as HTMLInputElement, "pass123");
      await user.type(confirmPasswordInput as HTMLInputElement, "pass124");
      await user.click(registerButton as HTMLButtonElement);

      expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "true");
    });

    it("switches to login and keeps email/password after successful register", async () => {
      type RegisterArgs = Parameters<typeof register>[0];
      type RegisterThunk = ReturnType<typeof register>;

      const mockedRegister = jest.mocked(register);
      const createMockRegisterThunk = (arg: RegisterArgs): RegisterThunk => {
        const thunk = (async (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
          arg.onSuccess?.("ok");
          const fulfilledAction = register.fulfilled(undefined, "test-request", arg);
          dispatch(fulfilledAction);
          return fulfilledAction;
        }) as unknown as RegisterThunk;

        return thunk;
      };

      mockedRegister.mockImplementation(createMockRegisterThunk);

      const store = configureStore({
        reducer: { auth: authReducer },
      });

      render(
        <Provider store={store}>
          <AuthenticationForm />
        </Provider>
      );

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /Регистрация/i }));

      const email = "user@test.com";
      const password = "pass123";

      const emailInput = document.getElementById(inputIds.email) as HTMLInputElement | null;
      const passwordInput = document.getElementById(inputIds.password) as HTMLInputElement | null;
      const confirmPasswordInput = document.getElementById(
        inputIds.confirmPassword
      ) as HTMLInputElement | null;

      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toBeInTheDocument();

      await user.type(emailInput as HTMLInputElement, email);
      await user.type(passwordInput as HTMLInputElement, password);
      await user.type(confirmPasswordInput as HTMLInputElement, password);
      await user.click(document.getElementById(submitButtonId) as HTMLButtonElement);

      await waitFor(() => {
        expect(screen.getByText(/Добре дошли отново/i)).toBeInTheDocument();
      });

      expect(emailInput).toHaveValue(email);
      expect(passwordInput).toHaveValue(password);
    });
  });

  describe("Logout", () => {
    it("logs out from navigation and redirects to /auth", async () => {
      const push = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push });

      type LogoutArgs = Parameters<typeof logout>[0];
      type LogoutThunk = ReturnType<typeof logout>;

      const mockedLogout = jest.mocked(logout);
      const createMockLogoutThunk = (arg: LogoutArgs): LogoutThunk => {
        const thunk = (async (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
          arg.onSuccess?.("ok");
          const fulfilledAction = logout.fulfilled(undefined, "test-request", arg);
          dispatch(fulfilledAction);
          return fulfilledAction;
        }) as unknown as LogoutThunk;

        return thunk;
      };

      mockedLogout.mockImplementation(createMockLogoutThunk);

      const store = configureStore({
        reducer: { auth: authReducer, categories: categoriesReducer },
        preloadedState: {
          auth: {
            token: "test-token",
            isAuthenticated: true,
            isLoading: false,
            error: null,
            user: { id: "user-1", email: "user@test.com", role: "user" },
          },
          categories: {
            categories: [],
            isLoading: false,
            error: null,
            selectedCategory: null,
            message: "",
            deletingCategoryId: null,
            hasFetchedCategories: true,
          },
        },
      });

      const { unmount } = render(
        <Provider store={store}>
          <Navigation />
        </Provider>
      );

      const user = userEvent.setup();
      await user.click(screen.getByText("CN"));
      await user.click(screen.getByText("Изход"));

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith("/auth");
      });
      expect(store.getState().auth.isAuthenticated).toBe(false);
      expect(store.getState().auth.error).toBeNull();

      unmount();

      render(
        <Provider store={store}>
          <AuthPage />
        </Provider>
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
