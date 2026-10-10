import { Link, type LinkProps } from "@tanstack/react-router";
import { cn } from "cn";
import { useRef, useState, type ReactNode } from "react";

type Position = {
  left: number;
  width: number;
  opacity: number;
};

export const navLinks = [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "About",
    to: "/",
  },
  {
    label: "Committee",
    to: "/",
  },
  {
    label: "FAQs",
    to: "/",
  },
] satisfies readonly {
  label: string;
  to: LinkProps["to"];
}[];

type NavTabProps = {
  children: ReactNode;
  setPosition: (position: Position) => void;
  className?: string;
  to: LinkProps["to"];
};

function NavTab({ children, setPosition, className, to }: NavTabProps) {
  const ref = useRef<HTMLLIElement>(null);

  const handleMouseEnter = () => {
    if (!ref.current) return;

    const { width } = ref.current.getBoundingClientRect();

    setPosition({
      width,
      opacity: 1,
      left: ref.current.offsetLeft,
    });
  };

  return (
    <Link to={to}>
      <li
        ref={ref}
        onMouseEnter={handleMouseEnter}
        className={cn(
          "relative z-10 block cursor-pointer px-3 py-1.5 text-base! md:text-base rounded-full hover:bg-secondary",
          className,
        )}
      >
        {children}
      </li>
    </Link>
  );
}

function Cursor(props: { position: Position }) {
  return (
    <li
      className="absolute z-0 h-9 -translate-y-2 max-sm:-translate-y-2 rounded-full bg-secondary transition-all duration-300 ease-out"
      style={{
        left: `${props.position.left}px`,
        width: `${props.position.width}px`,
        opacity: props.position.opacity,
      }}
    />
  );
}

export default function Navbar() {
  const [position, setPosition] = useState<Position>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <nav className="fixed top-0 left-0 z-100 flex w-full items-center justify-between px-12 py-6 max-sm:px-8">
      <ul
        onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
        className="mx-auto flex w-fit rounded-full border-2 border-secondary bg-transparent backdrop-blur-xl z-100 fixed top-1 left-1/2 -translate-x-1/2 px-2 py-1 max-sm:p-1 gap-4 max-sm:gap-0"
      >
        {navLinks.map((l) => (
          <NavTab to={l.to} setPosition={setPosition}>
            {l.label}
          </NavTab>
        ))}
        <Cursor position={position} />
      </ul>
    </nav>
  );
}
