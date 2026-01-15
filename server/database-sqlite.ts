import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import path from "path";

export interface Admin {
  id: string;
  business_name: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  commission_rate: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface AffiliateLink {
  id: string;
  partner_id: string;
  original_url: string;
  link_code: string;
  title: string;
  description?: string;
  clicks: number;
  conversions: number;
  earnings: number;
  created_at: string;
  updated_at: string;
}

export interface LinkClick {
  id: string;
  link_id: string;
  partner_id: string;
  ip_address: string;
  user_agent: string;
  referrer?: string;
  clicked_at: string;
}

export interface Conversion {
  id: string;
  link_id: string;
  partner_id: string;
  amount: number;
  commission_amount: number;
  order_id?: string;
  converted_at: string;
}

class SQLiteDatabaseManager {
  private db: Database.Database;

  constructor() {
    this.db = new Database(path.join(process.cwd(), "affiliate.db"));
    this.initializeSchema();
  }

  private initializeSchema() {
    // Enable foreign keys
    this.db.pragma("foreign_keys = ON");

    // Create admin table (single admin account)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS admin (
        id TEXT PRIMARY KEY,
        business_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create partners table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS partners (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        commission_rate REAL NOT NULL DEFAULT 0.1,
        status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create affiliate_links table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS affiliate_links (
        id TEXT PRIMARY KEY,
        partner_id TEXT NOT NULL,
        original_url TEXT NOT NULL,
        link_code TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        clicks INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        earnings REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE CASCADE
      )
    `);

    // Create link_clicks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS link_clicks (
        id TEXT PRIMARY KEY,
        link_id TEXT NOT NULL,
        partner_id TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        user_agent TEXT,
        referrer TEXT,
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (link_id) REFERENCES affiliate_links (id) ON DELETE CASCADE,
        FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE CASCADE
      )
    `);

    // Create conversions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversions (
        id TEXT PRIMARY KEY,
        link_id TEXT NOT NULL,
        partner_id TEXT NOT NULL,
        amount REAL NOT NULL,
        commission_amount REAL NOT NULL,
        order_id TEXT,
        converted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (link_id) REFERENCES affiliate_links (id) ON DELETE CASCADE,
        FOREIGN KEY (partner_id) REFERENCES partners (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
      CREATE INDEX IF NOT EXISTS idx_affiliate_links_partner_id ON affiliate_links(partner_id);
      CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON affiliate_links(link_code);
      CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
      CREATE INDEX IF NOT EXISTS idx_link_clicks_partner_id ON link_clicks(partner_id);
      CREATE INDEX IF NOT EXISTS idx_conversions_link_id ON conversions(link_id);
      CREATE INDEX IF NOT EXISTS idx_conversions_partner_id ON conversions(partner_id);
    `);
  }

  // Admin methods
  async createAdmin(
    businessName: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<Admin> {
    const id = nanoid();
    const passwordHash = await bcrypt.hash(password, 10);

    const stmt = this.db.prepare(`
      INSERT INTO admin (id, business_name, email, password_hash, first_name, last_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, businessName, email, passwordHash, firstName, lastName);

    return this.getAdmin()!;
  }

  getAdmin(): Admin | null {
    const stmt = this.db.prepare("SELECT * FROM admin LIMIT 1");
    return stmt.get() as Admin | null;
  }

  async validateAdmin(email: string, password: string): Promise<Admin | null> {
    const admin = this.getAdmin();
    if (!admin || admin.email !== email) return null;

    const isValid = await bcrypt.compare(password, admin.password_hash);
    return isValid ? admin : null;
  }

  // Partner methods
  createPartner(
    email: string,
    firstName: string,
    lastName: string,
    commissionRate: number = 0.1,
  ): Partner {
    const id = nanoid();

    const stmt = this.db.prepare(`
      INSERT INTO partners (id, email, first_name, last_name, commission_rate)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, email, firstName, lastName, commissionRate);

    return this.getPartner(id)!;
  }

  getPartner(id: string): Partner | null {
    const stmt = this.db.prepare("SELECT * FROM partners WHERE id = ?");
    return stmt.get(id) as Partner | null;
  }

  getPartnerByEmail(email: string): Partner | null {
    const stmt = this.db.prepare("SELECT * FROM partners WHERE email = ?");
    return stmt.get(email) as Partner | null;
  }

  getAllPartners(): Partner[] {
    const stmt = this.db.prepare(
      "SELECT * FROM partners ORDER BY created_at DESC",
    );
    return stmt.all() as Partner[];
  }

  updatePartnerStatus(id: string, status: "active" | "inactive"): void {
    const stmt = this.db.prepare(
      "UPDATE partners SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    );
    stmt.run(status, id);
  }

  // Affiliate link methods
  createAffiliateLink(
    partnerId: string,
    originalUrl: string,
    title: string,
    description?: string,
  ): AffiliateLink {
    const id = nanoid();
    const linkCode = nanoid(8);

    const stmt = this.db.prepare(`
      INSERT INTO affiliate_links (id, partner_id, original_url, link_code, title, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, partnerId, originalUrl, linkCode, title, description);

    return this.getAffiliateLink(id)!;
  }

  getAffiliateLink(id: string): AffiliateLink | null {
    const stmt = this.db.prepare("SELECT * FROM affiliate_links WHERE id = ?");
    return stmt.get(id) as AffiliateLink | null;
  }

  getAffiliateLinkByCode(linkCode: string): AffiliateLink | null {
    const stmt = this.db.prepare(
      "SELECT * FROM affiliate_links WHERE link_code = ?",
    );
    return stmt.get(linkCode) as AffiliateLink | null;
  }

  getAffiliateLinksByPartner(partnerId: string): AffiliateLink[] {
    const stmt = this.db.prepare(
      "SELECT * FROM affiliate_links WHERE partner_id = ? ORDER BY created_at DESC",
    );
    return stmt.all(partnerId) as AffiliateLink[];
  }

  // Link click tracking
  trackClick(
    linkId: string,
    partnerId: string,
    ipAddress: string,
    userAgent?: string,
    referrer?: string,
  ): LinkClick {
    const id = nanoid();

    // Insert click record
    const clickStmt = this.db.prepare(`
      INSERT INTO link_clicks (id, link_id, partner_id, ip_address, user_agent, referrer)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    clickStmt.run(id, linkId, partnerId, ipAddress, userAgent, referrer);

    // Update click count
    const updateStmt = this.db.prepare(`
      UPDATE affiliate_links 
      SET clicks = clicks + 1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    updateStmt.run(linkId);

    return {
      id,
      link_id: linkId,
      partner_id: partnerId,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer,
      clicked_at: new Date().toISOString(),
    };
  }

  // Conversion tracking
  trackConversion(
    linkId: string,
    partnerId: string,
    amount: number,
    orderId?: string,
  ): Conversion {
    const link = this.getAffiliateLink(linkId);
    if (!link) throw new Error("Link not found");

    const partner = this.getPartner(partnerId);
    if (!partner) throw new Error("Partner not found");

    const commissionAmount = amount * partner.commission_rate;
    const id = nanoid();

    // Start transaction
    const transaction = this.db.transaction(() => {
      // Insert conversion record
      const conversionStmt = this.db.prepare(`
        INSERT INTO conversions (id, link_id, partner_id, amount, commission_amount, order_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      conversionStmt.run(
        id,
        linkId,
        partnerId,
        amount,
        commissionAmount,
        orderId,
      );

      // Update link statistics
      const updateStmt = this.db.prepare(`
        UPDATE affiliate_links 
        SET conversions = conversions + 1, 
            earnings = earnings + ?, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      updateStmt.run(commissionAmount, linkId);
    });

    transaction();

    return {
      id,
      link_id: linkId,
      partner_id: partnerId,
      amount,
      commission_amount: commissionAmount,
      order_id: orderId,
      converted_at: new Date().toISOString(),
    };
  }

  // Analytics methods
  getPartnerStats(partnerId: string) {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total_links,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(earnings) as total_earnings
      FROM affiliate_links 
      WHERE partner_id = ?
    `);

    return stmt.get(partnerId);
  }

  getOverallStats() {
    const partnerCountStmt = this.db.prepare(
      'SELECT COUNT(*) as count FROM partners WHERE status = "active"',
    );
    const partnerCount = partnerCountStmt.get() as { count: number };

    const statsStmt = this.db.prepare(`
      SELECT 
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(earnings) as total_earnings
      FROM affiliate_links
    `);
    const stats = statsStmt.get() as {
      total_clicks: number;
      total_conversions: number;
      total_earnings: number;
    };

    return {
      total_partners: partnerCount.count,
      total_clicks: stats.total_clicks || 0,
      total_conversions: stats.total_conversions || 0,
      total_earnings: stats.total_earnings || 0,
    };
  }

  close() {
    this.db.close();
  }
}

export const sqliteDb = new SQLiteDatabaseManager();
