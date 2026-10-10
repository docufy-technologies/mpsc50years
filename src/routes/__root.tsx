import { createRootRoute, Outlet } from "@tanstack/react-router";

import "../styles.css";
import Navbar from "@/components/blocks/navbar";
import Footer from "@/components/blocks/footer";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
