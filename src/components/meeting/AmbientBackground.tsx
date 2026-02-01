import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
  className?: string;
  intensity?: "low" | "medium" | "high";
}

export function AmbientBackground({ 
  className,
  intensity = "medium" 
}: AmbientBackgroundProps) {
  const opacityMap = {
    low: "opacity-[0.03]",
    medium: "opacity-[0.06]",
    high: "opacity-[0.1]",
  };

  return (
    <div className={cn("fixed inset-0 pointer-events-none overflow-hidden", className)}>
      {/* Primary aurora gradient - teal */}
      <div 
        className={cn(
          "absolute -top-1/2 -left-1/4 w-[80%] h-[80%] rounded-full blur-[120px]",
          "bg-gradient-radial from-aurora-teal to-transparent",
          opacityMap[intensity]
        )}
        style={{
          animation: "ambient-float-1 25s ease-in-out infinite",
        }}
      />
      
      {/* Secondary aurora gradient - violet */}
      <div 
        className={cn(
          "absolute -bottom-1/4 -right-1/4 w-[70%] h-[70%] rounded-full blur-[100px]",
          "bg-gradient-radial from-aurora-violet to-transparent",
          opacityMap[intensity]
        )}
        style={{
          animation: "ambient-float-2 30s ease-in-out infinite",
        }}
      />

      {/* Tertiary accent - cyan */}
      <div 
        className={cn(
          "absolute top-1/3 right-1/4 w-[40%] h-[40%] rounded-full blur-[80px]",
          "bg-gradient-radial from-aurora-cyan to-transparent",
          "opacity-[0.03]"
        )}
        style={{
          animation: "ambient-float-3 20s ease-in-out infinite",
        }}
      />

      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <style>{`
        @keyframes ambient-float-1 {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg);
          }
          33% {
            transform: translate(5%, 3%) rotate(5deg);
          }
          66% {
            transform: translate(-3%, 5%) rotate(-3deg);
          }
        }
        
        @keyframes ambient-float-2 {
          0%, 100% {
            transform: translate(0%, 0%) rotate(0deg);
          }
          33% {
            transform: translate(-4%, -2%) rotate(-4deg);
          }
          66% {
            transform: translate(3%, -4%) rotate(3deg);
          }
        }
        
        @keyframes ambient-float-3 {
          0%, 100% {
            transform: translate(0%, 0%) scale(1);
          }
          50% {
            transform: translate(-5%, 5%) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
