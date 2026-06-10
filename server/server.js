import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { initSocket } from "./src/config/socket.js";

import authRoutes from "./src/routes/auth.routes.js";
import seekerRoutes from "./src/routes/seeker.routes.js";
import employerRoutes from "./src/routes/employer.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import feedRoutes from "./src/routes/feed.routes.js";
import connectionRoutes from "./src/routes/connection.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import searchRoutes from "./src/routes/search.routes.js";
import prisma from "./src/config/db.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize socket
const io = initSocket(httpServer);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── OPTIMIZED MIDDLEWARE ───────────────────────────────

// Security headers (production only)
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
}

// Compression for faster response
app.use(compression());

// CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://talentbridge.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://talentbridge.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  },
});
// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging (different formats based on environment)
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// Static files with cache headers
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  maxAge: "7d",
  etag: true,
  lastModified: true,
}));

// ─── ROUTES ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/seeker", seekerRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/search", searchRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/", (req, res) => res.json({ message: "TalentBridge API running ✅" }));

// ─── ERROR HANDLING ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === "production" 
    ? "Internal Server Error" 
    : err.message;
    
  res.status(500).json({ message });
});

// ─── GRACEFUL SHUTDOWN ──────────────────────────────────
const gracefulShutdown = async () => {
  console.log("🔄 Shutting down gracefully...");
  
  // Close socket connections
  if (io) {
    io.close(() => {
      console.log("Socket.io closed");
    });
  }
  
  // Close database connection
  await prisma.$disconnect();
  console.log("Database disconnected");
  
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// ─── START SERVER ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
});

export { io };