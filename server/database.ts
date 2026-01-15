import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

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

class DatabaseManager {
  private admin: Admin | null = null;
  private partners: Partner[] = [];
  private affiliateLinks: AffiliateLink[] = [];
  private linkClicks: LinkClick[] = [];
  private conversions: Conversion[] = [];

  constructor() {
    // Initialize with empty state
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
    const now = new Date().toISOString();

    this.admin = {
      id,
      business_name: businessName,
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      created_at: now,
      updated_at: now,
    };

    return this.admin;
  }

  getAdmin(): Admin | null {
    return this.admin;
  }

  async validateAdmin(email: string, password: string): Promise<Admin | null> {
    if (!this.admin || this.admin.email !== email) return null;

    const isValid = await bcrypt.compare(password, this.admin.password_hash);
    return isValid ? this.admin : null;
  }

  // Partner methods
  createPartner(
    email: string,
    firstName: string,
    lastName: string,
    commissionRate: number = 0.1,
  ): Partner {
    const id = nanoid();
    const now = new Date().toISOString();

    const partner: Partner = {
      id,
      email,
      first_name: firstName,
      last_name: lastName,
      commission_rate: commissionRate,
      status: "active",
      created_at: now,
      updated_at: now,
    };

    this.partners.push(partner);
    return partner;
  }

  getPartner(id: string): Partner | null {
    return this.partners.find((p) => p.id === id) || null;
  }

  getPartnerByEmail(email: string): Partner | null {
    return this.partners.find((p) => p.email === email) || null;
  }

  getAllPartners(): Partner[] {
    return [...this.partners].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  updatePartnerStatus(id: string, status: "active" | "inactive"): void {
    const partner = this.partners.find((p) => p.id === id);
    if (partner) {
      partner.status = status;
      partner.updated_at = new Date().toISOString();
    }
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
    const now = new Date().toISOString();

    const link: AffiliateLink = {
      id,
      partner_id: partnerId,
      original_url: originalUrl,
      link_code: linkCode,
      title,
      description,
      clicks: 0,
      conversions: 0,
      earnings: 0,
      created_at: now,
      updated_at: now,
    };

    this.affiliateLinks.push(link);
    return link;
  }

  getAffiliateLink(id: string): AffiliateLink | null {
    return this.affiliateLinks.find((l) => l.id === id) || null;
  }

  getAffiliateLinkByCode(linkCode: string): AffiliateLink | null {
    return this.affiliateLinks.find((l) => l.link_code === linkCode) || null;
  }

  getAffiliateLinksByPartner(partnerId: string): AffiliateLink[] {
    return this.affiliateLinks
      .filter((l) => l.partner_id === partnerId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
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
    const now = new Date().toISOString();

    const click: LinkClick = {
      id,
      link_id: linkId,
      partner_id: partnerId,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer,
      clicked_at: now,
    };

    this.linkClicks.push(click);

    // Update click count
    const link = this.affiliateLinks.find((l) => l.id === linkId);
    if (link) {
      link.clicks += 1;
      link.updated_at = now;
    }

    return click;
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
    const now = new Date().toISOString();

    const conversion: Conversion = {
      id,
      link_id: linkId,
      partner_id: partnerId,
      amount,
      commission_amount: commissionAmount,
      order_id: orderId,
      converted_at: now,
    };

    this.conversions.push(conversion);

    // Update link statistics
    link.conversions += 1;
    link.earnings += commissionAmount;
    link.updated_at = now;

    return conversion;
  }

  // Analytics methods
  getPartnerStats(partnerId: string) {
    const partnerLinks = this.affiliateLinks.filter(
      (l) => l.partner_id === partnerId,
    );

    return {
      total_links: partnerLinks.length,
      total_clicks: partnerLinks.reduce((sum, l) => sum + l.clicks, 0),
      total_conversions: partnerLinks.reduce(
        (sum, l) => sum + l.conversions,
        0,
      ),
      total_earnings: partnerLinks.reduce((sum, l) => sum + l.earnings, 0),
    };
  }

  getOverallStats() {
    const activePartners = this.partners.filter((p) => p.status === "active");

    return {
      total_partners: activePartners.length,
      total_clicks: this.affiliateLinks.reduce((sum, l) => sum + l.clicks, 0),
      total_conversions: this.affiliateLinks.reduce(
        (sum, l) => sum + l.conversions,
        0,
      ),
      total_earnings: this.affiliateLinks.reduce(
        (sum, l) => sum + l.earnings,
        0,
      ),
    };
  }

  close() {
    // No-op for in-memory database
  }
}

export const db = new DatabaseManager();
