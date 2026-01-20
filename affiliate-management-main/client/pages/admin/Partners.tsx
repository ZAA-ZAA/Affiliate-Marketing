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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  TrendingUp,
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

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [affiliateUsers, setAffiliateUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newPartner, setNewPartner] = useState({
    userId: "",
    commissionRate: 10,
  });
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/login");
      return;
    }
    loadPartners();
    loadAffiliateUsers();
  }, [navigate]);

  const loadPartners = async () => {
    try {
      const response = await fetch("/api/partners");
      if (response.ok) {
        const data = await response.json();
        setPartners(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading partners:", err);
      setLoading(false);
    }
  };

  const loadAffiliateUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch("/api/affiliate-users");
      if (response.ok) {
        const users = await response.json();
        setAffiliateUsers(users);
      }
    } catch (err) {
      console.error("Error loading affiliate users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingPartner(true);
    setError("");

    try {
      if (!newPartner.userId) {
        setError("Please select an affiliate user");
        setIsAddingPartner(false);
        return;
      }

      const response = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: newPartner.userId,
          commissionRate: newPartner.commissionRate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add partner");
      }

      await loadPartners();
      await loadAffiliateUsers();

      setSuccess("Partner added successfully!");
      setNewPartner({ userId: "", commissionRate: 10 });
      setDialogOpen(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add partner");
    } finally {
      setIsAddingPartner(false);
    }
  };

  const filteredPartners = partners.filter(
    (partner) =>
      partner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading partners...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Affiliate Partners</h1>
            <p className="text-gray-600">Manage your affiliate partners and their performance</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPartners}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Partners Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Partners ({partners.length})
                </CardTitle>
                <CardDescription>
                  View and manage all active affiliate partners
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                      Select an affiliate user who has signed up to add them as a partner.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddPartner} className="space-y-4">
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
                                <div className="flex items-center justify-between w-full gap-2">
                                  <span>
                                    {user.firstName} {user.lastName} ({user.email})
                                  </span>
                                  {user.partnerStatus === "pending" && (
                                    <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                                      Pending
                                    </span>
                                  )}
                                  {user.partnerStatus === "rejected" && (
                                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                      Rejected
                                    </span>
                                  )}
                                  {!user.partnerStatus && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                      New
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commissionRate">Commission Rate (%)</Label>
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
                      disabled={isAddingPartner || !newPartner.userId}
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
                <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>
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
                      variant={partner.status === "active" ? "default" : "secondary"}
                      className={partner.status === "active" ? "bg-green-600" : ""}
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
                    : "No active partners yet."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
