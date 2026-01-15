import { RequestHandler } from "express";
import { db } from "../database";

export const createLink: RequestHandler = (req, res) => {
  try {
    const { partnerId, originalUrl, title, description } = req.body;

    // Validate URL
    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    // Check if partner exists
    const partner = db.getPartner(partnerId);
    if (!partner) {
      return res.status(404).json({ error: "Partner not found" });
    }

    const link = db.createAffiliateLink(
      partnerId,
      originalUrl,
      title,
      description,
    );

    res.json(link);
  } catch (error) {
    console.error("Error creating link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPartnerLinks: RequestHandler = (req, res) => {
  try {
    const { partnerId } = req.params;

    const links = db.getAffiliateLinksByPartner(partnerId);

    res.json(links);
  } catch (error) {
    console.error("Error fetching partner links:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLink: RequestHandler = (req, res) => {
  try {
    const { linkId } = req.params;

    const link = db.getAffiliateLink(linkId);
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    res.json(link);
  } catch (error) {
    console.error("Error fetching link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const redirectLink: RequestHandler = (req, res) => {
  try {
    const { linkCode } = req.params;

    const link = db.getAffiliateLinkByCode(linkCode);
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    // Track the click
    const ipAddress = req.ip || req.connection.remoteAddress || "0.0.0.0";
    const userAgent = req.get("User-Agent");
    const referrer = req.get("Referrer");

    db.trackClick(link.id, link.partner_id, ipAddress, userAgent, referrer);

    // Redirect to original URL
    res.redirect(link.original_url);
  } catch (error) {
    console.error("Error redirecting link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const trackConversion: RequestHandler = (req, res) => {
  try {
    const { linkId, amount, orderId } = req.body;
    const { partnerId } = req.params;

    const conversion = db.trackConversion(linkId, partnerId, amount, orderId);

    res.json(conversion);
  } catch (error) {
    console.error("Error tracking conversion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
