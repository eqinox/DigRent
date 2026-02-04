import { apiSlice } from "@/store/slices/apiSlice";
import { authReducer } from "@/store/slices/authSlice";
import { configureStore } from "@reduxjs/toolkit";

const makeJsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("apiSlice baseQueryWithReauth", () => {
  beforeEach(() => {
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url =
        typeof input === "string" ? input : input instanceof Request ? input.url : input.toString();

      if (url.includes("/auth/refresh")) {
        return makeJsonResponse(200, {
          access_token: "refreshed-token",
          user: { id: "user-1", email: "user@test.com", role: "user" },
        });
      }

      return makeJsonResponse(401, {
        message: "Unauthorized",
        statusCode: 401,
      });
    }) as unknown as typeof global.fetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("refreshes token after 401 and updates auth state", async () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
      },
      preloadedState: {
        auth: {
          token: "expired-token",
          isAuthenticated: true,
          isLoading: false,
          error: null,
          user: { id: "user-1", email: "user@test.com", role: "user" },
        },
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    });

    const result = await store.dispatch(
      apiSlice.endpoints.authenticatedGet.initiate("/categories")
    );

    const fetchMock = global.fetch as jest.Mock;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls.length).toBeGreaterThan(1);

    const refreshCallArg = fetchMock.mock.calls[1][0];
    const refreshUrl =
      typeof refreshCallArg === "string"
        ? refreshCallArg
        : "url" in refreshCallArg
          ? refreshCallArg.url
          : "";
    expect(refreshUrl).toContain("/auth/refresh");
    expect(store.getState().auth.token).toBe("refreshed-token");
    expect("error" in result).toBe(true);
  });
});
