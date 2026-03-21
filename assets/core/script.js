'use strict';

(function () {

  const ROOT = document.documentElement;

  function syncThemeVars() {
    const cs = getComputedStyle(ROOT);
    window.__coreTheme = {
      accent: cs.getPropertyValue('--accent').trim(),
      glass: cs.getPropertyValue('--glass-bg').trim(),
      radius: cs.getPropertyValue('--radius').trim(),
    };
  }
  syncThemeVars();

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function initReveal() {
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.classList.add('reveal-ready');
      revealObserver.observe(el);
    });
  }
  initReveal();

  const revealStyle = document.createElement('style');
  revealStyle.textContent = `.reveal-ready{opacity:0;transform:translateY(28px);transition:opacity .55s cubic-bezier(.4,0,.2,1),transform .55s cubic-bezier(.4,0,.2,1);}.reveal-ready.is-visible{opacity:1;transform:none;}`;
  document.head.appendChild(revealStyle);

  document.addEventListener('pointerdown', e => {
    const el = e.target.closest('[data-ripple], button, .btn, [role="button"]');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement('span');
    Object.assign(ripple.style, {
      position: 'absolute', borderRadius: '50%',
      width: size + 'px', height: size + 'px',
      left: x + 'px', top: y + 'px',
      background: 'rgba(255,255,255,0.18)',
      transform: 'scale(0)', pointerEvents: 'none',
      animation: 'coreRipple .6s ease-out forwards',
      zIndex: 9999,
    });
    const prev = getComputedStyle(el).position;
    if (prev === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });

  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `@keyframes coreRipple{to{transform:scale(1);opacity:0;}}`;
  document.head.appendChild(rippleStyle);

  function highlightActiveNav() {
    const path = location.pathname;
    document.querySelectorAll('nav a, .nav a, .navbar a').forEach(a => {
      a.classList.toggle('nav-active', a.getAttribute('href') === path);
    });
  }
  highlightActiveNav();

  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-dropdown-toggle]');
    if (trigger) {
      const targetId = trigger.dataset.dropdownToggle;
      const menu = document.getElementById(targetId);
      if (menu) {
        const open = menu.dataset.open === 'true';
        document.querySelectorAll('[data-open="true"]').forEach(m => { m.dataset.open = 'false'; });
        menu.dataset.open = open ? 'false' : 'true';
      }
      return;
    }
    document.querySelectorAll('[data-open="true"]').forEach(m => { m.dataset.open = 'false'; });
  });

  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.dataset.open = 'true';
    document.body.style.overflow = 'hidden';
  }
  function closeModal(id) {
    const m = id ? document.getElementById(id) : document.querySelector('.modal[data-open="true"]');
    if (!m) return;
    m.dataset.open = 'false';
    document.body.style.overflow = '';
  }
  window.openModal = openModal;
  window.closeModal = closeModal;

  document.addEventListener('click', e => {
    if (e.target.dataset.modalOpen) openModal(e.target.dataset.modalOpen);
    if (e.target.dataset.modalClose !== undefined) closeModal(e.target.dataset.modalClose || undefined);
    if (e.target.classList.contains('modal') && e.target.dataset.open === 'true') closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  let activeTooltip = null;
  function createTooltip(text, anchor) {
    if (activeTooltip) activeTooltip.remove();
    const tt = document.createElement('div');
    tt.className = 'core-tooltip';
    tt.textContent = text;
    document.body.appendChild(tt);
    const r = anchor.getBoundingClientRect();
    const tr = tt.getBoundingClientRect();
    let top = r.top + window.scrollY - tr.height - 10;
    let left = r.left + window.scrollX + r.width / 2 - tr.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tr.width - 8));
    Object.assign(tt.style, { top: top + 'px', left: left + 'px', opacity: '1' });
    activeTooltip = tt;
  }

  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-tooltip]');
    if (el) createTooltip(el.dataset.tooltip, el);
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('[data-tooltip]') && activeTooltip) {
      activeTooltip.remove(); activeTooltip = null;
    }
  });

  const ttStyle = document.createElement('style');
  ttStyle.textContent = `.core-tooltip{position:absolute;z-index:99999;background:rgba(30,20,50,.92);backdrop-filter:blur(12px);color:#e8d8ff;font-size:12px;padding:6px 12px;border-radius:8px;pointer-events:none;opacity:0;transition:opacity .2s;border:1px solid rgba(160,100,255,.25);white-space:nowrap;max-width:260px;}`;
  document.head.appendChild(ttStyle);

  document.addEventListener('click', e => {
    const tab = e.target.closest('[data-tab]');
    if (!tab) return;
    const group = tab.closest('[data-tab-group]');
    if (!group) return;
    const key = tab.dataset.tab;
    group.querySelectorAll('[data-tab]').forEach(t => t.classList.toggle('tab-active', t.dataset.tab === key));
    group.querySelectorAll('[data-tab-panel]').forEach(p => p.classList.toggle('tab-panel-active', p.dataset.tabPanel === key));
  });

  document.addEventListener('click', e => {
    const hdr = e.target.closest('[data-accordion-header]');
    if (!hdr) return;
    const item = hdr.closest('[data-accordion-item]');
    const body = item ? item.querySelector('[data-accordion-body]') : null;
    if (!body) return;
    const open = item.dataset.open === 'true';
    const accordion = item.closest('[data-accordion]');
    if (accordion && accordion.dataset.accordion !== 'multi') {
      accordion.querySelectorAll('[data-accordion-item]').forEach(i => {
        i.dataset.open = 'false';
        const b = i.querySelector('[data-accordion-body]');
        if (b) b.style.maxHeight = '0';
      });
    }
    item.dataset.open = open ? 'false' : 'true';
    body.style.maxHeight = open ? '0' : body.scrollHeight + 'px';
  });

  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3800;
    let container = document.getElementById('core-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'core-toast-container';
      Object.assign(container.style, {
        position: 'fixed', bottom: '80px', right: '20px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        zIndex: 999999, maxWidth: '340px',
      });
      document.body.appendChild(container);
    }
    const colors = { info: '#7c6aff', success: '#4cffb4', warning: '#ffd166', error: '#ff6b6b' };
    const icons = { info: 'i', success: '+', warning: '!', error: 'x' };
    const toast = document.createElement('div');
    toast.className = 'core-toast';
    toast.innerHTML = '<span style="color:' + colors[type] + ';font-size:16px;flex-shrink:0">' + icons[type] + '</span><span style="flex:1;font-size:13px;line-height:1.4">' + message + '</span><button onclick="this.parentElement.remove()" style="background:none;border:none;color:rgba(200,180,255,.5);cursor:pointer;font-size:16px;line-height:1;padding:0;flex-shrink:0">&times;</button>';
    Object.assign(toast.style, {
      display: 'flex', alignItems: 'center', gap: '10px',
      background: 'rgba(25,15,45,.92)', backdropFilter: 'blur(20px)',
      border: '1px solid ' + colors[type] + '44', borderLeft: '3px solid ' + colors[type],
      borderRadius: '10px', padding: '12px 14px', color: '#e8d8ff',
      boxShadow: '0 8px 32px rgba(0,0,0,.4)', animation: 'toastIn .35s ease',
      transition: 'opacity .3s, transform .3s',
    });
    container.appendChild(toast);
    var timeout = setTimeout(function() {
      toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)';
      setTimeout(function() { toast.remove(); }, 320);
    }, duration);
    toast.querySelector('button').addEventListener('click', function() { clearTimeout(timeout); });
  }
  window.showToast = showToast;

  const toastStyle = document.createElement('style');
  toastStyle.textContent = `@keyframes toastIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}`;
  document.head.appendChild(toastStyle);

  const progressBar = document.createElement('div');
  Object.assign(progressBar.style, {
    position: 'fixed', top: '0', left: '0', height: '3px', width: '0%',
    background: 'linear-gradient(90deg, #7c6aff, #b04fff, #4cffb4)',
    zIndex: 999999, transition: 'width .25s ease, opacity .4s ease',
    borderRadius: '0 3px 3px 0', pointerEvents: 'none',
  });
  document.body.appendChild(progressBar);

  function setProgress(pct) {
    progressBar.style.width = pct + '%';
    if (pct >= 100) {
      progressBar.style.opacity = '0';
      setTimeout(function() { progressBar.style.width = '0%'; progressBar.style.opacity = '1'; }, 500);
    }
  }
  window.setProgress = setProgress;

  var fakeProgress = 0;
  var fakeTimer = setInterval(function() {
    fakeProgress += Math.random() * 18;
    if (fakeProgress >= 85) { clearInterval(fakeTimer); return; }
    setProgress(fakeProgress);
  }, 180);
  window.addEventListener('load', function() { clearInterval(fakeTimer); setProgress(100); });

  const imgObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
      if (img.dataset.srcset) { img.srcset = img.dataset.srcset; delete img.dataset.srcset; }
      img.classList.add('img-loaded');
      imgObserver.unobserve(img);
    });
  }, { rootMargin: '200px' });
  document.querySelectorAll('img[data-src]').forEach(function(img) { imgObserver.observe(img); });

  document.addEventListener('invalid', function(e) {
    e.preventDefault();
    const el = e.target;
    el.classList.add('input-error');
    let msg = el.closest('.form-field') && el.closest('.form-field').querySelector('.form-error');
    if (!msg) {
      msg = document.createElement('span');
      msg.className = 'form-error';
      el.parentNode.insertBefore(msg, el.nextSibling);
    }
    msg.textContent = el.validationMessage;
  }, true);

  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('input-error')) {
      e.target.classList.remove('input-error');
      const msg = e.target.parentNode.querySelector('.form-error');
      if (msg) msg.textContent = '';
    }
  });

  const formStyle = document.createElement('style');
  formStyle.textContent = `.input-error{border-color:#ff6b6b!important;box-shadow:0 0 0 3px rgba(255,107,107,.18)!important;}.form-error{color:#ff6b6b;font-size:11.5px;margin-top:4px;display:block;}`;
  document.head.appendChild(formStyle);

  document.addEventListener('click', function(e) {
    const el = e.target.closest('[data-copy]');
    if (!el) return;
    navigator.clipboard.writeText(el.dataset.copy).then(function() {
      showToast('Copied to clipboard', 'success', 2000);
    });
  });

  const shortcuts = {};
  function registerShortcut(combo, fn) { shortcuts[combo.toLowerCase()] = fn; }
  window.registerShortcut = registerShortcut;

  document.addEventListener('keydown', function(e) {
    if (e.target.matches('input,textarea,select,[contenteditable]')) return;
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    parts.push(e.key.toLowerCase());
    const combo = parts.join('+');
    if (shortcuts[combo]) { e.preventDefault(); shortcuts[combo](e); }
  });

  const perfData = { fcp: null, lcp: null, cls: 0, fid: null, ttfb: null, resources: [] };

  if ('PerformanceObserver' in window) {
    try {
      new PerformanceObserver(function(list) {
        list.getEntries().forEach(function(e) { if (e.name === 'first-contentful-paint') perfData.fcp = e.startTime; });
      }).observe({ type: 'paint', buffered: true });
      new PerformanceObserver(function(list) {
        list.getEntries().forEach(function(e) { perfData.lcp = e.startTime; });
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(function(list) {
        list.getEntries().forEach(function(e) { perfData.cls += e.value; });
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(function(list) {
        list.getEntries().forEach(function(e) { perfData.fid = e.processingStart - e.startTime; });
      }).observe({ type: 'first-input', buffered: true });
      new PerformanceObserver(function(list) {
        list.getEntries().forEach(function(e) { perfData.resources.push({ name: e.name, duration: e.duration, size: e.transferSize }); });
      }).observe({ type: 'resource', buffered: true });
    } catch (_) {}
  }

  const navTiming = performance.getEntriesByType('navigation')[0];
  if (navTiming) perfData.ttfb = navTiming.responseStart - navTiming.requestStart;
  window.__corePerfData = perfData;

  const analytics = {
    pageViews: 0, clicks: 0, keypresses: 0, scrollDepth: 0,
    sessionStart: Date.now(), events: [], heatmap: {},
  };
  analytics.pageViews++;

  function trackEvent(category, action, label, value) {
    const ev = { category: category, action: action, label: label, value: value, ts: Date.now() };
    analytics.events.push(ev);
    if (analytics.events.length > 500) analytics.events.shift();
  }
  window.trackEvent = trackEvent;

  document.addEventListener('click', function(e) {
    analytics.clicks++;
    const key = (Math.round(e.clientX / 40) * 40) + ',' + (Math.round(e.clientY / 40) * 40);
    analytics.heatmap[key] = (analytics.heatmap[key] || 0) + 1;
    trackEvent('interaction', 'click', e.target.tagName);
  });
  document.addEventListener('keypress', function() { analytics.keypresses++; });
  window.addEventListener('scroll', function() {
    const depth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (depth > analytics.scrollDepth) analytics.scrollDepth = Math.min(depth, 100);
  }, { passive: true });
  window.__coreAnalytics = analytics;

  const networkLog = [];
  const _origFetch = window.fetch;
  window.fetch = async function () {
    const args = Array.prototype.slice.call(arguments);
    const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
    const method = (args[1] && args[1].method) || 'GET';
    const start = performance.now();
    const entry = { url: url, method: method, status: null, duration: null, size: null, ts: Date.now(), type: 'fetch', error: null };
    networkLog.push(entry);
    try {
      const res = await _origFetch.apply(this, args);
      entry.status = res.status;
      entry.duration = +(performance.now() - start).toFixed(2);
      const clone = res.clone();
      clone.blob().then(function(b) { entry.size = b.size; }).catch(function() {});
      return res;
    } catch (err) {
      entry.error = err.message;
      entry.duration = +(performance.now() - start).toFixed(2);
      throw err;
    }
  };

  const _origXHROpen = XMLHttpRequest.prototype.open;
  const _origXHRSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url) {
    this.__netEntry = { url: url, method: method, status: null, duration: null, size: null, ts: Date.now(), type: 'xhr', error: null };
    networkLog.push(this.__netEntry);
    return _origXHROpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function() {
    if (this.__netEntry) {
      const start = performance.now();
      const self = this;
      this.addEventListener('loadend', function() {
        self.__netEntry.status = self.status;
        self.__netEntry.duration = +(performance.now() - start).toFixed(2);
        self.__netEntry.size = self.response ? self.response.length : null;
      });
    }
    return _origXHRSend.apply(this, arguments);
  };
  window.__coreNetworkLog = networkLog;

  const consoleLogs = [];
  ['log', 'warn', 'error', 'info', 'debug'].forEach(function(level) {
    const orig = console[level].bind(console);
    console[level] = function() {
      const args = Array.prototype.slice.call(arguments);
      consoleLogs.push({ level: level, args: args.map(function(a) { try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); } catch(e) { return String(a); } }), ts: Date.now() });
      if (consoleLogs.length > 300) consoleLogs.shift();
      orig.apply(console, args);
    };
  });
  window.__coreConsoleLogs = consoleLogs;

  const errorLog = [];
  window.addEventListener('error', function(e) {
    errorLog.push({ message: e.message, source: e.filename, line: e.lineno, col: e.colno, ts: Date.now() });
  });
  window.addEventListener('unhandledrejection', function(e) {
    errorLog.push({ message: String(e.reason), source: 'Promise', line: null, col: null, ts: Date.now() });
  });
  window.__coreErrorLog = errorLog;

  function getDeviceInfo() {
    const nav = navigator;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection || {};
    return {
      userAgent: nav.userAgent,
      platform: nav.platform,
      language: nav.language,
      languages: nav.languages ? nav.languages.join(', ') : '',
      cookiesEnabled: nav.cookieEnabled,
      doNotTrack: nav.doNotTrack,
      onLine: nav.onLine,
      hardwareConcurrency: nav.hardwareConcurrency,
      deviceMemory: nav.deviceMemory,
      maxTouchPoints: nav.maxTouchPoints,
      screen: { w: screen.width, h: screen.height, dpr: devicePixelRatio, colorDepth: screen.colorDepth, orientation: screen.orientation ? screen.orientation.type : 'N/A' },
      viewport: { w: window.innerWidth, h: window.innerHeight },
      connection: { effectiveType: conn.effectiveType, downlink: conn.downlink, rtt: conn.rtt, saveData: conn.saveData },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: Intl.DateTimeFormat().resolvedOptions().locale,
    };
  }

  async function getStorageInfo() {
    const info = { localStorage: null, sessionStorage: null, quota: null, usage: null, percent: null };
    try {
      let ls = 0;
      for (var k in localStorage) { if (localStorage.hasOwnProperty(k)) ls += localStorage[k].length * 2; }
      info.localStorage = ls;
      let ss = 0;
      for (var k2 in sessionStorage) { if (sessionStorage.hasOwnProperty(k2)) ss += sessionStorage[k2].length * 2; }
      info.sessionStorage = ss;
    } catch (_) {}
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      info.quota = est.quota;
      info.usage = est.usage;
      info.percent = est.quota ? +((est.usage / est.quota) * 100).toFixed(2) : 0;
    }
    return info;
  }

  const cpuSamples = [];
  function sampleCPU() {
    const start = performance.now();
    var n = 0;
    while (performance.now() - start < 2) n++;
    const ratio = Math.min(100, Math.round((2 / (performance.now() - start + 0.001)) * 100));
    cpuSamples.push(100 - Math.min(ratio, 99));
    if (cpuSamples.length > 60) cpuSamples.shift();
  }
  setInterval(sampleCPU, 1000);
  function getCPUEstimate() {
    if (!cpuSamples.length) return 0;
    return +(cpuSamples.reduce(function(a, b) { return a + b; }, 0) / cpuSamples.length).toFixed(1);
  }

  function getMemoryInfo() {
    const mem = performance.memory;
    if (!mem) return null;
    return {
      usedJSHeap: mem.usedJSHeapSize,
      totalJSHeap: mem.totalJSHeapSize,
      jsHeapLimit: mem.jsHeapSizeLimit,
      percentUsed: +((mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100).toFixed(2),
    };
  }

  var inspectActive = false;
  var inspectHighlight = null;
  var inspectedElement = null;

  function startInspect() {
    inspectActive = true;
    document.body.style.cursor = 'crosshair';
    if (!inspectHighlight) {
      inspectHighlight = document.createElement('div');
      Object.assign(inspectHighlight.style, {
        position: 'fixed', pointerEvents: 'none', zIndex: 9999998,
        border: '2px solid #7c6aff', background: 'rgba(124,106,255,.12)',
        transition: 'all .08s ease', borderRadius: '4px', display: 'none',
      });
      document.body.appendChild(inspectHighlight);
    }
    inspectHighlight.style.display = 'block';
  }
  window.startInspect = startInspect;

  function stopInspect() {
    inspectActive = false;
    document.body.style.cursor = '';
    if (inspectHighlight) inspectHighlight.style.display = 'none';
  }

  document.addEventListener('mousemove', function(e) {
    if (!inspectActive) return;
    const el = e.target;
    if (el === inspectHighlight || devToolsPanel.contains(el)) return;
    const r = el.getBoundingClientRect();
    Object.assign(inspectHighlight.style, {
      top: r.top + 'px', left: r.left + 'px',
      width: r.width + 'px', height: r.height + 'px',
    });
  });

  document.addEventListener('click', function(e) {
    if (!inspectActive) return;
    e.preventDefault(); e.stopPropagation();
    const el = e.target;
    if (el === inspectHighlight || devToolsPanel.contains(el)) return;
    inspectedElement = el;
    stopInspect();
    showInspectedElement(el);
    activatePanel('elements');
  }, true);

  function showInspectedElement(el) {
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    const attrs = Array.prototype.slice.call(el.attributes).map(function(a) { return a.name + '="' + a.value + '"'; }).join(' ');
    const styleProps = ['display','position','width','height','margin','padding','border','background','color','font-size','font-weight','z-index','opacity','transform','transition','box-shadow','border-radius','overflow'];
    const styles = styleProps.map(function(p) {
      return '<tr><td style="color:#b4a0ff;padding:2px 8px 2px 0">' + p + '</td><td style="color:#e8d8ff">' + cs[p] + '</td></tr>';
    }).join('');
    const statsItems = [['Width', box.width.toFixed(1)+'px'],['Height', box.height.toFixed(1)+'px'],['Top', box.top.toFixed(1)+'px'],['Left', box.left.toFixed(1)+'px']];
    const html = '<div style="margin-bottom:10px"><span style="color:#7c6aff">&lt;' + el.tagName.toLowerCase() + '</span><span style="color:#b4a0ff"> ' + attrs + '</span><span style="color:#7c6aff">&gt;</span></div>'
      + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px">'
      + statsItems.map(function(item) { return '<div style="background:rgba(124,106,255,.15);border-radius:6px;padding:6px 10px"><div style="font-size:10px;color:#8a7aaa">' + item[0] + '</div><div style="color:#e8d8ff;font-weight:600">' + item[1] + '</div></div>'; }).join('')
      + '</div><div style="font-size:11px;color:#8a7aaa;margin-bottom:6px">COMPUTED STYLES</div>'
      + '<table style="width:100%;border-collapse:collapse;font-size:12px">' + styles + '</table>';
    const panel = devToolsPanel.querySelector('#dt-elements-content');
    if (panel) panel.innerHTML = html;
  }

  const devToolsBtn = document.createElement('button');
  devToolsBtn.id = 'core-devtools-btn';
  devToolsBtn.textContent = '\u2699 Developer Tools';
  Object.assign(devToolsBtn.style, {
    position: 'fixed', bottom: '14px', left: '50%', transform: 'translateX(-50%)',
    zIndex: 9999990, padding: '9px 22px', borderRadius: '999px',
    background: 'rgba(25,15,50,.85)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(124,106,255,.4)', color: '#d4c0ff',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
    boxShadow: '0 4px 24px rgba(80,40,160,.35)', transition: 'all .2s ease',
    letterSpacing: '.3px',
  });
  devToolsBtn.addEventListener('mouseenter', function() {
    devToolsBtn.style.background = 'rgba(60,30,100,.95)';
    devToolsBtn.style.borderColor = 'rgba(160,100,255,.7)';
  });
  devToolsBtn.addEventListener('mouseleave', function() {
    devToolsBtn.style.background = 'rgba(25,15,50,.85)';
    devToolsBtn.style.borderColor = 'rgba(124,106,255,.4)';
  });
  document.body.appendChild(devToolsBtn);

  const devToolsPanel = document.createElement('div');
  devToolsPanel.id = 'core-devtools-panel';
  devToolsPanel.style.cssText = 'position:fixed;bottom:0;left:0;right:0;height:52vh;min-height:300px;max-height:80vh;background:rgba(12,7,28,.97);backdrop-filter:blur(32px);border-top:1px solid rgba(124,106,255,.25);z-index:9999995;display:none;flex-direction:column;font-family:\'JetBrains Mono\',Consolas,monospace;font-size:12px;color:#c8b8ee;overflow:hidden;';
  document.body.appendChild(devToolsPanel);

  var devToolsOpen = false;
  devToolsBtn.addEventListener('click', function() {
    devToolsOpen = !devToolsOpen;
    devToolsPanel.style.display = devToolsOpen ? 'flex' : 'none';
    if (devToolsOpen) renderDevTools();
  });

  const PANELS = ['overview','performance','network','console','elements','analytics','device','storage'];
  var activeTab = 'overview';

  function renderDevTools() {
    devToolsPanel.innerHTML = '';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;background:rgba(18,10,36,.98);border-bottom:1px solid rgba(124,106,255,.2);flex-shrink:0;overflow-x:auto;overflow-y:hidden;';

    const title = document.createElement('div');
    title.style.cssText = 'padding:0 14px;color:#7c6aff;font-weight:700;font-size:13px;white-space:nowrap;border-right:1px solid rgba(124,106,255,.2);height:100%;display:flex;align-items:center;';
    title.textContent = '\u2699 DevTools';
    header.appendChild(title);

    PANELS.forEach(function(p) {
      const btn = document.createElement('button');
      btn.dataset.dtTab = p;
      btn.textContent = p.charAt(0).toUpperCase() + p.slice(1);
      btn.style.cssText = 'background:none;border:none;padding:10px 14px;cursor:pointer;font-size:12px;font-family:inherit;color:' + (p===activeTab?'#b4a0ff':'#6a5a8a') + ';border-bottom:' + (p===activeTab?'2px solid #7c6aff':'2px solid transparent') + ';transition:all .2s;white-space:nowrap;';
      btn.addEventListener('click', function() { activatePanel(p); });
      header.appendChild(btn);
    });

    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    header.appendChild(spacer);

    const inspectBtn = document.createElement('button');
    inspectBtn.textContent = '\uD83D\uDD0D Inspect';
    inspectBtn.style.cssText = 'background:rgba(124,106,255,.2);border:1px solid rgba(124,106,255,.3);border-radius:6px;padding:5px 12px;cursor:pointer;font-size:11px;color:#b4a0ff;margin-right:8px;font-family:inherit;';
    inspectBtn.addEventListener('click', function() { startInspect(); activatePanel('elements'); });
    header.appendChild(inspectBtn);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '\u2715';
    closeBtn.style.cssText = 'background:none;border:none;color:#6a5a8a;cursor:pointer;font-size:16px;padding:0 14px;font-family:inherit;';
    closeBtn.addEventListener('click', function() { devToolsOpen = false; devToolsPanel.style.display = 'none'; stopInspect(); });
    header.appendChild(closeBtn);

    devToolsPanel.appendChild(header);

    const content = document.createElement('div');
    content.id = 'dt-main-content';
    content.style.cssText = 'flex:1;overflow:auto;padding:16px;';
    devToolsPanel.appendChild(content);

    const resizer = document.createElement('div');
    resizer.style.cssText = 'position:absolute;top:0;left:0;right:0;height:5px;cursor:ns-resize;z-index:10;';
    devToolsPanel.appendChild(resizer);
    var resizing = false, startY, startH;
    resizer.addEventListener('pointerdown', function(e) {
      resizing = true; startY = e.clientY; startH = devToolsPanel.offsetHeight;
      document.addEventListener('pointermove', onResize);
      document.addEventListener('pointerup', function() {
        resizing = false;
        document.removeEventListener('pointermove', onResize);
      }, { once: true });
    });
    function onResize(e) {
      if (!resizing) return;
      const delta = startY - e.clientY;
      devToolsPanel.style.height = Math.max(200, Math.min(window.innerHeight * 0.9, startH + delta)) + 'px';
    }

    activatePanel(activeTab);
  }

  function activatePanel(name) {
    activeTab = name;
    devToolsPanel.querySelectorAll('[data-dt-tab]').forEach(function(b) {
      const active = b.dataset.dtTab === name;
      b.style.color = active ? '#b4a0ff' : '#6a5a8a';
      b.style.borderBottom = active ? '2px solid #7c6aff' : '2px solid transparent';
    });
    const content = devToolsPanel.querySelector('#dt-main-content');
    if (!content) return;
    content.innerHTML = '';
    const renderers = {
      overview: renderOverview,
      performance: renderPerformance,
      network: renderNetwork,
      console: renderConsole,
      elements: renderElements,
      analytics: renderAnalytics,
      device: renderDevice,
      storage: renderStorage,
    };
    if (renderers[name]) renderers[name](content);
  }

  function fmt(bytes) {
    if (!bytes && bytes !== 0) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }
  function ms(val) { return val != null ? val.toFixed(1) + 'ms' : 'N/A'; }
  function elapsed(ts) { const s = Math.round((Date.now() - ts) / 1000); return s < 60 ? s + 's ago' : Math.round(s/60) + 'm ago'; }

  function card(title, content, accent) {
    accent = accent || '#7c6aff';
    return '<div style="background:rgba(25,15,50,.6);border:1px solid rgba(124,106,255,.18);border-radius:10px;padding:14px;margin-bottom:12px"><div style="font-size:10px;font-weight:700;color:' + accent + ';letter-spacing:1px;text-transform:uppercase;margin-bottom:10px">' + title + '</div>' + content + '</div>';
  }

  function statGrid(items) {
    return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px">' + items.map(function(item) {
      const l = item[0], v = item[1], c = item[2] || '#e8d8ff';
      return '<div style="background:rgba(40,20,70,.5);border-radius:8px;padding:10px 12px"><div style="font-size:10px;color:#8a7aaa;margin-bottom:4px">' + l + '</div><div style="font-size:16px;font-weight:700;color:' + c + '">' + v + '</div></div>';
    }).join('') + '</div>';
  }

  function miniBar(pct, color) {
    color = color || '#7c6aff';
    return '<div style="height:6px;background:rgba(124,106,255,.15);border-radius:3px;overflow:hidden;margin-top:4px"><div style="height:100%;width:' + Math.min(100, pct) + '%;background:' + color + ';border-radius:3px;transition:width .4s"></div></div>';
  }

  function renderOverview(el) {
    const mem = getMemoryInfo();
    const cpu = getCPUEstimate();
    const nav2 = performance.getEntriesByType('navigation')[0] || {};
    const errors = window.__coreErrorLog ? window.__coreErrorLog.length : 0;
    const netReqs = window.__coreNetworkLog ? window.__coreNetworkLog.length : 0;
    const sessionSec = Math.round((Date.now() - analytics.sessionStart) / 1000);
    el.innerHTML =
      card('Page Health', statGrid([
        ['Errors', errors, errors > 0 ? '#ff6b6b' : '#4cffb4'],
        ['Network Requests', netReqs, '#b4a0ff'],
        ['Session Time', sessionSec + 's', '#ffd166'],
        ['Scroll Depth', analytics.scrollDepth + '%', '#4cffb4'],
        ['Clicks', analytics.clicks, '#b4a0ff'],
        ['Keypresses', analytics.keypresses, '#b4a0ff'],
      ])) +
      card('Core Web Vitals', statGrid([
        ['FCP', ms(perfData.fcp), perfData.fcp && perfData.fcp < 1800 ? '#4cffb4' : '#ffd166'],
        ['LCP', ms(perfData.lcp), perfData.lcp && perfData.lcp < 2500 ? '#4cffb4' : '#ffd166'],
        ['TTFB', ms(perfData.ttfb), perfData.ttfb && perfData.ttfb < 800 ? '#4cffb4' : '#ffd166'],
        ['FID', ms(perfData.fid), '#b4a0ff'],
        ['CLS', perfData.cls.toFixed(4), perfData.cls < 0.1 ? '#4cffb4' : '#ff6b6b'],
      ])) +
      card('Memory', mem ?
        statGrid([
          ['JS Heap Used', fmt(mem.usedJSHeap), '#b4a0ff'],
          ['Total JS Heap', fmt(mem.totalJSHeap), '#b4a0ff'],
          ['Heap Limit', fmt(mem.jsHeapLimit), '#6a5a8a'],
          ['Heap Used %', mem.percentUsed + '%', mem.percentUsed > 80 ? '#ff6b6b' : '#4cffb4'],
        ]) + miniBar(mem.percentUsed, mem.percentUsed > 80 ? '#ff6b6b' : '#7c6aff')
        : '<span style="color:#6a5a8a">Memory API not available.</span>') +
      card('CPU (heuristic)',
        statGrid([['Est. CPU Load', cpu + '%', cpu > 70 ? '#ff6b6b' : cpu > 40 ? '#ffd166' : '#4cffb4']]) +
        miniBar(cpu, cpu > 70 ? '#ff6b6b' : '#7c6aff') +
        '<div style="font-size:10px;color:#6a5a8a;margin-top:8px">Based on JS event-loop timing. GPU data requires WebGL (see Device panel).</div>') +
      card('Navigation Timing', statGrid([
        ['DNS Lookup', ms(nav2.domainLookupEnd - nav2.domainLookupStart)],
        ['TCP Connect', ms(nav2.connectEnd - nav2.connectStart)],
        ['Request', ms(nav2.responseStart - nav2.requestStart)],
        ['Response', ms(nav2.responseEnd - nav2.responseStart)],
        ['DOM Parse', ms(nav2.domContentLoadedEventEnd - nav2.responseEnd)],
        ['Load Event', ms(nav2.loadEventEnd - nav2.loadEventStart)],
        ['Total Load', ms(nav2.loadEventEnd - nav2.startTime)],
        ['DOM Elements', document.querySelectorAll('*').length],
      ]));
  }

  function renderPerformance(el) {
    const resources = perfData.resources.slice(-30).reverse();
    const maxD = Math.max.apply(null, resources.map(function(x) { return x.duration || 0; }).concat([1]));
    el.innerHTML = card('Resource Waterfall (last 30)',
      '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="color:#6a5a8a;border-bottom:1px solid rgba(124,106,255,.15)"><th style="text-align:left;padding:4px 8px">Resource</th><th style="text-align:right;padding:4px 8px">Duration</th><th style="text-align:right;padding:4px 8px">Size</th><th style="padding:4px 8px;width:120px">Bar</th></tr></thead><tbody>' +
      resources.map(function(r) {
        const pct = ((r.duration || 0) / maxD * 100).toFixed(1);
        const name = r.name.split('/').pop().split('?')[0] || r.name;
        const c = r.duration > 500 ? '#ff6b6b' : r.duration > 200 ? '#ffd166' : '#4cffb4';
        return '<tr style="border-bottom:1px solid rgba(124,106,255,.08);color:#c8b8ee"><td style="padding:4px 8px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + r.name + '">' + name + '</td><td style="text-align:right;padding:4px 8px;color:' + c + '">' + ms(r.duration) + '</td><td style="text-align:right;padding:4px 8px;color:#8a7aaa">' + fmt(r.size) + '</td><td style="padding:4px 8px"><div style="height:4px;background:rgba(124,106,255,.15);border-radius:2px"><div style="height:100%;width:' + pct + '%;background:' + c + ';border-radius:2px"></div></div></td></tr>';
      }).join('') +
      '</tbody></table></div>');
  }

  function renderNetwork(el) {
    const log = window.__coreNetworkLog || [];
    function statusColor(s) { return s >= 500 ? '#ff6b6b' : s >= 400 ? '#ffd166' : s >= 200 ? '#4cffb4' : '#6a5a8a'; }
    el.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span style="color:#8a7aaa;font-size:11px">' + log.length + ' requests captured</span>' +
      '<button id="dt-net-clear" style="background:rgba(124,106,255,.15);border:1px solid rgba(124,106,255,.2);border-radius:6px;padding:3px 10px;color:#b4a0ff;cursor:pointer;font-size:11px;font-family:inherit">Clear</button></div>' +
      card('Request Log',
        '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="color:#6a5a8a;border-bottom:1px solid rgba(124,106,255,.15)"><th style="text-align:left;padding:4px 6px">Method</th><th style="text-align:left;padding:4px 6px">URL</th><th style="text-align:center;padding:4px 6px">Status</th><th style="text-align:right;padding:4px 6px">Duration</th><th style="text-align:right;padding:4px 6px">Size</th><th style="text-align:right;padding:4px 6px">Time</th></tr></thead><tbody>' +
        log.slice().reverse().map(function(r) {
          return '<tr style="border-bottom:1px solid rgba(124,106,255,.07);color:#c8b8ee"><td style="padding:4px 6px"><span style="background:rgba(124,106,255,.2);border-radius:4px;padding:1px 6px;font-size:10px;color:#b4a0ff">' + r.method + '</span></td><td style="padding:4px 6px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + r.url + '">' + r.url + '</td><td style="text-align:center;padding:4px 6px;color:' + statusColor(r.status) + '">' + (r.error ? 'ERR' : (r.status || '...')) + '</td><td style="text-align:right;padding:4px 6px;color:#b4a0ff">' + (r.duration != null ? ms(r.duration) : '...') + '</td><td style="text-align:right;padding:4px 6px;color:#8a7aaa">' + fmt(r.size) + '</td><td style="text-align:right;padding:4px 6px;color:#6a5a8a">' + elapsed(r.ts) + '</td></tr>';
        }).join('') +
        '</tbody></table></div>');
    const clearBtn = el.querySelector('#dt-net-clear');
    if (clearBtn) clearBtn.addEventListener('click', function() { networkLog.length = 0; renderNetwork(el); });
  }

  function renderConsole(el) {
    const logs = window.__coreConsoleLogs || [];
    function levelColor(l) { return { log: '#c8b8ee', warn: '#ffd166', error: '#ff6b6b', info: '#4cffb4', debug: '#8a7aaa' }[l] || '#c8b8ee'; }
    function levelIcon(l) { return { log: '›', warn: '!', error: 'x', info: 'i', debug: '.' }[l] || '›'; }
    el.innerHTML =
      '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">' +
      ['all','log','warn','error','info','debug'].map(function(f) { return '<button data-console-filter="' + f + '" style="background:rgba(124,106,255,.1);border:1px solid rgba(124,106,255,.2);border-radius:6px;padding:3px 10px;cursor:pointer;font-size:11px;color:#b4a0ff;font-family:inherit">' + f + '</button>'; }).join('') +
      '<button id="dt-con-clear" style="margin-left:auto;background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.2);border-radius:6px;padding:3px 10px;color:#ff6b6b;cursor:pointer;font-size:11px;font-family:inherit">Clear</button></div>' +
      '<div id="dt-console-list" style="font-size:11.5px;line-height:1.6">' +
      logs.slice().reverse().map(function(l) {
        return '<div data-level="' + l.level + '" style="display:flex;gap:8px;padding:5px 8px;border-bottom:1px solid rgba(124,106,255,.07);color:' + levelColor(l.level) + '"><span style="opacity:.5;flex-shrink:0">' + elapsed(l.ts) + '</span><span style="flex-shrink:0;width:14px">' + levelIcon(l.level) + '</span><span style="flex:1;white-space:pre-wrap;word-break:break-all">' + l.args.join(' ') + '</span></div>';
      }).join('') +
      (!logs.length ? '<div style="color:#6a5a8a;padding:20px;text-align:center">No console output yet.</div>' : '') +
      '</div>';
    el.querySelector('#dt-con-clear').addEventListener('click', function() { consoleLogs.length = 0; renderConsole(el); });
    el.querySelectorAll('[data-console-filter]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const f = btn.dataset.consoleFilter;
        el.querySelectorAll('[data-console-filter]').forEach(function(b) { b.style.background = 'rgba(124,106,255,.1)'; });
        btn.style.background = 'rgba(124,106,255,.3)';
        el.querySelectorAll('#dt-console-list [data-level]').forEach(function(row) {
          row.style.display = (f === 'all' || row.dataset.level === f) ? '' : 'none';
        });
      });
    });
  }

  function renderElements(el) {
    el.innerHTML =
      '<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px"><button id="dt-inspect-start" style="background:rgba(124,106,255,.2);border:1px solid rgba(124,106,255,.3);border-radius:8px;padding:6px 14px;color:#b4a0ff;cursor:pointer;font-size:12px;font-family:inherit">Click to Inspect Element</button><span style="color:#6a5a8a;font-size:11px">Then click any element on page</span></div>' +
      '<div id="dt-elements-content" style="font-size:12px">' + (!inspectedElement ? '<div style="color:#6a5a8a;padding:20px;text-align:center">No element inspected yet.</div>' : '') + '</div>' +
      card('DOM Summary', statGrid([
        ['Total Elements', document.querySelectorAll('*').length],
        ['Scripts', document.querySelectorAll('script').length],
        ['Stylesheets', document.querySelectorAll('link[rel=stylesheet],style').length],
        ['Images', document.querySelectorAll('img').length],
        ['Forms', document.querySelectorAll('form').length],
        ['Buttons', document.querySelectorAll('button,[type=button],[type=submit]').length],
        ['Links', document.querySelectorAll('a[href]').length],
        ['IFrames', document.querySelectorAll('iframe').length],
      ]));
    el.querySelector('#dt-inspect-start').addEventListener('click', startInspect);
    if (inspectedElement) showInspectedElement(inspectedElement);
  }

  function renderAnalytics(el) {
    const sessionSec = Math.round((Date.now() - analytics.sessionStart) / 1000);
    const eventCounts = {};
    analytics.events.forEach(function(e) { eventCounts[e.action] = (eventCounts[e.action] || 0) + 1; });
    const topEvents = Object.keys(eventCounts).map(function(k) { return [k, eventCounts[k]]; }).sort(function(a,b) { return b[1]-a[1]; }).slice(0,10);
    const heatEntries = Object.keys(analytics.heatmap).map(function(k) { return [k, analytics.heatmap[k]]; }).sort(function(a,b) { return b[1]-a[1]; }).slice(0,8);
    const maxHeat = Math.max.apply(null, heatEntries.map(function(e) { return e[1]; }).concat([1]));

    el.innerHTML =
      card('Session Stats', statGrid([
        ['Page Views', analytics.pageViews],
        ['Total Clicks', analytics.clicks, '#b4a0ff'],
        ['Keypresses', analytics.keypresses, '#b4a0ff'],
        ['Max Scroll Depth', analytics.scrollDepth + '%', '#4cffb4'],
        ['Session Duration', sessionSec + 's', '#ffd166'],
        ['Events Tracked', analytics.events.length, '#b4a0ff'],
      ])) +
      card('Top Interactions', topEvents.length ?
        topEvents.map(function(item) {
          return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="width:90px;color:#8a7aaa;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item[0] + '</span><div style="flex:1;height:12px;background:rgba(124,106,255,.12);border-radius:6px;overflow:hidden"><div style="height:100%;width:' + (item[1]/topEvents[0][1]*100).toFixed(0) + '%;background:linear-gradient(90deg,#7c6aff,#b04fff);border-radius:6px"></div></div><span style="width:30px;text-align:right;color:#b4a0ff;font-size:12px;font-weight:700">' + item[1] + '</span></div>';
        }).join('') : '<span style="color:#6a5a8a">No events yet.</span>') +
      card('Click Heatmap (top zones)', heatEntries.length ?
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px">' +
        heatEntries.map(function(item) {
          const parts = item[0].split(',');
          return '<div style="background:rgba(124,106,255,.15);border-radius:8px;padding:8px 10px"><div style="font-size:10px;color:#6a5a8a">x:' + parts[0] + ' y:' + parts[1] + '</div><div style="font-size:14px;font-weight:700;color:#b4a0ff">' + item[1] + ' hits</div>' + miniBar(+(item[1]/maxHeat*100).toFixed(0), '#b04fff') + '</div>';
        }).join('') + '</div>' : '<span style="color:#6a5a8a">No click data yet.</span>') +
      card('Recent Events (last 20)',
        '<div style="font-size:11px">' +
        analytics.events.slice(-20).reverse().map(function(e) {
          return '<div style="display:flex;gap:8px;padding:3px 0;border-bottom:1px solid rgba(124,106,255,.07)"><span style="color:#6a5a8a;width:60px;flex-shrink:0">' + elapsed(e.ts) + '</span><span style="color:#8a7aaa;width:80px;flex-shrink:0">' + e.category + '</span><span style="color:#c8b8ee;flex:1">' + e.action + (e.label ? ' · ' + e.label : '') + '</span></div>';
        }).join('') +
        (!analytics.events.length ? '<div style="color:#6a5a8a;padding:10px 0">No events tracked yet.</div>' : '') +
        '</div>');
  }

  function renderDevice(el) {
    const d = getDeviceInfo();
    const conn = d.connection;
    var gpuHTML;
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) throw new Error('no webgl');
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
      const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      gpuHTML = statGrid([
        ['Vendor', vendor || 'N/A'],
        ['Renderer', renderer || 'N/A'],
        ['WebGL Version', gl.getParameter(gl.VERSION) || 'N/A'],
        ['GLSL Version', gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || 'N/A'],
        ['Max Texture', gl.getParameter(gl.MAX_TEXTURE_SIZE) + 'px'],
        ['Max Attribs', gl.getParameter(gl.MAX_VERTEX_ATTRIBS)],
      ]);
    } catch(e) {
      gpuHTML = '<span style="color:#6a5a8a">GPU info unavailable</span>';
    }
    el.innerHTML =
      card('Screen & Viewport', statGrid([
        ['Screen', d.screen.w + '\u00d7' + d.screen.h],
        ['Viewport', d.viewport.w + '\u00d7' + d.viewport.h],
        ['DPR', d.screen.dpr],
        ['Color Depth', d.screen.colorDepth + 'bit'],
        ['Orientation', d.screen.orientation || 'N/A'],
        ['Touch Points', d.maxTouchPoints],
      ])) +
      card('Hardware', statGrid([
        ['CPU Cores', d.hardwareConcurrency || 'N/A'],
        ['Device RAM', d.deviceMemory ? d.deviceMemory + ' GB' : 'N/A'],
        ['Platform', d.platform],
        ['Online', d.onLine ? 'Yes' : 'No', d.onLine ? '#4cffb4' : '#ff6b6b'],
        ['Cookies', d.cookiesEnabled ? 'Yes' : 'No'],
        ['DNT', d.doNotTrack || 'N/A'],
      ])) +
      card('Network Connection', statGrid([
        ['Type', conn.effectiveType || 'N/A'],
        ['Downlink', conn.downlink != null ? conn.downlink + ' Mbps' : 'N/A'],
        ['RTT', conn.rtt != null ? conn.rtt + 'ms' : 'N/A'],
        ['Save Data', conn.saveData ? 'On' : 'Off'],
      ])) +
      card('Locale & Time', statGrid([
        ['Language', d.language],
        ['Languages', d.languages],
        ['Timezone', d.timezone],
        ['Locale', d.locale],
      ])) +
      card('User Agent', '<div style="word-break:break-all;color:#8a7aaa;font-size:11px;line-height:1.6">' + d.userAgent + '</div>') +
      card('GPU (WebGL)', gpuHTML);
  }

  async function renderStorage(el) {
    el.innerHTML = '<div style="color:#6a5a8a;padding:20px;text-align:center">Loading storage info...</div>';
    const info = await getStorageInfo();
    const lsKeys = [];
    try { for (var k in localStorage) { if (localStorage.hasOwnProperty(k)) lsKeys.push([k, localStorage[k]]); } } catch(_) {}
    const ssKeys = [];
    try { for (var k2 in sessionStorage) { if (sessionStorage.hasOwnProperty(k2)) ssKeys.push([k2, sessionStorage[k2]]); } } catch(_) {}
    const cookies = document.cookie.split(';').map(function(c) { return c.trim(); }).filter(Boolean);
    el.innerHTML =
      card('Quota Overview',
        statGrid([
          ['Quota', fmt(info.quota)],
          ['Used', fmt(info.usage)],
          ['Free', fmt(info.quota - info.usage)],
          ['Used %', info.percent != null ? info.percent + '%' : 'N/A', info.percent > 80 ? '#ff6b6b' : '#4cffb4'],
        ]) + (info.percent != null ? miniBar(info.percent, info.percent > 80 ? '#ff6b6b' : '#7c6aff') : '')) +
      card('localStorage (' + lsKeys.length + ' keys, ' + fmt(info.localStorage) + ')',
        lsKeys.length ? '<div style="max-height:160px;overflow-y:auto"><table style="width:100%;font-size:11px;border-collapse:collapse">' + lsKeys.map(function(item) {
          return '<tr style="border-bottom:1px solid rgba(124,106,255,.08)"><td style="padding:3px 8px 3px 0;color:#b4a0ff;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item[0] + '</td><td style="padding:3px 0;color:#8a7aaa;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (item[1].length > 80 ? item[1].slice(0,80)+'...' : item[1]) + '</td><td style="padding:3px 0 3px 8px;text-align:right;color:#6a5a8a">' + fmt(item[1].length * 2) + '</td></tr>';
        }).join('') + '</table></div>' : '<span style="color:#6a5a8a">Empty</span>') +
      card('sessionStorage (' + ssKeys.length + ' keys, ' + fmt(info.sessionStorage) + ')',
        ssKeys.length ? '<div style="max-height:120px;overflow-y:auto"><table style="width:100%;font-size:11px;border-collapse:collapse">' + ssKeys.map(function(item) {
          return '<tr style="border-bottom:1px solid rgba(124,106,255,.08)"><td style="padding:3px 8px 3px 0;color:#b4a0ff;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + item[0] + '</td><td style="padding:3px 0;color:#8a7aaa">' + (item[1].length > 80 ? item[1].slice(0,80)+'...' : item[1]) + '</td></tr>';
        }).join('') + '</table></div>' : '<span style="color:#6a5a8a">Empty</span>') +
      card('Cookies (' + cookies.length + ')',
        cookies.length ? '<div style="max-height:120px;overflow-y:auto">' + cookies.map(function(c) {
          return '<div style="padding:3px 0;border-bottom:1px solid rgba(124,106,255,.08);font-size:11px;color:#8a7aaa;word-break:break-all">' + c + '</div>';
        }).join('') + '</div>' : '<span style="color:#6a5a8a">No cookies</span>');
  }

  setInterval(function() {
    if (devToolsOpen && ['overview','analytics'].indexOf(activeTab) !== -1) {
      activatePanel(activeTab);
    }
  }, 2500);

  const dtResponsiveStyle = document.createElement('style');
  dtResponsiveStyle.textContent = `
    @media (max-width:600px){
      #core-devtools-panel{font-size:11px;}
      #core-devtools-panel table{font-size:10px;}
      #core-devtools-btn{font-size:12px;padding:8px 16px;}
    }
    @media (max-width:400px){
      #core-devtools-panel [style*="grid-template-columns:repeat(auto-fill"]{grid-template-columns:1fr 1fr!important;}
    }
  `;
  document.head.appendChild(dtResponsiveStyle);

  window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;
    document.querySelectorAll('[data-parallax]').forEach(function(el) {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      el.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
    });
  }, { passive: true });

  window.addEventListener('scroll', function() {
    document.querySelectorAll('header, .header, .navbar, nav[data-sticky]').forEach(function(h) {
      h.classList.toggle('scrolled', window.scrollY > 20);
    });
  }, { passive: true });

  document.addEventListener('mousedown', function() { document.body.classList.add('using-mouse'); });
  document.addEventListener('keydown', function() { document.body.classList.remove('using-mouse'); });

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  ROOT.dataset.colorScheme = mq.matches ? 'dark' : 'light';
  mq.addEventListener('change', function(e) { ROOT.dataset.colorScheme = e.matches ? 'dark' : 'light'; });

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(function(entries) {
      entries.forEach(function(entry) {
        const w = entry.contentRect.width;
        entry.target.dataset.width = w < 400 ? 'sm' : w < 768 ? 'md' : 'lg';
      });
    });
    document.querySelectorAll('[data-watch-size]').forEach(function(el) { ro.observe(el); });
  }

  window.Core = {
    version: '1.0.0',
    showToast: showToast,
    openModal: openModal,
    closeModal: closeModal,
    trackEvent: trackEvent,
    registerShortcut: registerShortcut,
    setProgress: setProgress,
    analytics: function() { return window.__coreAnalytics; },
    network: function() { return window.__coreNetworkLog; },
    errors: function() { return window.__coreErrorLog; },
    perf: function() { return window.__corePerfData; },
    device: getDeviceInfo,
    memory: getMemoryInfo,
    cpu: getCPUEstimate,
    storage: getStorageInfo,
  };

  console.info('%cCore JS 1.0.0 initialised', 'color:#7c6aff;font-weight:bold;font-size:13px');

})();