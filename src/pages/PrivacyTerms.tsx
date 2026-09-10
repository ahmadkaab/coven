import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  LockKey,
  FileText,
  Key,
  CheckCircle,
  WarningCircle,
  Trash,
  ArrowSquareOut,
  Info,
  Scales,
} from '@phosphor-icons/react';

type Tab = 'disclosure' | 'privacy' | 'terms';

interface Props {
  defaultTab?: Tab;
}

export function PrivacyTerms({ defaultTab = 'disclosure' }: Props) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [wiped, setWiped] = useState<boolean>(false);

  useEffect(() => {
    if (location.pathname.includes('privacy')) setActiveTab('privacy');
    else if (location.pathname.includes('terms')) setActiveTab('terms');
    else if (location.pathname.includes('disclosure')) setActiveTab('disclosure');
  }, [location.pathname]);

  const handleWipeData = () => {
    if (window.confirm('Wipe all COVEN local keys, saved sessions, and cached data from this browser?')) {
      localStorage.clear();
      sessionStorage.clear();
      setWiped(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  };

  return (
    <main className="page-content">
      <div className="container" style={{ maxWidth: '880px', margin: '0 auto', paddingTop: 'var(--sp-12)', paddingBottom: 'var(--sp-16)' }}>
        
        {/* ── Page Header ────────────────────────────────────────── */}
        <header style={{ textAlign: 'center', marginBottom: 'var(--sp-10)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(230, 25, 25, 0.08)',
              border: '1px solid rgba(230, 25, 25, 0.25)',
              borderRadius: '100px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--crimson)',
              marginBottom: 'var(--sp-4)',
            }}
          >
            <ShieldCheck size={14} weight="bold" />
            GOVERNANCE & TRUST
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: 'var(--chalk)',
              marginBottom: 'var(--sp-4)',
            }}
          >
            SECURITY, DISCLOSURE<br />
            <span style={{ color: 'var(--crimson)' }}>& COMPLIANCE</span>
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--ghost)',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Full transparency on how COVEN interacts with Torn City's API, protects player privacy, and enforces zero-risk authentication.
          </p>
        </header>

        {/* ── Tab Selector ───────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: 'var(--sp-8)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setActiveTab('disclosure')}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              background: activeTab === 'disclosure' ? 'rgba(230, 25, 25, 0.15)' : 'transparent',
              border: activeTab === 'disclosure' ? '1px solid rgba(230, 25, 25, 0.4)' : '1px solid transparent',
              color: activeTab === 'disclosure' ? 'var(--chalk)' : 'var(--ghost)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Key size={14} weight="bold" color={activeTab === 'disclosure' ? '#e61919' : 'inherit'} />
            Torn API Disclosure
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              background: activeTab === 'privacy' ? 'rgba(230, 25, 25, 0.15)' : 'transparent',
              border: activeTab === 'privacy' ? '1px solid rgba(230, 25, 25, 0.4)' : '1px solid transparent',
              color: activeTab === 'privacy' ? 'var(--chalk)' : 'var(--ghost)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <LockKey size={14} weight="bold" color={activeTab === 'privacy' ? '#e61919' : 'inherit'} />
            Privacy Policy
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              background: activeTab === 'terms' ? 'rgba(230, 25, 25, 0.15)' : 'transparent',
              border: activeTab === 'terms' ? '1px solid rgba(230, 25, 25, 0.4)' : '1px solid transparent',
              color: activeTab === 'terms' ? 'var(--chalk)' : 'var(--ghost)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.04em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Scales size={14} weight="bold" color={activeTab === 'terms' ? '#e61919' : 'inherit'} />
            Terms of Service
          </button>
        </div>

        {/* ── TAB 1: TORN API DISCLOSURE ─────────────────────────── */}
        {activeTab === 'disclosure' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
            
            {/* Disclaimer Box */}
            <div
              className="card-industrial"
              style={{
                borderLeft: '4px solid #f59e0b',
                padding: '20px 24px',
                background: 'rgba(245, 158, 11, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <WarningCircle size={18} color="#f59e0b" weight="fill" />
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase' }}>
                  Official Community Project Disclaimer
                </h3>
              </div>
              <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ghost)', lineHeight: 1.65 }}>
                COVEN is an independent, community-created marketplace for Torn City digital graphic art and signatures. 
                COVEN is <strong>not affiliated with, endorsed by, or operated by Chedburn Networks Ltd. or Torn City</strong>. 
                COVEN operates strictly within the official Torn City API guidelines and developer terms of service.
              </p>
            </div>

            {/* Permissions Breakdown */}
            <div className="card-industrial" style={{ padding: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--chalk)', textTransform: 'uppercase', marginBottom: '16px' }}>
                Requested API Key Permissions: <span style={{ color: 'var(--crimson)' }}>user=basic,profile,log</span>
              </h2>

              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ghost)', lineHeight: 1.65, marginBottom: '20px' }}>
                When creating your COVEN key on Torn City, you configure a scoped <strong>Custom Key</strong>. Here is the exact list of what each permission does and why it is required:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', borderLeft: '3px solid #10B981' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>
                      1. basic
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ghost)' }}>
                      [ Identity Resolution ]
                    </span>
                  </div>
                  <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ghost)', lineHeight: 1.6 }}>
                    Reads your numeric <code>player_id</code> and <code>name</code>. Eliminates the need to manually enter your player ID and prevents identity spoofing.
                  </p>
                </div>

                <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', borderLeft: '3px solid #818CF8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#818CF8', fontWeight: 700 }}>
                      2. profile
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ghost)' }}>
                      [ Reputation & Syndicates ]
                    </span>
                  </div>
                  <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ghost)', lineHeight: 1.6 }}>
                    Reads public display information: your player level, rank title, avatar image URL, and faction affiliation (e.g. Monarch, Natural Selection) to display on your collector dossier and assign faction armory privileges.
                  </p>
                </div>

                <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', borderLeft: '3px solid var(--crimson)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--crimson)', fontWeight: 700 }}>
                      3. log (Log Category #4810 Only)
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ghost)' }}>
                      [ Automated Payment Auditing ]
                    </span>
                  </div>
                  <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ghost)', lineHeight: 1.6 }}>
                    Used exclusively when an artist or seller settles an art transaction. COVEN filters specifically for Torn Log Category <strong>#4810</strong> (<code>received money via send money</code>). It checks whether the buyer sent the exact agreed Torn cash amount within the transaction window. COVEN does not read or parse other personal log categories.
                  </p>
                </div>
              </div>
            </div>

            {/* Zero-Risk Guarantee */}
            <div className="card-industrial" style={{ padding: '24px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <CheckCircle size={22} color="#10B981" weight="fill" />
                <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#fff', textTransform: 'uppercase' }}>
                  What COVEN Can NEVER Access or Touch
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ghost)' }}>
                  <span style={{ color: '#ef4444' }}>✕</span> Battle Stats (Str / Def / Spd / Dex)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ghost)' }}>
                  <span style={{ color: '#ef4444' }}>✕</span> Money on hand or Cayman Bank
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ghost)' }}>
                  <span style={{ color: '#ef4444' }}>✕</span> Personal Inventory or Item Vault
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ghost)' }}>
                  <span style={{ color: '#ef4444' }}>✕</span> Properties, Vaults, or Networth
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ghost)' }}>
                  <span style={{ color: '#ef4444' }}>✕</span> Private Mail or Messages
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ghost)' }}>
                  <span style={{ color: '#ef4444' }}>✕</span> Account Actions or In-Game Moves
                </div>
              </div>
            </div>

            {/* Direct Torn Key Link */}
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <a
                href="https://www.torn.com/preferences.php#tab=api?step=addNewKey&title=COVEN&user=basic,profile,log"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <ArrowSquareOut size={16} weight="bold" />
                Generate Official Scoped Key on Torn.com
              </a>
            </div>

          </div>
        )}

        {/* ── TAB 2: PRIVACY POLICY ──────────────────────────────── */}
        {activeTab === 'privacy' && (
          <div className="card-industrial" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--chalk)', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                Privacy Policy
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ghost)' }}>
                Effective Date: September 2026 • Rev 1.2
              </span>
            </div>

            <section>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', marginBottom: '8px' }}>
                1. Information We Collect
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ghost)', lineHeight: 1.65, margin: 0 }}>
                COVEN only collects public Torn City game data provided via your Torn API key: player ID, display name, level, faction name, and public avatar URL. For artists listing artwork, we store the artwork titles, descriptions, preview images, watermark layers, and transaction settlement logs.
              </p>
            </section>

            <section>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', marginBottom: '8px' }}>
                2. Storage & Encryption
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ghost)', lineHeight: 1.65, margin: 0 }}>
                Your Torn API key is stored in your client browser's local storage to persist your active session. It is never sold, traded, or shared with advertisers or third parties. All network communications between your browser, Supabase, and Torn City's API take place over encrypted TLS 1.3 (HTTPS) connections.
              </p>
            </section>

            <section>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', marginBottom: '8px' }}>
                3. Tracking & Cookies
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ghost)', lineHeight: 1.65, margin: 0 }}>
                COVEN does not use intrusive third-party tracking scripts, advertising trackers, or cross-site behavioral cookies. Local browser storage is strictly utilized for core app functionality: maintaining your login session, notification read states, and client preferences.
              </p>
            </section>

            <section>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', marginBottom: '8px' }}>
                4. Your Right to Data Erasure
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ghost)', lineHeight: 1.65, margin: '0 0 14px 0' }}>
                You can immediately wipe all credentials, cached profiles, and local session tokens from your browser at any time using the utility below:
              </p>

              <button
                onClick={handleWipeData}
                className="btn btn-ghost"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#ef4444',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '8px 16px',
                  borderRadius: '6px',
                }}
              >
                <Trash size={14} weight="bold" />
                {wiped ? 'DATA CLEARED! REDIRECTING...' : 'Wipe All Local Credentials & Storage'}
              </button>
            </section>
          </div>
        )}

        {/* ── TAB 3: TERMS OF SERVICE ────────────────────────────── */}
        {activeTab === 'terms' && (
          <div className="card-industrial" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--chalk)', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
                Terms of Service
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ghost)' }}>
                Effective Date: September 2026 • Rev 1.1
              </span>
            </div>

            <section>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', marginBottom: '8px' }}>
                1. Nature of the Service
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ghost)', lineHeight: 1.65, margin: 0 }}>
                COVEN is an independent digital art marketplace designed exclusively for community graphics, profile banners, faction sigils, forum signatures, and artistic commissions within the fictional universe of Torn City.
              </p>
            </section>

            <section>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', marginBottom: '8px' }}>
                2. In-Game Currency & Payments
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ghost)', lineHeight: 1.65, margin: 0 }}>
                All transactions on COVEN are settled strictly using fictional <strong>Torn City In-Game Cash ($)</strong> sent via Torn's Send Cash wire mechanism. COVEN strictly prohibits real-money trading (RMT). Any attempts to transact using fiat currency or out-of-game assets will result in immediate termination of access.
              </p>
            </section>

            <section>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', marginBottom: '8px' }}>
                3. Intellectual Property & Proof of Provenance
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ghost)', lineHeight: 1.65, margin: 0 }}>
                Artists retain original moral copyright over their creative works. Upon successful verified payment, buyers receive exclusive digital ownership of the edition and the unwatermarked clean master deliverable for use on Torn City player profiles, forum threads, and faction armories. Plagiarism, copyright theft, or selling another creator's art without authorization is strictly banned.
              </p>
            </section>

            <section>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', marginBottom: '8px' }}>
                4. User Conduct
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ghost)', lineHeight: 1.65, margin: 0 }}>
                Users agree not to harass artists, upload malicious files, attempt to circumvent transaction log verification, or exploit the platform. All syndicate interactions, dispatches, and forum cards must adhere to general community decency standards.
              </p>
            </section>
          </div>
        )}

      </div>
    </main>
  );
}
