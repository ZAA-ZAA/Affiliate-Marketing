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
import {
  TrendingUp,
  Globe,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface ConversionSource {
  source: string;
  conversions: number;
  last_conversion: string | null;
}

interface LeadDetail {
  id: string;
  affiliate_id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  referrer: string;
  source: string;
  source_url: string;
  submitted_at: string;
  partner_id: string;
  partner_name: string | null;
}

export default function ConversionDetails() {
  const [conversionSources, setConversionSources] = useState<ConversionSource[]>([]);
  const [leads, setLeads] = useState<LeadDetail[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/login");
      return;
    }
    loadConversionDetails();
  }, [navigate]);

  const loadConversionDetails = async () => {
    try {
      const response = await fetch("/api/conversions/details");
      if (response.ok) {
        const data = await response.json();
        setConversionSources(data.by_source || []);
        setLeads(data.leads || []);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading conversion details:", err);
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes("facebook") || lowerSource.includes("fb.com")) {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
          FB
        </div>
      );
    }
    if (lowerSource.includes("tiktok")) {
      return (
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold">
          TT
        </div>
      );
    }
    if (lowerSource.includes("youtube")) {
      return (
        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
          YT
        </div>
      );
    }
    if (lowerSource.includes("twitter") || lowerSource.includes("x.com")) {
      return (
        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm font-bold">
          X
        </div>
      );
    }
    if (lowerSource.includes("instagram")) {
      return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
          IG
        </div>
      );
    }
    if (lowerSource.includes("linkedin")) {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-bold">
          IN
        </div>
      );
    }
    if (lowerSource === "direct" || !source) {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm font-bold">
          D
        </div>
      );
    }
    return <Globe className="w-10 h-10 text-gray-400" />;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversion details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalConversions = conversionSources.reduce((sum, s) => sum + s.conversions, 0);

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                Conversion Details & Leads
              </h1>
              <p className="text-gray-600">View form submissions and lead information</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadConversionDetails}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversions</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalConversions.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Sources</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {conversionSources.length}
                  </p>
                </div>
                <Globe className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {leads.length}
                  </p>
                </div>
                <Mail className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sources Grid */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Conversion Sources
            </CardTitle>
            <CardDescription>Breakdown by source platform</CardDescription>
          </CardHeader>
          <CardContent>
            {conversionSources.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {conversionSources.map((source, index) => (
                  <div
                    key={index}
                    className="p-4 bg-purple-50 rounded-lg text-center"
                  >
                    <div className="flex justify-center mb-3">
                      {getSourceIcon(source.source)}
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {source.conversions}
                    </p>
                    <p className="text-sm text-gray-600">{source.source || "Direct"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No conversions recorded yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Lead Details ({leads.length})
            </CardTitle>
            <CardDescription>All form submissions from affiliate links</CardDescription>
          </CardHeader>
          <CardContent>
            {leads.length > 0 ? (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() =>
                      setSelectedLead(selectedLead?.id === lead.id ? null : lead)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                          {lead.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{lead.name}</p>
                          <p className="text-sm text-gray-600">{lead.email}</p>
                          {lead.company && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Building className="h-3 w-3" /> {lead.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {lead.source || "Direct"}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {formatDate(lead.submitted_at)}
                        </p>
                        {lead.partner_name && (
                          <p className="text-xs text-purple-600 mt-1">
                            Partner: {lead.partner_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedLead?.id === lead.id && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> Email
                            </p>
                            <p className="text-sm">{lead.email}</p>
                          </div>
                          {lead.phone && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" /> Phone
                              </p>
                              <p className="text-sm">{lead.phone}</p>
                            </div>
                          )}
                          {lead.company && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Building className="h-3 w-3" /> Company
                              </p>
                              <p className="text-sm">{lead.company}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                              <Globe className="h-3 w-3" /> Source
                            </p>
                            <p className="text-sm">{lead.source || "Direct"}</p>
                          </div>
                        </div>
                        {lead.message && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> Message
                            </p>
                            <p className="text-sm bg-gray-50 p-3 rounded mt-1">
                              {lead.message}
                            </p>
                          </div>
                        )}
                        {lead.affiliate_id && (
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              Affiliate ID
                            </p>
                            <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                              {lead.affiliate_id}
                            </p>
                          </div>
                        )}
                        {lead.referrer && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" /> Referrer URL
                            </p>
                            <p className="text-xs text-gray-600 break-all">
                              {lead.referrer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No leads recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
