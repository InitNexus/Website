(function () {
    const NexusDebug = {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        online: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory || null,
        connection: navigator.connection ? {
            type: navigator.connection.type,
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
        } : null,
        screen: {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            pixelDepth: screen.pixelDepth,
            colorDepth: screen.colorDepth,
            devicePixelRatio: window.devicePixelRatio
        },
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            scrollX: window.scrollX,
            scrollY: window.scrollY
        },
        timeOrigin: performance.timeOrigin,
        navigationTiming: {},
        paintTiming: {},
        memory: performance.memory ? {
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            usedJSHeapSize: performance.memory.usedJSHeapSize
        } : null,
        resources: [],
        elements: {},
        dom: {},
        events: {},
        network: {},
        observers: {},
        collectNavigationTiming() {
            const nav = performance.getEntriesByType("navigation")[0];
            if (!nav) return;
            this.navigationTiming = {
                type: nav.type,
                redirectCount: nav.redirectCount,
                startTime: nav.startTime,
                unloadEventStart: nav.unloadEventStart,
                unloadEventEnd: nav.unloadEventEnd,
                domInteractive: nav.domInteractive,
                domContentLoadedEventStart: nav.domContentLoadedEventStart,
                domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
                domComplete: nav.domComplete,
                loadEventStart: nav.loadEventStart,
                loadEventEnd: nav.loadEventEnd,
                duration: nav.duration,
                transferSize: nav.transferSize,
                encodedBodySize: nav.encodedBodySize,
                decodedBodySize: nav.decodedBodySize
            };
        },
        collectPaintTiming() {
            performance.getEntriesByType("paint").forEach(p => {
                this.paintTiming[p.name] = p.startTime;
            });
        },
        collectResources() {
            this.resources = performance.getEntriesByType("resource").map(r => ({
                name: r.name,
                type: r.initiatorType,
                startTime: r.startTime,
                duration: r.duration,
                transferSize: r.transferSize,
                encodedBodySize: r.encodedBodySize,
                decodedBodySize: r.decodedBodySize,
                nextHopProtocol: r.nextHopProtocol
            }));
        },
        collectElements() {
            const all = document.querySelectorAll("*");
            this.elements.total = all.length;
            this.elements.byTag = {};
            this.elements.interactive = document.querySelectorAll("a,button,input,select,textarea").length;
            this.elements.images = document.images.length;
            this.elements.videos = document.querySelectorAll("video").length;
            this.elements.audios = document.querySelectorAll("audio").length;
            this.elements.canvases = document.querySelectorAll("canvas").length;
            this.elements.svgs = document.querySelectorAll("svg").length;
            all.forEach(e => {
                const tag = e.tagName.toLowerCase();
                this.elements.byTag[tag] = (this.elements.byTag[tag] || 0) + 1;
            });
        },
        collectDOM() {
            this.dom = {
                readyState: document.readyState,
                title: document.title,
                referrer: document.referrer,
                hidden: document.hidden,
                visibilityState: document.visibilityState,
                characterSet: document.characterSet,
                doctype: document.doctype ? document.doctype.name : null,
                scripts: document.scripts.length,
                stylesheets: document.styleSheets.length,
                forms: document.forms.length,
                links: document.links.length
            };
        },
        collectNetwork() {
            const entries = performance.getEntriesByType("resource");
            let totalSize = 0;
            entries.forEach(e => {
                totalSize += e.transferSize || 0;
            });
            this.network = {
                resourceCount: entries.length,
                totalTransferSize: totalSize,
                protocols: [...new Set(entries.map(e => e.nextHopProtocol).filter(Boolean))]
            };
        },
        observePerformance() {
            const longTasks = [];
            const observer = new PerformanceObserver(list => {
                list.getEntries().forEach(entry => {
                    longTasks.push({
                        name: entry.name,
                        duration: entry.duration,
                        start: entry.startTime
                    });
                });
            });
            try {
                observer.observe({ entryTypes: ["longtask"] });
            } catch {}
            this.observers.longTasks = longTasks;
        },
        observeLayoutShift() {
            const shifts = [];
            const observer = new PerformanceObserver(list => {
                list.getEntries().forEach(e => {
                    if (!e.hadRecentInput) {
                        shifts.push({
                            value: e.value,
                            start: e.startTime
                        });
                    }
                });
            });
            try {
                observer.observe({ type: "layout-shift", buffered: true });
            } catch {}
            this.observers.layoutShifts = shifts;
        },
        eventTracking() {
            const counts = {};
            const origAdd = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function (type, listener, options) {
                counts[type] = (counts[type] || 0) + 1;
                return origAdd.call(this, type, listener, options);
            };
            this.events = counts;
        },
        collect() {
            this.collectNavigationTiming();
            this.collectPaintTiming();
            this.collectResources();
            this.collectElements();
            this.collectDOM();
            this.collectNetwork();
        },
        log() {
            console.group("NexusDebug");
            console.log("Environment", {
                version: this.version,
                timestamp: this.timestamp,
                userAgent: this.userAgent,
                platform: this.platform,
                language: this.language,
                cookiesEnabled: this.cookiesEnabled,
                online: this.online,
                hardwareConcurrency: this.hardwareConcurrency,
                deviceMemory: this.deviceMemory
            });
            console.log("Screen", this.screen);
            console.log("Viewport", this.viewport);
            console.log("Connection", this.connection);
            console.log("Navigation Timing", this.navigationTiming);
            console.log("Paint Timing", this.paintTiming);
            console.log("Memory", this.memory);
            console.log("DOM", this.dom);
            console.log("Elements", this.elements);
            console.log("Network", this.network);
            console.log("Resources", this.resources);
            console.log("Events", this.events);
            console.log("Observers", this.observers);
            console.groupEnd();
        },
        export() {
            return JSON.parse(JSON.stringify(this));
        }
    };

    NexusDebug.eventTracking();
    NexusDebug.observePerformance();
    NexusDebug.observeLayoutShift();
    NexusDebug.collect();
    NexusDebug.log();

    window.NexusDebug = NexusDebug;

    window.addEventListener("load", () => {
        NexusDebug.collect();
        NexusDebug.log();
    });

    window.addEventListener("online", () => {
        NexusDebug.online = true;
        NexusDebug.collectNetwork();
        NexusDebug.log();
    });

    window.addEventListener("offline", () => {
        NexusDebug.online = false;
        NexusDebug.log();
    });

    window.addEventListener("resize", () => {
        NexusDebug.viewport.width = window.innerWidth;
        NexusDebug.viewport.height = window.innerHeight;
    });

    window.addEventListener("scroll", () => {
        NexusDebug.viewport.scrollX = window.scrollX;
        NexusDebug.viewport.scrollY = window.scrollY;
    });
})();