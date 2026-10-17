import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";
import { Link, type LinkProps } from "@tanstack/react-router";

function FooterLink(props: { label: string; to: LinkProps["to"] }) {
  return (
    <Link
      to={props.to}
      className="text-muted-foreground text-sm hover:text-primary block duration-150"
    >
      {props.label}
    </Link>
  );
}
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <FooterLink label="Terms of Service" to="/terms-and-conditions" />
          <FooterLink label="Privacy Policy" to="/privacy-policy" />
        </div>
        {/* Social links */}

        <div className="my-5 flex flex-wrap justify-center gap-6 text-xs">
          <a
            href="https://x.com/docufybd"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X / Twitter"
            className="text-muted-foreground hover:text-accent block duration-150"
          >
            <IconBrandX />
          </a>

          <a
            href="https://linkedin.com/company/docufybd"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-muted-foreground hover:text-accent block duration-150"
          >
            <IconBrandLinkedin />
          </a>

          <a
            href="https://facebook.com/docufy.bd"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-muted-foreground hover:text-accent block duration-150"
          >
            <IconBrandFacebook />
          </a>

          <a
            href="https://instagram.com/docufy_"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-muted-foreground hover:text-accent block duration-150"
          >
            <IconBrandInstagram />
          </a>

          <a
            href="mailto:info@tech.docufybd.com"
            aria-label="Email"
            className="text-muted-foreground hover:text-accent block duration-150"
          >
            <IconMail />
          </a>
        </div>

        {/* Copyright */}
        <span className="block text-center text-base">
          © {currentYear}{" "}
          <a
            href="https://docufybd.com"
            className="hover:text-accent duration-150"
          >
            Mohammadpur Preparatory School & College
          </a>
          , All rights reserved
        </span>
      </div>
    </footer>
  );
}
