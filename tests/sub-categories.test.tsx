import SubCategoryPage from "@/app/(private)/sub-category/[id]/page";
import AddSubCategoryPage from "@/app/(private)/sub-category/add/page";
import EditSubCategoryPage from "@/app/(private)/sub-category/edit/[id]/page";
import SubCategorySuccessPage from "@/app/(private)/sub-category/success/page";
import { SubCategoryResponseDto } from "@/dto/subCategory.dto";
import { authReducer } from "@/store/slices/authSlice";
import { subCategoriesReducer } from "@/store/slices/subCategoriesSlice";
import {
  createSubCategory,
  deleteSubCategory,
  editSubCategory,
  findSubCategoryById,
} from "@/store/thunks/fetchSubCategories";
import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import { Provider } from "react-redux";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
      }}
    >
      {children}
    </a>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    fill,
    unoptimized,
    ...props
  }: React.ComponentProps<"img"> & {
    fill?: boolean;
    unoptimized?: boolean;
  }) => <img {...props} />,
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/store/thunks/fetchSubCategories", () => {
  const actual = jest.requireActual("@/store/thunks/fetchSubCategories");
  const mockCreateSubCategory = jest.fn();
  const mockDeleteSubCategory = jest.fn();
  const mockEditSubCategory = jest.fn();
  const mockFindSubCategoryById = jest.fn();
  Object.assign(mockCreateSubCategory, actual.createSubCategory);
  Object.assign(mockDeleteSubCategory, actual.deleteSubCategory);
  Object.assign(mockEditSubCategory, actual.editSubCategory);
  Object.assign(mockFindSubCategoryById, actual.findSubCategoryById);
  return {
    ...actual,
    createSubCategory: mockCreateSubCategory,
    deleteSubCategory: mockDeleteSubCategory,
    editSubCategory: mockEditSubCategory,
    findSubCategoryById: mockFindSubCategoryById,
  };
});

const rootReducer = combineReducers({
  auth: authReducer,
  subCategories: subCategoriesReducer,
});

const createStore = (preloadedState?: Partial<ReturnType<typeof rootReducer>>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });

class MockFileReader {
  result: string | null = null;
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;

  readAsDataURL() {
    this.result = "data:image/png;base64,MOCK_IMAGE";
    this.onload?.(new ProgressEvent("load") as ProgressEvent<FileReader>);
  }
}

const categoryFixture = {
  id: "cat-1",
  name: "Категория 1",
  image: { original: "image-1.png", small: "image-1.png" },
  creatorId: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const subCategoriesFixture: SubCategoryResponseDto[] = [
  {
    id: "sub-1",
    category: categoryFixture,
    type: "Подкатегория 1",
    minRange: 10,
    maxRange: 20,
    image: { original: "sub-1.png", small: "sub-1.png" },
    creatorId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sub-2",
    category: categoryFixture,
    type: "Подкатегория 2",
    minRange: 30,
    maxRange: 40,
    image: { original: "sub-2.png", small: "sub-2.png" },
    creatorId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("Sub-categories list", () => {
  it("lists sub-categories for the category", async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    const categoryId = "cat-1";
    const store = createStore({
      subCategories: {
        subCategoriesByCategory: {
          [categoryId]: subCategoriesFixture.map((subCategory) => ({
            ...subCategory,
          })),
        },
        isLoading: false,
        loadingCategoryId: null,
        error: null,
        selectedSubCategory: null,
        message: "",
        deletingSubCategoryId: null,
        hasFetchedSubCategoriesByCategory: {
          [categoryId]: true,
        },
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <SubCategoryPage params={Promise.resolve({ id: categoryId })} />
        </Provider>
      );
    });

    subCategoriesFixture.forEach((subCategory) => {
      expect(screen.getByText(subCategory.type)).toBeInTheDocument();
    });
    expect(screen.queryByText("Няма налични подкатегории")).not.toBeInTheDocument();
  });

  it("shows empty state when no sub-categories exist", async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    const categoryId = "cat-1";
    const store = createStore({
      subCategories: {
        subCategoriesByCategory: {
          [categoryId]: [],
        },
        isLoading: false,
        loadingCategoryId: null,
        error: null,
        selectedSubCategory: null,
        message: "",
        deletingSubCategoryId: null,
        hasFetchedSubCategoriesByCategory: {
          [categoryId]: true,
        },
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <SubCategoryPage params={Promise.resolve({ id: categoryId })} />
        </Provider>
      );
    });

    expect(screen.getByText("Няма налични подкатегории")).toBeInTheDocument();
  });
});

describe("Sub-categories CRUD operations", () => {
  beforeAll(() => {
    (global as typeof globalThis).FileReader = MockFileReader as unknown as typeof FileReader;
    (global as typeof globalThis).URL.createObjectURL = jest.fn(() => "blob:mock");
    (global as typeof globalThis).URL.revokeObjectURL = jest.fn();
  });

  it("creates sub-category, redirects to success, and shows it in the list", async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => {
        if (key === "categoryId") return "f2b92495-fd88-4199-b875-730de7568d58";
        if (key === "mode") return "create";
        if (key === "type") return "Тестова подкатегория";
        return null;
      },
    });

    type CreateArgs = Parameters<typeof createSubCategory>[0];
    type CreateThunk = ReturnType<typeof createSubCategory>;

    const mockedCreateSubCategory = jest.mocked(createSubCategory);
    mockedCreateSubCategory.mockImplementation((arg: CreateArgs): CreateThunk => {
      const payload: SubCategoryResponseDto = {
        id: "sub-3",
        category: {
          ...categoryFixture,
          id: arg.data.categoryId,
        },
        type: arg.data.type,
        minRange: arg.data.minRange,
        maxRange: arg.data.maxRange,
        image: { original: "sub-10.png", small: "sub-10.png" },
        creatorId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const thunk = (async (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
        arg.onSuccess?.("ok");
        const fulfilledAction = createSubCategory.fulfilled(payload, "test-request", arg);
        dispatch(fulfilledAction);
        return fulfilledAction;
      }) as unknown as CreateThunk;

      return thunk;
    });

    const categoryId = "f2b92495-fd88-4199-b875-730de7568d58";
    const store = createStore({
      subCategories: {
        subCategoriesByCategory: {
          [categoryId]: [],
        },
        isLoading: false,
        loadingCategoryId: null,
        error: null,
        selectedSubCategory: null,
        message: "",
        deletingSubCategoryId: null,
        hasFetchedSubCategoriesByCategory: {
          [categoryId]: true,
        },
      },
    });

    const { container } = render(
      <Provider store={store}>
        <AddSubCategoryPage />
      </Provider>
    );

    const user = userEvent.setup();
    const typeInput = screen.getByPlaceholderText("Въведете тип");
    const rangeInputs = screen.getAllByPlaceholderText("0");
    const minRangeInput = rangeInputs[0];
    const maxRangeInput = rangeInputs[1];
    const imageInput = await waitFor(() => container.querySelector('input[type="file"]'));
    expect(imageInput).toBeInTheDocument();

    await user.type(typeInput, "Тестова подкатегория");
    await user.type(minRangeInput, "1");
    await user.type(maxRangeInput, "5");
    await user.upload(
      imageInput as HTMLInputElement,
      new File(["image"], "image.png", { type: "image/png" })
    );
    await user.click(screen.getByRole("button", { name: "Създай подкатегория" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        "/sub-category/success?mode=create&type=%D0%A2%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%B0%20%D0%BF%D0%BE%D0%B4%D0%BA%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D1%8F&categoryId=f2b92495-fd88-4199-b875-730de7568d58"
      );
    });

    const userSuccess = userEvent.setup();
    const { unmount } = render(<SubCategorySuccessPage />);

    const backLink = screen.getByRole("link", { name: "Към под категорията" });
    expect(backLink).toHaveAttribute("href", `/sub-category/${categoryId}`);

    await userSuccess.click(backLink);

    unmount();

    await act(async () => {
      render(
        <Provider store={store}>
          <SubCategoryPage params={Promise.resolve({ id: categoryId })} />
        </Provider>
      );
    });

    expect(screen.getByText("Тестова подкатегория")).toBeInTheDocument();
  });

  it("edits sub-category, redirects to success, and shows updated list entry", async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => {
        if (key === "categoryId") return "cat-1";
        if (key === "mode") return "edit";
        if (key === "type") return "Обновена подкатегория";
        return null;
      },
    });

    type EditArgs = Parameters<typeof editSubCategory>[0];
    type EditThunk = ReturnType<typeof editSubCategory>;
    type FindArgs = Parameters<typeof findSubCategoryById>[0];
    type FindThunk = ReturnType<typeof findSubCategoryById>;

    const mockedEditSubCategory = jest.mocked(editSubCategory);
    mockedEditSubCategory.mockImplementation((arg: EditArgs): EditThunk => {
      const payload: SubCategoryResponseDto = {
        id: arg.data.id,
        category: {
          ...categoryFixture,
          id: "cat-1",
        },
        type: arg.data.type,
        minRange: arg.data.minRange,
        maxRange: arg.data.maxRange,
        image: { original: "sub-1-updated.png", small: "sub-1-updated.png" },
        creatorId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const thunk = (async (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
        arg.onSuccess?.("ok");
        const fulfilledAction = editSubCategory.fulfilled(payload, "test-request", arg);
        dispatch(fulfilledAction);
        return fulfilledAction;
      }) as unknown as EditThunk;

      return thunk;
    });

    const mockedFindSubCategoryById = jest.mocked(findSubCategoryById);
    mockedFindSubCategoryById.mockImplementation((arg: FindArgs): FindThunk => {
      const payload: SubCategoryResponseDto = {
        id: arg,
        category: {
          ...categoryFixture,
          id: "cat-1",
        },
        type: "Подкатегория 1",
        minRange: 10,
        maxRange: 20,
        image: { original: "sub-1.png", small: "sub-1.png" },
        creatorId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const thunk = (async (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
        const fulfilledAction = findSubCategoryById.fulfilled(payload, "test-request", arg);
        dispatch(fulfilledAction);
        return fulfilledAction;
      }) as unknown as FindThunk;

      return thunk;
    });

    const categoryId = "cat-1";
    const store = createStore({
      subCategories: {
        subCategoriesByCategory: {
          [categoryId]: subCategoriesFixture.map((subCategory) => ({
            ...subCategory,
          })),
        },
        isLoading: false,
        loadingCategoryId: null,
        error: null,
        selectedSubCategory: null,
        message: "",
        deletingSubCategoryId: null,
        hasFetchedSubCategoriesByCategory: {
          [categoryId]: true,
        },
      },
    });

    let container: HTMLElement;
    await act(async () => {
      const rendered = render(
        <Provider store={store}>
          <EditSubCategoryPage params={Promise.resolve({ id: "sub-1" })} />
        </Provider>
      );
      container = rendered.container;
    });

    const user = userEvent.setup();
    const typeInput = await screen.findByPlaceholderText("Въведете тип");
    const imageInput = await waitFor(() => container.querySelector('input[type="file"]'));
    expect(imageInput).toBeInTheDocument();

    await user.clear(typeInput);
    await user.type(typeInput, "Обновена подкатегория");
    await user.upload(
      imageInput as HTMLInputElement,
      new File(["image"], "image-updated.png", { type: "image/png" })
    );
    await user.click(screen.getByRole("button", { name: "Запази промените" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        "/sub-category/success?mode=edit&type=%D0%9E%D0%B1%D0%BD%D0%BE%D0%B2%D0%B5%D0%BD%D0%B0%20%D0%BF%D0%BE%D0%B4%D0%BA%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D1%8F&categoryId=cat-1"
      );
    });

    const userSuccess = userEvent.setup();
    const { unmount } = render(<SubCategorySuccessPage />);

    const backLink = screen.getByRole("link", { name: "Към под категорията" });
    expect(backLink).toHaveAttribute("href", `/sub-category/${categoryId}`);

    await userSuccess.click(backLink);

    unmount();

    await act(async () => {
      render(
        <Provider store={store}>
          <SubCategoryPage params={Promise.resolve({ id: categoryId })} />
        </Provider>
      );
    });

    expect(screen.getByText("Обновена подкатегория")).toBeInTheDocument();
  });

  it("deletes the only sub-category and shows empty state text", async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    const categoryId = "cat-1";
    const store = createStore({
      subCategories: {
        subCategoriesByCategory: {
          [categoryId]: [
            {
              id: "sub-1",
              category: {
                ...categoryFixture,
                id: categoryId,
              },
              type: "Подкатегория 1",
              minRange: 10,
              maxRange: 20,
              image: { original: "sub-1.png", small: "sub-1.png" },
              creatorId: "user-1",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
        isLoading: false,
        loadingCategoryId: null,
        error: null,
        selectedSubCategory: null,
        message: "",
        deletingSubCategoryId: null,
        hasFetchedSubCategoriesByCategory: {
          [categoryId]: true,
        },
      },
    });

    await act(async () => {
      store.dispatch(
        deleteSubCategory.fulfilled("sub-1", "test-request", {
          subCategoryId: "sub-1",
        })
      );
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <SubCategoryPage params={Promise.resolve({ id: categoryId })} />
        </Provider>
      );
    });

    expect(screen.getByText("Няма налични подкатегории")).toBeInTheDocument();
  });
});
