import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

export function FloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="fixed bottom-24 right-6 z-50"
    >
      <Button
        type="button"
        onClick={onClick}
        className="liquid-glass-effect h-16 w-16 rounded-full shadow-lg"
      >
        Inspect
      </Button>
    </motion.div>
  );
}
