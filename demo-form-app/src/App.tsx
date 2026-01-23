import { useState, useEffect, useRef } from "react";
import { CheckCircle, AlertCircle, Loader2, Send, User, Mail, Building, Phone, MessageSquare } from "lucide-react";
import { API_CONFIG } from "./config";

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}

function App() {
  const [affiliateId, setAffiliateId] = useState<string | null>(null);
  const [referrer, setReferrer] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [clickTracked, setClickTracked] = useState(false);
  
  // Ref to prevent double tracking (especially in React StrictMode)
  const trackingInProgress = useRef(false);

  // Extract affiliate-id from URL on mount and track the click
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const affiliateIdParam = urlParams.get("affiliate-id") || urlParams.get("affiliate_id");
    
    // Get referrer - where the user came from before clicking the link
    const documentReferrer = document.referrer || "";
    setReferrer(documentReferrer);
    
    if (affiliateIdParam) {
      setAffiliateId(affiliateIdParam);
      
      // Create a unique key for this page visit to prevent duplicate tracking
      const sessionKey = `tracked_${affiliateIdParam}_${window.location.href}`;
      const alreadyTracked = sessionStorage.getItem(sessionKey);
      
      // Only track if not already tracked in this session and not currently tracking
      if (!alreadyTracked && !trackingInProgress.current) {
        trackingInProgress.current = true;
        trackClick(affiliateIdParam, documentReferrer).finally(() => {
          // Mark as tracked in session storage
          sessionStorage.setItem(sessionKey, "true");
          trackingInProgress.current = false;
        });
      }
    }
  }, []);

  // Track click with affiliate ID and referrer
  const trackClick = async (affId: string, ref: string): Promise<void> => {
    try {
      const response = await fetch(`${API_CONFIG.API_URL}/api/external/track-click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_CONFIG.API_KEY,
        },
        body: JSON.stringify({
          affiliate_id: affId,
          referrer: ref,
          user_agent: navigator.userAgent,
          page_url: window.location.href,
        }),
      });

      if (response.ok) {
        setClickTracked(true);
        console.log("Click tracked successfully");
      } else {
        console.error("Failed to track click:", await response.text());
      }
    } catch (err) {
      console.error("Error tracking click:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Special handling for phone - only allow numbers, +, -, spaces, parentheses, and dots
    if (name === "phone") {
      // Allow only numbers, +, -, spaces, parentheses, and dots
      const cleanedValue = value.replace(/[^\d+\-() .]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: cleanedValue,
      }));
      
      // Validate phone number format (optional field, but if provided, validate)
      if (cleanedValue && cleanedValue.trim() !== "") {
        // Remove all non-digit characters for validation
        const digitsOnly = cleanedValue.replace(/\D/g, "");
        if (digitsOnly.length < 7) {
          setPhoneError("Phone number must be at least 7 digits");
        } else if (digitsOnly.length > 15) {
          setPhoneError("Phone number cannot exceed 15 digits");
        } else {
          setPhoneError("");
        }
      } else {
        setPhoneError("");
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number if provided
    if (formData.phone && formData.phone.trim() !== "") {
      const digitsOnly = formData.phone.replace(/\D/g, "");
      if (digitsOnly.length < 7) {
        setPhoneError("Phone number must be at least 7 digits");
        return;
      }
      if (digitsOnly.length > 15) {
        setPhoneError("Phone number cannot exceed 15 digits");
        return;
      }
    }
    
    setLoading(true);
    setError("");
    setPhoneError("");

    try {
      // Submit to the affiliate management API via addlead endpoint
      const response = await fetch(`${API_CONFIG.API_URL}/api/external/addlead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_CONFIG.API_KEY,
        },
        body: JSON.stringify({
          ...formData,
          affiliate_id: affiliateId,
          referrer: referrer,
          source_url: window.location.href,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit request");
      }

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Send className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Request a Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Get started with Gleen's HR and Payroll solutions
          </p>
          {affiliateId && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Referred by affiliate partner
            </div>
          )}
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Success!</p>
                <p className="text-green-700 text-sm">
                  Thank you! Your demo request has been submitted successfully. We'll contact you soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
      <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Contact Information</h2>
            <p className="text-gray-500 text-sm mb-6">Fill out the form below and we'll get back to you</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Your Company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                        phoneError 
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                          : "border-gray-200 focus:ring-blue-500"
                      }`}
                    />
                  </div>
                  {phoneError && (
                    <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                  )}
                  <p className="text-xs text-gray-500">Enter numbers only (e.g., +1 555 123 4567)</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your needs..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
      </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Request Demo
                  </>
                )}
        </button>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-gray-900 font-semibold mb-3">What happens next?</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-medium">1</span>
              <span>Our team will review your request</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-medium">2</span>
              <span>We'll contact you within 24 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-medium">3</span>
              <span>Schedule a personalized demo session</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-medium">4</span>
              <span>Get started with Gleen's solutions</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          © 2026 Gleen Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default App;
