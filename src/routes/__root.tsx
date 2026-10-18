import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import "../styles.css";
import Footer from "@/components/blocks/footer";
import Navbar from "@/components/blocks/navbar";
import { AuthProvider } from "@/features/auth/component/auth-provider";
import { queryClient } from "@/lib/query-client";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navbar />
        <Outlet />
        <Footer />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
