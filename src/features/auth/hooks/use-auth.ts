import { useSyncExternalStore } from "react";
import { getCurrentUser, login, logout } from "../actions";
import type { CurrentUser } from "../schema/auth-schema";

type AuthState = {
  error: Error | null;
  isLoading: boolean;
  user: CurrentUser | null;
};

let state: AuthState = { error: null, isLoading: true, user: null };
const listeners = new Set<() => void>();
let initialized = false;

function notify() {
  for (const listener of listeners) listener();
}

function setState(next: AuthState) {
  state = next;
  notify();
}

async function initialize() {
  setState({ error: null, isLoading: true, user: null });
  try {
    setState({ error: null, isLoading: true, user: await getCurrentUser() });
  } catch (error) {
    console.error("Unable to load the current user:", error);
    setState({
      error:
        error instanceof Error
          ? error
          : new Error("Unable to connect to the backend."),
      isLoading: false,
      user: null,
    });
    return;
  }
  setState({ error: null, isLoading: false, user: state.user });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!initialized) {
    initialized = true;
    void initialize();
  }
  return () => listeners.delete(listener);
}

export function useAuth() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );

  return {
    ...snapshot,
    retry() {
      void initialize();
    },
    async login(value: Parameters<typeof login>[0]) {
      const user = await login(value);
      setState({ error: null, isLoading: false, user });
      return user;
    },
    async logout() {
      await logout();
      setState({ error: null, isLoading: false, user: null });
    },
    setUser(user: CurrentUser | null) {
      setState({ error: null, isLoading: false, user });
    },
  };
}
