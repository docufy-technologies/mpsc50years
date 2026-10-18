import type { ReactNode } from "react";
import { useAuth } from "../hooks/use-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  useAuth();
  return children;
}
