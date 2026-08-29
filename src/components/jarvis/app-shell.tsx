import { PanelLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Sidebar } from "@/components/jarvis/sidebar";
import { useJarvis } from "@/state/jarvis-store";

export function AppShell({ children }: { children: ReactNode }) {
  const { setSidebarOpen } = useJarvis();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-20 grid size-9 place-items-center rounded-lg border border-border glass text-muted-foreground md:hidden"
      >
        <PanelLeft className="size-4" />
      </button>
      <main className="md:pl-60">{children}</main>
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-10">
      <h1 className="text-2xl font-medium tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
    </header>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-20">{children}</div>;
}
