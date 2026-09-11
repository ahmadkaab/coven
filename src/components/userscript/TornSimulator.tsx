import { useState } from 'react';
import {
  UserCircle,
  ChatCircleText,
  CurrencyDollar,
  Lightning,
  Eye,
  CheckCircle,
  Sparkle,
  ArrowSquareOut,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Gavel,
  Clock,
} from '@phosphor-icons/react';

type TabType = 'profile' | 'forum' | 'sendcash';

export function TornSimulator() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [scriptActive, setScriptActive] = useState<boolean>(true);
  const [watermark, setWatermark] = useState<boolean>(true);
  const [currentBid, setCurrentBid] = useState<number>(3850000);
  const [bidToast, setBidToast] = useState<string | null>(null);
  const [autofilled, setAutofilled] = useState<boolean>(false);
  const [hudOpen, setHudOpen] = useState<boolean>(true);

  // Send cash fields
  const [cashPlayerId, setCashPlayerId] = useState<string>('');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [cashMessage, setCashMessage] = useState<string>('');

  const handleAutoFill = () => {
    setCashPlayerId('4295891');
    setCashAmount('5,000,000');
    setCashMessage('COVEN: NEON SYNDICATE PROTOCOL - Log #4810-7782');
    setAutofilled(true);
  };

  const handleResetCash = () => {
    setCashPlayerId('');
    setCashAmount('');
    setCashMessage('');
    setAutofilled(false);
  };

  const handlePlaceBid = () => {
    const nextBid = currentBid + 250000;
    setCurrentBid(nextBid);
    setBidToast(`BID ACCEPTED: $${(nextBid / 1000000).toFixed(2)}M TORN CASH`);
    setTimeout(() => setBidToast(null), 3000);
  };

  return (
    <div
      style={{
        background: '#0d0f12',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(230, 25, 25, 0.08)',
        marginBottom: 'var(--sp-12)',
      }}
    >
      {/* ── Control Bar / Simulation Header ───────────────────────── */}
      <div
        style={{
          background: '#16191f',
          padding: '12px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* Left: Simulation Title & Fake Browser Address */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
          </div>

          <div
            style={{
              background: '#0a0b0e',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '4px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--ghost)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              letterSpacing: '0.02em',
            }}
          >
            <span style={{ color: '#10B981' }}>🔒</span>
            <span style={{ color: '#fff' }}>https://www.torn.com</span>
            <span style={{ color: '#666' }}>
              {activeTab === 'profile' && '/profiles.php?XID=4295891'}
              {activeTab === 'forum' && '/forums.php#!p=forums&f=23&b=0&a=899214'}
              {activeTab === 'sendcash' && '/sendcash.php'}
            </span>
          </div>
        </div>

        {/* Right: Interactive Script Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => setScriptActive(!scriptActive)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: scriptActive ? 'rgba(230, 25, 25, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: scriptActive ? '1px solid rgba(230, 25, 25, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: scriptActive ? '#fff' : 'var(--ghost)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Toggle simulated COVEN UserScript injection"
          >
            {scriptActive ? (
              <>
                <ToggleRight size={18} color="#e61919" weight="fill" />
                <span>COVEN SCRIPT: <strong style={{ color: '#e61919' }}>ACTIVE</strong></span>
              </>
            ) : (
              <>
                <ToggleLeft size={18} color="#888" />
                <span>COVEN SCRIPT: <strong style={{ color: '#888' }}>OFF (VANILLA TORN)</strong></span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Tab Selector ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          background: '#12141a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            flex: 1,
            minWidth: '170px',
            padding: '12px 16px',
            background: activeTab === 'profile' ? '#181b22' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'profile' ? '2px solid #e61919' : '2px solid transparent',
            color: activeTab === 'profile' ? '#fff' : 'var(--ghost)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <UserCircle size={16} weight={activeTab === 'profile' ? 'fill' : 'regular'} color={activeTab === 'profile' ? '#e61919' : 'inherit'} />
          1. Player Profile
        </button>

        <button
          onClick={() => setActiveTab('forum')}
          style={{
            flex: 1,
            minWidth: '170px',
            padding: '12px 16px',
            background: activeTab === 'forum' ? '#181b22' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'forum' ? '2px solid #818CF8' : '2px solid transparent',
            color: activeTab === 'forum' ? '#fff' : 'var(--ghost)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <ChatCircleText size={16} weight={activeTab === 'forum' ? 'fill' : 'regular'} color={activeTab === 'forum' ? '#818CF8' : 'inherit'} />
          2. Art Forum Cards
        </button>

        <button
          onClick={() => setActiveTab('sendcash')}
          style={{
            flex: 1,
            minWidth: '170px',
            padding: '12px 16px',
            background: activeTab === 'sendcash' ? '#181b22' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'sendcash' ? '2px solid #10B981' : '2px solid transparent',
            color: activeTab === 'sendcash' ? '#fff' : 'var(--ghost)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <CurrencyDollar size={16} weight={activeTab === 'sendcash' ? 'fill' : 'regular'} color={activeTab === 'sendcash' ? '#10B981' : 'inherit'} />
          3. Send Cash Assistant
        </button>
      </div>

      {/* ── Simulated Torn City Canvas ────────────────────────────── */}
      <div style={{ padding: '24px', position: 'relative', minHeight: '440px' }}>

        {/* ── TAB 1: PLAYER PROFILE ───────────────────────────────── */}
        {activeTab === 'profile' && (
          <div>
            {/* Torn Standard Profile Header Banner */}
            <div
              style={{
                background: '#24262b',
                borderRadius: '8px 8px 0 0',
                padding: '16px 20px',
                border: '1px solid #383a42',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Torn Avatar */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #374151, #1f2937)',
                    border: '2px solid #4b5563',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80"
                    alt="ahmad_kaab"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Status dot */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '3px',
                      right: '3px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '2px solid #24262b',
                    }}
                    title="Online"
                  />
                </div>

                {/* Torn Name & Level */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2
                      style={{
                        margin: 0,
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.2rem',
                        color: '#f3f4f6',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      ahmad_kaab
                    </h2>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: '#9ca3af',
                        background: '#1f2937',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      [4295891]
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#10B981', fontWeight: 600 }}>
                      Level 72
                    </span>
                    <span style={{ color: '#4b5563' }}>•</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#d1d5db' }}>
                      Faction: <strong style={{ color: '#f59e0b' }}>Monarch</strong>
                    </span>
                    <span style={{ color: '#4b5563' }}>•</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9ca3af' }}>
                      Rank: #14 Underboss
                    </span>
                  </div>
                </div>
              </div>

              {/* Torn Profile Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    background: '#374151',
                    color: '#e5e7eb',
                    border: '1px solid #4b5563',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    cursor: 'pointer',
                  }}
                >
                  Send Message
                </button>
                <button
                  style={{
                    background: '#10B981',
                    color: '#064e3b',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Send Cash
                </button>
              </div>
            </div>

            {/* Simulated Torn Profile Content Box */}
            <div
              style={{
                background: '#1c1e23',
                padding: '20px',
                border: '1px solid #2f323a',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
              }}
            >
              {/* ── COVEN INJECTED PROFILE WIDGET ── */}
              {scriptActive ? (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(20, 10, 10, 0.95), rgba(12, 12, 16, 0.98))',
                    border: '1px solid rgba(230, 25, 25, 0.35)',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    marginBottom: '16px',
                    boxShadow: '0 0 25px rgba(230, 25, 25, 0.12)',
                    position: 'relative',
                    animation: 'fadeIn 0.3s ease-out',
                  }}
                >
                  {/* Script Tag */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.55rem',
                      letterSpacing: '0.1em',
                      color: 'var(--crimson)',
                      background: 'rgba(230, 25, 25, 0.12)',
                      padding: '2px 8px',
                      borderRadius: '100px',
                      border: '1px solid rgba(230, 25, 25, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Lightning size={10} weight="fill" />
                    COVEN INJECTION ACTIVE
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        background: 'var(--crimson)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                      }}
                    >
                      C
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.85rem',
                        color: 'var(--chalk)',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                      }}
                    >
                      COVEN VERIFIED SYNDICATE ARTIST
                    </span>
                    <span
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#10B981',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.55rem',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        fontWeight: 700,
                      }}
                    >
                      MASTER TIER
                    </span>
                  </div>

                  {/* Telemetry Metrics */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '10px',
                      marginTop: '12px',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '4px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ghost)' }}>
                        TOTAL SALES VOLUME
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#10B981' }}>
                        $24.50M
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '4px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ghost)' }}>
                        PROVENANCE DELIVERIES
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#818CF8' }}>
                        19 Masters
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '4px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ghost)' }}>
                        SPECIALTY
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: '#f59e0b' }}>
                        Cyber-Noir & Holographic
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <a
                      href="/commissions/new"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: 'linear-gradient(135deg, #e61919, #b91414)',
                        color: '#fff',
                        textDecoration: 'none',
                        padding: '6px 14px',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.04em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 700,
                      }}
                    >
                      <Sparkle size={12} weight="fill" />
                      Commission ahmad_kaab
                    </a>

                    <a
                      href="/artists/ahmad_kaab"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--chalk)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textDecoration: 'none',
                        padding: '6px 14px',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.04em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <ArrowSquareOut size={12} />
                      Inspect COVEN Dossier
                    </a>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '16px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: '#666',
                  }}
                >
                  [ Vanilla Torn City Profile: No COVEN script installed. Player art credentials and trade history invisible. ]
                </div>
              )}

              {/* Standard Torn Biography snippet */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9ca3af', lineHeight: 1.6 }}>
                <strong style={{ color: '#d1d5db' }}>Signature:</strong> Official visual architect for Monarch syndicate. For custom forum signatures, faction war banners, and profile layouts, check my gallery. Open for high-stakes commissions.
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: FORUM POST ART CARD ─────────────────────────── */}
        {activeTab === 'forum' && (
          <div>
            <div
              style={{
                background: '#24262b',
                borderRadius: '8px 8px 0 0',
                padding: '12px 18px',
                border: '1px solid #383a42',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#9ca3af' }}>
                  Graphic & Art Design &gt; Art Auctions
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#f3f4f6' }}>
                  [AUCTION] NEON SYNDICATE PROTOCOL — Edition 1/1 Master
                </h3>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#6b7280' }}>
                Post #899214
              </span>
            </div>

            <div
              style={{
                background: '#1c1e23',
                padding: '20px',
                border: '1px solid #2f323a',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
              }}
            >
              {/* Author bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: '#374151',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                    alt="ahmad_kaab"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#f3f4f6', fontWeight: 600 }}>
                    ahmad_kaab
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#6b7280', marginLeft: '8px' }}>
                    14 minutes ago
                  </span>
                </div>
              </div>

              {/* Forum post body */}
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#d1d5db', lineHeight: 1.6, margin: '0 0 14px 0' }}>
                Dropping my newest bespoke 1/1 masterwork for the underworld collectors. Verified cryptographic provenance seal included. Check live auction status below:
              </p>

              {/* ── SCRIPT INJECTION: TRANSFORM LINK INTO RICH CARD ── */}
              {scriptActive ? (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 18, 26, 0.95), rgba(10, 10, 14, 0.98))',
                    border: '1px solid rgba(129, 140, 248, 0.35)',
                    borderRadius: '8px',
                    padding: '16px',
                    maxWidth: '560px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(129, 140, 248, 0.1)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.55rem',
                      letterSpacing: '0.08em',
                      color: '#818CF8',
                      background: 'rgba(129, 140, 248, 0.12)',
                      padding: '2px 8px',
                      borderRadius: '100px',
                      border: '1px solid rgba(129, 140, 248, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Eye size={10} weight="fill" />
                    COVEN FORUM CARD TRANSFORM
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Artwork Preview with Watermark Toggle */}
                    <div style={{ position: 'relative', width: '150px', height: '150px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"
                        alt="NEON SYNDICATE PROTOCOL"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {watermark && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.8rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            transform: 'rotate(-25deg)',
                            pointerEvents: 'none',
                          }}
                        >
                          COVEN PREVIEW
                        </div>
                      )}
                      <button
                        onClick={() => setWatermark(!watermark)}
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          left: 4,
                          right: 4,
                          background: 'rgba(0, 0, 0, 0.8)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '0.55rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        {watermark ? 'Hide Watermark' : 'Show Watermark'}
                      </button>
                    </div>

                    {/* Card Content & Bidding */}
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#818CF8', letterSpacing: '0.05em' }}>
                        COVEN LIVE AUCTION BLOCK
                      </div>
                      <h4
                        style={{
                          margin: '2px 0 6px 0',
                          fontFamily: 'var(--font-display)',
                          fontSize: '1rem',
                          color: '#fff',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        NEON SYNDICATE PROTOCOL
                      </h4>

                      <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ghost)' }}>
                            CURRENT HIGH BID
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#10B981' }}>
                            ${(currentBid / 1000000).toFixed(2)}M
                          </div>
                        </div>

                        <div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--ghost)' }}>
                            CLOSING IN
                          </div>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.8rem',
                              color: '#f59e0b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '3px',
                            }}
                          >
                            <Clock size={12} weight="bold" />
                            02h : 18m : 44s
                          </div>
                        </div>
                      </div>

                      {/* Interactive Bid Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={handlePlaceBid}
                          style={{
                            background: 'linear-gradient(135deg, #818CF8, #6366F1)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 14px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <Gavel size={12} weight="fill" />
                          Place Next Bid (+250k)
                        </button>

                        <a
                          href="/auctions"
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--chalk)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <ArrowSquareOut size={12} />
                          Full Page
                        </a>
                      </div>

                      {bidToast && (
                        <div
                          style={{
                            marginTop: '8px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6rem',
                            color: '#10B981',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <CheckCircle size={12} weight="fill" />
                          {bidToast}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#16181d',
                    borderRadius: '4px',
                    border: '1px solid #2a2d35',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.7rem',
                    color: '#60a5fa',
                    textDecoration: 'underline',
                  }}
                >
                  https://coven.torn.city/artwork/art-01
                  <span style={{ color: '#6b7280', textDecoration: 'none', marginLeft: '10px', fontSize: '0.6rem' }}>
                    [ Plain URL: Userscript OFF ]
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: SEND CASH TRANSFER HELPER ────────────────────── */}
        {activeTab === 'sendcash' && (
          <div>
            <div
              style={{
                background: '#24262b',
                borderRadius: '8px 8px 0 0',
                padding: '14px 18px',
                border: '1px solid #383a42',
              }}
            >
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#f3f4f6' }}>
                Torn City — Send Cash Wire
              </h3>
            </div>

            <div
              style={{
                background: '#1c1e23',
                padding: '20px',
                border: '1px solid #2f323a',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
              }}
            >
              {/* ── SCRIPT INJECTION: PAYMENT ASSISTANT BANNER ── */}
              {scriptActive ? (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.25), rgba(12, 20, 16, 0.95))',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#10B981" weight="fill" />
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.85rem',
                          color: '#fff',
                          textTransform: 'uppercase',
                        }}
                      >
                        COVEN ART PAYMENT DETECTED
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.55rem',
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#10B981',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        SECURE LOG VERIFICATION
                      </span>
                    </div>

                    <p
                      style={{
                        margin: '6px 0 0 0',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: 'var(--ghost)',
                      }}
                    >
                      Target: <strong style={{ color: '#fff' }}>ahmad_kaab [4295891]</strong> • Amount: <strong style={{ color: '#10B981' }}>$5,000,000</strong> • Ref: <strong style={{ color: '#818CF8' }}>Log #4810-7782</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleAutoFill}
                      style={{
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: '#064e3b',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Lightning size={14} weight="fill" />
                      1-Click Auto-Fill
                    </button>

                    {autofilled && (
                      <button
                        onClick={handleResetCash}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: 'var(--ghost)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          cursor: 'pointer',
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    color: '#666',
                    textAlign: 'center',
                  }}
                >
                  [ Vanilla Torn Cash Wire: Player must manually copy-paste recipient ID and log notes, risking transfer errors. ]
                </div>
              )}

              {/* Simulated Torn Send Cash Form Inputs */}
              <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9ca3af', marginBottom: '6px' }}>
                    RECIPIENT PLAYER ID
                  </label>
                  <input
                    type="text"
                    value={cashPlayerId}
                    onChange={(e) => setCashPlayerId(e.target.value)}
                    placeholder="Enter Player ID e.g. 4295891"
                    style={{
                      width: '100%',
                      background: '#12141a',
                      border: autofilled ? '1px solid #10B981' : '1px solid #374151',
                      borderRadius: '4px',
                      padding: '10px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: autofilled ? '#10B981' : '#fff',
                      outline: 'none',
                      transition: 'all 0.3s',
                    }}
                  />
                  {autofilled && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#10B981', marginTop: '4px', display: 'inline-block' }}>
                      ✓ Verified: ahmad_kaab (Platform Sovereign & Master Artist)
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9ca3af', marginBottom: '6px' }}>
                    AMOUNT ($ TORN CASH)
                  </label>
                  <input
                    type="text"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="e.g. 5000000"
                    style={{
                      width: '100%',
                      background: '#12141a',
                      border: autofilled ? '1px solid #10B981' : '1px solid #374151',
                      borderRadius: '4px',
                      padding: '10px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: autofilled ? '#10B981' : '#fff',
                      outline: 'none',
                      transition: 'all 0.3s',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#9ca3af', marginBottom: '6px' }}>
                    MESSAGE / LOG REFERENCE
                  </label>
                  <input
                    type="text"
                    value={cashMessage}
                    onChange={(e) => setCashMessage(e.target.value)}
                    placeholder="Optional message"
                    style={{
                      width: '100%',
                      background: '#12141a',
                      border: autofilled ? '1px solid #10B981' : '1px solid #374151',
                      borderRadius: '4px',
                      padding: '10px 12px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: autofilled ? '#10B981' : '#fff',
                      outline: 'none',
                      transition: 'all 0.3s',
                    }}
                  />
                </div>

                <div style={{ marginTop: '8px' }}>
                  <button
                    style={{
                      background: '#10B981',
                      color: '#064e3b',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '10px 20px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                    }}
                  >
                    SEND WIRE TRANSFER
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FLOATING UNDERWORLD HUD DOCK (SIMULATED) ─────────────── */}
        {scriptActive && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '18px',
              zIndex: 10,
            }}
          >
            {hudOpen ? (
              <div
                style={{
                  background: 'rgba(10, 10, 15, 0.96)',
                  border: '1px solid rgba(230, 25, 25, 0.4)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.9), 0 0 15px rgba(230, 25, 25, 0.2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                  <span style={{ color: 'var(--chalk)', fontWeight: 700 }}>COVEN RADAR:</span>
                </div>
                <span style={{ color: '#9ca3af' }}>Auctions: <strong style={{ color: '#fff' }}>2 Active</strong></span>
                <span style={{ color: '#9ca3af' }}>Vault: <strong style={{ color: '#10B981' }}>Secure</strong></span>
                <span style={{ color: '#9ca3af' }}>Wire: <strong style={{ color: '#818CF8' }}>0 Unread</strong></span>

                <button
                  onClick={() => setHudOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--ghost)',
                    cursor: 'pointer',
                    fontSize: '0.65rem',
                    padding: '0 2px',
                  }}
                  title="Minimize simulated HUD"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setHudOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #e61919, #991b1b)',
                  color: '#fff',
                  border: '1px solid rgba(230, 25, 25, 0.5)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Lightning size={12} weight="fill" />
                OPEN COVEN HUD
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
