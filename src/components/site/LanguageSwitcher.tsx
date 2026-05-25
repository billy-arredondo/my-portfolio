import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface LangLink {
  code: string;
  label: string;
  href: string;
  current: boolean;
}

interface Props {
  langLinks: LangLink[];
}

export default function LanguageSwitcher({ langLinks }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Select language">
          <Languages size={16} aria-hidden="true" className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {langLinks.map((link) => (
          <DropdownMenuItem key={link.code} asChild>
            <a
              href={link.href}
              aria-current={link.current ? "true" : undefined}
              className={link.current ? "font-semibold" : ""}
            >
              {link.label}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
