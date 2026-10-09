let authorization: string | undefined;

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const API_ORIGIN = new URL(API_BASE_URL).origin;

type ApiErrorBody = {
  success?: false;
  message?: string;
  data?: unknown;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isApiErrorBody = (value: unknown): value is ApiErrorBody =>
  isRecord(value);

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;
  readonly errors: Record<string, string[]> | undefined;

  constructor(status: number, data: unknown) {
    const message =
      isApiErrorBody(data) && typeof data.message === "string"
        ? data.message
        : `API request failed with status ${status}`;

    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.errors = ApiError.extractValidationErrors(data);
  }
  
  private static extractValidationErrors(
    data: unknown,
  ): Record<string, string[]> | undefined {
    if (!isApiErrorBody(data) || !isRecord(data.errors)) {
      return undefined;
    }

    const errors: Record<string, string[]> = {};

    for (const [field, messages] of Object.entries(data.errors)) {
      if (
        Array.isArray(messages) &&
        messages.every((message) => typeof message === "string")
      ) {
        errors[field] = messages;
      }
    }

    return Object.keys(errors).length > 0 ? errors : undefined;
  }

  getValidationMessages(field: string): string[] {
    return this.errors?.[field] ?? [];
  }
}
export const setAccessToken = (tokenType: string, accessToken: string) => {
  if (tokenType.toLowerCase() !== "bearer") {
    throw new Error(`Unsupported token type: ${tokenType}`);
  }

  authorization = `${tokenType} ${accessToken}`;
};

export const clearAccessToken = () => {
  authorization = undefined;
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const text = await response.text();

  if (!text.trim()) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    // Preserve non-JSON responses, including proxy/server error pages.
    return text;
  }
};

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const url = new URL(
    path.replace(/^\/+/, ""),
    `${API_BASE_URL.replace(/\/+$/, "")}/`,
  );

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (authorization) {
    headers.set("Authorization", authorization);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};
