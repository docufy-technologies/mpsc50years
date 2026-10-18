import * as v from "valibot";
import { API_URL } from "@/constants";
import { fetchBackend } from "@/lib/api";
import {
  type CurrentUser,
  currentUserSchema,
  type LoginInput,
  loginSchema,
} from "./schema/auth-schema";

function extractErrorDetail(res: Response, errorData: unknown): string {
  if (errorData && typeof errorData === "object" && "detail" in errorData) {
    const detail = (errorData as { detail: unknown }).detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) =>
          item && typeof item === "object" && "msg" in item
            ? String(item.msg)
            : "Invalid input",
        )
        .join(", ");
    }
    return String(detail);
  }
  return `Request failed (${res.status})`;
}

async function parseUserResponse(res: Response): Promise<CurrentUser> {
  const body: unknown = await res.json();
  const result = v.safeParse(currentUserSchema, body);
  if (!result.success) {
    throw new Error("The backend returned an invalid user response.");
  }
  return result.output;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(extractErrorDetail(res, errorData));
  }
  return parseUserResponse(res);
}

export async function login(value: LoginInput): Promise<CurrentUser> {
  const input = v.parse(loginSchema, value);
  const res = await fetchBackend("/auth/login", "POST", input);
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(extractErrorDetail(res, errorData));
  }
  return parseUserResponse(res);
}

export async function logout(): Promise<void> {
  const res = await fetchBackend("/auth/logout", "POST");
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(extractErrorDetail(res, errorData));
  }
}
