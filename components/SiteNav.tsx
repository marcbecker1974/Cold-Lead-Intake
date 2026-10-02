"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/leads", label: "Leads" },
] as const;

// Home is active only on "/"; Leads also covers /leads/[id].
function isActive(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-4 py-1.5 sm:px-6"
      >
        <Link
          href="/"
          className="-mx-2 rounded-md px-2 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-600"
        >
          Cold Lead Intake
        </Link>
        <ul className="flex gap-1">
          {LINKS.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-md px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-600 md:py-1.5 ${
                    active
                      ? "bg-zinc-200 font-medium dark:bg-zinc-800"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
