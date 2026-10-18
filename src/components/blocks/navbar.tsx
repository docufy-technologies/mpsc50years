import { Link, type LinkProps } from "@tanstack/react-router";
import { cn } from "cn";
import { type ReactNode, useRef } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";

export const navLinks = [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "About",
    to: "/about-mpsc",
  },
  {
    label: "Committee",
    to: "/committee",
  },
  {
    label: "Join",
    to: "/login",
  },
] satisfies readonly {
  label: string;
  to: LinkProps["to"];
}[];

type NavTabProps = {
  children: ReactNode;
  className?: string;
  to: LinkProps["to"];
};

function NavTab({ children, className, to }: NavTabProps) {
  const ref = useRef<HTMLLIElement>(null);

  return (
    <Link to={to}>
      <li
        ref={ref}
        className={cn(
          "relative z-10 block cursor-pointer px-3 py-1 text-base! md:text-base rounded-full hover:bg-secondary",
          className,
        )}
      >
        {children}
      </li>
    </Link>
  );
}

export default function Navbar() {
  const { user } = useAuth();
  const links = navLinks.map((link) =>
    link.label === "Join" && user
      ? { ...link, label: "Profile", to: "/profile" as const }
      : link,
  );

  return (
    <nav className="mx-auto flex w-fit rounded-full border border-muted bg-transparent backdrop-blur-xl z-100 fixed top-4 left-1/2 -translate-x-1/2 px-1 py-1 max-sm:p-1 gap-4 max-sm:gap-0">
      {links.map((l) => (
        <NavTab key={l.to} to={l.to}>
          {l.label}
        </NavTab>
      ))}
    </nav>
  );
}
