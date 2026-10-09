import {
  login,
  logout,
  register,
} from "./generated/authentication/authentication";
import type { LoginBody, RegisterBody } from "./generated/models";
import { clearAccessToken, setAccessToken } from "./api";

export const signIn = async (credentials: LoginBody) => {
  const response = await login(credentials);

  if (response.status !== 200) {
    throw new Error(`Unexpected login status: ${response.status}`);
  }

  const payload = response.data.data;

  if (!payload) {
    throw new Error(
      "Authentication response did not include authentication data.",
    );
  }

  setAccessToken(payload.token_type, payload.access_token);

  return payload.user;
};

export const signUp = async (details: RegisterBody) => {
  const response = await register(details);

  if (response.status !== 201) {
    throw new Error(`Unexpected registration status: ${response.status}`);
  }

  const payload = response.data.data;
  
  if (!payload) {
    throw new Error(
      "Authentication response did not include authentication data.",
    );
  }

  setAccessToken(payload.token_type, payload.access_token);

  return payload.user;
};

export const signOut = async () => {
  try {
    await logout();
  } finally {
    clearAccessToken();
  }
};
