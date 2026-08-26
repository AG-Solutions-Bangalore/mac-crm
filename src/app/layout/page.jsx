import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { Breadcrumbs } from "@/components/new/breadcrumbs";

export default function Page({ children }) {
  const navigate = useNavigate();
  const { themeMode, setThemeMode } = useTheme();

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="bg-[var(--base)] dark:bg-[var(--base)]">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 bg-[var(--base)]/95 dark:bg-[var(--base)]/95 backdrop-blur px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 hover:bg-slate-200 dark:hover:bg-slate-800" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 inline-block bg-[var(--line)]"
            />
            <Breadcrumbs onBack={handleBackClick} />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
              className="rounded-full w-9 h-9 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              {themeMode === "light" ? (
                <Moon className="h-[1.2rem] w-[1.2rem] text-slate-700 dark:text-slate-300" />
              ) : (
                <Sun className="h-[1.2rem] w-[1.2rem] text-amber-400" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 pt-0">
          <div className="min-h-[calc(100vh-8rem)] md:min-h-[100vh] flex-1 p-4 md:p-6 pt-0">
            {children}
          </div>
        </main>
        <footer className="hidden sm:block sticky bottom-0 z-10 h-8 shrink-0 items-center bg-[var(--base)]/95 dark:bg-[var(--base)]/95 backdrop-blur px-6">
          <div className="flex items-center justify-between gap-2 py-2 text-xs border-t border-[var(--line)] text-[var(--ink-soft)]">
            <span>© 2025-26 All Rights Reserved</span>
            <span>Crafted with ❤️ by AG Solutions</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
