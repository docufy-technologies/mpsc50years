import { toast } from "sonner";
import { API_URL } from "@/constants";

export async function fetchBackend(
  route: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: object,
): Promise<Response> {
  const api_url = route.startsWith("/")
    ? `${API_URL}${route}`
    : `${API_URL}/${route}`;

  const requestOptions: RequestInit = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    let res = await fetch(api_url, requestOptions);

    if (res.status === 401) {
      // Don't attempt to refresh token if the 401 came from a login or refresh attempt itself
      if (api_url.includes("/login") || api_url.includes("/refresh-token")) {
        return res;
      }

      console.log("Token invalid/expired. Attempting to refresh...");
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh-token`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          res = await fetch(api_url, requestOptions);
          if (res.status === 401) {
            throw new Error("Authentication failed after refresh.");
          }
          return res;
        } else {
          throw new Error("Failed to refresh token.");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";

        toast.error("Session Expired. Please Login again.");
        console.error(error);
        throw new Error(errorMessage);
      }
    }
    return res;
  } catch (error) {
    console.error("Fetch backend network error:", error);
    throw error;
  }
}
