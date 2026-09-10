import { useState } from 'react';
import {
  Code,
  DownloadSimple,
  ShieldCheck,
  Lightning,
  CurrencyDollar,
  Eye,
  Broadcast,
  ArrowSquareOut,
  CheckCircle,
  Copy,
  UserCircle,
} from '@phosphor-icons/react';
import { TornSimulator } from '../components/userscript/TornSimulator';

const FEATURES = [
  {
    icon: <UserCircle size={28} weight="duotone" />,
    title: 'In-Game Profile Badges',
    description:
      'When visiting a COVEN-registered player on Torn, a cyber-noir widget displays their Syndicate Title, verified tier, sales history, and avatar frame — with 1-click links to commission or inspect their vault.',
    color: '#e61919',
  },
  {
    icon: <Eye size={28} weight="duotone" />,
    title: 'Interactive Forum Art Cards',
    description:
      'COVEN artwork links posted in Torn\'s Graphic & Art Design forums auto-transform into rich preview cards with watermark previews, real-time bid amounts, countdown timers, and jump-to-auction buttons.',
    color: '#818CF8',
  },
  {
    icon: <CurrencyDollar size={28} weight="duotone" />,
    title: '1-Click Cash Transfer Assistant',
    description:
      'When sending payment for a COVEN purchase, the script pre-fills Torn\'s Send Cash form with the recipient\'s Player ID, exact dollar amount, and the verification reference note — zero typo risk.',
    color: '#10B981',
  },
  {
    icon: <Broadcast size={28} weight="duotone" />,
    title: 'Floating Underworld HUD',
    description:
      'A persistent dock on every Torn page shows live COVEN alerts: outbid warnings, vault breach attempts, sale confirmations, and commission milestone updates — all without leaving Torn.',
    color: '#f59e0b',
  },
];

const INSTALL_STEPS = [
  {
    step: 1,
    title: 'Install Tampermonkey',
    description: 'Get the Tampermonkey browser extension from the Chrome Web Store, Firefox Add-ons, or your preferred browser\'s extension marketplace.',
    linkText: 'Chrome Web Store →',
    linkUrl: 'https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo',
  },
  {
    step: 2,
    title: 'Install COVEN Script',
    description: 'Click the install button below. Tampermonkey will automatically detect the .user.js file and present its native 1-click install prompt.',
    linkText: null,
    linkUrl: null,
  },
  {
    step: 3,
    title: 'Visit Torn City',
    description: 'Navigate to any player profile, forum thread, or the Send Cash page. COVEN widgets will automatically appear wherever relevant.',
    linkText: 'Open Torn City →',
    linkUrl: 'https://www.torn.com/',
  },
];

export function UserScriptInstall() {
  const [copied, setCopied] = useState(false);
  const installUrl = `${window.location.origin}/userscript/coven.user.js`;

  const handleCopy = () => {
    navigator.clipboard.writeText(installUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <main className="page-content">
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* ── Hero ──────────────────────────────────────────────── */}
        <header style={{ textAlign: 'center', paddingTop: 'var(--sp-16)', paddingBottom: 'var(--sp-10)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 16px',
              background: 'rgba(230, 25, 25, 0.08)',
              border: '1px solid rgba(230, 25, 25, 0.2)',
              borderRadius: '100px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--crimson)',
              marginBottom: 'var(--sp-6)',
            }}
          >
            <Code size={14} weight="bold" />
            TAMPERMONKEY USERSCRIPT
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
              color: 'var(--chalk)',
              marginBottom: 'var(--sp-4)',
            }}
          >
            BRING COVEN<br />
            <span style={{ color: 'var(--crimson)' }}>INTO TORN CITY</span>
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--ghost)',
              maxWidth: '540px',
              margin: '0 auto',
              lineHeight: 1.7,
              letterSpacing: '0.02em',
            }}
          >
            One script. Four superpowers. Inject COVEN artist badges, live auction cards, 
            payment auto-fill, and real-time underworld alerts directly into every Torn City page.
          </p>
        </header>

        {/* ── Feature Grid ─────────────────────────────────────── */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--sp-4)',
            marginBottom: 'var(--sp-12)',
          }}
        >
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className="card-industrial"
              style={{
                padding: '20px',
                borderLeft: `3px solid ${feat.color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: `${feat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: feat.color,
                }}
              >
                {feat.icon}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.9rem',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  color: 'var(--chalk)',
                  margin: 0,
                }}
              >
                {feat.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--ghost)',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {feat.description}
              </p>
            </div>
          ))}
        </section>

        {/* ── Interactive In-Game Simulator ──────────────────────── */}
        <section style={{ marginBottom: 'var(--sp-12)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 14px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '100px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#10B981',
                marginBottom: 'var(--sp-3)',
              }}
            >
              <Lightning size={12} weight="fill" />
              NO TAMPERMONKEY NEEDED TO TEST
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.6rem',
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: 'var(--chalk)',
                margin: '0 0 6px 0',
              }}
            >
              Interactive In-Game Simulator
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--ghost)',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              Test the COVEN UserScript live inside a simulated Torn City interface. Toggle the script switch to compare vanilla Torn vs COVEN-enhanced Torn in real-time.
            </p>
          </div>

          <TornSimulator />
        </section>

        {/* ── Install Steps ────────────────────────────────────── */}
        <section style={{ marginBottom: 'var(--sp-12)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
              color: 'var(--chalk)',
              marginBottom: 'var(--sp-6)',
              textAlign: 'center',
            }}
          >
            3-Step Install
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {INSTALL_STEPS.map((s) => (
              <div
                key={s.step}
                className="card-industrial"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start',
                }}
              >
                {/* Step Number */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: s.step === 2
                      ? 'linear-gradient(135deg, #e61919, #b91414)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: s.step === 2
                      ? '1px solid rgba(230, 25, 25, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                    color: s.step === 2 ? '#fff' : 'var(--ghost)',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {s.step}
                </div>

                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9rem',
                      letterSpacing: '-0.01em',
                      textTransform: 'uppercase',
                      color: 'var(--chalk)',
                      margin: '0 0 4px 0',
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      color: 'var(--ghost)',
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {s.description}
                  </p>

                  {/* Step 2 — Install Button */}
                  {s.step === 2 && (
                    <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                      <a
                        href={installUrl}
                        className="btn btn-industrial"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'linear-gradient(135deg, #e61919, #b91414)',
                          color: '#fff',
                          border: '1px solid rgba(230, 25, 25, 0.4)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.7rem',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          transition: 'all 0.2s',
                        }}
                      >
                        <DownloadSimple size={16} weight="bold" />
                        Install UserScript
                      </a>
                      <button
                        onClick={handleCopy}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: copied ? '#10B981' : 'var(--ghost)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.625rem',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          padding: '10px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {copied ? <CheckCircle size={14} weight="bold" /> : <Copy size={14} />}
                        {copied ? 'COPIED!' : 'Copy URL'}
                      </button>
                    </div>
                  )}

                  {/* External link */}
                  {s.linkUrl && (
                    <a
                      href={s.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '10px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.625rem',
                        letterSpacing: '0.08em',
                        color: 'var(--crimson)',
                        textDecoration: 'none',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        transition: 'color 0.2s',
                      }}
                    >
                      {s.linkText}
                      <ArrowSquareOut size={12} weight="bold" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Security Assurance ────────────────────────────────── */}
        <section
          className="card-industrial"
          style={{
            padding: '24px 28px',
            borderLeft: '3px solid #10B981',
            marginBottom: 'var(--sp-16)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
              fontFamily: 'var(--font-display)',
              fontSize: '0.9rem',
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              color: '#10B981',
            }}
          >
            <ShieldCheck size={22} weight="duotone" />
            Security & Privacy
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--ghost)',
              lineHeight: 1.65,
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Lightning size={14} weight="bold" style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong style={{ color: 'var(--chalk)' }}>Zero API Key Storage</strong> — The UserScript never stores, transmits, or reads your Torn API key. All enrichment uses public Torn profile XID data.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Lightning size={14} weight="bold" style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong style={{ color: 'var(--chalk)' }}>Read-Only DOM Injection</strong> — The script only adds visual elements to Torn pages. It cannot modify your account, inventory, battle stats, or game state.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Lightning size={14} weight="bold" style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
              <span>
                <strong style={{ color: 'var(--chalk)' }}>Open Source</strong> — The complete script is available for inspection at <code style={{ color: '#818CF8' }}>/userscript/coven.user.js</code>. Audit it before installing.
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
