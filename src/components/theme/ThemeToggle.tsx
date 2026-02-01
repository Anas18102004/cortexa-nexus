import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor, Check } from "lucide-react";
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
              "relative overflow-hidden group rounded-xl",
              "hover:bg-surface-2 transition-colors duration-200",
              className
            )}
          >
            {/* Sun icon (visible in light mode) */}
            <motion.div
              initial={false}
              animate={{
                y: isLight ? 0 : -24,
                opacity: isLight ? 1 : 0,
                rotate: isLight ? 0 : -90,
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="absolute"
            >
              <Sun className="w-4 h-4 text-aurora-rose" />
            </motion.div>
            
            {/* Moon icon (visible in dark mode) */}
            <motion.div
              initial={false}
              animate={{
                y: isLight ? 24 : 0,
                opacity: isLight ? 0 : 1,
                rotate: isLight ? 90 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="absolute"
            >
              <Moon className="w-4 h-4 text-aurora-cyan" />
            </motion.div>
            
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="min-w-[160px] p-1.5 glass-panel border-border/50"
          sideOffset={8}
        >
          <DropdownMenuItem 
            onClick={() => setTheme("light")}
            className={cn(
              "flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-colors",
              theme === "light" 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-surface-2"
            )}
          >
            <Sun className="w-4 h-4" />
            <span className="font-medium">Light</span>
            {theme === "light" && (
              <Check className="w-4 h-4 ml-auto" />
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setTheme("dark")}
            className={cn(
              "flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-colors",
              theme === "dark" 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-surface-2"
            )}
          >
            <Moon className="w-4 h-4" />
            <span className="font-medium">Dark</span>
            {theme === "dark" && (
              <Check className="w-4 h-4 ml-auto" />
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setTheme("system")}
            className={cn(
              "flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-colors",
              theme === "system" 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-surface-2"
            )}
          >
            <Monitor className="w-4 h-4" />
            <span className="font-medium">System</span>
            {theme === "system" && (
              <Check className="w-4 h-4 ml-auto" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full variant with label - Pill style toggle
  return (
    <div className={cn(
      "flex items-center gap-1 p-1 rounded-xl bg-surface-2 border border-border/50", 
      className
    )}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("light")}
        className={cn(
          "gap-1.5 rounded-lg px-3 transition-all duration-200",
          theme === "light" 
            ? "bg-card text-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Sun className="w-3.5 h-3.5" />
        Light
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("dark")}
        className={cn(
          "gap-1.5 rounded-lg px-3 transition-all duration-200",
          theme === "dark" 
            ? "bg-card text-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Moon className="w-3.5 h-3.5" />
        Dark
      </Button>
    </div>
  );
}
