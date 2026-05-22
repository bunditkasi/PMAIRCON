import React from "react";
import Link from "next/link";
import type { ReactNode } from "react";

interface AppShellProps {
  backHref?: string;
  backLabel?: string;
  eyebrow: string;
  title: string;
  description?: string;
  heroAside?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  heroAside,
  children,
}: AppShellProps) {
  return (
    <main className="app-shell">
      <div className="app-shell__inner">
        {backHref && backLabel ? (
          <Link
            className="app-shell__back-link"
            href={backHref}
          >
            {backLabel}
          </Link>
        ) : null}

        <header className="app-shell__hero">
          <div className="app-shell__hero-copy">
            <p className="app-shell__eyebrow">{eyebrow}</p>
            <h1 className="app-shell__title">{title}</h1>
            {description ? (
              <p className="app-shell__description">{description}</p>
            ) : null}
          </div>
          {heroAside ? (
            <div className="app-shell__hero-aside">{heroAside}</div>
          ) : null}
        </header>

        <div className="app-shell__content">{children}</div>
      </div>
    </main>
  );
}
