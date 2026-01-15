import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Code, Copy, ExternalLink, Info } from "lucide-react";

export default function TrackingInstructions() {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedPixel, setCopiedPixel] = useState(false);

  const baseUrl = window.location.origin;

  const trackingScript = `<script src="${baseUrl}/api/track-script?partner=LINK_CODE"></script>`;
  const trackingPixel = `<img src="${baseUrl}/api/track-pixel?partner=LINK_CODE" width="1" height="1" style="display:none;" />`;

  const copyToClipboard = async (text: string, type: "script" | "pixel") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "script") {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
      } else {
        setCopiedPixel(true);
        setTimeout(() => setCopiedPixel(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to={`/partner/${partnerId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Partner
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Tracking Setup Instructions
              </h1>
              <p className="text-gray-600">
                How to implement affiliate tracking on destination websites
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              How Affiliate Tracking Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                New Parameter-Based System
              </h3>
              <p className="text-blue-800 text-sm">
                Instead of redirect links, your affiliate URLs now append a{" "}
                <code>?partner=CODE</code> parameter directly to the destination
                URL. This is more user-friendly and SEO-friendly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  ✅ Your Affiliate Link:
                </h4>
                <code className="text-sm bg-gray-100 p-2 rounded block break-all">
                  https://sprinthr.com/demo?partner=ABC123
                </code>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  ❌ Old Redirect System:
                </h4>
                <code className="text-sm bg-gray-100 p-2 rounded block break-all text-gray-500">
                  https://yoursite.com/l/ABC123
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* JavaScript Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-green-600" />
                JavaScript Tracking
                <Badge variant="default">Recommended</Badge>
              </CardTitle>
              <CardDescription>
                Automatically detects partner parameters and tracks conversions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">
                  Add this script to your website:
                </h4>
                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{trackingScript}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(trackingScript, "script")}
                  >
                    {copiedScript ? "Copied!" : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <h5 className="font-medium text-green-900 text-sm mb-1">
                  What it does:
                </h5>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>
                    • Automatically tracks when users visit with ?partner=
                    parameter
                  </li>
                  <li>• Works on any page of your website</li>
                  <li>• Tracks referrer information for better analytics</li>
                  <li>• No additional setup required</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Pixel Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-600" />
                Pixel Tracking
                <Badge variant="secondary">Simple</Badge>
              </CardTitle>
              <CardDescription>
                Simple image pixel for basic tracking (fallback method)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">
                  Add this pixel to specific pages:
                </h4>
                <div className="relative">
                  <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{trackingPixel}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(trackingPixel, "pixel")}
                  >
                    {copiedPixel ? "Copied!" : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <h5 className="font-medium text-blue-900 text-sm mb-1">
                  When to use:
                </h5>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Simple websites without JavaScript</li>
                  <li>• Email newsletters or static content</li>
                  <li>• Backup tracking method</li>
                  <li>• Quick implementation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Steps</CardTitle>
            <CardDescription>
              How to set up tracking on your destination website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Replace LINK_CODE with actual partner code
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Each affiliate link has a unique code. Replace "LINK_CODE"
                    in the tracking code with the actual partner code from your
                    affiliate link.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Add to your website
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Place the tracking code on pages where you want to track
                    affiliate traffic. Usually in the &lt;head&gt; section or
                    before the closing &lt;/body&gt; tag.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Test the tracking
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Visit your affiliate link and check that clicks are being
                    tracked in your partner dashboard.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Complete Example</CardTitle>
            <CardDescription>
              Full HTML example with tracking implemented
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto">
              <code>{`<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <!-- Place tracking script in head -->
  <script src="${baseUrl}/api/track-script?partner=ABC123"></script>
</head>
<body>
  <h1>Welcome to My Website</h1>
  <p>This page will now track affiliate visits!</p>
  
  <!-- Optional: Pixel tracking for specific events -->
  <img src="${baseUrl}/api/track-pixel?partner=ABC123" 
       width="1" height="1" style="display:none;" />
</body>
</html>`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
