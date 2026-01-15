import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Code,
  Eye,
  Globe,
  MousePointer,
  DollarSign,
} from "lucide-react";

export default function DemoDestination() {
  const [partnerCode, setPartnerCode] = useState<string | null>(null);
  const [trackingLog, setTrackingLog] = useState<string[]>([]);
  const [conversionTracked, setConversionTracked] = useState(false);

  // Simulate the tracking logic that would be on SprintHR.com
  useEffect(() => {
    // Extract partner code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const partner = urlParams.get("partner");

    if (partner) {
      setPartnerCode(partner);
      addToLog(`✅ Partner detected: ${partner}`);

      // Simulate storing partner info
      localStorage.setItem("demo_affiliate_partner", partner);
      localStorage.setItem("demo_affiliate_timestamp", Date.now().toString());
      addToLog(`💾 Partner stored in localStorage`);

      // Simulate tracking API call
      setTimeout(() => {
        addToLog(`📡 Tracking API called: /api/track`);
        addToLog(`📊 Visit data sent to affiliate system`);
      }, 500);

      // Clean URL (remove partner parameter)
      const url = new URL(window.location);
      url.searchParams.delete("partner");
      window.history.replaceState({}, document.title, url.toString());
      addToLog(`🧹 URL cleaned (partner parameter removed)`);
    } else {
      // Check if we have stored partner info
      const storedPartner = localStorage.getItem("demo_affiliate_partner");
      if (storedPartner) {
        setPartnerCode(storedPartner);
        addToLog(`🔄 Existing partner found: ${storedPartner}`);
      }
    }
  }, []);

  const addToLog = (message: string) => {
    setTrackingLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const simulateConversion = (amount: number) => {
    const storedPartner = localStorage.getItem("demo_affiliate_partner");
    if (storedPartner) {
      addToLog(
        `💰 Conversion tracked: $${amount} for partner ${storedPartner}`,
      );
      addToLog(`📤 Conversion data sent to affiliate system`);
      setConversionTracked(true);
    } else {
      addToLog(`❌ No partner found for conversion`);
    }
  };

  const clearDemo = () => {
    localStorage.removeItem("demo_affiliate_partner");
    localStorage.removeItem("demo_affiliate_timestamp");
    setPartnerCode(null);
    setTrackingLog([]);
    setConversionTracked(false);
    addToLog(`🗑️ Demo data cleared`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              SprintHR.com Demo
            </h1>
          </div>
          <p className="text-gray-600">
            This simulates how SprintHR.com would implement affiliate tracking
          </p>
          <Badge variant="secondary" className="mt-2">
            Demo Destination Website
          </Badge>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer className="h-5 w-5 text-blue-600" />
                Partner Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {partnerCode ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-700">Partner: {partnerCode}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-500">No partner detected</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Visit Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {partnerCode ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-700">Visit tracked</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-500">No tracking active</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Conversion Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conversionTracked ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-700">Conversion tracked</span>
                </div>
              ) : partnerCode ? (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span className="text-yellow-700">Ready for conversion</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-500">No partner to track</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How to Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              How to Test Affiliate Tracking
            </CardTitle>
            <CardDescription>
              Add a partner parameter to the URL to see tracking in action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Test URLs:</h4>
              <div className="space-y-2">
                <code className="block bg-gray-100 p-2 rounded text-sm">
                  {window.location.origin}/demo-destination?partner=ABC123
                </code>
                <code className="block bg-gray-100 p-2 rounded text-sm">
                  {window.location.origin}/demo-destination?partner=XYZ789
                </code>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">What Happens:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Partner code is detected from URL parameter</li>
                <li>• Visit is tracked and sent to affiliate system</li>
                <li>• Partner info is stored for conversion tracking</li>
                <li>• URL is cleaned (parameter removed)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Simulate Customer Actions</CardTitle>
            <CardDescription>
              Test what happens when customers take actions on the website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => simulateConversion(99.99)}
                disabled={!partnerCode}
                className="bg-green-600 hover:bg-green-700"
              >
                Purchase ($99.99)
              </Button>

              <Button
                onClick={() => simulateConversion(299.99)}
                disabled={!partnerCode}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Premium Plan ($299.99)
              </Button>

              <Button
                onClick={() => simulateConversion(0)}
                disabled={!partnerCode}
                variant="outline"
              >
                Free Signup
              </Button>

              <Button onClick={clearDemo} variant="outline">
                Clear Demo
              </Button>
            </div>

            {!partnerCode && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No partner detected. Visit this page with a ?partner=CODE
                  parameter to test conversions.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Tracking Log */}
        <Card>
          <CardHeader>
            <CardTitle>Tracking Log</CardTitle>
            <CardDescription>
              Real-time view of affiliate tracking events (like console.log)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
              {trackingLog.length > 0 ? (
                trackingLog.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">
                  No tracking events yet. Visit with ?partner=CODE to see
                  tracking in action.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
