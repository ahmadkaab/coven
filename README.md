# ⚔️ COVEN — Torn's Independent Art Market

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React%2019-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-UserScript-red?style=flat-square)](https://www.tampermonkey.net/)

> **COVEN** is a production-grade, cyber-noir digital art marketplace engineered specifically for the [Torn City](https://www.torn.com/) ecosystem. It provides real-time auctions, bespoke graphic commission studios, cryptographic provenance verification (SHA-256), syndicate faction armories, and seamless in-game Tampermonkey integration.

---

## ⚡ Core Features

* **Real-Time Auction Block**: Anti-snipe extensions (2-minute resets), live bid increments, and countdown clocks.
* **Bespoke Commission Studios**: Multi-tier graphic proposal pipeline, milestone tracking, and escrow settlement.
* **Automated Log #4810 Verification**: Direct audit of Torn City transaction logs (`received money via send money`) to confirm exact cash wires automatically.
* **Collector Trophy Vault**: Unlocks unwatermarked **Clean Masters** upon verified payment, accompanied by cryptographically signed Certificates of Authenticity.
* **Torn Forum BBCode Exporter**: 1-click generation of official BBCode cards ready for Torn's *Graphic & Art Design* forums.
* **Syndicate Faction Armories**: Dedicated art vaults for top factions (*Monarch, Natural Selection, CRG*) and Ranked War banners.
* **Underworld Accreditations & Titles**: Crime 2.0-inspired vanity titles, animated avatar frames, and milestone reward claiming.
* **Official Tampermonkey UserScript (`coven.user.js`)**:
  * In-game player profile badges displaying artist tiers and sales volume.
  * Auto-transformation of forum links into live bidding cards.
  * 1-click Send Cash transfer assistant pre-filling recipient ID, amount, and reference notes.
  * Persistent Underworld HUD dock with live marketplace alerts.
* **Interactive In-Game Simulator**: Embedded sandbox on `/userscript` allowing zero-install interactive testing.

---

## 🛠️ Architecture & Tech Stack

* **Frontend**: React 19, TypeScript, Vite 8
* **Styling**: Vanilla Cyber-Noir Design Tokens (Glassmorphism, High-Density Telemetry)
* **Icons**: `@phosphor-icons/react`
* **Animations**: `framer-motion`
* **Database & Auth**: Supabase PostgreSQL (PostgREST, Supavisor Connection Pooling)
* **Media & Delivery**: Cloudinary CDN (unsigned presets for watermark generation)
* **External API**: Client-authenticated Torn City API v1/v2

---

## 🚀 Quickstart & Local Development

### Prerequisites
* Node.js 18+
* npm or pnpm

### Setup
```bash
# Clone the repository
git clone https://github.com/ahmadkaab/coven.git
cd coven

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deploy to Vercel

COVEN is pre-configured with [`vercel.json`](./vercel.json) for single-page application rewrites and UserScript MIME type headers:

1. Push to your GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Configure the following environment variables:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public anonymous key |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned preset (`coven_artworks`) |
| `VITE_TORN_API_KEY_PRIMARY` | Read-only Torn API key for fallback telemetry |

4. Click **Deploy**.

---

## 🔒 Security & Torn API Compliance

COVEN operates strictly under official Torn City API guidelines:
* Requires a scoped **Custom Key** (`user=basic,profile,log`).
* **Zero Access Guarantee**: Never accesses battle stats, money on hand, inventory, properties, or private messages.
* **Local Storage Only**: API keys remain securely inside the player's browser session.

*Disclaimer: COVEN is an independent community project and is not affiliated with, endorsed by, or operated by Chedburn Networks Ltd. or Torn City.*

---

## 📜 License

MIT License. Designed and engineered for the Torn City creative community.
