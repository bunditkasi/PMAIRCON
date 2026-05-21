import React from "react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Air Conditioner PM System",
  description: "QR-based preventive maintenance and repair logging.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="app-root">{children}</body>
    </html>
  );
}
