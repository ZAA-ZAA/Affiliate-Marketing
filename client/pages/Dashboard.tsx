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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  BarChart3,
  DollarSign,
  MousePointer,
  TrendingUp,
  Link as LinkIcon,
  LogOut,
  Settings,
  Search,
  Eye,
  Copy,
  MoreHorizontal,
  UserCheck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AffiliateLink, UserStats } from "@shared/api";

// Helper function to make requests with fallback to XMLHttpRequest
function makeRequest(url: string, options: RequestInit = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    // Try fetch first
    if (typeof fetch !== "undefined") {
      const fetchOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
      };

      fetch(url, fetchOptions)
        .then((response) => {
          if (!response.ok) {
            // Try to get error details
            return response.text().then((text) => {
              let errorData;
              try {
                errorData = JSON.parse(text);
              } catch {
                errorData = { error: text || response.statusText };
              }
              throw new Error(
                errorData.error ||
                  `HTTP ${response.status}: ${response.statusText}`,
              );
            });
          }
          return response.json();
        })
        .then(resolve)
        .catch((error) => {
          console.log("Fetch failed, trying XMLHttpRequest fallback:", error);
          // Fallback to XMLHttpRequest
          makeXHRRequest(url, options).then(resolve).catch(reject);
        });
    } else {
      // No fetch available, use XMLHttpRequest directly
      makeXHRRequest(url, options).then(resolve).catch(reject);
    }
  });
}

function makeXHRRequest(url: string, options: RequestInit = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = (options.method as string) || "GET";

    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (parseError) {
            reject(new Error("Failed to parse response JSON"));
          }
        } else {
          reject(new Error(`XHR ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };

    xhr.onerror = function () {
      reject(new Error("Network error with XMLHttpRequest"));
    };

    xhr.ontimeout = function () {
      reject(new Error("Request timeout"));
    };

    xhr.timeout = 10000; // 10 second timeout

    if (options.body) {
      xhr.send(options.body as string);
    } else {
      xhr.send();
    }
  });
}

interface Partner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  commissionRate: number;
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  status: "active" | "inactive";
  joinedDate: string;
}

export default function Dashboard() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [stats, setStats] = useState({
    totalPartners: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0,
  });
  const [newPartner, setNewPartner] = useState({
    userId: "",
    email: "",
    firstName: "",
    lastName: "",
    commissionRate: 10,
    useExistingUser: false,
  });
  const [affiliateUsers, setAffiliateUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/login");
      return;
    }
    loadDashboardData();
    loadAffiliateUsers();
  }, [navigate]);

  const loadAffiliateUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch("/api/affiliate-users");
      if (response.ok) {
        const users = await response.json();
        // Only show users who don't have partner records yet
        setAffiliateUsers(users.filter((u: any) => !u.hasPartner));
      }
    } catch (err) {
      console.error("Error loading affiliate users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadDashboardData = async (retryCount = 0) => {
    try {
      setError(""); // Clear any previous errors
      console.log(`Dashboard: loadDashboardData attempt ${retryCount + 1}`);

      // Test basic connectivity first
      const baseUrl = window.location.origin;
      console.log("Dashboard: Base URL:", baseUrl);
      console.log("Dashboard: Current location:", window.location.href);

      // Load partners with XMLHttpRequest fallback
      console.log("Dashboard: Fetching partners from /api/partners");

      const partnersData = await makeRequest("/api/partners");

      console.log("Dashboard: Partners data:", partnersData);
      setPartners(Array.isArray(partnersData) ? partnersData : []);

      // Load overall stats
      console.log("Dashboard: Fetching stats from /api/stats");
      const statsData = await makeRequest("/api/stats");
      console.log("Dashboard: Stats data:", statsData);
      setStats({
        totalPartners: statsData.total_partners || 0,
        totalClicks: statsData.total_clicks || 0,
        totalConversions: statsData.total_conversions || 0,
        totalEarnings: statsData.total_earnings || 0,
      });

      setLoading(false);
    } catch (err) {
      console.error("Dashboard: loadDashboardData error:", err);
      console.error("Dashboard: Error type:", typeof err);
      console.error(
        "Dashboard: Error name:",
        err instanceof Error ? err.name : "Unknown",
      );
      console.error(
        "Dashboard: Error message:",
        err instanceof Error ? err.message : "Unknown",
      );
      console.error(
        "Dashboard: Error stack:",
        err instanceof Error ? err.stack : "No stack",
      );

      // For development, provide fallback data to allow testing the UI
      if (retryCount === 0) {
        console.log("Dashboard: Providing fallback data for development");
        setPartners([]);
        setStats({
          totalPartners: 0,
          totalClicks: 0,
          totalConversions: 0,
          totalEarnings: 0,
        });
        setLoading(false);
        setError(
          "Warning: Using offline mode - API connection failed. Some features may not work correctly.",
        );
        return;
      }

      // Retry logic for network errors
      if (
        retryCount < 2 &&
        (err instanceof TypeError ||
          err.name === "AbortError" ||
          (err instanceof Error && err.message.includes("fetch")))
      ) {
        console.log(`Dashboard: Retrying... attempt ${retryCount + 1}`);
        setRetrying(true);
        setTimeout(() => {
          setRetrying(false);
          loadDashboardData(retryCount + 1);
        }, 2000); // Increased delay
        return;
      }

      // Enhanced error messages
      let errorMessage = "Failed to load dashboard data";
      if (err instanceof TypeError && err.message.includes("fetch")) {
        errorMessage =
          "Network error: Unable to connect to server. Please check your connection and try again.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingPartner(true);
    setError("");

    try {
      const requestData = newPartner.useExistingUser
        ? {
            userId: newPartner.userId,
            commissionRate: newPartner.commissionRate,
          }
        : {
            email: newPartner.email,
            firstName: newPartner.firstName,
            lastName: newPartner.lastName,
            commissionRate: newPartner.commissionRate,
          };

      const data = await makeRequest("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      // Reload dashboard data to get updated stats
      await loadDashboardData();
      await loadAffiliateUsers(); // Refresh available users

      setSuccess("Partner added successfully!");
      setNewPartner({
        userId: "",
        email: "",
        firstName: "",
        lastName: "",
        commissionRate: 10,
        useExistingUser: false,
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add partner");
    } finally {
      setIsAddingPartner(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/login");
  };

  const handleManualRefresh = () => {
    setLoading(true);
    setError("");
    setRetrying(false);
    loadDashboardData(0);
  };

  const filteredPartners = partners.filter(
    (partner) =>
      partner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {retrying ? "Retrying connection..." : "Loading dashboard..."}
          </p>
          {retrying && (
            <p className="text-sm text-gray-500 mt-2">
              Connection failed, retrying automatically...
            </p>
          )}
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
                Partner Manager
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={loading}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {loading ? "Refreshing..." : "Refresh Data"}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert
            variant={error.includes("Warning") ? "default" : "destructive"}
            className="mb-6"
          >
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              {error.includes("Network error") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={loading}
                >
                  Try Again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Partners
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalPartners || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Clicks
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.totalClicks || 0).toLocaleString()}
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
                    {stats.totalConversions || 0}
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
                    ${(stats.totalEarnings || 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partners Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Affiliate Partners
                </CardTitle>
                <CardDescription>
                  Manage your affiliate partners and their performance
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Partner
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Partner</DialogTitle>
                    <DialogDescription>
                      Link an existing affiliate user or create a new partner.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPartner} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Partner Source</Label>
                      <Select
                        value={newPartner.useExistingUser ? "existing" : "new"}
                        onValueChange={(value) => {
                          setNewPartner((prev) => ({
                            ...prev,
                            useExistingUser: value === "existing",
                            userId: "",
                            email: "",
                            firstName: "",
                            lastName: "",
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="existing">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4" />
                              Select Existing Affiliate User
                            </div>
                          </SelectItem>
                          <SelectItem value="new">
                            <div className="flex items-center gap-2">
                              <UserPlus className="h-4 w-4" />
                              Create New Partner
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newPartner.useExistingUser ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="selectUser">Select Affiliate User</Label>
                          <Select
                            value={newPartner.userId}
                            onValueChange={(value) =>
                              setNewPartner((prev) => ({
                                ...prev,
                                userId: value,
                              }))
                            }
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose an affiliate user..." />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingUsers ? (
                                <SelectItem value="loading" disabled>
                                  Loading users...
                                </SelectItem>
                              ) : affiliateUsers.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No available users
                                </SelectItem>
                              ) : (
                                affiliateUsers.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName} ({user.email})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {affiliateUsers.length === 0 && !loadingUsers && (
                            <p className="text-xs text-gray-500">
                              All affiliate users already have partner accounts.
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={newPartner.firstName}
                              onChange={(e) =>
                                setNewPartner((prev) => ({
                                  ...prev,
                                  firstName: e.target.value,
                                }))
                              }
                              required={!newPartner.useExistingUser}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={newPartner.lastName}
                              onChange={(e) =>
                                setNewPartner((prev) => ({
                                  ...prev,
                                  lastName: e.target.value,
                                }))
                              }
                              required={!newPartner.useExistingUser}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newPartner.email}
                            onChange={(e) =>
                              setNewPartner((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            required={!newPartner.useExistingUser}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="commissionRate">
                        Commission Rate (%)
                      </Label>
                      <Input
                        id="commissionRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={newPartner.commissionRate}
                        onChange={(e) =>
                          setNewPartner((prev) => ({
                            ...prev,
                            commissionRate: parseFloat(e.target.value),
                          }))
                        }
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isAddingPartner || (newPartner.useExistingUser && !newPartner.userId)}
                    >
                      {isAddingPartner ? "Adding..." : "Add Partner"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search partners by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Partners Table */}
            <div className="space-y-4">
              {filteredPartners.map((partner) => (
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
                        {partner.commissionRate}%
                      </p>
                      <p className="text-xs text-gray-500">Commission</p>
                    </div>
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
                      <p className="text-xs text-gray-500">Conversions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        ${(partner.totalEarnings || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Earnings</p>
                    </div>
                    <Badge
                      variant={
                        partner.status === "active" ? "default" : "secondary"
                      }
                    >
                      {partner.status}
                    </Badge>
                    <Link to={`/partner/${partner.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {filteredPartners.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "No partners found matching your search."
                    : "No partners registered yet."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
