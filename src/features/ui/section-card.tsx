import React from "react";
import type { ReactNode } from "react";

interface SectionCardProps {
  title?: string;
  eyebrow?: string;
  aside?: string;
  children: ReactNode;
}

export function SectionCard({
  title,
  eyebrow,
  aside,
  children,
}: SectionCardProps) {
  return (
    <section className="section-card">
      {title || eyebrow || aside ? (
        <div className="section-card__header">
          <div className="section-card__header-copy">
            {eyebrow ? <p className="section-card__eyebrow">{eyebrow}</p> : null}
            {title ? <h2 className="section-card__title">{title}</h2> : null}
          </div>
          {aside ? <p className="section-card__aside">{aside}</p> : null}
        </div>
      ) : null}
      <div>{children}</div>
    </section>
  );
}
