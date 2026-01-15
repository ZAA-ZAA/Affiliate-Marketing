import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  setupAdmin,
  adminLogin,
  addPartner,
  getPartners,
  getStats,
} from "./routes/auth";
import {
  createLink,
  getPartnerLinks,
  getLink,
  redirectLink,
  trackConversion,
} from "./routes/links";
import {
  trackPartnerClick,
  getTrackingPixel,
  getTrackingScript,
} from "./routes/tracking";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth routes
  app.post("/api/auth/setup-admin", setupAdmin);
  app.post("/api/auth/admin-login", adminLogin);

  // Partner management routes
  app.post("/api/partners", addPartner);
  app.get("/api/partners", getPartners);
  app.get("/api/stats", getStats);

  // Link management routes
  app.post("/api/links", createLink);
  app.get("/api/links/:partnerId", getPartnerLinks);
  app.get("/api/links/detail/:linkId", getLink);
  app.post("/api/conversions/:partnerId", trackConversion);

  // Link redirect route (should be before SPA fallback)
  app.get("/l/:linkCode", redirectLink);

  // New tracking routes for parameter-based affiliate links
  app.post("/api/track", trackPartnerClick);
  app.get("/api/track-pixel", getTrackingPixel);
  app.get("/api/track-script", getTrackingScript);

  return app;
}
