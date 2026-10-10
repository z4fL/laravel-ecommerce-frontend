import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { API_BASE_URL } from "../../api";
import { server } from "../../test/setup";
import { AuthPage } from "./AuthPage";

const loginUrl = `${API_BASE_URL}/auth/login`;
const registerUrl = `${API_BASE_URL}/auth/register`;

const successfulAuthResponse = {
  success: true,
  message: "Authenticated.",
  data: {
    user: {
      id: 1,
      name: "Shopper",
      username: "shopper",
      email: "shopper@example.com",
      created_at: "2026-01-01T00:00:00.000000Z",
    },
    access_token: "test-access-token",
    token_type: "Bearer",
  },
};

function renderAuthPage(mode: "login" | "register") {
  return render(
    <MemoryRouter initialEntries={[`/${mode}`]}>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/" element={<h1>Storefront destination</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AuthPage", () => {
  it("renders login and switches between login and registration", async () => {
    const user = userEvent.setup();
    renderAuthPage("login");

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    expect(screen.getByLabelText("Email address")).toBeRequired();
    expect(screen.getByLabelText("Password")).toBeRequired();
    expect(screen.queryByLabelText("Username")).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Create an account" }));
    expect(screen.getByRole("heading", { name: "Create account" })).toBeVisible();
    expect(screen.getByLabelText("Full name")).toBeRequired();
    expect(screen.getByLabelText("Username")).toBeRequired();
    expect(screen.getByLabelText("Confirm password")).toBeRequired();
    expect(screen.getByLabelText("Phone number")).toBeRequired();

    await user.click(
      within(screen.getByRole("navigation", { name: "Account navigation" })).getByRole(
        "link",
        { name: "Sign in" },
      ),
    );
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  it("logs in and navigates to the storefront", async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    server.use(
      http.post(loginUrl, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(successfulAuthResponse);
      }),
    );
    renderAuthPage("login");

    await user.type(screen.getByLabelText("Email address"), "shopper@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { name: "Storefront destination" })).toBeVisible();
    expect(requestBody).toEqual({ email: "shopper@example.com", password: "Password123!" });
  });

  it("registers with the required API fields and navigates to the storefront", async () => {
    const user = userEvent.setup();
    let requestBody: unknown;
    server.use(
      http.post(registerUrl, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(successfulAuthResponse, { status: 201 });
      }),
    );
    renderAuthPage("register");

    await user.type(screen.getByLabelText("Full name"), "New Shopper");
    await user.type(screen.getByLabelText("Username"), "new-shopper");
    await user.type(screen.getByLabelText("Email address"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.type(screen.getByLabelText("Confirm password"), "Password123!");
    await user.type(screen.getByLabelText("Phone number"), "085222555111");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("heading", { name: "Storefront destination" })).toBeVisible();
    expect(requestBody).toEqual({
      name: "New Shopper",
      username: "new-shopper",
      email: "new@example.com",
      password: "Password123!",
      password_confirmation: "Password123!",
      phone: "085222555111",
    });
  });

  it("shows backend validation feedback on login", async () => {
    const user = userEvent.setup();
    server.use(
      http.post(
        loginUrl,
        () =>
          HttpResponse.json(
            {
              success: false,
              message: "Validation failed.",
              data: null,
              errors: { email: ["Enter a registered email address."] },
            },
            { status: 422 },
          ),
      ),
    );
    renderAuthPage("login");

    await user.type(screen.getByLabelText("Email address"), "shopper@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Validation failed.");
    expect(screen.getByText("Enter a registered email address.")).toBeVisible();
    expect(screen.getByLabelText("Email address")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows backend validation feedback on registration", async () => {
    const user = userEvent.setup();
    server.use(
      http.post(
        registerUrl,
        () =>
          HttpResponse.json(
            {
              success: false,
              message: "Validation failed.",
              data: null,
              errors: { username: ["This username is already in use."] },
            },
            { status: 422 },
          ),
      ),
    );
    renderAuthPage("register");

    await user.type(screen.getByLabelText("Full name"), "New Shopper");
    await user.type(screen.getByLabelText("Username"), "new-shopper");
    await user.type(screen.getByLabelText("Email address"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.type(screen.getByLabelText("Confirm password"), "Password123!");
    await user.type(screen.getByLabelText("Phone number"), "085222555111");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Validation failed.");
    expect(screen.getByText("This username is already in use.")).toBeVisible();
  });

  it("shows authentication failures from the API", async () => {
    const user = userEvent.setup();
    server.use(
      http.post(
        loginUrl,
        () =>
          HttpResponse.json(
            { success: false, message: "Invalid email or password.", data: null },
            { status: 401 },
          ),
      ),
    );
    renderAuthPage("login");

    await user.type(screen.getByLabelText("Email address"), "shopper@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
  });

  it("rejects mismatched passwords before sending registration", async () => {
    const user = userEvent.setup();
    let requestCount = 0;
    server.use(
      http.post(registerUrl, () => {
        requestCount += 1;
        return HttpResponse.json(successfulAuthResponse, { status: 201 });
      }),
    );
    renderAuthPage("register");

    await user.type(screen.getByLabelText("Full name"), "New Shopper");
    await user.type(screen.getByLabelText("Username"), "new-shopper");
    await user.type(screen.getByLabelText("Email address"), "new@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.type(screen.getByLabelText("Confirm password"), "Different123!");
    await user.type(screen.getByLabelText("Phone number"), "085222555111");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Passwords do not match.")).toBeVisible();
    expect(requestCount).toBe(0);
  });

  it("disables repeated submissions while login is pending", async () => {
    const user = userEvent.setup();
    let releaseRequest: (() => void) | undefined;
    let requestCount = 0;
    server.use(
      http.post(loginUrl, async () => {
        requestCount += 1;
        await new Promise<void>((resolve) => {
          releaseRequest = resolve;
        });
        return HttpResponse.json(successfulAuthResponse);
      }),
    );
    renderAuthPage("login");

    await user.type(screen.getByLabelText("Email address"), "shopper@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    const pendingButton = await screen.findByRole("button", { name: "Signing in..." });
    await waitFor(() => expect(requestCount).toBe(1));
    expect(pendingButton).toBeDisabled();
    await user.click(pendingButton);
    expect(requestCount).toBe(1);

    releaseRequest?.();
    expect(await screen.findByRole("heading", { name: "Storefront destination" })).toBeVisible();
  });

  it("shows network failures and allows a successful retry", async () => {
    const user = userEvent.setup();
    server.use(http.post(loginUrl, () => HttpResponse.error()));
    renderAuthPage("login");

    await user.type(screen.getByLabelText("Email address"), "shopper@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toBeVisible();
    await user.clear(screen.getByLabelText("Email address"));
    await user.type(screen.getByLabelText("Email address"), "shopper@example.com");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    server.use(
      http.post(loginUrl, () => HttpResponse.json(successfulAuthResponse)),
    );
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { name: "Storefront destination" })).toBeVisible();
  });
});
