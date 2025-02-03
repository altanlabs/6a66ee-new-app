import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "@/theme/use-theme";

interface LayoutProps {
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function Layout({
  showHeader = true,
  showFooter = true,
}: LayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center">
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      {showFooter && (
        <footer className="border-t border-border/40">
          <div className="container flex h-14 max-w-screen-2xl items-center justify-center">
            <p className="text-sm text-muted-foreground">
              © 2024 PDF Summarizer. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}