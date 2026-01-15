import { RequestHandler } from "express";
import { db } from "../database";

export const setupAdmin: RequestHandler = async (req, res) => {
  try {
    const { businessName, adminEmail, password, firstName, lastName } =
      req.body;

    // Check if admin already exists
    const existingAdmin = db.getAdmin();
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin account already exists" });
    }

    // Create admin account
    const admin = await db.createAdmin(
      businessName,
      adminEmail,
      password,
      firstName,
      lastName,
    );

    res.json({
      admin: {
        id: admin.id,
        businessName: admin.business_name,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
      },
    });
  } catch (error) {
    console.error("Error setting up admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const adminLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate admin credentials
    const admin = await db.validateAdmin(email, password);
    if (!admin) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // In a real app, you'd generate and return a JWT token here
    res.json({
      admin: {
        id: admin.id,
        businessName: admin.business_name,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
      },
    });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addPartner: RequestHandler = async (req, res) => {
  try {
    const { email, firstName, lastName, commissionRate } = req.body;

    // Check if partner already exists
    const existingPartner = db.getPartnerByEmail(email);
    if (existingPartner) {
      return res.status(400).json({ error: "Partner already exists" });
    }

    // Create partner
    const partner = db.createPartner(
      email,
      firstName,
      lastName,
      commissionRate / 100,
    ); // Convert percentage to decimal

    res.json({
      partner: {
        id: partner.id,
        email: partner.email,
        firstName: partner.first_name,
        lastName: partner.last_name,
        commissionRate: partner.commission_rate * 100, // Convert back to percentage
        status: partner.status,
        joinedDate: partner.created_at.split("T")[0],
      },
    });
  } catch (error) {
    console.error("Error adding partner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPartners: RequestHandler = (req, res) => {
  try {
    const partners = db.getAllPartners();

    const partnersWithStats = partners.map((partner) => {
      const stats = db.getPartnerStats(partner.id);
      return {
        id: partner.id,
        email: partner.email,
        firstName: partner.first_name,
        lastName: partner.last_name,
        commissionRate: partner.commission_rate * 100, // Convert to percentage
        status: partner.status,
        joinedDate: partner.created_at.split("T")[0],
        totalClicks: stats?.total_clicks || 0,
        totalConversions: stats?.total_conversions || 0,
        totalEarnings: stats?.total_earnings || 0,
      };
    });

    res.json(partnersWithStats);
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getStats: RequestHandler = (req, res) => {
  try {
    const stats = db.getOverallStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
