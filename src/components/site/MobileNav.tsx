import { useState, useEffect } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface NavLink {
  href: string;
  label: string;
}

interface LangLink {
  code: string;
  label: string;
  href: string;
  current: boolean;
}

interface Props {
  links: NavLink[];
  langLinks: LangLink[];
}

export default function MobileNav({ links, langLinks }: Props) {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    document.body.dataset.navOpen = open ? "true" : "false";
    return () => {
      document.body.dataset.navOpen = "false";
    };
  }, [open]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 flex flex-col px-6 pb-6">
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <nav className="mt-8 flex flex-col gap-4 flex-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Separator />
        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            {langLinks.map((l) => (
              <a
                key={l.code}
                href={l.href}
                aria-current={l.current ? "true" : undefined}
                className={[
                  "px-2 py-1 rounded transition-colors hover:text-foreground",
                  l.current
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-accent",
                ].join(" ")}
                onClick={() => setOpen(false)}
              >
                {l.code.toUpperCase()}
              </a>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
