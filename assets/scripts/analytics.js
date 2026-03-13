(function () {
  const endpoint = "https://statistics.init-nexusbyte.workers.dev/";
  const sessionId = crypto.randomUUID();
  const visitorId = localStorage.getItem("nexus_visitor_id") || (function(){ let id = crypto.randomUUID(); localStorage.setItem("nexus_visitor_id", id); return id; })();

  const data = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    online: navigator.onLine,
    screen: { width: screen.width, height: screen.height, pixelRatio: window.devicePixelRatio, colorDepth: screen.colorDepth },
    viewport: { width: window.innerWidth, height: window.innerHeight },
    battery: { charging: null, level: null },
    connection: navigator.connection ? { type: navigator.connection.type, effectiveType: navigator.connection.effectiveType, downlink: navigator.connection.downlink, rtt: navigator.connection.rtt, saveData: navigator.connection.saveData } : null,
    page: { url: location.href, path: location.pathname, title: document.title, referrer: document.referrer, hash: location.hash },
    ip: null,
    location: {},
    browser: {},
    os: null,
    deviceType: null,
    gpu: null,
    cpuCores: navigator.hardwareConcurrency || null,
    memoryGB: navigator.deviceMemory || null
  };

  function detectBrowser() {
    const ua = navigator.userAgent;
    if (/edg/i.test(ua)) { data.browser.name="Edge"; data.browser.version=ua.match(/Edg\/([0-9.]+)/)?.[1]; }
    else if (/chrome|crios|crmo/i.test(ua)) { data.browser.name="Chrome"; data.browser.version=ua.match(/Chrome\/([0-9.]+)/)?.[1]; }
    else if (/firefox|fxios/i.test(ua)) { data.browser.name="Firefox"; data.browser.version=ua.match(/Firefox\/([0-9.]+)/)?.[1]; }
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) { data.browser.name="Safari"; data.browser.version=ua.match(/Version\/([0-9.]+)/)?.[1]; }
    else { data.browser.name="Unknown"; data.browser.version="Unknown"; }
  }

  function detectOS() {
    const ua = navigator.userAgent.toLowerCase();
    if (/windows nt 10/.test(ua)) data.os="Windows 10";
    else if (/mac os x/.test(ua)) data.os="Mac OS";
    else if (/android/.test(ua)) data.os="Android";
    else if (/iphone|ipad|ipod/.test(ua)) data.os="iOS";
    else if (/linux/.test(ua)) data.os="Linux";
    else data.os="Unknown";
  }

  function detectDevice() {
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile/.test(ua)) data.deviceType="Mobile";
    else if (/tablet|ipad/.test(ua)) data.deviceType="Tablet";
    else data.deviceType="Desktop";
  }

  async function fetchIP() {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const json = await res.json();
      data.ip = json.ip;
      data.location = { continent: json.continent_code, country: json.country_name, region: json.region, city: json.city, postal: json.postal };
    } catch {}
  }

  async function detectBattery() {
    try {
      if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        data.battery.charging = battery.charging;
        data.battery.level = battery.level;
      }
    } catch {}
  }

  async function detectGPU() {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return;
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) data.gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    } catch {}
  }

  function buildEmbed() {
    return {
      username: "Website Analytics",
      embeds: [{
        title: "New Visitor",
        color: 0xc4a7e7,
        fields: [
          { name:"IP Address", value:data.ip||"Unknown", inline:true },
          { name:"Continent", value:data.location.continent||"Unknown", inline:true },
          { name:"Country", value:data.location.country||"Unknown", inline:true },
          { name:"Region", value:data.location.region||"Unknown", inline:true },
          { name:"City", value:data.location.city||"Unknown", inline:true },
          { name:"Postal Code", value:data.location.postal||"Unknown", inline:true },
          { name:"Browser", value:data.browser.name+" "+data.browser.version, inline:true },
          { name:"OS", value:data.os||"Unknown", inline:true },
          { name:"Device Type", value:data.deviceType||"Unknown", inline:true },
          { name:"Screen", value:data.screen.width+"x"+data.screen.height+" @ "+data.screen.pixelRatio+"x", inline:true },
          { name:"Page URL", value:data.page.url, inline:false },
          { name:"Session ID", value:sessionId, inline:false },
          { name:"Visitor ID", value:visitorId, inline:false }
        ],
        timestamp: data.timestamp
      }]
    };
  }

  async function sendAnalytics() {
    const payload = buildEmbed();
    try {
      await fetch(endpoint, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(payload)
      });
    } catch {}
  }

  async function init() {
    detectBrowser();
    detectOS();
    detectDevice();
    await fetchIP();
    await detectBattery();
    await detectGPU();
    await sendAnalytics();
  }

  init();

  window.addEventListener("resize", ()=>{ data.viewport.width=window.innerWidth; data.viewport.height=window.innerHeight; });
  window.addEventListener("online", ()=>{ data.online=true; });
  window.addEventListener("offline", ()=>{ data.online=false; });

})();