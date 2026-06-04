import express from "express";
import cors from "cors";
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

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/seeker", seekerRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/search", searchRoutes);

app.get("/", (req, res) => res.json({ message: "TalentBridge API running ✅" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { io };