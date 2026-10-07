let authorization: string | undefined;

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(status: number, data: unknown) {
    super(
      typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
        ? data.message
        : `API request failed with status ${status}`,
    );
    this.status = status;
    this.data = data;
    this.name = "ApiError";
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

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
  const url = new URL(path.replace(/^\/+/, ""), `${baseUrl.replace(/\/+$/, "")}/`);
  const headers = new Headers(options.headers);
  if (authorization) headers.set("Authorization", authorization);

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) clearAccessToken();

  const text = [204, 205, 304].includes(response.status) ? "" : await response.text();
  const data: unknown = text ? JSON.parse(text) : {};

  if (!response.ok) throw new ApiError(response.status, data);

  return { data, status: response.status, headers: response.headers } as T;
};
