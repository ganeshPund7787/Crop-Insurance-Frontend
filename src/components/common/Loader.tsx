import { motion } from "framer-motion";

export default function Loader({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-screen bg-background" : "py-12"
      }`}
    >
      <motion.div className="flex gap-2" initial="start" animate="end">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-3 h-3 rounded-full bg-primary-500"
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
