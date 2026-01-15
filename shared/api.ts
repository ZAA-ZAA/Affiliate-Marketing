// Auth types
export interface RegisterTenantRequest {
  tenantName: string;
  subdomain: string;
  adminEmail: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  subdomain: string;
  email: string;
  password: string;
}

export interface RegisterAffiliateRequest {
  tenantId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId?: string;
  };
  tenant?: {
    id: string;
    name: string;
    subdomain: string;
  };
}

// Link types
export interface CreateLinkRequest {
  tenantId: string;
  userId: string;
  originalUrl: string;
  title: string;
  description?: string;
  commissionRate?: number;
}

export interface AffiliateLink {
  id: string;
  tenant_id: string;
  user_id: string;
  original_url: string;
  link_code: string;
  title: string;
  description?: string;
  commission_rate: number;
  clicks: number;
  conversions: number;
  earnings: number;
  created_at: string;
  updated_at: string;
}

export interface TrackConversionRequest {
  linkId: string;
  amount: number;
  orderId?: string;
}

export interface UserStats {
  total_links: number;
  total_clicks: number;
  total_conversions: number;
  total_earnings: number;
}

// Demo response (existing)
export interface DemoResponse {
  message: string;
  timestamp: string;
  data: Record<string, unknown>;
}
