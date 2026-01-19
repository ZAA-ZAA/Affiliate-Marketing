import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  LogOut,
  Link as LinkIcon,
  MousePointer,
  DollarSign,
  TrendingUp,
  Copy,
  Plus,
  ExternalLink,
  Clock,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { AffiliateLink } from "@/types/api";

export default function AffiliateDashboard() {
  const [partner, setPartner] = useState<any>(null);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [stats, setStats] = useState({
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if affiliate is logged in
    const affiliateData = localStorage.getItem("affiliate");
    if (!affiliateData) {
      navigate("/affiliate/login");
      return;
    }

    const partnerData = JSON.parse(affiliateData);
    setPartner(partnerData);
    
    // Only load dashboard data if partner is active
    if (partnerData.id && partnerData.status === "active") {
      loadDashboardData(partnerData.id);
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const loadDashboardData = async (partnerId: string) => {
    try {
      setError("");

      // Load partner's links
      const linksResponse = await fetch(`/api/links/${partnerId}`);
      if (!linksResponse.ok) {
        throw new Error("Failed to load links");
      }
      const linksData = await linksResponse.json();
      setLinks(linksData);

      // Calculate stats from links
      const totalClicks = linksData.reduce(
        (sum: number, link: AffiliateLink) => sum + (link.clicks || 0),
        0
      );
      const totalConversions = linksData.reduce(
        (sum: number, link: AffiliateLink) => sum + (link.conversions || 0),
        0
      );
      const totalEarnings = linksData.reduce(
        (sum: number, link: AffiliateLink) => sum + (link.earnings || 0),
        0
      );

      setStats({
        totalClicks,
        totalConversions,
        totalEarnings,
      });

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("affiliate");
    navigate("/affiliate/login");
  };

  const copyLinkToClipboard = async (link: AffiliateLink) => {
    try {
      const url = new URL(link.original_url);
      url.searchParams.set("affiliate-id", link.link_code);
      const affiliateUrl = url.toString();

      setCopiedLinkId(link.link_code);

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(affiliateUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = affiliateUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setTimeout(() => setCopiedLinkId(null), 3000);
    } catch (err) {
      console.error("Copy error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return null;
  }

  // Show pending approval message
  if (partner.status === "pending") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Affiliate Dashboard
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {partner.firstName} {partner.lastName}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                    <Clock className="h-10 w-10 text-amber-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Account Under Review
                  </h1>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Your account is under review for approval. Our team will review your
                    application and notify you once your account has been approved.
                  </p>
                  <div className="bg-white rounded-lg p-4 w-full border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {partner.firstName.charAt(0)}
                          {partner.lastName.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            {partner.firstName} {partner.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{partner.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-6">
                    This usually takes 1-2 business days. Thank you for your patience!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show rejected message
  if (partner.status === "rejected") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Affiliate Dashboard
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {partner.firstName} {partner.lastName}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <XCircle className="h-10 w-10 text-red-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Application Not Approved
                  </h1>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Unfortunately, your affiliate application was not approved at this time.
                    If you believe this was a mistake, please contact our support team.
                  </p>
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                    <XCircle className="h-3 w-3 mr-1" />
                    Rejected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Affiliate Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {partner.firstName} {partner.lastName}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Partner Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {partner.firstName.charAt(0)}
                  {partner.lastName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {partner.firstName} {partner.lastName}
                  </h1>
                  <p className="text-gray-600">{partner.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                    <span className="text-sm text-gray-500">
                      {partner.commissionRate}% Commission Rate
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Clicks
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalClicks.toLocaleString()}
                  </p>
                </div>
                <MousePointer className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Conversions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalConversions}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.totalEarnings.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              My Affiliate Links
            </CardTitle>
            <CardDescription>
              Your trackable affiliate links and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{link.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {link.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-600 font-mono text-xs break-all">
                        {(() => {
                          const url = new URL(link.original_url);
                          url.searchParams.set("affiliate-id", link.link_code);
                          return url.toString();
                        })()}
                      </span>
                      <Button
                        variant={
                          copiedLinkId === link.link_code
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => copyLinkToClipboard(link)}
                        disabled={copiedLinkId === link.link_code}
                      >
                        {copiedLinkId === link.link_code ? (
                          <>
                            <div className="h-3 w-3 mr-1 rounded-full bg-green-500"></div>
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy Link
                          </>
                        )}
                      </Button>
                      <a
                        href={link.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {link.clicks}
                      </p>
                      <p className="text-xs text-gray-500">Clicks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {link.conversions}
                      </p>
                      <p className="text-xs text-gray-500">Conversions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        ${link.earnings.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Earnings</p>
                    </div>
                  </div>
                </div>
              ))}

              {links.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <LinkIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No affiliate links yet.</p>
                  <p className="text-sm mt-2">
                    Contact admin to generate links for you.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
