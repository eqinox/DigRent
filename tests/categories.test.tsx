import CategoriesPage from "@/app/(private)/categories/page";
import AddCategoryPage from "@/app/(private)/category/add/page";
import EditCategoryPage from "@/app/(private)/category/edit/[id]/page";
import CategorySuccessPage from "@/app/(private)/category/success/page";
import { CategoryResponseDto } from "@/dto/category.dto";
import { authReducer } from "@/store/slices/authSlice";
import { categoriesReducer } from "@/store/slices/categoriesSlice";
import {
  createCategory,
  deleteCategory,
  editCategory,
  findCategoryById,
} from "@/store/thunks/fetchCategories";
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

jest.mock("@/store/thunks/fetchCategories", () => {
  const actual = jest.requireActual("@/store/thunks/fetchCategories");
  const mockCreateCategory = jest.fn();
  const mockDeleteCategory = jest.fn();
  const mockEditCategory = jest.fn();
  const mockFindCategoryById = jest.fn();
  Object.assign(mockCreateCategory, actual.createCategory);
  Object.assign(mockDeleteCategory, actual.deleteCategory);
  Object.assign(mockEditCategory, actual.editCategory);
  Object.assign(mockFindCategoryById, actual.findCategoryById);
  return {
    ...actual,
    createCategory: mockCreateCategory,
    deleteCategory: mockDeleteCategory,
    editCategory: mockEditCategory,
    findCategoryById: mockFindCategoryById,
  };
});

const rootReducer = combineReducers({
  auth: authReducer,
  categories: categoriesReducer,
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

const categoriesFixture: CategoryResponseDto[] = [
  {
    id: "cat-1",
    name: "Категория 1",
    image: { original: "image-1.png", small: "image-1.png" },
    creatorId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cat-2",
    name: "Категория 2",
    image: { original: "image-2.png", small: "image-2.png" },
    creatorId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cat-3",
    name: "Категория 3",
    image: { original: "image-3.png", small: "image-3.png" },
    creatorId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("Categories CRUD operations", () => {
  beforeAll(() => {
    (global as typeof globalThis).FileReader = MockFileReader as unknown as typeof FileReader;
    (global as typeof globalThis).URL.createObjectURL = jest.fn(() => "blob:mock");
    (global as typeof globalThis).URL.revokeObjectURL = jest.fn();
  });

  describe("Add", () => {
    it("from empty categories creates category, redirects to success, and shows it in the list", async () => {
      const push = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push });
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (key: string) => {
          if (key === "mode") return "create";
          if (key === "name") return "Нова категория";
          return null;
        },
      });

      type CreateArgs = Parameters<typeof createCategory>[0];
      type CreateThunk = ReturnType<typeof createCategory>;

      const mockedCreateCategory = jest.mocked(createCategory);
      mockedCreateCategory.mockImplementation((arg: CreateArgs): CreateThunk => {
        const payload: CategoryResponseDto = {
          id: "cat-4",
          name: arg.data.name,
          image: { original: "image.png", small: "image.png" },
          creatorId: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const thunk = (async (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
          arg.onSuccess?.("ok");
          const fulfilledAction = createCategory.fulfilled(payload, "test-request", arg);
          dispatch(fulfilledAction);
          return fulfilledAction;
        }) as unknown as CreateThunk;

        return thunk;
      });

      const store = createStore({
        categories: {
          categories: categoriesFixture.map((category) => ({ ...category })),
          isLoading: false,
          error: null,
          selectedCategory: null,
          message: "",
          deletingCategoryId: null,
          hasFetchedCategories: true,
        },
      });
      const { container } = render(
        <Provider store={store}>
          <AddCategoryPage />
        </Provider>
      );

      const user = userEvent.setup();
      const nameInput = await screen.findByLabelText(/Име на категорията/i);
      const imageInput = await waitFor(() => container.querySelector('input[type="file"]'));
      expect(imageInput).toBeInTheDocument();

      const name = "Нова категория";
      await user.type(nameInput, name);
      await user.upload(
        imageInput as HTMLInputElement,
        new File(["image"], "image.png", { type: "image/png" })
      );
      await user.click(document.getElementById("submit") as HTMLButtonElement);

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          `/category/success?mode=create&name=${encodeURIComponent(name)}`
        );
      });

      const userSuccess = userEvent.setup();
      const { unmount } = render(<CategorySuccessPage />);

      const backLink = screen.getByRole("link", { name: /Към списъка/i });
      expect(backLink).toHaveAttribute("href", "/categories");

      await userSuccess.click(backLink);

      unmount();

      render(
        <Provider store={store}>
          <CategoriesPage />
        </Provider>
      );

      expect(screen.getByText("Нова категория")).toBeInTheDocument();
      expect(screen.getByAltText("Нова категория")).toBeInTheDocument();
    });

    it("from non-empty categories adds one more category to the list and lists all", async () => {
      const store = createStore({
        categories: {
          categories: categoriesFixture.map((category) => ({ ...category })),
          isLoading: false,
          error: null,
          selectedCategory: null,
          message: "",
          deletingCategoryId: null,
          hasFetchedCategories: true,
        },
      });

      render(
        <Provider store={store}>
          <CategoriesPage />
        </Provider>
      );

      const newCategory: CategoryResponseDto = {
        id: "cat-4",
        name: "Категория 4",
        image: { original: "image-4.png", small: "image-4.png" },
        creatorId: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await act(async () => {
        store.dispatch(
          createCategory.fulfilled(newCategory, "test-request", {
            data: { name: newCategory.name, image: newCategory.image.original },
          })
        );
      });

      categoriesFixture.concat(newCategory).forEach((category) => {
        expect(screen.getByText(category.name)).toBeInTheDocument();
      });
    });
  });

  describe("Edit", () => {
    it("edits category, redirects to success, and shows updated list entry", async () => {
      const push = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push });
      (useSearchParams as jest.Mock).mockReturnValue({
        get: (key: string) => {
          if (key === "mode") return "edit";
          if (key === "name") return "Обновена категория";
          return null;
        },
      });

      type EditArgs = Parameters<typeof editCategory>[0];
      type EditThunk = ReturnType<typeof editCategory>;
      type FindArgs = Parameters<typeof findCategoryById>[0];
      type FindThunk = ReturnType<typeof findCategoryById>;

      const mockedEditCategory = jest.mocked(editCategory);
      mockedEditCategory.mockImplementation((arg: EditArgs): EditThunk => {
        const payload: CategoryResponseDto = {
          id: arg.data.id,
          name: arg.data.name,
          image: { original: "image-new.png", small: "image-new.png" },
          creatorId: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const thunk = (async (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
          arg.onSuccess?.("ok");
          const fulfilledAction = editCategory.fulfilled(payload, "test-request", arg);
          dispatch(fulfilledAction);
          return fulfilledAction;
        }) as unknown as EditThunk;

        return thunk;
      });

      const mockedFindCategoryById = jest.mocked(findCategoryById);
      mockedFindCategoryById.mockImplementation((arg: FindArgs): FindThunk => {
        const payload: CategoryResponseDto = {
          id: arg,
          name: "Категория 1",
          image: { original: "image-1.png", small: "image-1.png" },
          creatorId: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const thunk = (async (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
          const fulfilledAction = findCategoryById.fulfilled(payload, "test-request", arg);
          dispatch(fulfilledAction);
          return fulfilledAction;
        }) as unknown as FindThunk;

        return thunk;
      });

      const store = createStore({
        categories: {
          categories: categoriesFixture.map((category) => ({ ...category })),
          isLoading: false,
          error: null,
          selectedCategory: null,
          message: "",
          deletingCategoryId: null,
          hasFetchedCategories: true,
        },
      });

      let container: HTMLElement;
      await act(async () => {
        const rendered = render(
          <Provider store={store}>
            <EditCategoryPage params={Promise.resolve({ id: "cat-1" })} />
          </Provider>
        );
        container = rendered.container;
      });

      const user = userEvent.setup();
      const nameInput = await screen.findByLabelText(/Име на категорията/i);
      const imageInput = await waitFor(() => container.querySelector('input[type="file"]'));
      expect(imageInput).toBeInTheDocument();

      await user.clear(nameInput);
      await user.type(nameInput, "Обновена категория");
      await user.upload(
        imageInput as HTMLInputElement,
        new File(["image"], "image-new.png", { type: "image/png" })
      );
      await user.click(document.getElementById("submit") as HTMLButtonElement);

      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          `/category/success?mode=edit&name=${encodeURIComponent("Обновена категория")}`
        );
      });

      const userSuccess = userEvent.setup();
      const { unmount } = render(<CategorySuccessPage />);

      const backLink = screen.getByRole("link", { name: /Към списъка/i });
      expect(backLink).toHaveAttribute("href", "/categories");

      await userSuccess.click(backLink);

      unmount();

      render(
        <Provider store={store}>
          <CategoriesPage />
        </Provider>
      );

      expect(screen.getByText("Обновена категория")).toBeInTheDocument();
      expect(screen.getByAltText("Обновена категория")).toBeInTheDocument();
    });
  });

  describe("Delete", () => {
    it("deletes one category from the list and lists the rest", async () => {
      const store = createStore({
        categories: {
          categories: categoriesFixture.map((category) => ({ ...category })),
          isLoading: false,
          error: null,
          selectedCategory: null,
          message: "",
          deletingCategoryId: null,
          hasFetchedCategories: true,
        },
      });

      render(
        <Provider store={store}>
          <CategoriesPage />
        </Provider>
      );

      const deletedCategoryId = "cat-2";
      const deletedCategoryName = "Категория 2";

      await act(async () => {
        store.dispatch(
          deleteCategory.fulfilled(deletedCategoryId, "test-request", {
            categoryId: deletedCategoryId,
          })
        );
      });

      expect(screen.queryByText(deletedCategoryName)).not.toBeInTheDocument();

      categoriesFixture
        .filter((category) => category.id !== deletedCategoryId)
        .forEach((category) => {
          expect(screen.getByText(category.name)).toBeInTheDocument();
        });
    });

    it("deletes the only category and shows empty state text", async () => {
      const store = createStore({
        categories: {
          categories: [
            {
              id: "cat-1",
              name: "Категория 1",
              image: { original: "image-1.png", small: "image-1.png" },
              creatorId: "user-1",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          isLoading: false,
          error: null,
          selectedCategory: null,
          message: "",
          deletingCategoryId: null,
          hasFetchedCategories: true,
        },
      });

      render(
        <Provider store={store}>
          <CategoriesPage />
        </Provider>
      );

      await act(async () => {
        store.dispatch(
          deleteCategory.fulfilled("cat-1", "test-request", {
            categoryId: "cat-1",
          })
        );
      });

      expect(screen.queryByText("Категория 1")).not.toBeInTheDocument();
      expect(screen.getByText("Няма налични категории")).toBeInTheDocument();
    });
  });
});

describe("List categories", () => {
  it("renders all category names from fixture", () => {
    const store = createStore({
      categories: {
        categories: categoriesFixture.map((category) => ({ ...category })),
        isLoading: false,
        error: null,
        selectedCategory: null,
        message: "",
        deletingCategoryId: null,
        hasFetchedCategories: true,
      },
    });

    render(
      <Provider store={store}>
        <CategoriesPage />
      </Provider>
    );

    categoriesFixture.forEach((category) => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
    });
  });

  it("renders empty state text when no categories exist", () => {
    const store = createStore({
      categories: {
        categories: [],
        isLoading: false,
        error: null,
        selectedCategory: null,
        message: "",
        deletingCategoryId: null,
        hasFetchedCategories: true,
      },
    });

    render(
      <Provider store={store}>
        <CategoriesPage />
      </Provider>
    );

    expect(screen.getByText("Няма налични категории")).toBeInTheDocument();
  });
});
