import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface AmbientBackgroundProps {
  className?: string;
  intensity?: "low" | "medium" | "high";
}

export function AmbientBackground({ 
  className,
  intensity = "medium" 
}: AmbientBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const opacityMap = {
    low: isLight ? "opacity-[0.04]" : "opacity-[0.06]",
    medium: isLight ? "opacity-[0.06]" : "opacity-[0.1]",
    high: isLight ? "opacity-[0.08]" : "opacity-[0.15]",
  };

  return (
    <div className={cn("fixed inset-0 pointer-events-none overflow-hidden", className)}>
      {/* Primary aurora gradient - teal/emerald */}
      <div 
        className={cn(
          "absolute -top-1/2 -left-1/4 w-[100%] h-[100%] rounded-full",
          isLight ? "blur-[150px]" : "blur-[120px]",
          "bg-gradient-radial from-aurora-teal to-transparent",
          opacityMap[intensity]
        )}
        style={{
          animation: "ambient-float-1 30s ease-in-out infinite",
        }}
      />
      
      {/* Secondary aurora gradient - violet/purple */}
      <div 
        className={cn(
          "absolute -bottom-1/3 -right-1/4 w-[80%] h-[80%] rounded-full",
          isLight ? "blur-[140px]" : "blur-[100px]",
          "bg-gradient-radial from-aurora-violet to-transparent",
          opacityMap[intensity]
        )}
        style={{
          animation: "ambient-float-2 35s ease-in-out infinite",
        }}
      />

      {/* Tertiary accent - cyan/blue */}
      <div 
        className={cn(
          "absolute top-1/4 right-1/3 w-[50%] h-[50%] rounded-full",
          isLight ? "blur-[120px]" : "blur-[80px]",
          "bg-gradient-radial from-aurora-cyan to-transparent",
          isLight ? "opacity-[0.03]" : "opacity-[0.05]"
        )}
        style={{
          animation: "ambient-float-3 25s ease-in-out infinite",
        }}
      />

      {/* Light mode: warm accent overlay */}
      {isLight && (
        <div 
          className="absolute -bottom-1/2 left-1/4 w-[60%] h-[60%] rounded-full blur-[130px] bg-gradient-radial from-aurora-rose/20 to-transparent opacity-[0.12]"
          style={{
            animation: "ambient-float-4 28s ease-in-out infinite",
          }}
        />
      )}

      {/* Subtle noise texture overlay */}
      <div 
        className={cn(
          "absolute inset-0",
          isLight ? "opacity-[0.02]" : "opacity-[0.012]"
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <style>{`
        @keyframes ambient-float-1 {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(3%, 2%) rotate(3deg) scale(1.02);
          }
          50% {
            transform: translate(5%, 4%) rotate(5deg) scale(1.04);
          }
          75% {
            transform: translate(2%, 3%) rotate(2deg) scale(1.01);
          }
        }
        
        @keyframes ambient-float-2 {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg) scale(1);
          }
          33% {
            transform: translate(-3%, -2%) rotate(-3deg) scale(1.03);
          }
          66% {
            transform: translate(2%, -3%) rotate(2deg) scale(0.98);
          }
        }
        
        @keyframes ambient-float-3 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
          }
          50% {
            transform: translate(-4%, 4%) scale(1.08);
          }
        }
        
        @keyframes ambient-float-4 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
          }
          50% {
            transform: translate(3%, -3%) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
