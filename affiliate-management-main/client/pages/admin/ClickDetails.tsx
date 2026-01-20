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
  MousePointer,
  TrendingUp,
  Globe,
  ArrowLeft,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface ClickSource {
  source: string;
  clicks: number;
  last_click: string | null;
}

interface ClickDetail {
  id: string;
  affiliate_id: string;
  referrer: string;
  source: string;
  ip_address: string;
  clicked_at: string;
  page_url: string;
  partner_name: string;
}

export default function ClickDetails() {
  const [clickSources, setClickSources] = useState<ClickSource[]>([]);
  const [recentClicks, setRecentClicks] = useState<ClickDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/login");
      return;
    }
    loadClickDetails();
  }, [navigate]);

  const loadClickDetails = async () => {
    try {
      const response = await fetch("/api/clicks/details");
      if (response.ok) {
        const data = await response.json();
        setClickSources(data.by_source || []);
        setRecentClicks(data.recent || []);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading click details:", err);
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading click details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalClicks = clickSources.reduce((sum, s) => sum + s.clicks, 0);

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
                <MousePointer className="h-6 w-6 text-green-600" />
                Click Details
              </h1>
              <p className="text-gray-600">Detailed breakdown of all click traffic</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={loadClickDetails}>
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
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {totalClicks.toLocaleString()}
                  </p>
                </div>
                <MousePointer className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Traffic Sources</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {clickSources.length}
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
                  <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {recentClicks.length}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Traffic Sources
              </CardTitle>
              <CardDescription>Breakdown by source platform</CardDescription>
            </CardHeader>
            <CardContent>
              {clickSources.length > 0 ? (
                <div className="space-y-4">
                  {clickSources.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {getSourceIcon(source.source)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {source.source || "Direct"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Last click: {formatDate(source.last_click)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {source.clicks.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">clicks</p>
                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-2 bg-green-600 rounded-full"
                            style={{
                              width: `${
                                totalClicks > 0
                                  ? (source.clicks / totalClicks) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No clicks recorded yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Clicks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Recent Clicks
              </CardTitle>
              <CardDescription>Latest click activity</CardDescription>
            </CardHeader>
            <CardContent>
              {recentClicks.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {recentClicks.map((click, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getSourceIcon(click.source)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">
                              {click.source || "Direct"}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {click.partner_name || "Unknown"}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {click.page_url || "Unknown page"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {formatDate(click.clicked_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent clicks</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
