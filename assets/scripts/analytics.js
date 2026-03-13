(function () {
    const NexusAnalytics = {
        webhook: "https://discord.com/api/webhooks/1482024070265569381/oR5t3PNSG-SF-KNwUy7bBpzcauMaZJlp3uvW2nBq6VTm9afxcugpnNukENhWjh4o_rqe",
        sessionId: null,
        visitorId: null,
        consentCookie: "analytics_consent",
        data: {
            timestamp: new Date().toISOString(),
            ip: null,
            location: {
                continent: null,
                country: null,
                city: null
            },
            browser: {
                name: null,
                version: null
            },
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            online: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                pixelRatio: window.devicePixelRatio,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            page: {
                url: location.href,
                path: location.pathname,
                title: document.title,
                referrer: document.referrer
            },
            connection: null
        },
        getCookie(name) {
            const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
            if (match) return match[2];
            return null;
        },
        generateId() {
            return crypto.randomUUID();
        },
        initIds() {
            this.sessionId = this.generateId();
            let id = localStorage.getItem("nexus_visitor_id");
            if (!id) {
                id = this.generateId();
                localStorage.setItem("nexus_visitor_id", id);
            }
            this.visitorId = id;
        },
        collectBrowser() {
            const ua = navigator.userAgent;
            let name = "Unknown";
            let version = "Unknown";

            if (/edg/i.test(ua)) {
                name = "Edge";
                version = ua.match(/Edg\/([0-9.]+)/)?.[1];
            } else if (/chrome|crios|crmo/i.test(ua)) {
                name = "Chrome";
                version = ua.match(/Chrome\/([0-9.]+)/)?.[1];
            } else if (/firefox|fxios/i.test(ua)) {
                name = "Firefox";
                version = ua.match(/Firefox\/([0-9.]+)/)?.[1];
            } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
                name = "Safari";
                version = ua.match(/Version\/([0-9.]+)/)?.[1];
            }

            this.data.browser.name = name;
            this.data.browser.version = version;
        },
        collectConnection() {
            if (navigator.connection) {
                this.data.connection = {
                    type: navigator.connection.type || null,
                    effectiveType: navigator.connection.effectiveType || null,
                    downlink: navigator.connection.downlink || null,
                    rtt: navigator.connection.rtt || null,
                    saveData: navigator.connection.saveData || null
                };
            }
        },
        async fetchIPLocation() {
            try {
                const response = await fetch("https://ipapi.co/json/");
                const json = await response.json();
                this.data.ip = json.ip || null;
                this.data.location.continent = json.continent_code || null;
                this.data.location.country = json.country_name || null;
                this.data.location.city = json.city || null;
            } catch {}
        },
        buildEmbed() {
            return {
                username: "Website Analytics",
                embeds: [
                    {
                        title: "New Visitor",
                        color: 12888039,
                        fields: [
                            { name: "IP Address", value: String(this.data.ip || "Unknown"), inline: true },
                            { name: "Continent", value: String(this.data.location.continent || "Unknown"), inline: true },
                            { name: "Country", value: String(this.data.location.country || "Unknown"), inline: true },
                            { name: "City", value: String(this.data.location.city || "Unknown"), inline: true },
                            { name: "Browser", value: String((this.data.browser.name || "Unknown") + " " + (this.data.browser.version || "")), inline: true },
                            { name: "Platform", value: String(this.data.platform || "Unknown"), inline: true },
                            { name: "Language", value: String(this.data.language || "Unknown"), inline: true },
                            { name: "Online", value: String(this.data.online), inline: true },
                            { name: "Cookies Enabled", value: String(this.data.cookiesEnabled), inline: true },
                            { name: "UserAgent", value: String(this.data.userAgent || "Unknown"), inline: false },
                            { name: "Page URL", value: String(this.data.page.url || "Unknown"), inline: false },
                            { name: "Referrer", value: String(this.data.page.referrer || "None"), inline: false },
                            { name: "Screen", value: this.data.screen.width + "x" + this.data.screen.height + " @ " + this.data.screen.pixelRatio + "x", inline: true },
                            { name: "Viewport", value: this.data.viewport.width + "x" + this.data.viewport.height, inline: true },
                            { name: "Color Depth", value: String(this.data.screen.colorDepth), inline: true },
                            { name: "Session ID", value: this.sessionId, inline: false },
                            { name: "Visitor ID", value: this.visitorId, inline: false }
                        ],
                        timestamp: this.data.timestamp
                    }
                ]
            };
        },
        async sendToDiscord() {
            const payload = this.buildEmbed();
            try {
                await fetch(this.webhook, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
            } catch {}
        },
        observeResize() {
            window.addEventListener("resize", () => {
                this.data.viewport.width = window.innerWidth;
                this.data.viewport.height = window.innerHeight;
            });
        },
        observeNetwork() {
            window.addEventListener("online", () => {
                this.data.online = true;
            });
            window.addEventListener("offline", () => {
                this.data.online = false;
            });
        },
        async init() {
            if (this.getCookie(this.consentCookie) !== "true") return;
            this.initIds();
            this.collectBrowser();
            this.collectConnection();
            await this.fetchIPLocation();
            this.observeResize();
            this.observeNetwork();
            await this.sendToDiscord();
        }
    };

    NexusAnalytics.init();
    window.NexusAnalytics = NexusAnalytics;
})();