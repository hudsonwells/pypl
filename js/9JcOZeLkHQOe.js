!(function () {
  const policy = document.createElement("script");
  policy.type = "application/json";
  policy.id = "policy-data";
  policy.text = JSON.stringify({
    policies: ["CookieBanner"],
    nonce: "",
    tenant: "paypal-careers",
    policyData: { country: "GB", language: "en" },
  });

  const pyplScript = document.createElement("script");
  pyplScript.src = "https://www.paypalobjects.com/ncs/ncs.js";

  document.head.appendChild(policy);
  document.head.appendChild(pyplScript);
})();

// Global variables for cookie preferences
var cookie_prefs = document.cookie.split("; ").find((row) => row.startsWith("cookie_prefs"))?.split("=")[1];
var pyplCookiePrefs = {};
if (cookie_prefs) {
  cookie_prefs = cookie_prefs.split("%2C").slice(0, 3);
  cookie_prefs.forEach(function (item) {
    var key = item.split("%3D")[0];
    var value = item.split("%3D")[1];
    pyplCookiePrefs[key] = value === "1";
  });
}

