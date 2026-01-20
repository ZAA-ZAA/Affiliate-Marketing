import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  MousePointer,
  TrendingUp,
  DollarSign,
  Clock,
  Eye,
  ArrowRight,
  Link as LinkIcon,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface Partner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  commissionRate: number;
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  status: "pending" | "active" | "inactive" | "rejected";
  joinedDate: string;
}

export default function Dashboard() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [stats, setStats] = useState({
    totalPartners: 0,
    pendingPartners: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/login");
      return;
    }
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setError("");

      // Load partners
      const partnersResponse = await fetch("/api/partners");
      if (partnersResponse.ok) {
        const partnersData = await partnersResponse.json();
        setPartners(Array.isArray(partnersData) ? partnersData : []);
      }

      // Load stats
      const statsResponse = await fetch("/api/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalPartners: statsData.total_partners || 0,
          pendingPartners: statsData.pending_partners || 0,
          totalClicks: statsData.total_clicks || 0,
          totalConversions: statsData.total_conversions || 0,
          totalEarnings: statsData.total_earnings || 0,
        });
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  // Get top 10 recent partners for quick view
  const recentPartners = partners.slice(0, 10);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of your affiliate program</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Link to="/admin/partners">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Partners</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalPartners || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/pending">
            <Card
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                stats.pendingPartners > 0 ? "border-amber-300 bg-amber-50" : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Approval
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pendingPartners || 0}
                    </p>
                  </div>
                  <Clock
                    className={`h-8 w-8 ${
                      stats.pendingPartners > 0 ? "text-amber-600" : "text-gray-400"
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/clicks">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-green-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(stats.totalClicks || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Click to view details</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/conversions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-purple-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalConversions || 0}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">Click to view leads</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(stats.totalEarnings || 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/admin/links">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Link Management</h3>
                    <p className="text-sm text-gray-600">
                      Create general links for all partners or partner-specific links
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-6 w-6 text-blue-600" />
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/pending">
            <Card
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                stats.pendingPartners > 0
                  ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
                  : "bg-gray-50"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
                    <p className="text-sm text-gray-600">
                      {stats.pendingPartners > 0
                        ? `${stats.pendingPartners} application(s) waiting for review`
                        : "All applications have been reviewed"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock
                      className={`h-6 w-6 ${
                        stats.pendingPartners > 0 ? "text-amber-600" : "text-gray-400"
                      }`}
                    />
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Partners Quick View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Partners
                </CardTitle>
                <CardDescription>
                  Top 10 most recent affiliate partners
                </CardDescription>
              </div>
              <Link to="/admin/partners">
                <Button variant="outline" size="sm">
                  View All Partners
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {partner.firstName.charAt(0)}
                      {partner.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {partner.firstName} {partner.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{partner.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {partner.totalClicks || 0}
                      </p>
                      <p className="text-xs text-gray-500">Clicks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {partner.totalConversions || 0}
                      </p>
                      <p className="text-xs text-gray-500">Conv</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        ${(partner.totalEarnings || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Earnings</p>
                    </div>
                    <Badge
                      variant={partner.status === "active" ? "default" : "secondary"}
                      className={partner.status === "active" ? "bg-green-600" : ""}
                    >
                      {partner.status}
                    </Badge>
                    <Link to={`/partner/${partner.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {recentPartners.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No active partners yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
