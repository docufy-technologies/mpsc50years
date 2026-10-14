import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";

import "../styles.css";
import Footer from "@/components/blocks/footer";
import Navbar from "@/components/blocks/navbar";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <Toaster richColors position="top-right" />
    </>
  );
}
