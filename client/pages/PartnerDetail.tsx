import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
  ArrowLeft,
  BarChart3,
  DollarSign,
  MousePointer,
  TrendingUp,
  Link as LinkIcon,
  Copy,
  Plus,
  ExternalLink,
  Calendar,
  Code,
  Globe,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AffiliateLink } from "@shared/api";

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

export default function PartnerDetail() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [newLink, setNewLink] = useState({
    originalUrl: "",
    title: "",
    description: "",
    useCustomUrl: false,
  });

  // Predefined destination URLs
  const getPredefinedUrls = () => {
    const origin = window.location.origin;
    return [
      {
        url: `${origin}/demo`,
        title: "Demo Request Form",
        description: "Main demo request page with form",
      },
      {
        url: `${origin}/`,
        title: "Homepage",
        description: "Main landing page",
      },
    ];
  };
  
  const predefinedUrls = getPredefinedUrls();
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!partnerId) {
      navigate("/dashboard");
      return;
    }

    // Check if user is authenticated
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/login");
      return;
    }

    loadPartnerData();
  }, [partnerId, navigate]);

  const loadPartnerData = async (retryCount = 0) => {
    try {
      setError(""); // Clear any previous errors

      // Load partner details
      console.log("Fetching partners from /api/partners");

      // Create timeout signal with fallback for browser compatibility
      let timeoutId: number;
      const controller = new AbortController();

      if (typeof AbortSignal.timeout === "function") {
        // Modern browsers
        var partnersResponse = await fetch("/api/partners", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000),
        });
      } else {
        // Fallback for older browsers
        timeoutId = window.setTimeout(() => controller.abort(), 10000);
        var partnersResponse = await fetch("/api/partners", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      }

      console.log("Partners response status:", partnersResponse.status);

      if (!partnersResponse.ok) {
        const errorText = await partnersResponse.text();
        console.error("Partners API error:", errorText);
        throw new Error(
          `Failed to load partners (${partnersResponse.status}): ${errorText}`,
        );
      }

      const partnersData = await partnersResponse.json();
      console.log("Partners data:", partnersData);

      const foundPartner = partnersData.find(
        (p: Partner) => p.id === partnerId,
      );

      if (!foundPartner) {
        console.error("Partner not found with ID:", partnerId);
        throw new Error(`Partner not found with ID: ${partnerId}`);
      }

      setPartner(foundPartner);

      // Load partner's links
      console.log(`Fetching links from /api/links/${partnerId}`);

      // Create timeout for links request
      const linksController = new AbortController();
      let linksTimeoutId: number;

      if (typeof AbortSignal.timeout === "function") {
        var linksResponse = await fetch(`/api/links/${partnerId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000),
        });
      } else {
        linksTimeoutId = window.setTimeout(
          () => linksController.abort(),
          10000,
        );
        var linksResponse = await fetch(`/api/links/${partnerId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: linksController.signal,
        });
        clearTimeout(linksTimeoutId);
      }

      console.log("Links response status:", linksResponse.status);

      if (!linksResponse.ok) {
        const errorText = await linksResponse.text();
        console.error("Links API error:", errorText);
        throw new Error(
          `Failed to load links (${linksResponse.status}): ${errorText}`,
        );
      }

      const linksData = await linksResponse.json();
      console.log("Links data:", linksData);
      setLinks(linksData);

      setLoading(false);
    } catch (err) {
      console.error("loadPartnerData error:", err);

      // Retry logic for network errors
      if (
        retryCount < 2 &&
        (err instanceof TypeError || err.name === "AbortError")
      ) {
        console.log(`Retrying... attempt ${retryCount + 1}`);
        setRetrying(true);
        setTimeout(() => {
          setRetrying(false);
          loadPartnerData(retryCount + 1);
        }, 1000);
        return;
      }

      // Enhanced error messages
      let errorMessage = "Failed to load partner data";
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

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingLink(true);
    setError("");

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newLink, partnerId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create link");
      }

      const data = await response.json();

      setLinks((prev) => [data, ...prev]);
      setSuccess("Link created successfully!");
      setNewLink({ originalUrl: "", title: "", description: "", useCustomUrl: false });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create link");
    } finally {
      setIsAddingLink(false);
    }
  };

  const copyLinkToClipboard = async (link: AffiliateLink) => {
    try {
      // Generate affiliate URL with affiliate-id parameter
      const url = new URL(link.original_url);
      url.searchParams.set("affiliate-id", link.link_code);
      const affiliateUrl = url.toString();

      // Set temporary copied state for button feedback
      setCopiedLinkId(link.link_code);

      if (navigator.clipboard && window.isSecureContext) {
        // Use modern clipboard API
        await navigator.clipboard.writeText(affiliateUrl);
      } else {
        // Fallback for older browsers or non-HTTPS
        const textArea = document.createElement("textarea");
        textArea.value = affiliateUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setSuccess(`Affiliate link copied: ${affiliateUrl}`);
      setTimeout(() => {
        setSuccess("");
        setCopiedLinkId(null);
      }, 3000);
    } catch (err) {
      console.error("Copy error:", err);
      setError("Failed to copy link to clipboard");
      setCopiedLinkId(null);
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {retrying ? "Retrying connection..." : "Loading partner details..."}
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

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Partner not found</p>
            <Link to="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Partner Manager
                </span>
              </div>
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
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Partner Header */}
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
                    <Badge
                      variant={
                        partner.status === "active" ? "default" : "secondary"
                      }
                    >
                      {partner.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Joined {partner.joinedDate}
                    </span>
                    <span className="text-sm text-gray-500">
                      {partner.commissionRate}% Commission
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Links
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {links.length}
                  </p>
                </div>
                <LinkIcon className="h-8 w-8 text-blue-600" />
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
                    {partner.totalClicks.toLocaleString()}
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
                    {partner.totalConversions}
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
                    ${partner.totalEarnings.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Affiliate Links
                </CardTitle>
                <CardDescription>
                  Manage and track performance of {partner.firstName}'s
                  affiliate links
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Affiliate Link</DialogTitle>
                    <DialogDescription>
                      Create a trackable link for {partner.firstName}{" "}
                      {partner.lastName}.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateLink} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Destination URL</Label>
                      <div className="space-y-2">
                        <Select
                          value={newLink.useCustomUrl ? "custom" : newLink.originalUrl}
                          onValueChange={(value) => {
                            if (value === "custom") {
                              setNewLink((prev) => ({
                                ...prev,
                                useCustomUrl: true,
                                originalUrl: "",
                              }));
                            } else {
                              const selected = predefinedUrls.find((u) => u.url === value);
                              setNewLink((prev) => ({
                                ...prev,
                                useCustomUrl: false,
                                originalUrl: value,
                                title: selected?.title || prev.title,
                                description: selected?.description || prev.description,
                              }));
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a predefined page or use custom URL" />
                          </SelectTrigger>
                          <SelectContent>
                            {predefinedUrls.map((predefined, index) => (
                              <SelectItem key={index} value={predefined.url}>
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{predefined.title}</div>
                                    <div className="text-xs text-gray-500">
                                      {predefined.url}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">
                              <div className="flex items-center gap-2">
                                <Code className="h-4 w-4" />
                                <span>Custom URL</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {newLink.useCustomUrl && (
                          <Input
                            id="originalUrl"
                            type="url"
                            placeholder="https://example.com/product"
                            value={newLink.originalUrl}
                            onChange={(e) =>
                              setNewLink((prev) => ({
                                ...prev,
                                originalUrl: e.target.value,
                              }))
                            }
                            required
                          />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Link Title</Label>
                      <Input
                        id="title"
                        placeholder="Product Name or Campaign"
                        value={newLink.title}
                        onChange={(e) =>
                          setNewLink((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Input
                        id="description"
                        placeholder="Brief description of the link"
                        value={newLink.description}
                        onChange={(e) =>
                          setNewLink((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isAddingLink}
                    >
                      {isAddingLink ? "Creating..." : "Create Link"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Links List */}
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
                            Copy Full Link
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
                      <Link
                        to={`/tracking-instructions/${partnerId}`}
                        className="text-purple-600 hover:underline flex items-center"
                      >
                        <Code className="h-3 w-3 mr-1" />
                        Setup Tracking
                      </Link>
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
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {link.clicks > 0
                          ? ((link.conversions / link.clicks) * 100).toFixed(1)
                          : "0"}
                        %
                      </p>
                      <p className="text-xs text-gray-500">CVR</p>
                    </div>
                  </div>
                </div>
              ))}

              {links.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No affiliate links created yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
