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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Link as LinkIcon,
  Plus,
  Globe,
  Code,
  Copy,
  ExternalLink,
  TrendingUp,
  Users,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

interface AffiliateLink {
  id: string;
  partner_id: string | null;
  partner_name: string;
  original_url: string;
  link_code: string;
  title: string;
  description: string;
  source: string;
  is_general: boolean;
  is_enabled: boolean;
  clicks: number;
  conversions: number;
  earnings: number;
  created_at: string;
}

interface Partner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const PREDEFINED_SOURCES = [
  "Facebook",
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter/X",
  "LinkedIn",
  "Email",
  "Website",
  "Blog",
  "Forum",
  "Direct",
];

const DEMO_FORM_URL = "http://localhost:3001";

export default function Links() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // New link form
  const [newLink, setNewLink] = useState({
    originalUrl: "",
    title: "",
    description: "",
    source: "Direct",
    customSource: "",
    isGeneral: true,
    partnerId: "",
    useCustomUrl: false,
  });

  const navigate = useNavigate();

  const getPredefinedUrls = () => {
    const origin = window.location.origin;
    return [
      {
        url: DEMO_FORM_URL,
        title: "Demo Request Form",
        description: "Lead capture form (separate app on port 3001)",
      },
      {
        url: `${origin}/`,
        title: "Homepage",
        description: "Main landing page",
      },
    ];
  };

  const predefinedUrls = getPredefinedUrls();

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (!admin) {
      navigate("/login");
      return;
    }
    loadLinks();
    loadPartners();
  }, [navigate]);

  const loadLinks = async () => {
    try {
      const response = await fetch("/api/links/all");
      if (response.ok) {
        const data = await response.json();
        setLinks(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error loading links:", err);
      setLoading(false);
    }
  };

  const loadPartners = async () => {
    try {
      const response = await fetch("/api/partners");
      if (response.ok) {
        const data = await response.json();
        setPartners(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error loading partners:", err);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      const finalSource = newLink.source === "Custom" ? newLink.customSource : newLink.source;
      
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: newLink.originalUrl,
          title: newLink.title,
          description: newLink.description,
          source: finalSource,
          isGeneral: newLink.isGeneral,
          partnerId: newLink.isGeneral ? null : newLink.partnerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create link");
      }

      await loadLinks();
      setSuccess("Link created successfully!");
      setNewLink({
        originalUrl: "",
        title: "",
        description: "",
        source: "Direct",
        customSource: "",
        isGeneral: true,
        partnerId: "",
        useCustomUrl: false,
      });
      setDialogOpen(false);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create link");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}/toggle`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to toggle link status");
      }

      const data = await response.json();
      setLinks((prev) =>
        prev.map((link) =>
          link.id === linkId ? { ...link, is_enabled: data.is_enabled } : link
        )
      );
      setSuccess(`Link ${data.is_enabled ? "enabled" : "disabled"} successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle link");
      setTimeout(() => setError(""), 3000);
    }
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

      setSuccess(`Link copied: ${affiliateUrl}`);
      setTimeout(() => {
        setSuccess("");
        setCopiedLinkId(null);
      }, 3000);
    } catch (err) {
      console.error("Copy error:", err);
      setError("Failed to copy link");
      setCopiedLinkId(null);
      setTimeout(() => setError(""), 3000);
    }
  };

  const getSourceBadgeColor = (source: string) => {
    const colors: { [key: string]: string } = {
      Facebook: "bg-blue-600",
      Instagram: "bg-gradient-to-r from-purple-600 to-pink-500",
      TikTok: "bg-black",
      YouTube: "bg-red-600",
      "Twitter/X": "bg-sky-500",
      LinkedIn: "bg-blue-700",
      Email: "bg-green-600",
      Website: "bg-gray-600",
      Blog: "bg-orange-600",
      Forum: "bg-purple-600",
      Direct: "bg-gray-500",
    };
    return colors[source] || "bg-gray-500";
  };

  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.partner_name.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "general") return matchesSearch && link.is_general;
    if (activeTab === "partner") return matchesSearch && !link.is_general;
    if (activeTab === "disabled") return matchesSearch && !link.is_enabled;
    return matchesSearch;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading links...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Link Management</h1>
            <p className="text-gray-600">
              Create and manage affiliate links for all partners
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadLinks}>
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

        {/* Links Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  All Links ({links.length})
                </CardTitle>
                <CardDescription>
                  General links apply to all partners automatically
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Link
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Affiliate Link</DialogTitle>
                    <DialogDescription>
                      Create a trackable link. General links are automatically
                      available to all partners.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateLink} className="space-y-4">
                    {/* Link Type Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">General Link</p>
                          <p className="text-xs text-gray-500">
                            Available to all partners
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={newLink.isGeneral}
                        onCheckedChange={(checked) =>
                          setNewLink((prev) => ({ ...prev, isGeneral: checked }))
                        }
                      />
                    </div>

                    {/* Partner Selection (only for non-general links) */}
                    {!newLink.isGeneral && (
                      <div className="space-y-2">
                        <Label>Select Partner</Label>
                        <Select
                          value={newLink.partnerId}
                          onValueChange={(value) =>
                            setNewLink((prev) => ({ ...prev, partnerId: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a partner..." />
                          </SelectTrigger>
                          <SelectContent>
                            {partners.map((partner) => (
                              <SelectItem key={partner.id} value={partner.id}>
                                {partner.firstName} {partner.lastName} (
                                {partner.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Source Selection */}
                    <div className="space-y-2">
                      <Label>Traffic Source</Label>
                      <Select
                        value={newLink.source}
                        onValueChange={(value) =>
                          setNewLink((prev) => ({ ...prev, source: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select where this link will be used..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PREDEFINED_SOURCES.map((source) => (
                            <SelectItem key={source} value={source}>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${getSourceBadgeColor(
                                    source
                                  )}`}
                                />
                                {source}
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="Custom">
                            <div className="flex items-center gap-2">
                              <Code className="h-3 w-3" />
                              Custom Source
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {newLink.source === "Custom" && (
                        <Input
                          placeholder="Enter custom source name..."
                          value={newLink.customSource}
                          onChange={(e) =>
                            setNewLink((prev) => ({
                              ...prev,
                              customSource: e.target.value,
                            }))
                          }
                          required
                        />
                      )}
                    </div>

                    {/* Destination URL */}
                    <div className="space-y-2">
                      <Label>Destination URL</Label>
                      <Select
                        value={
                          newLink.useCustomUrl ? "custom" : newLink.originalUrl
                        }
                        onValueChange={(value) => {
                          if (value === "custom") {
                            setNewLink((prev) => ({
                              ...prev,
                              useCustomUrl: true,
                              originalUrl: "",
                            }));
                          } else {
                            const selected = predefinedUrls.find(
                              (u) => u.url === value
                            );
                            setNewLink((prev) => ({
                              ...prev,
                              useCustomUrl: false,
                              originalUrl: value,
                              title: selected?.title || prev.title,
                              description:
                                selected?.description || prev.description,
                            }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a destination page..." />
                        </SelectTrigger>
                        <SelectContent>
                          {predefinedUrls.map((predefined, index) => (
                            <SelectItem key={index} value={predefined.url}>
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                <div>
                                  <div className="font-medium">
                                    {predefined.title}
                                  </div>
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
                          type="url"
                          placeholder="https://example.com/page"
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

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Link Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Facebook Demo Form Link"
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

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input
                        id="description"
                        placeholder="Brief description of this link..."
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
                      disabled={
                        isCreating ||
                        !newLink.originalUrl ||
                        !newLink.title ||
                        (!newLink.isGeneral && !newLink.partnerId)
                      }
                    >
                      {isCreating ? "Creating..." : "Create Link"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabs and Search */}
            <div className="flex items-center justify-between mb-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">All Links</TabsTrigger>
                  <TabsTrigger value="general">
                    <Globe className="h-3 w-3 mr-1" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="partner">
                    <Users className="h-3 w-3 mr-1" />
                    Partner-Specific
                  </TabsTrigger>
                  <TabsTrigger value="disabled">Disabled</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Links List */}
            <div className="space-y-4">
              {filteredLinks.map((link) => (
                <div
                  key={link.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    link.is_enabled
                      ? "bg-gray-50 hover:bg-gray-100 border-gray-200"
                      : "bg-gray-100 border-gray-300 opacity-60"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{link.title}</h3>
                      {link.is_general && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Globe className="h-3 w-3 mr-1" />
                          General
                        </Badge>
                      )}
                      <Badge className={`${getSourceBadgeColor(link.source)} text-white`}>
                        {link.source}
                      </Badge>
                      {!link.is_enabled && (
                        <Badge variant="secondary" className="bg-gray-300">
                          Disabled
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {link.description || "No description"}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs text-gray-400">
                        {link.is_general ? "All Partners" : link.partner_name}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-blue-600 font-mono text-xs truncate max-w-md">
                        {(() => {
                          const url = new URL(link.original_url);
                          url.searchParams.set("affiliate-id", link.link_code);
                          return url.toString();
                        })()}
                      </span>
                      <Button
                        variant={
                          copiedLinkId === link.link_code ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => copyLinkToClipboard(link)}
                        disabled={copiedLinkId === link.link_code}
                        className="h-6 px-2"
                      >
                        {copiedLinkId === link.link_code ? (
                          "Copied!"
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <a
                        href={(() => {
                          const url = new URL(link.original_url);
                          url.searchParams.set("affiliate-id", link.link_code);
                          return url.toString();
                        })()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center text-xs"
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
                    <div className="flex flex-col items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleLink(link.id)}
                        className={link.is_enabled ? "text-green-600" : "text-gray-400"}
                      >
                        {link.is_enabled ? (
                          <ToggleRight className="h-6 w-6" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </Button>
                      <span className="text-xs text-gray-500">
                        {link.is_enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredLinks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "No links found matching your search."
                    : "No links created yet."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
