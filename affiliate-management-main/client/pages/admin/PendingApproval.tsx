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
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Phone,
  Mail,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface PendingPartner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  commissionRate: number;
  status: string;
  joinedDate: string;
}

export default function PendingApproval() {
  const [pendingPartners, setPendingPartners] = useState<PendingPartner[]>([]);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/login");
      return;
    }
    loadPendingPartners();
  }, [navigate]);

  const loadPendingPartners = async () => {
    try {
      const response = await fetch("/api/partners/pending");
      if (response.ok) {
        const data = await response.json();
        setPendingPartners(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading pending partners:", err);
      setLoading(false);
    }
  };

  const handleApprovePartner = async (partnerId: string) => {
    setProcessingApproval(partnerId);
    setError("");
    try {
      const response = await fetch(`/api/partners/${partnerId}/approve`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve partner");
      }
      setSuccess("Partner approved successfully!");
      await loadPendingPartners();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve partner");
    } finally {
      setProcessingApproval(null);
    }
  };

  const handleRejectPartner = async (partnerId: string) => {
    setProcessingApproval(partnerId);
    setError("");
    try {
      const response = await fetch(`/api/partners/${partnerId}/reject`, {
        method: "POST",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject partner");
      }
      setSuccess("Partner rejected.");
      await loadPendingPartners();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject partner");
    } finally {
      setProcessingApproval(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending approvals...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Pending Approval</h1>
            <p className="text-gray-600">Review and approve or reject affiliate partner applications</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadPendingPartners}>
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

        {/* Pending Partners Card */}
        <Card className="border-amber-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Pending Applications ({pendingPartners.length})
                </CardTitle>
                <CardDescription>
                  Affiliate partner applications waiting for your review
                </CardDescription>
              </div>
              {pendingPartners.length > 0 && (
                <Badge variant="destructive" className="bg-amber-500">
                  {pendingPartners.length} pending
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {partner.firstName.charAt(0)}
                      {partner.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {partner.firstName} {partner.lastName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {partner.email}
                        </span>
                        {partner.mobileNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {partner.mobileNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Applied: {partner.joinedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {partner.commissionRate}%
                      </p>
                      <p className="text-xs text-gray-500">Commission Rate</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-amber-100 text-amber-700 border-amber-300"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprovePartner(partner.id)}
                        disabled={processingApproval === partner.id}
                      >
                        {processingApproval === partner.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectPartner(partner.id)}
                        disabled={processingApproval === partner.id}
                      >
                        {processingApproval === partner.id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingPartners.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
                  <p className="font-medium">No pending applications</p>
                  <p className="text-sm mt-1">
                    All affiliate applications have been reviewed.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
