import { RequestHandler } from "express";
import { db } from "../database";

// New endpoint for tracking partner parameter clicks
export const trackPartnerClick: RequestHandler = (req, res) => {
  try {
    const { partner, url, referrer } = req.body;

    if (!partner) {
      return res.status(400).json({ error: "Partner code required" });
    }

    // Find the affiliate link by partner code
    const link = db.getAffiliateLinkByCode(partner);
    if (!link) {
      return res.status(404).json({ error: "Invalid partner code" });
    }

    // Track the click
    const ipAddress = req.ip || req.connection.remoteAddress || "0.0.0.0";
    const userAgent = req.get("User-Agent");

    const click = db.trackClick(
      link.id,
      link.partner_id,
      ipAddress,
      userAgent,
      referrer,
    );

    res.json({
      success: true,
      message: "Click tracked successfully",
      clickId: click.id,
    });
  } catch (error) {
    console.error("Error tracking partner click:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Endpoint to get tracking pixel/script for websites
export const getTrackingPixel: RequestHandler = (req, res) => {
  const { partner } = req.query;

  if (!partner) {
    return res.status(400).send("Partner code required");
  }

  // Return a 1x1 tracking pixel
  const pixelBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64",
  );

  // Track the pixel request
  try {
    const link = db.getAffiliateLinkByCode(partner as string);
    if (link) {
      const ipAddress = req.ip || req.connection.remoteAddress || "0.0.0.0";
      const userAgent = req.get("User-Agent");
      const referrer = req.get("Referrer");

      db.trackClick(link.id, link.partner_id, ipAddress, userAgent, referrer);
    }
  } catch (error) {
    console.error("Error tracking pixel:", error);
  }

  res.set({
    "Content-Type": "image/png",
    "Content-Length": pixelBuffer.length,
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  res.send(pixelBuffer);
};

// JavaScript tracking snippet endpoint
export const getTrackingScript: RequestHandler = (req, res) => {
  const { partner } = req.query;

  if (!partner) {
    return res.status(400).send("Partner code required");
  }

  const trackingScript = `
(function() {
  const partner = '${partner}';
  const apiUrl = '${req.protocol}://${req.get("host")}/api/track';
  
  // Track page view
  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      partner: partner,
      url: window.location.href,
      referrer: document.referrer
    })
  }).catch(() => {
    // Fallback: track with pixel
    const img = new Image();
    img.src = '${req.protocol}://${req.get("host")}/api/track-pixel?partner=' + partner;
  });
})();
`;

  res.set({
    "Content-Type": "application/javascript",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  res.send(trackingScript);
};
