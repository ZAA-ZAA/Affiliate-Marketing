# Destination Website Tracking Code

This document explains what code the destination website (e.g., SprintHR.com) needs to implement to track affiliate visits.

## 🎯 The Goal

When someone visits: `https://sprinthr.com?partner=ABC123`

The website should:

1. Detect the `partner=ABC123` parameter
2. Track the visit back to your affiliate system
3. Store the partner info for conversion tracking

## 📋 Implementation Options

### Option 1: Basic JavaScript Tracking (Recommended)

Add this script to SprintHR.com's website (in `<head>` or before `</body>`):

```html
<!-- Affiliate Tracking Script -->
<script>
  (function () {
    // Configuration - Update these URLs to your affiliate system
    const AFFILIATE_API_BASE = "https://your-affiliate-system.com";
    const TRACK_ENDPOINT = AFFILIATE_API_BASE + "/api/track";
    const PIXEL_ENDPOINT = AFFILIATE_API_BASE + "/api/track-pixel";

    // Extract partner code from URL
    function getPartnerFromURL() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("partner");
    }

    // Store partner in localStorage for conversion tracking later
    function storePartner(partnerCode) {
      localStorage.setItem("affiliate_partner", partnerCode);
      localStorage.setItem(
        "affiliate_partner_timestamp",
        Date.now().toString(),
      );

      // Also store in sessionStorage for immediate tracking
      sessionStorage.setItem("current_partner", partnerCode);
    }

    // Send tracking data to affiliate system
    function trackVisit(partnerCode) {
      const trackingData = {
        partner: partnerCode,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };

      // Try fetch API first
      if (typeof fetch !== "undefined") {
        fetch(TRACK_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(trackingData),
          mode: "cors",
        }).catch(function (error) {
          console.log("Affiliate tracking failed:", error);
          // Fallback to pixel tracking
          trackWithPixel(partnerCode);
        });
      } else {
        // Fallback for older browsers
        trackWithPixel(partnerCode);
      }
    }

    // Fallback pixel tracking
    function trackWithPixel(partnerCode) {
      const img = new Image();
      img.src =
        PIXEL_ENDPOINT +
        "?partner=" +
        encodeURIComponent(partnerCode) +
        "&url=" +
        encodeURIComponent(window.location.href) +
        "&ref=" +
        encodeURIComponent(document.referrer) +
        "&t=" +
        Date.now();

      // Add to page but hide it
      img.style.display = "none";
      img.width = 1;
      img.height = 1;
      document.body.appendChild(img);
    }

    // Main tracking function
    function initAffiliateTracking() {
      const partnerCode = getPartnerFromURL();

      if (partnerCode) {
        console.log("Affiliate partner detected:", partnerCode);

        // Store for later conversion tracking
        storePartner(partnerCode);

        // Track the visit immediately
        trackVisit(partnerCode);

        // Optional: Clean URL (remove partner parameter)
        if (window.history && window.history.replaceState) {
          const url = new URL(window.location);
          url.searchParams.delete("partner");
          window.history.replaceState({}, document.title, url.toString());
        }
      }
    }

    // Initialize when page loads
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initAffiliateTracking);
    } else {
      initAffiliateTracking();
    }
  })();
</script>
```

### Option 2: Conversion Tracking

When a user makes a purchase or converts, add this code:

```javascript
// Call this when a conversion happens (purchase, signup, etc.)
function trackConversion(amount, orderId) {
  const partnerCode = localStorage.getItem("affiliate_partner");
  const partnerTimestamp = localStorage.getItem("affiliate_partner_timestamp");

  if (!partnerCode) {
    console.log("No affiliate partner found for conversion");
    return;
  }

  // Check if partner tracking is still valid (e.g., within 30 days)
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const trackingAge = now - parseInt(partnerTimestamp);

  if (trackingAge > thirtyDaysInMs) {
    console.log("Affiliate partner tracking expired");
    localStorage.removeItem("affiliate_partner");
    localStorage.removeItem("affiliate_partner_timestamp");
    return;
  }

  const conversionData = {
    partner: partnerCode,
    amount: amount,
    orderId: orderId,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };

  // Send conversion data
  fetch("https://your-affiliate-system.com/api/conversions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conversionData),
    mode: "cors",
  })
    .then(function (response) {
      if (response.ok) {
        console.log("Conversion tracked successfully");
      }
    })
    .catch(function (error) {
      console.log("Conversion tracking failed:", error);
    });
}

// Example usage on purchase completion:
// trackConversion(99.99, 'ORDER-12345');
```

### Option 3: Server-Side Tracking (PHP Example)

If SprintHR.com uses PHP, they could track server-side:

```php
<?php
// affiliate-tracking.php

function trackAffiliateVisit() {
    if (isset($_GET['partner'])) {
        $partnerCode = $_GET['partner'];

        // Store in session for conversion tracking
        $_SESSION['affiliate_partner'] = $partnerCode;
        $_SESSION['affiliate_timestamp'] = time();

        // Track the visit
        $trackingData = [
            'partner' => $partnerCode,
            'url' => $_SERVER['REQUEST_URI'],
            'referrer' => $_SERVER['HTTP_REFERER'] ?? '',
            'ip' => $_SERVER['REMOTE_ADDR'],
            'userAgent' => $_SERVER['HTTP_USER_AGENT'],
            'timestamp' => date('c')
        ];

        // Send to affiliate system
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://your-affiliate-system.com/api/track');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($trackingData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $result = curl_exec($ch);
        curl_close($ch);

        // Optional: Redirect to clean URL
        $cleanUrl = strtok($_SERVER['REQUEST_URI'], '?');
        if ($cleanUrl !== $_SERVER['REQUEST_URI']) {
            header("Location: $cleanUrl", true, 301);
            exit;
        }
    }
}

// Call this at the top of your pages
trackAffiliateVisit();
?>
```

## 🔧 Integration Steps for SprintHR.com

### Step 1: Add Tracking Script

Add the JavaScript tracking code to all pages where you want to track affiliate visits.

### Step 2: Update Configuration

Replace `https://your-affiliate-system.com` with your actual affiliate system URL.

### Step 3: Implement Conversion Tracking

Call `trackConversion()` when users complete desired actions (purchases, signups, etc.).

### Step 4: Test Implementation

1. Visit `https://sprinthr.com?partner=TEST123`
2. Check browser console for tracking logs
3. Verify tracking data appears in your affiliate dashboard

## 📊 What Gets Tracked

### Visit Data:

- Partner code (ABC123)
- Page URL visited
- Referrer (where they came from)
- Timestamp
- User agent/browser info
- IP address

### Conversion Data:

- Purchase amount
- Order ID
- Partner who referred the customer
- Conversion timestamp

## 🛡️ Privacy & GDPR Compliance

```javascript
// Add this for GDPR compliance
function hasTrackingConsent() {
  // Check your consent management system
  return localStorage.getItem("tracking_consent") === "true";
}

// Only track if consent is given
if (hasTrackingConsent()) {
  initAffiliateTracking();
}
```

## 🔍 Debugging

Add this to test if tracking is working:

```javascript
// Debug mode - add to console
function debugAffiliateTracking() {
  console.log("Current partner:", localStorage.getItem("affiliate_partner"));
  console.log(
    "Partner timestamp:",
    localStorage.getItem("affiliate_partner_timestamp"),
  );
  console.log(
    "URL params:",
    new URLSearchParams(window.location.search).get("partner"),
  );
}

// Call in browser console: debugAffiliateTracking()
```

This implementation ensures that when someone clicks your affiliate link `https://sprinthr.com?partner=ABC123`, SprintHR.com will:

1. ✅ Detect the partner code
2. ✅ Store it for conversion tracking
3. ✅ Send visit data to your affiliate system
4. ✅ Clean the URL for better UX
5. ✅ Track conversions when they happen
