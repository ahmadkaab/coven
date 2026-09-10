import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  CurrencyDollar,
  Sword,
  Users,
  Copy,
  Check,
  ArrowLeft,
  PlusCircle,
  Chats,
  ShareNetwork,
  Clock,
  Flame,
  FileCode,
  Sparkle,
  Eye,
} from '@phosphor-icons/react';
import {
  getFactionById,
  getFactionVaultItems,
  getFactionBounties,
  getTreasuryDonations,
} from '../services/factionService';
import { DonateModal } from '../components/faction/DonateModal';
import { useToast } from '../context/ToastContext';
import type { FactionProfile, FactionVaultItem, FactionBounty, TreasuryDonation } from '../types/faction';

export function FactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [faction, setFaction] = useState<FactionProfile | null>(null);
  const [vaultItems, setVaultItems] = useState<FactionVaultItem[]>([]);
  const [bounties, setBounties] = useState<FactionBounty[]>([]);
  const [donations, setDonations] = useState<TreasuryDonation[]>([]);
  const [activeTab, setActiveTab] = useState<'armory' | 'treasury' | 'bounties' | 'honor'>('armory');
  const [armoryFilter, setArmoryFilter] = useState<'all' | 'war_banner' | 'forum_sig' | 'crest'>('all');

  const [donateOpen, setDonateOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<FactionVaultItem | null>(null);

  const loadData = () => {
    if (!id) return;
    const f = getFactionById(id);
    if (f) {
      setFaction(f);
      setVaultItems(getFactionVaultItems(f.id));
      setBounties(getFactionBounties(f.id));
      setDonations(getTreasuryDonations(f.id));
    }
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener('coven:faction_update', handler);
    return () => window.removeEventListener('coven:faction_update', handler);
  }, [id]);

  const filteredVault = useMemo(() => {
    if (armoryFilter === 'all') return vaultItems;
    return vaultItems.filter((item) => item.type === armoryFilter);
  }, [vaultItems, armoryFilter]);

  const handleCopyBBCode = (item: FactionVaultItem) => {
    navigator.clipboard.writeText(item.bbcode);
    setCopiedCodeId(item.id);
    addToast('Torn Forum BBCode copied to clipboard!', 'success');
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  if (!faction) {
    return (
      <main className="page-content">
        <div className="container" style={{ paddingTop: 'var(--sp-20)', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              color: 'var(--ghost)',
              letterSpacing: '0.15em',
              marginBottom: 'var(--sp-4)',
            }}
          >
            [ FACTION ARMORY NOT FOUND ]
          </div>
          <p style={{ color: 'var(--ghost)', marginBottom: 'var(--sp-6)' }}>
            The requested syndicate armory record does not exist or is locked in deep vault clearance.
          </p>
          <Link to="/factions" className="btn btn-industrial">
            ← Back to Factions Directory
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-content">
      {/* Hero Banner Header */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '260px',
          backgroundImage: `url(${faction.bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: '1px solid var(--wire)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to bottom, rgba(7,8,10,0.4) 0%, rgba(7,8,10,0.85) 75%, var(--void) 100%)`,
          }}
        />

        <div className="container" style={{ position: 'relative', paddingTop: 'var(--sp-6)', paddingBottom: 'var(--sp-6)' }}>
          {/* Breadcrumb */}
          <Link
            to="/factions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--ghost)',
              textDecoration: 'none',
              marginBottom: 'var(--sp-4)',
              letterSpacing: '0.08em',
            }}
          >
            <ArrowLeft size={12} />
            BACK TO FACTIONS DIRECTORY
          </Link>

          {/* Active War Alert Bar */}
          {faction.warStatus && faction.warStatus.status === 'active' && (
            <div
              style={{
                background: 'rgba(225,29,72,0.12)',
                border: '1px solid rgba(225,29,72,0.35)',
                borderRadius: 'var(--r-md)',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: 'var(--sp-4)',
                boxShadow: '0 4px 20px rgba(225,29,72,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--red)',
                    boxShadow: '0 0 10px var(--red)',
                  }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                  RANKED WAR ENGAGEMENT: {faction.tag} vs {faction.warStatus.opponentTag} ({faction.warStatus.opponentName})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: faction.warStatus.leadRespect >= 0 ? 'var(--term-green)' : 'var(--red)',
                  }}
                >
                  LEAD: {faction.warStatus.leadRespect >= 0 ? '+' : ''}{faction.warStatus.leadRespect.toLocaleString()} RESPECT
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--ghost)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Clock size={12} /> {faction.warStatus.timeLeft} REMAINING
                </span>
              </div>
            </div>
          )}

          {/* Faction Profile Identity */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            {/* Crest Emblem */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--r-md)',
                border: `2px solid ${faction.accentColor}`,
                boxShadow: `0 0 25px ${faction.accentColor}55`,
                overflow: 'hidden',
                background: 'var(--pit)',
                flexShrink: 0,
              }}
            >
              <img
                src={faction.crestUrl}
                alt={faction.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Main Info */}
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: faction.accentColor,
                    letterSpacing: '0.12em',
                  }}
                >
                  [{faction.tag}] #{faction.tornFactionId}
                </span>
                <span
                  style={{
                    background: 'var(--pit)',
                    border: '1px solid var(--wire)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    color: 'var(--chalk)',
                    padding: '3px 8px',
                    borderRadius: 'var(--r-sm)',
                  }}
                >
                  RANK #{faction.rank} IN TORN CITY
                </span>
                <span
                  style={{
                    background: 'var(--pit)',
                    border: '1px solid var(--wire)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    color: 'var(--term-green)',
                    padding: '3px 8px',
                    borderRadius: 'var(--r-sm)',
                  }}
                >
                  {(faction.respect / 1_000_000).toFixed(2)}M RESPECT
                </span>
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                  lineHeight: 1.1,
                  margin: '0 0 6px 0',
                  color: 'var(--chalk)',
                  letterSpacing: '0.03em',
                }}
              >
                {faction.name.toUpperCase()}
              </h1>

              <p
                style={{
                  fontStyle: 'italic',
                  fontSize: '0.875rem',
                  color: 'var(--phosphor)',
                  margin: '0 0 10px 0',
                }}
              >
                "{faction.motto}"
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ghost)',
                }}
              >
                <span>
                  LEADER: <strong style={{ color: 'var(--chalk)' }}>{faction.leader.name}</strong> [#{faction.leader.id}]
                </span>
                {faction.coLeader && (
                  <span>
                    CO-LEADER: <strong style={{ color: 'var(--chalk)' }}>{faction.coLeader.name}</strong> [#{faction.coLeader.id}]
                  </span>
                )}
                <span>
                  STRENGTH: <strong style={{ color: 'var(--chalk)' }}>{faction.verifiedMembersCount} SOLDIERS</strong>
                </span>
              </div>
            </div>

            {/* Quick Actions Area */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignSelf: 'flex-start' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setDonateOpen(true)}
                style={{
                  padding: '9px 18px',
                  background: faction.accentColor,
                  borderColor: faction.accentColor,
                  boxShadow: `0 0 16px ${faction.accentColor}44`,
                  color: '#fff',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CurrencyDollar size={16} weight="bold" />
                <span>DONATE TO TREASURY</span>
              </button>

              <Link
                to="/dispatches"
                className="btn btn-ghost"
                style={{
                  padding: '9px 16px',
                  fontSize: '0.6875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                }}
              >
                <Chats size={16} weight="bold" />
                <span>FACTION WIRE</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ paddingTop: 'var(--sp-6)', paddingBottom: 'var(--sp-16)' }}>
        {/* Treasury Highlight Strip */}
        <div
          className="card-industrial"
          style={{
            padding: '18px 24px',
            marginBottom: 'var(--sp-8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--r-md)',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--term-green)',
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.2)',
              }}
            >
              <CurrencyDollar size={24} weight="bold" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)', letterSpacing: '0.12em' }}>
                FACTION ART ESCROW TREASURY
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: '#34d399', textShadow: '0 0 16px rgba(52, 211, 153, 0.25)' }}>
                ${(faction.treasuryBalance / 1_000_000).toFixed(2)}M TORN CASH
              </div>
            </div>
          </div>

          {/* Recent Donor Badge */}
          {donations.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkle size={16} color="#fbbf24" weight="fill" />
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--ghost)' }}>
                LATEST DONATION:{' '}
                <strong style={{ color: 'var(--chalk)' }}>{donations[0].donatorName}</strong> (+$
                {(donations[0].amount / 1_000_000).toFixed(1)}M)
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setDonateOpen(true)}
            className="btn btn-sm btn-ghost"
            style={{
              borderColor: 'rgba(16, 185, 129, 0.5)',
              color: 'var(--term-green)',
              padding: '7px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)',
            }}
          >
            <PlusCircle size={14} weight="bold" />
            <span>CONTRIBUTE FUNDS</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className="collector-tabs-nav"
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--wire)',
            marginBottom: 'var(--sp-6)',
            gap: '8px',
          }}
        >
          <button
            className={`collector-tab-btn ${activeTab === 'armory' ? 'active' : ''}`}
            onClick={() => setActiveTab('armory')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === 'armory' ? faction.accentColor : 'transparent'}`,
              color: activeTab === 'armory' ? 'var(--chalk)' : 'var(--ghost)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Shield size={14} />
            <span>ARMORY & VAULT ({vaultItems.length})</span>
          </button>

          <button
            className={`collector-tab-btn ${activeTab === 'treasury' ? 'active' : ''}`}
            onClick={() => setActiveTab('treasury')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === 'treasury' ? faction.accentColor : 'transparent'}`,
              color: activeTab === 'treasury' ? 'var(--chalk)' : 'var(--ghost)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CurrencyDollar size={14} />
            <span>ART TREASURY & LEDGER ({donations.length})</span>
          </button>

          <button
            className={`collector-tab-btn ${activeTab === 'bounties' ? 'active' : ''}`}
            onClick={() => setActiveTab('bounties')}
            style={{
              padding: '12px 18px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === 'bounties' ? faction.accentColor : 'transparent'}`,
              color: activeTab === 'bounties' ? 'var(--chalk)' : 'var(--ghost)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Flame size={14} />
            <span>WAR ART BOUNTIES ({bounties.length})</span>
          </button>
        </div>

        {/* TAB 1: ARMORY & VAULT */}
        {activeTab === 'armory' && (
          <div>
            {/* Sub Filter */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: 'var(--sp-6)',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={() => setArmoryFilter('all')}
                style={{
                  background: armoryFilter === 'all' ? 'var(--plate)' : 'transparent',
                  color: armoryFilter === 'all' ? 'var(--chalk)' : 'var(--ghost)',
                  border: '1px solid var(--wire)',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                ALL ASSETS ({vaultItems.length})
              </button>
              <button
                onClick={() => setArmoryFilter('war_banner')}
                style={{
                  background: armoryFilter === 'war_banner' ? 'var(--plate)' : 'transparent',
                  color: armoryFilter === 'war_banner' ? 'var(--chalk)' : 'var(--ghost)',
                  border: '1px solid var(--wire)',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                WAR BANNERS (1200×400)
              </button>
              <button
                onClick={() => setArmoryFilter('forum_sig')}
                style={{
                  background: armoryFilter === 'forum_sig' ? 'var(--plate)' : 'transparent',
                  color: armoryFilter === 'forum_sig' ? 'var(--chalk)' : 'var(--ghost)',
                  border: '1px solid var(--wire)',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                FORUM SIGNATURES (400×150)
              </button>
              <button
                onClick={() => setArmoryFilter('crest')}
                style={{
                  background: armoryFilter === 'crest' ? 'var(--plate)' : 'transparent',
                  color: armoryFilter === 'crest' ? 'var(--chalk)' : 'var(--ghost)',
                  border: '1px solid var(--wire)',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                CRESTS & EMBLEMS
              </button>
            </div>

            {/* Grid of Vault Items */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '20px',
              }}
            >
              {filteredVault.map((item) => {
                const isCopied = copiedCodeId === item.id;
                const isBanner = item.type === 'war_banner';
                const isSig = item.type === 'forum_sig';

                return (
                  <div
                    key={item.id}
                    className="card-industrial"
                    style={{
                      background: 'var(--void)',
                      border: '1px solid var(--wire)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Visual Canvas Container */}
                    <div
                      style={{
                        position: 'relative',
                        height: isBanner ? '140px' : isSig ? '100px' : '200px',
                        background: 'var(--pit)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                      onClick={() => setPreviewItem(item)}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: isSig ? 'cover' : 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                      />

                      {/* Dimension pill */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
                          background: 'rgba(7,8,10,0.85)',
                          border: '1px solid var(--wire)',
                          padding: '2px 6px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.5625rem',
                          color: 'var(--ghost)',
                          borderRadius: '2px',
                        }}
                      >
                        {item.dimensions}
                      </div>

                      {/* Animated Badge */}
                      {item.animated && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(16,185,129,0.9)',
                            color: '#fff',
                            padding: '2px 6px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.5625rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            borderRadius: '2px',
                          }}
                        >
                          60FPS ANIMATED
                        </div>
                      )}
                    </div>

                    {/* Meta Section */}
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <h3
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1rem',
                            margin: 0,
                            letterSpacing: '0.02em',
                            color: 'var(--chalk)',
                          }}
                        >
                          {item.title}
                        </h3>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          color: 'var(--ghost)',
                          marginBottom: '14px',
                        }}
                      >
                        <span>
                          COMMISSIONED BY:{' '}
                          <Link
                            to={`/artists/${item.artistId}`}
                            style={{ color: faction.accentColor, textDecoration: 'none', fontWeight: 700 }}
                          >
                            @{item.artistName}
                          </Link>
                        </span>
                        <span style={{ color: 'var(--term-green)', fontWeight: 700 }}>
                          ${(item.commissionValue / 1_000_000).toFixed(1)}M
                        </span>
                      </div>

                      {/* BBCode Preview Box */}
                      <div
                        style={{
                          background: 'var(--pit)',
                          border: '1px solid var(--wire)',
                          padding: '8px 10px',
                          borderRadius: '2px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.625rem',
                          color: 'var(--ghost)',
                          wordBreak: 'break-all',
                          maxHeight: '48px',
                          overflow: 'hidden',
                          marginBottom: '14px',
                          userSelect: 'all',
                        }}
                      >
                        {item.bbcode}
                      </div>

                      {/* Action Row */}
                      <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleCopyBBCode(item)}
                          style={{
                            flex: 1,
                            padding: '7px 12px',
                            fontSize: '0.6875rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: isCopied ? 'rgba(16, 185, 129, 0.2)' : undefined,
                            borderColor: isCopied ? 'var(--term-green)' : undefined,
                            color: isCopied ? 'var(--term-green)' : undefined,
                          }}
                        >
                          {isCopied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
                          <span>{isCopied ? 'COPIED BBCODE!' : 'COPY TORN BBCODE'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="btn btn-sm btn-ghost"
                          style={{
                            padding: '7px 10px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="View High-Res Preview"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: TREASURY & LEDGER */}
        {activeTab === 'treasury' && (
          <div>
            <div style={{ maxWidth: '800px', marginBottom: 'var(--sp-6)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--chalk)', margin: '0 0 8px 0' }}>
                SYNDICATE ART ESCROW LEDGER
              </h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', lineHeight: 1.5 }}>
                Contributions from verified faction members are secured in COVEN smart escrow. Funds cannot be withdrawn
                for non-art purposes and are programmatically released upon artist milestone approval.
              </p>
            </div>

            {/* Ledger Table */}
            <div className="card-industrial" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--wire)', background: 'var(--pit)', color: 'var(--ghost)' }}>
                    <th style={{ padding: '12px 16px' }}>DATE / TIMESTAMP</th>
                    <th style={{ padding: '12px 16px' }}>MEMBER / OPERATIVE</th>
                    <th style={{ padding: '12px 16px' }}>AMOUNT (TORN $)</th>
                    <th style={{ padding: '12px 16px' }}>PLEDGE PURPOSE / MEMO</th>
                    <th style={{ padding: '12px 16px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--wire)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--ghost)' }}>
                        {new Date(d.timestamp).toLocaleDateString()} {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--chalk)' }}>
                        {d.donatorName} <span style={{ fontSize: '0.625rem', color: 'var(--ghost)' }}>[#{d.donatorId}]</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--term-green)', fontWeight: 700 }}>
                        +${d.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--phosphor)' }}>
                        {d.note || 'Treasury contribution'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            background: 'rgba(16,185,129,0.15)',
                            color: 'var(--term-green)',
                            border: '1px solid var(--term-green)',
                            padding: '2px 6px',
                            fontSize: '0.625rem',
                            borderRadius: '2px',
                          }}
                        >
                          LOCKED IN ESCROW
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: WAR ART BOUNTIES */}
        {activeTab === 'bounties' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--chalk)', margin: '0 0 4px 0' }}>
                  ACTIVE FACTION COMMISSION BOUNTIES
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', margin: 0 }}>
                  Open art briefs funded by the {faction.name} Treasury. Verified artists can pitch proposals directly.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-industrial"
                onClick={() => {
                  addToast('To post a faction bounty, verify leadership status on Torn City API.', 'info');
                }}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.6875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <PlusCircle size={14} />
                <span>POST SYNDICATE BOUNTY</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {bounties.map((bounty) => (
                <div
                  key={bounty.id}
                  className="card-industrial"
                  style={{
                    background: 'var(--void)',
                    border: '1px solid var(--wire)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span
                      style={{
                        background: 'rgba(251,191,36,0.15)',
                        border: '1px solid #fbbf24',
                        color: '#fbbf24',
                        padding: '2px 8px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        borderRadius: '2px',
                      }}
                    >
                      {bounty.status === 'open' ? 'OPEN FOR PITCHES' : 'UNDER REVIEW'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                      DEADLINE: {bounty.deadline}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.125rem',
                      color: 'var(--chalk)',
                      letterSpacing: '0.02em',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {bounty.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--ghost)',
                      lineHeight: 1.5,
                      marginBottom: '16px',
                      flex: 1,
                    }}
                  >
                    {bounty.description}
                  </p>

                  <div
                    style={{
                      background: 'var(--pit)',
                      border: '1px solid var(--wire)',
                      padding: '10px 12px',
                      borderRadius: '2px',
                      marginBottom: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)' }}>
                        DELIVERABLE FORMAT
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--chalk)', fontWeight: 600 }}>
                        {bounty.deliverableType}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)' }}>
                        ESCROW BOUNTY REWARD
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.125rem', color: 'var(--term-green)', fontWeight: 700 }}>
                        ${(bounty.reward / 1_000_000).toFixed(1)}M
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-industrial"
                    onClick={() => {
                      navigate('/dispatches');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: faction.accentColor,
                      borderColor: faction.accentColor,
                      color: '#fff',
                    }}
                  >
                    <Chats size={14} weight="bold" />
                    <span>PITCH PROPOSAL VIA THE WIRE</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Resolution Preview Modal */}
      {previewItem && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--sp-4)',
          }}
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="card-industrial"
            style={{
              maxWidth: '900px',
              width: '100%',
              background: 'var(--void)',
              border: `1px solid ${faction.accentColor}`,
              padding: '20px',
              boxShadow: `0 0 50px ${faction.accentColor}33`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', margin: 0, color: 'var(--chalk)' }}>
                  {previewItem.title}
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                  {previewItem.dimensions} • Created by @{previewItem.artistName}
                </div>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--ghost)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px', background: 'var(--pit)', padding: '12px', borderRadius: '2px' }}>
              <img
                src={previewItem.imageUrl}
                alt={previewItem.title}
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-industrial"
                onClick={() => handleCopyBBCode(previewItem)}
                style={{ flex: 1, padding: '10px' }}
              >
                <Copy size={14} />
                <span>COPY TORN FORUM BBCODE</span>
              </button>
              <button
                type="button"
                className="btn btn-industrial"
                onClick={() => setPreviewItem(null)}
                style={{ padding: '10px 20px', background: 'var(--pit)' }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      <DonateModal
        faction={faction}
        isOpen={donateOpen}
        onClose={() => setDonateOpen(false)}
        onDonationComplete={() => loadData()}
      />
    </main>
  );
}
