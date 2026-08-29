import { Link, useRouterState } from "@tanstack/react-router";
import {
  Brain,
  MessagesSquare,
  Plus,
  Settings,
  SlidersHorizontal,
  Workflow,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useJarvis } from "@/state/jarvis-store";

const links = [
  { to: "/conversations", label: "Conversations", icon: MessagesSquare },
  { to: "/memory", label: "Memory", icon: Brain },
  { to: "/automations", label: "Automations", icon: Workflow },
  { to: "/tools", label: "Tools", icon: SlidersHorizontal },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, newConversation } = useJarvis();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 transition-transform duration-300",
          "md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <Link to="/" className="hud-label text-primary" onClick={() => setSidebarOpen(false)}>
            J.A.R.V.I.S
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
            className="text-muted-foreground md:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <Link
          to="/"
          onClick={() => {
            newConversation();
            setSidebarOpen(false);
          }}
          className="mb-6 flex items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Plus className="size-4" />
          New conversation
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === to
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <p className="hud-label px-3 text-muted-foreground/60">local session</p>
      </aside>
    </>
  );
}
