(function () {

const endpoint = "https://statistics.init-nexusbyte.workers.dev/";
const sessionId = crypto.randomUUID();
const visitorId = localStorage.getItem("nexus_visitor_id") || (function () {
    let id = crypto.randomUUID();
    localStorage.setItem("nexus_visitor_id", id);
    return id;
})();

const data = {
    timestamp: new Date().toISOString(),
    ip: null,
    isp: null,
    asn: null,
    proxy: null,
    vpn: null,
    tor: null,
    continent: null,
    country: null,
    region: null,
    city: null,
    postal: null,
    latitude: null,
    longitude: null,
    timezone: null,
    currency: null,
    callingCode: null,
    languages: null,
    browserName: null,
    browserVersion: null,
    userAgent: navigator.userAgent,
    os: null,
    deviceType: null,
    platform: navigator.platform,
    language: navigator.language,
    cookies: navigator.cookieEnabled,
    online: navigator.onLine,
    screenWidth: screen.width,
    screenHeight: screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
    colorDepth: screen.colorDepth,
    cpu: navigator.hardwareConcurrency || null,
    memory: navigator.deviceMemory || null,
    gpu: null,
    batteryCharging: null,
    batteryLevel: null,
    touch: 'ontouchstart' in window,
    connectionType: navigator.connection?.effectiveType || null,
    downlink: navigator.connection?.downlink || null,
    rtt: navigator.connection?.rtt || null,
    canvasFingerprint: null,
    webglFingerprint: null,
    audioFingerprint: null,
    fonts: null,
    navigationTiming: null,
    paintTiming: null,
    pageURL: location.href
};

function detectBrowser() {
    const ua = navigator.userAgent;
    if (/edg/i.test(ua)) { data.browserName = "Edge"; data.browserVersion = ua.match(/Edg\/([0-9.]+)/)?.[1]; }
    else if (/chrome/i.test(ua)) { data.browserName = "Chrome"; data.browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1]; }
    else if (/firefox/i.test(ua)) { data.browserName = "Firefox"; data.browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1]; }
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) { data.browserName = "Safari"; data.browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1]; }
    else { data.browserName = "Unknown"; data.browserVersion = "Unknown"; }
}

function detectOS() {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("windows")) data.os = "Windows";
    else if (ua.includes("mac")) data.os = "MacOS";
    else if (ua.includes("android")) data.os = "Android";
    else if (ua.includes("iphone") || ua.includes("ipad")) data.os = "iOS";
    else if (ua.includes("linux")) data.os = "Linux";
    else data.os = "Unknown";
}

function detectDevice() {
    const ua = navigator.userAgent.toLowerCase();
    if (/mobile/.test(ua)) data.deviceType = "Mobile";
    else if (/tablet|ipad/.test(ua)) data.deviceType = "Tablet";
    else data.deviceType = "Desktop";
}

function fingerprintCanvas() {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125,1,62,20);
        ctx.fillStyle = '#069';
        ctx.fillText('NexusByte Analytics', 2, 15);
        ctx.fillStyle = 'rgba(102,204,0,0.7)';
        ctx.fillText('NexusByte Analytics', 4, 17);
        data.canvasFingerprint = canvas.toDataURL();
    } catch {}
}

function fingerprintWebGL() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return;
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbg) data.webglFingerprint = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
    } catch {}
}

function fingerprintAudio() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const analyser = audioCtx.createAnalyser();
        oscillator.connect(analyser);
        analyser.connect(audioCtx.destination);
        oscillator.start(0);
        data.audioFingerprint = analyser.fftSize.toString();
        oscillator.stop();
    } catch {}
}

function getNavigationTiming() {
    try {
        if (performance.timing) data.navigationTiming = JSON.stringify(performance.timing);
        if (performance.getEntriesByType) data.paintTiming = JSON.stringify(performance.getEntriesByType('paint'));
    } catch {}
}

async function detectBattery() {
    try {
        if (navigator.getBattery) {
            const b = await navigator.getBattery();
            data.batteryCharging = b.charging;
            data.batteryLevel = b.level;
        }
    } catch {}
}

async function fetchIPInfo() {
    try {
        const r = await fetch("https://ipapi.co/json/");
        const j = await r.json();
        data.ip = j.ip;
        data.isp = j.org;
        data.asn = j.asn;
        data.continent = j.continent_code;
        data.country = j.country_name;
        data.region = j.region;
        data.city = j.city;
        data.postal = j.postal;
        data.latitude = j.latitude;
        data.longitude = j.longitude;
        data.timezone = j.timezone;
        data.currency = j.currency;
        data.callingCode = j.country_calling_code;
        data.languages = j.languages;
    } catch {}
}

function buildEmbed() {
    const text =
        "**General Information**\n" +
        "• Website URL: " + (data.pageURL || "Unknown") + "\n" +
        "• Access Timestamp: " + data.timestamp + "\n" +
        "• Session ID: " + sessionId + "\n" +
        "• Visitor ID: " + visitorId + "\n\n" +

        "**Network Information**\n" +
        "• IP Address: " + (data.ip || "Unknown") + "\n" +
        "• ISP: " + (data.isp || "Unknown") + "\n" +
        "• ASN: " + (data.asn || "Unknown") + "\n" +
        "• Proxy: " + (data.proxy || "Unknown") + "\n" +
        "• VPN: " + (data.vpn || "Unknown") + "\n" +
        "• Tor: " + (data.tor || "Unknown") + "\n\n" +

        "**Browser Information**\n" +
        "• Browser Name: " + data.browserName + "\n" +
        "• Browser Version: " + data.browserVersion + "\n" +
        "• UserAgent: " + data.userAgent + "\n\n" +

        "**Device Information**\n" +
        "• OS: " + data.os + "\n" +
        "• Device Type: " + data.deviceType + "\n" +
        "• Platform: " + data.platform + "\n" +
        "• Language: " + data.language + "\n" +
        "• Cookies Enabled: " + data.cookies + "\n" +
        "• Online: " + data.online + "\n" +
        "• CPU Cores: " + (data.cpu || "Unknown") + "\n" +
        "• RAM: " + (data.memory || "Unknown") + "\n" +
        "• GPU: " + (data.gpu || "Unknown") + "\n" +
        "• Canvas Fingerprint: " + (data.canvasFingerprint ? "Captured" : "Unknown") + "\n" +
        "• WebGL Fingerprint: " + (data.webglFingerprint || "Unknown") + "\n" +
        "• Audio Fingerprint: " + (data.audioFingerprint || "Unknown") + "\n" +
        "• Battery Charging: " + (data.batteryCharging ?? "Unknown") + "\n" +
        "• Battery Level: " + (data.batteryLevel ?? "Unknown") + "\n" +
        "• Screen: " + data.screenWidth + "x" + data.screenHeight + "\n" +
        "• Viewport: " + data.viewportWidth + "x" + data.viewportHeight + "\n" +
        "• Pixel Ratio: " + data.pixelRatio + "\n" +
        "• Color Depth: " + data.colorDepth + "\n" +
        "• Touch Support: " + data.touch + "\n" +
        "• Connection Type: " + (data.connectionType || "Unknown") + "\n" +
        "• Downlink: " + (data.downlink || "Unknown") + "\n" +
        "• RTT: " + (data.rtt || "Unknown") + "\n\n" +

        "**Location Information**\n" +
        "• Continent: " + (data.continent || "Unknown") + "\n" +
        "• Country: " + (data.country || "Unknown") + "\n" +
        "• Region: " + (data.region || "Unknown") + "\n" +
        "• City: " + (data.city || "Unknown") + "\n" +
        "• Postal: " + (data.postal || "Unknown") + "\n" +
        "• Latitude: " + (data.latitude || "Unknown") + "\n" +
        "• Longitude: " + (data.longitude || "Unknown") + "\n" +
        "• Timezone: " + (data.timezone || "Unknown") + "\n" +
        "• Currency: " + (data.currency || "Unknown") + "\n" +
        "• Calling Code: " + (data.callingCode || "Unknown") + "\n" +
        "• Languages: " + (data.languages || "Unknown");

    return {
        username: "Website Analytics",
        embeds: [{
            title: "Visitor Log",
            description: text,
            color: 0xc4a7e7,
            timestamp: data.timestamp,
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    style: 1,
                    label: "Download Info",
                    custom_id: "download_info"
                }]
            }]
        }]
    };
}

async function send() {
    try {
        await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildEmbed())
        });
    } catch {}
}

async function init() {
    detectBrowser();
    detectOS();
    detectDevice();
    fingerprintCanvas();
    fingerprintWebGL();
    fingerprintAudio();
    getNavigationTiming();
    await fetchIPInfo();
    await detectBattery();
    await send();
}

init();

})();