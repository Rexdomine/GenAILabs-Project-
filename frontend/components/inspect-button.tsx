import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const baseClass =
  "inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_16px_40px_-20px_rgba(88,60,255,0.75)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-18px_rgba(88,60,255,0.85)]";

type InspectButtonProps = {
  onClick(): void;
  position?: "inside" | "floating";
  className?: string;
};

const pulse = {
  initial: { scale: 1, boxShadow: "0 0 0 rgba(88, 60, 255, 0.45)" },
  animate: {
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 rgba(88, 60, 255, 0.45)",
      "0 0 22px rgba(88, 60, 255, 0.65)",
      "0 0 0 rgba(88, 60, 255, 0.45)",
    ],
  },
  transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
} as const;

export function InspectButton({ onClick, position, className }: InspectButtonProps) {
  return (
    <motion.div {...pulse} className={className}>
      <Button
        type="button"
        onClick={onClick}
        className={cn(
          baseClass,
          position === "inside" && "h-10 px-4 text-xs font-semibold shadow-[0_12px_32px_-18px_rgba(88,60,255,0.7)]"
        )}
      >
        Inspect
      </Button>
    </motion.div>
  );
}
