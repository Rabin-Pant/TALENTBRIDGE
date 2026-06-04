import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  sendRequest, respondRequest, getConnections,
  getPendingRequests, getConnectionStatus,
  removeConnection, getSuggestions,
  getPublicProfile,  
} from "../controllers/connection.controller.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/",                        getConnections);
router.get("/pending",                 getPendingRequests);
router.get("/suggestions",             getSuggestions);
router.get("/status/:targetId",        getConnectionStatus);
router.get("/public-profile/:userId",  getPublicProfile);  
router.post("/",                       sendRequest);
router.put("/:id/respond",             respondRequest);
router.delete("/:id",                  removeConnection);

export default router;