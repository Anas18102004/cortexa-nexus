import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "full";
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const isLight = resolvedTheme === "light";

  if (variant === "icon") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="iconSm"
            className={cn(
              "relative overflow-hidden group",
              className
            )}
          >
            {/* Sun icon (visible in light mode) */}
            <motion.div
              initial={false}
              animate={{
                y: isLight ? 0 : -24,
                opacity: isLight ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute"
            >
              <Sun className="w-4 h-4 text-aurora-violet" />
            </motion.div>
            
            {/* Moon icon (visible in dark mode) */}
            <motion.div
              initial={false}
              animate={{
                y: isLight ? 24 : 0,
                opacity: isLight ? 0 : 1,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute"
            >
              <Moon className="w-4 h-4 text-aurora-cyan" />
            </motion.div>
            
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="min-w-[140px]">
          <DropdownMenuItem 
            onClick={() => setTheme("light")}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              theme === "light" && "bg-accent"
            )}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setTheme("dark")}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              theme === "dark" && "bg-accent"
            )}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setTheme("system")}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              theme === "system" && "bg-accent"
            )}
          >
            <Monitor className="w-4 h-4" />
            <span>System</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full variant with label
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={theme === "light" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setTheme("light")}
        className="gap-1.5"
      >
        <Sun className="w-3.5 h-3.5" />
        Light
      </Button>
      <Button
        variant={theme === "dark" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setTheme("dark")}
        className="gap-1.5"
      >
        <Moon className="w-3.5 h-3.5" />
        Dark
      </Button>
    </div>
  );
}
