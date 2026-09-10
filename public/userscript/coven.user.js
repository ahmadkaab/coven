// ==UserScript==
// @name         COVEN — Torn City Art Market Integration
// @namespace    https://coven.torn.city
// @version      1.0.0
// @description  Injects COVEN artist badges, live art auction cards, cash transfer helpers, and an underworld telemetry HUD into Torn City pages.
// @author       COVEN Development Team
// @match        https://www.torn.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @connect      coven.torn.city
// @connect      localhost
// @icon         https://coven.torn.city/favicon.svg
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ================================================================
     CONFIGURATION
     ================================================================ */
  const COVEN_BASE   = 'https://coven.torn.city';         // Production
  const COVEN_DEV    = 'http://localhost:5173';            // Dev fallback
  const POLL_MS      = 60_000;                             // HUD refresh interval
  const BADGE_VER    = '1.0';

  /* ================================================================
     GLOBAL STYLES — Injected once into Torn pages
     ================================================================ */
  GM_addStyle(`
    /* ── COVEN Badge Widget (Profile Pages) ────────────────────── */
    .coven-profile-widget {
      margin: 12px 0;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(10, 10, 14, 0.95), rgba(18, 18, 24, 0.92));
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-left: 3px solid #e61919;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      color: #e0e0e0;
      position: relative;
      overflow: hidden;
    }
    .coven-profile-widget::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(120deg, transparent 40%, rgba(230, 25, 25, 0.03) 50%, transparent 60%);
      pointer-events: none;
    }
    .coven-widget-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #e61919;
    }
    .coven-widget-header .coven-logo-mark {
      width: 20px;
      height: 20px;
      background: #e61919;
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      flex-shrink: 0;
    }
    .coven-widget-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 16px;
      font-size: 11px;
    }
    .coven-widget-body .coven-label {
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 9px;
    }
    .coven-widget-body .coven-value {
      color: #e0e0e0;
      font-weight: 600;
    }
    .coven-widget-body .coven-title-flair {
      background: linear-gradient(90deg, #e61919, #ff4d4d);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.06em;
    }
    .coven-widget-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }
    .coven-widget-actions a {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px 12px;
      font-size: 10px;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-decoration: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .coven-btn-primary {
      background: linear-gradient(135deg, #e61919, #b91414);
      color: #fff;
      border: 1px solid rgba(230, 25, 25, 0.4);
    }
    .coven-btn-primary:hover {
      background: linear-gradient(135deg, #ff2d2d, #e61919);
      box-shadow: 0 0 16px rgba(230, 25, 25, 0.3);
    }
    .coven-btn-ghost {
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .coven-btn-ghost:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    /* ── Forum Art Card (Forum Threads) ────────────────────────── */
    .coven-forum-card {
      display: inline-flex;
      flex-direction: column;
      max-width: 340px;
      margin: 8px 0;
      background: linear-gradient(180deg, rgba(12, 12, 16, 0.95), rgba(8, 8, 10, 0.98));
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      overflow: hidden;
      font-family: 'Courier New', monospace;
      color: #e0e0e0;
    }
    .coven-forum-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .coven-forum-card-body {
      padding: 12px 14px;
    }
    .coven-forum-card-title {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .coven-forum-card-meta {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.45);
      letter-spacing: 0.06em;
      margin-bottom: 8px;
    }
    .coven-forum-card-bid {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
    }
    .coven-forum-card-bid .bid-amount {
      color: #10B981;
      font-weight: 700;
    }
    .coven-forum-card-bid .bid-timer {
      color: #f59e0b;
      font-size: 10px;
    }
    .coven-forum-card-cta {
      display: block;
      margin-top: 10px;
      padding: 8px;
      text-align: center;
      background: rgba(230, 25, 25, 0.12);
      border: 1px solid rgba(230, 25, 25, 0.25);
      border-radius: 4px;
      color: #e61919;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-decoration: none;
      transition: all 0.2s;
    }
    .coven-forum-card-cta:hover {
      background: rgba(230, 25, 25, 0.25);
      box-shadow: 0 0 12px rgba(230, 25, 25, 0.2);
    }

    /* ── Cash Transfer Helper ──────────────────────────────────── */
    .coven-cash-helper {
      margin: 10px 0;
      padding: 12px 16px;
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.15);
      border-left: 3px solid #10B981;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: #e0e0e0;
    }
    .coven-cash-helper-title {
      font-size: 10px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #10B981;
      margin-bottom: 6px;
    }
    .coven-cash-helper button {
      margin-top: 8px;
      padding: 6px 14px;
      background: linear-gradient(135deg, #10B981, #059669);
      color: #fff;
      border: none;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 10px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s;
    }
    .coven-cash-helper button:hover {
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.3);
    }

    /* ── Floating HUD Dock ─────────────────────────────────────── */
    .coven-hud {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
      font-family: 'Courier New', monospace;
    }
    .coven-hud-toggle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e61919, #b91414);
      border: 2px solid rgba(230, 25, 25, 0.4);
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(230, 25, 25, 0.35);
      transition: all 0.3s;
      position: relative;
    }
    .coven-hud-toggle:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(230, 25, 25, 0.5);
    }
    .coven-hud-toggle .hud-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #f59e0b;
      color: #000;
      font-size: 9px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
    }
    .coven-hud-panel {
      position: absolute;
      bottom: 56px;
      right: 0;
      width: 300px;
      max-height: 380px;
      overflow-y: auto;
      background: linear-gradient(180deg, rgba(14, 14, 18, 0.98), rgba(8, 8, 10, 0.99));
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.8);
      display: none;
      padding: 0;
    }
    .coven-hud-panel.open {
      display: block;
      animation: covenSlideUp 0.25s ease-out;
    }
    @keyframes covenSlideUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .coven-hud-panel-header {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #e61919;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .coven-hud-item {
      padding: 10px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      font-size: 11px;
      color: #ccc;
      display: flex;
      gap: 10px;
      align-items: flex-start;
      transition: background 0.15s;
    }
    .coven-hud-item:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    .coven-hud-item .hud-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
    }
    .coven-hud-item .hud-icon.outbid   { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .coven-hud-item .hud-icon.breach   { background: rgba(239, 68, 68, 0.15);  color: #ef4444; }
    .coven-hud-item .hud-icon.sale     { background: rgba(16, 185, 129, 0.15); color: #10B981; }
    .coven-hud-item .hud-icon.comm     { background: rgba(99, 102, 241, 0.15); color: #818CF8; }
    .coven-hud-item .hud-text {
      flex: 1;
      line-height: 1.4;
    }
    .coven-hud-item .hud-text .hud-time {
      font-size: 9px;
      color: rgba(255, 255, 255, 0.3);
      margin-top: 2px;
    }
    .coven-hud-empty {
      padding: 24px 16px;
      text-align: center;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.3);
      letter-spacing: 0.08em;
    }
    .coven-hud-footer {
      padding: 10px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      text-align: center;
    }
    .coven-hud-footer a {
      font-size: 10px;
      color: #e61919;
      text-decoration: none;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 600;
      transition: color 0.2s;
    }
    .coven-hud-footer a:hover {
      color: #ff4d4d;
    }
  `);

  /* ================================================================
     DEMO DATA — Simulated COVEN state for offline testing
     In production, these would be fetched from coven.torn.city/api
     ================================================================ */
  const DEMO_ARTISTS = {
    '4427813': {
      name: 'bell_queen',
      tier: 'RISING',
      title: '◆ SHADOW ARTISAN ◆',
      frame: 'crimson-wire',
      totalSales: 34,
      avgRating: 4.9,
      verified: true,
      covenUrl: '/artists/62f6b66f-0e4c-450b-881a-51a29664b2f0',
    },
    '2190421': {
      name: 'SINTEX',
      tier: 'MASTER',
      title: '◆ ARCHITECT OF RUIN ◆',
      frame: 'obsidian-lattice',
      totalSales: 127,
      avgRating: 5.0,
      verified: true,
      covenUrl: '/artists/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    },
  };

  const DEMO_ALERTS = [
    { id: 'a1', type: 'outbid',  text: 'You were outbid on "CRIMSON PROTOCOL" — new bid $8.2M', time: '3m ago' },
    { id: 'a2', type: 'sale',    text: 'Your piece "NEON SYNDICATE" sold for $5.0M', time: '18m ago' },
    { id: 'a3', type: 'breach',  text: 'Vault breach attempt on "GHOST SIGNAL" — Shield held', time: '1h ago' },
    { id: 'a4', type: 'comm',    text: 'New commission milestone approved — "War Banner v3"', time: '2h ago' },
  ];

  /* ================================================================
     MODULE 1 — Profile Badge Injection
     Detects player XID on profile pages and injects COVEN widget
     ================================================================ */
  function injectProfileBadge() {
    const match = window.location.href.match(/profiles\.php\?XID=(\d+)/);
    if (!match) return;

    const xid = match[1];
    const artist = DEMO_ARTISTS[xid];
    if (!artist) return;

    // Don't inject twice
    if (document.querySelector('.coven-profile-widget')) return;

    const profileContainer =
      document.querySelector('.profile-wrapper') ||
      document.querySelector('.content-wrapper') ||
      document.querySelector('#profileroot') ||
      document.querySelector('.profile-container');

    if (!profileContainer) return;

    const widget = document.createElement('div');
    widget.className = 'coven-profile-widget';
    widget.innerHTML = `
      <div class="coven-widget-header">
        <div class="coven-logo-mark"></div>
        COVEN VERIFIED ${artist.tier} ARTIST
      </div>
      <div class="coven-widget-body">
        <div>
          <div class="coven-label">Syndicate Title</div>
          <div class="coven-title-flair">${artist.title}</div>
        </div>
        <div>
          <div class="coven-label">Avg Rating</div>
          <div class="coven-value">★ ${artist.avgRating} / 5.0</div>
        </div>
        <div>
          <div class="coven-label">Verified Sales</div>
          <div class="coven-value">${artist.totalSales} pieces</div>
        </div>
        <div>
          <div class="coven-label">Avatar Frame</div>
          <div class="coven-value" style="color: #818CF8">[${artist.frame.toUpperCase()}]</div>
        </div>
      </div>
      <div class="coven-widget-actions">
        <a href="${COVEN_BASE}${artist.covenUrl}" target="_blank" class="coven-btn-primary">
          ◆ Commission on COVEN
        </a>
        <a href="${COVEN_BASE}/collector/${xid}" target="_blank" class="coven-btn-ghost">
          Inspect Vault
        </a>
      </div>
    `;

    // Insert after the first major child or at the beginning
    const firstBlock = profileContainer.querySelector('.profile-right-wrapper, .basic-information');
    if (firstBlock && firstBlock.parentNode) {
      firstBlock.parentNode.insertBefore(widget, firstBlock.nextSibling);
    } else {
      profileContainer.prepend(widget);
    }
  }

  /* ================================================================
     MODULE 2 — Forum Art Card Enhancement
     Scans forum posts for COVEN artwork links and enriches them
     ================================================================ */
  function enhanceForumLinks() {
    if (!window.location.href.includes('/forums.php')) return;

    // Pattern: links to COVEN artwork detail pages
    const covenLinkPattern = /https?:\/\/(coven\.torn\.city|localhost:\d+)\/artwork\/([a-zA-Z0-9-]+)/;

    document.querySelectorAll('.post-content a, .forum-post a, .reply-body a').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const match = href.match(covenLinkPattern);
      if (!match || link.dataset.covenEnhanced) return;

      link.dataset.covenEnhanced = 'true';

      // Build a rich preview card
      const card = document.createElement('div');
      card.className = 'coven-forum-card';
      card.innerHTML = `
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"
             alt="COVEN Artwork Preview" loading="lazy" />
        <div class="coven-forum-card-body">
          <div class="coven-forum-card-title">COVEN ARTWORK</div>
          <div class="coven-forum-card-meta">Verified Listing • ID: ${match[2].slice(0, 8)}…</div>
          <div class="coven-forum-card-bid">
            <span class="bid-amount">$5,000,000</span>
            <span class="bid-timer">⏱ LIVE AUCTION</span>
          </div>
          <a href="${href}" target="_blank" class="coven-forum-card-cta">
            ◆ View on COVEN ◆
          </a>
        </div>
      `;

      // Replace the plain link with the card
      link.parentNode.insertBefore(card, link.nextSibling);
    });
  }

  /* ================================================================
     MODULE 3 — Cash Transfer Helper
     Pre-fills Torn's Send Cash form with COVEN order details
     ================================================================ */
  function injectCashHelper() {
    if (!window.location.href.includes('/sendcash') && !window.location.href.includes('/page.php?sid=sendCash')) return;
    if (document.querySelector('.coven-cash-helper')) return;

    // Check for pending COVEN transfers in local storage
    const pendingRaw = GM_getValue('coven_pending_transfer', null);
    if (!pendingRaw) return;

    let pending;
    try { pending = JSON.parse(pendingRaw); } catch { return; }

    const form = document.querySelector('#sendcash-form, .send-cash-wrap, .content-wrapper');
    if (!form) return;

    const helper = document.createElement('div');
    helper.className = 'coven-cash-helper';
    helper.innerHTML = `
      <div class="coven-cash-helper-title">◆ COVEN Payment Assistant</div>
      <div>
        <strong>Recipient:</strong> ${pending.recipientName} [${pending.recipientId}]<br/>
        <strong>Amount:</strong> $${Number(pending.amount).toLocaleString()}<br/>
        <strong>Reference:</strong> <code>${pending.reference}</code>
      </div>
      <button id="coven-autofill-btn">◆ Auto-Fill Transfer</button>
    `;

    form.prepend(helper);

    document.getElementById('coven-autofill-btn')?.addEventListener('click', () => {
      // Attempt to populate Torn's native inputs
      const playerInput = document.querySelector('input[name="XID"], input[name="to"], #receiver-input');
      const amountInput = document.querySelector('input[name="money"], input[name="amount"]');
      const noteInput   = document.querySelector('input[name="note"], textarea[name="message"]');

      if (playerInput) playerInput.value = pending.recipientId;
      if (amountInput) amountInput.value = pending.amount;
      if (noteInput)   noteInput.value = pending.reference;

      helper.innerHTML = `
        <div class="coven-cash-helper-title" style="color: #10B981">✓ FIELDS AUTO-FILLED</div>
        <div style="color: rgba(255,255,255,0.5); font-size: 10px;">
          Review the values above and confirm the transfer.
        </div>
      `;

      // Clear pending transfer
      GM_setValue('coven_pending_transfer', null);
    });
  }

  /* ================================================================
     MODULE 4 — Floating Underworld Telemetry HUD
     Persistent dock showing COVEN alerts on every Torn page
     ================================================================ */
  function createHUD() {
    if (document.querySelector('.coven-hud')) return;

    const alerts = DEMO_ALERTS; // In production, fetched from COVEN API
    const unread = alerts.length;

    const hud = document.createElement('div');
    hud.className = 'coven-hud';

    const iconMap = { outbid: '⚡', breach: '🛡', sale: '✓', comm: '◆' };

    const alertItems = alerts.length > 0
      ? alerts.map(a => `
          <div class="coven-hud-item">
            <div class="hud-icon ${a.type}">${iconMap[a.type] || '●'}</div>
            <div class="hud-text">
              ${a.text}
              <div class="hud-time">${a.time}</div>
            </div>
          </div>
        `).join('')
      : '<div class="coven-hud-empty">No active alerts. Your vault is secure.</div>';

    hud.innerHTML = `
      <div class="coven-hud-panel" id="coven-hud-panel">
        <div class="coven-hud-panel-header">
          <span style="width: 12px; height: 12px; background: #e61919; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); display: inline-block;"></span>
          COVEN Wire — Live Alerts
        </div>
        ${alertItems}
        <div class="coven-hud-footer">
          <a href="${COVEN_BASE}/notifications" target="_blank">OPEN FULL DASHBOARD →</a>
        </div>
      </div>
      <button class="coven-hud-toggle" id="coven-hud-toggle" title="COVEN Underworld HUD">
        ◆
        ${unread > 0 ? `<span class="hud-badge">${unread}</span>` : ''}
      </button>
    `;

    document.body.appendChild(hud);

    // Toggle panel
    document.getElementById('coven-hud-toggle')?.addEventListener('click', () => {
      const panel = document.getElementById('coven-hud-panel');
      if (panel) panel.classList.toggle('open');
    });

    // Close panel on outside click
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('coven-hud-panel');
      const toggle = document.getElementById('coven-hud-toggle');
      if (panel?.classList.contains('open') && !hud.contains(e.target)) {
        panel.classList.remove('open');
      }
    });
  }

  /* ================================================================
     INITIALIZATION — Run all modules
     ================================================================ */
  function init() {
    // Small delay to let Torn's SPA hydrate
    setTimeout(() => {
      injectProfileBadge();
      enhanceForumLinks();
      injectCashHelper();
      createHUD();
    }, 1500);

    // Re-run on SPA navigation (Torn uses hash/pushState)
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => {
          injectProfileBadge();
          enhanceForumLinks();
          injectCashHelper();
        }, 1200);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  init();
  console.log(`[COVEN] UserScript v${BADGE_VER} initialized on ${location.hostname}`);
})();
