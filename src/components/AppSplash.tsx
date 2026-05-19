import { motion } from "motion/react"

export default function AppSplash() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ display: "grid", gap: 16, justifyItems: "center", padding: 24 }}>
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "linear-gradient(135deg, #f3e1cf, #fffaf4)",
            boxShadow: "0 10px 18px rgba(0, 0, 0, 0.08)",
            display: "grid",
            placeItems: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <motion.div
            aria-hidden="true"
            animate={{ x: ["-120%", "120%"] }}
            transition={{ duration: 1.25, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0) 70%)",
              transform: "skewX(-15deg)",
              opacity: 0.65,
            }}
          />

          <motion.img
            src="/pwa-192.png"
            alt="주합"
            style={{ width: 44, height: 44, display: "block" }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.div
          aria-hidden="true"
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            border: "2px solid rgba(0, 0, 0, 0.12)",
            borderTopColor: "rgba(0, 0, 0, 0.52)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>
    </div>
  )
}

