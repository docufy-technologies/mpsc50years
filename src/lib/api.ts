import { toast } from "sonner";
import { API_URL } from "@/constants";

export async function fetchBackend(
  route: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: object,
): Promise<Response> {
  const apiUrl = route.startsWith("/")
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
    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) console.log("Error: Failed to refresh auth token.");
  } catch (error) {
    console.log(error);
  }

  try {
    return await fetch(apiUrl, requestOptions);
  } catch (error) {
    console.log("Error while fetching", apiUrl, error);
    toast(`Error: ${error}.`);
    throw error;
  }
}
