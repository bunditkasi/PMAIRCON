import React from "react";

import { QrConsole } from "../../../features/qr/qr-console";
import { AppShell } from "../../../features/ui/app-shell";
import { loadAppDataCollections } from "../../../lib/services/app-data";

export default async function QrConsolePage() {
  const collections = await loadAppDataCollections();
  const regions = [...new Set(
    collections.branches
      .map((branch) => branch.region.trim())
      .filter(Boolean),
  )].sort((left, right) => left.localeCompare(right));

  return (
    <AppShell
      backHref="/"
      backLabel="Back to home"
      eyebrow="Admin"
      title="QR Console"
      description="Generate scoped QR bundles and download printable assets from one browser workflow."
    >
      <QrConsole regions={regions} />
    </AppShell>
  );
}
