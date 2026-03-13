(function () {
    const NexusAnalytics = {
        endpoint: "https://statistics.init-nexusbyte.workers.dev/",
        sessionId: crypto.randomUUID(),
        visitorId: localStorage.getItem("nexus_visitor_id") || (function(){ let id = crypto.randomUUID(); localStorage.setItem("nexus_visitor_id", id); return id; })(),
        data: {
            timestamp: new Date().toISOString(),
            ip: null,
            location: { continent: null, country: null, city: null, region: null, postal: null },
            isp: null,
            timezone: null,
            browser: { name: null, version: null },
            os: null,
            deviceType: null,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            online: navigator.onLine,
            screen: { width: screen.width, height: screen.height, pixelRatio: window.devicePixelRatio, colorDepth: screen.colorDepth },
            viewport: { width: window.innerWidth, height: window.innerHeight },
            gpu: null,
            cpuCores: navigator.hardwareConcurrency || null,
            memoryGB: navigator.deviceMemory || null,
            battery: { charging: null, level: null },
            connection: navigator.connection ? { type: navigator.connection.type, effectiveType: navigator.connection.effectiveType, downlink: navigator.connection.downlink, rtt: navigator.connection.rtt, saveData: navigator.connection.saveData } : null,
            page: { url: location.href, path: location.pathname, title: document.title, referrer: document.referrer, hash: location.hash }
        },
        detectBrowser() {
            const ua = navigator.userAgent;
            if (/edg/i.test(ua)) { this.data.browser.name="Edge"; this.data.browser.version=ua.match(/Edg\/([0-9.]+)/)?.[1]; }
            else if (/chrome|crios|crmo/i.test(ua)) { this.data.browser.name="Chrome"; this.data.browser.version=ua.match(/Chrome\/([0-9.]+)/)?.[1]; }
            else if (/firefox|fxios/i.test(ua)) { this.data.browser.name="Firefox"; this.data.browser.version=ua.match(/Firefox\/([0-9.]+)/)?.[1]; }
            else if (/safari/i.test(ua) && !/chrome/i.test(ua)) { this.data.browser.name="Safari"; this.data.browser.version=ua.match(/Version\/([0-9.]+)/)?.[1]; }
            else { this.data.browser.name="Unknown"; this.data.browser.version="Unknown"; }
        },
        detectOS() {
            const ua = navigator.userAgent;
            if (/windows nt 10/i.test(ua)) this.data.os="Windows 10";
            else if (/windows nt 6.3/i.test(ua)) this.data.os="Windows 8.1";
            else if (/windows nt 6.2/i.test(ua)) this.data.os="Windows 8";
            else if (/windows nt 6.1/i.test(ua)) this.data.os="Windows 7";
            else if (/macintosh|mac os x/i.test(ua)) this.data.os="Mac OS";
            else if (/android/i.test(ua)) this.data.os="Android";
            else if (/iphone|ipad|ipod/i.test(ua)) this.data.os="iOS";
            else if (/linux/i.test(ua)) this.data.os="Linux";
            else this.data.os="Unknown";
        },
        detectDeviceType() {
            const ua = navigator.userAgent;
            if (/mobile/i.test(ua)) this.data.deviceType="Mobile";
            else if (/tablet|ipad/i.test(ua)) this.data.deviceType="Tablet";
            else this.data.deviceType="Desktop";
        },
        async fetchIPLocation() {
            try {
                const res = await fetch("https://ipapi.co/json/");
                const json = await res.json();
                this.data.ip = json.ip || null;
                this.data.location.continent = json.continent_code || null;
                this.data.location.country = json.country_name || null;
                this.data.location.region = json.region || null;
                this.data.location.city = json.city || null;
                this.data.location.postal = json.postal || null;
                this.data.isp = json.org || null;
                this.data.timezone = json.timezone || null;
            } catch {}
        },
        async detectGPU() {
            try {
                const canvas = document.createElement("canvas");
                const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
                if (!gl) return;
                const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
                if (debugInfo) this.data.gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            } catch {}
        },
        async detectBattery() {
            try {
                if (navigator.getBattery) {
                    const battery = await navigator.getBattery();
                    this.data.battery.charging = battery.charging;
                    this.data.battery.level = battery.level;
                }
            } catch {}
        },
        buildEmbed() {
            return {
                username: "Website Analytics",
                embeds: [{
                    title: "New Visitor",
                    color: 0xc4a7e7,
                    fields: [
                        { name:"IP Address", value:this.data.ip||"Unknown", inline:true },
                        { name:"Continent", value:this.data.location.continent||"Unknown", inline:true },
                        { name:"Country", value:this.data.location.country||"Unknown", inline:true },
                        { name:"Region", value:this.data.location.region||"Unknown", inline:true },
                        { name:"City", value:this.data.location.city||"Unknown", inline:true },
                        { name:"Postal Code", value:this.data.location.postal||"Unknown", inline:true },
                        { name:"ISP", value:this.data.isp||"Unknown", inline:true },
                        { name:"Timezone", value:this.data.timezone||"Unknown", inline:true },
                        { name:"Browser", value:this.data.browser.name+" "+this.data.browser.version, inline:true },
                        { name:"OS", value:this.data.os||"Unknown", inline:true },
                        { name:"Device Type", value:this.data.deviceType||"Unknown", inline:true },
                        { name:"UserAgent", value:this.data.userAgent||"Unknown", inline:false },
                        { name:"Platform", value:this.data.platform||"Unknown", inline:true },
                        { name:"Language", value:this.data.language||"Unknown", inline:true },
                        { name:"Online", value:this.data.online, inline:true },
                        { name:"Cookies Enabled", value:this.data.cookiesEnabled, inline:true },
                        { name:"Screen", value:this.data.screen.width+"x"+this.data.screen.height+" @ "+this.data.screen.pixelRatio+"x", inline:true },
                        { name:"Viewport", value:this.data.viewport.width+"x"+this.data.viewport.height, inline:true },
                        { name:"Color Depth", value:this.data.screen.colorDepth, inline:true },
                        { name:"GPU", value:this.data.gpu||"Unknown", inline:true },
                        { name:"CPU Cores", value:this.data.cpuCores||"Unknown", inline:true },
                        { name:"RAM (GB)", value:this.data.memoryGB||"Unknown", inline:true },
                        { name:"Connection Type", value:this.data.connection?.type||"Unknown", inline:true },
                        { name:"Connection Effective Type", value:this.data.connection?.effectiveType||"Unknown", inline:true },
                        { name:"Downlink", value:this.data.connection?.downlink||"Unknown", inline:true },
                        { name:"RTT", value:this.data.connection?.rtt||"Unknown", inline:true },
                        { name:"Save Data", value:this.data.connection?.saveData||"Unknown", inline:true },
                        { name:"Battery Charging", value:this.data.battery.charging===null?"Unknown":this.data.battery.charging, inline:true },
                        { name:"Battery Level", value:this.data.battery.level===null?"Unknown":this.data.battery.level, inline:true },
                        { name:"Page URL", value:this.data.page.url, inline:false },
                        { name:"Referrer", value:this.data.page.referrer||"None", inline:false },
                        { name:"Hash", value:this.data.page.hash||"None", inline:false },
                        { name:"Session ID", value:this.sessionId, inline:false },
                        { name:"Visitor ID", value:this.visitorId, inline:false }
                    ],
                    timestamp: this.data.timestamp
                }]
            };
        },
        async sendToWorker() {
            const payload = this.buildEmbed();
            try {
                await fetch(this.endpoint, {
                    method:"POST",
                    headers:{"Content-Type":"application/json"},
                    body: JSON.stringify(payload)
                });
            } catch {}
        },
        async init() {
            this.detectBrowser();
            this.detectOS();
            this.detectDeviceType();
            await this.fetchIPLocation();
            await this.detectGPU();
            await this.detectBattery();
            await this.sendToWorker();
        }
    };

    NexusAnalytics.init();
    window.NexusAnalytics = NexusAnalytics;

    window.addEventListener("resize", () => {
        NexusAnalytics.data.viewport.width = window.innerWidth;
        NexusAnalytics.data.viewport.height = window.innerHeight;
    });
    window.addEventListener("online", () => { NexusAnalytics.data.online = true; });
    window.addEventListener("offline", () => { NexusAnalytics.data.online = false; });
})();