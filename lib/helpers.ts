import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

/**
 * Comprehensive error handler for all FetchBaseQueryError types
 *
 * This function handles all possible error types that can occur in RTK Query:
 *
 * 1. HTTP Error (status: number) - Server responded with HTTP status code
 *    - Properties: status (number), data (any)
 *    - Example: 404 Not Found, 500 Internal Server Error
 *
 * 2. Fetch Error (status: 'FETCH_ERROR') - Network issues
 *    - Properties: status ('FETCH_ERROR'), error (string)
 *    - Example: CORS issues, network unavailable, DNS resolution failed
 *
 * 3. Parsing Error (status: 'PARSING_ERROR') - Response parsing failed
 *    - Properties: status ('PARSING_ERROR'), originalStatus (number), data (any), error (string)
 *    - Example: Invalid JSON response, unexpected response format
 *
 * 4. Timeout Error (status: 'TIMEOUT_ERROR') - Request timeout
 *    - Properties: status ('TIMEOUT_ERROR'), error (string)
 *    - Example: Request took longer than configured timeout
 *
 * 5. Custom Error (status: 'CUSTOM_ERROR') - User-defined errors
 *    - Properties: status ('CUSTOM_ERROR'), data? (any), error (string)
 *    - Example: Business logic errors, validation failures
 *
 * @param error - The FetchBaseQueryError to handle
 * @returns A user-friendly error message string
 */
export const handleFetchBaseQueryError = (
  error: FetchBaseQueryError
): string => {
  // HTTP Error (server responded with status code)
  if (typeof error.status === "number") {
    const httpError = error as { status: number; data: any };
    return (
      httpError.data?.message ||
      httpError.data?.error ||
      `HTTP Error ${httpError.status}: Server responded with error`
    );
  }

  // Fetch Error (network issues)
  if (error.status === "FETCH_ERROR") {
    const fetchError = error as { status: "FETCH_ERROR"; error: string };
    return fetchError.error || "Network error: Failed to fetch resource";
  }

  // Parsing Error (response parsing failed)
  if (error.status === "PARSING_ERROR") {
    const parsingError = error as {
      status: "PARSING_ERROR";
      originalStatus: number;
      data: any;
      error: string;
    };
    return (
      parsingError.error ||
      `Parsing error: Failed to parse response (Status: ${parsingError.originalStatus})`
    );
  }

  // Timeout Error
  if (error.status === "TIMEOUT_ERROR") {
    const timeoutError = error as { status: "TIMEOUT_ERROR"; error: string };
    return (
      timeoutError.error ||
      "Request timeout: The request took too long to complete"
    );
  }

  // Custom Error
  if (error.status === "CUSTOM_ERROR") {
    const customError = error as {
      status: "CUSTOM_ERROR";
      data?: any;
      error: string;
    };
    return (
      customError.error ||
      customError.data?.message ||
      "Custom error: An unexpected error occurred"
    );
  }

  // Fallback for unknown error types
  return "Unknown error: An unexpected error occurred";
};
