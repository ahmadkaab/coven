import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  CurrencyDollar,
  Sword,
  Users,
  MagnifyingGlass,
  ArrowRight,
  PlusCircle,
  Flame,
  FileCode,
} from '@phosphor-icons/react';
import { getFactions } from '../services/factionService';
import { DonateModal } from '../components/faction/DonateModal';
import type { FactionProfile } from '../types/faction';

export function Factions() {
  const [factions, setFactions] = useState<FactionProfile[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'war' | 'bounties'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'treasury' | 'assets'>('rank');
  const [donatingFaction, setDonatingFaction] = useState<FactionProfile | null>(null);

  const loadData = () => {
    setFactions(getFactions());
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener('coven:faction_update', handler);
    return () => window.removeEventListener('coven:faction_update', handler);
  }, []);

  // Filter & sort
  const filteredFactions = useMemo(() => {
    return factions
      .filter((f) => {
        const query = search.toLowerCase();
        const matchesQuery =
          f.name.toLowerCase().includes(query) ||
          f.tag.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query) ||
          f.focusTags.some((t) => t.toLowerCase().includes(query));

        if (!matchesQuery) return false;

        if (filterType === 'war') return !!f.warStatus && f.warStatus.status === 'active';
        if (filterType === 'bounties') return f.activeBountiesCount > 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'treasury') return b.treasuryBalance - a.treasuryBalance;
        if (sortBy === 'assets') return b.vaultAssetsCount - a.vaultAssetsCount;
        return a.rank - b.rank;
      });
  }, [factions, search, filterType, sortBy]);

  // Aggregate stats
  const totalTreasury = useMemo(
    () => factions.reduce((acc, f) => acc + f.treasuryBalance, 0),
    [factions]
  );
  const totalBounties = useMemo(
    () => factions.reduce((acc, f) => acc + f.activeBountiesCount, 0),
    [factions]
  );
  const totalAssets = useMemo(
    () => factions.reduce((acc, f) => acc + f.vaultAssetsCount, 0),
    [factions]
  );

  return (
    <main className="page-content">
      <div className="container" style={{ paddingTop: 'var(--sp-6)', paddingBottom: 'var(--sp-16)' }}>
        {/* Top Telemetry Header */}
        <div style={{ marginBottom: 'var(--sp-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--term-green)',
              letterSpacing: '0.15em',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--term-green)',
                boxShadow: '0 0 8px var(--term-green)',
              }}
            />
            [ TORN CITY SYNDICATE DIRECTORY // FACTION ARMORIES & ART VAULTS ]
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              letterSpacing: '0.03em',
              lineHeight: 1.1,
              margin: '0 0 8px 0',
              color: 'var(--chalk)',
            }}
          >
            FACTION VAULTS & ARMORIES
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--ghost)',
              maxWidth: '720px',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Explore official war banners, high-ranking forum signature suites, and proprietary armory assets
            commissioned by Torn City's elite syndicates. Pool Torn cash into faction art treasuries or pitch directly for active war bounties.
          </p>
        </div>

        {/* Aggregate Telemetry Row */}
        <div
          className="dossier-metrics-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: 'var(--sp-8)',
          }}
        >
          <div className="card-industrial" style={{ padding: '16px', background: 'var(--void)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ghost)', marginBottom: '4px' }}>
              <Shield size={16} color="var(--red)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.1em' }}>
                SYNDICATES TRACKED
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--chalk)' }}>
              {factions.length} <span style={{ fontSize: '0.75rem', color: 'var(--ghost)', fontWeight: 400 }}>ELITE TEAMS</span>
            </div>
          </div>

          <div className="card-industrial" style={{ padding: '16px', background: 'var(--void)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ghost)', marginBottom: '4px' }}>
              <CurrencyDollar size={16} color="var(--term-green)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.1em' }}>
                TOTAL ART TREASURY
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--term-green)' }}>
              ${(totalTreasury / 1_000_000).toFixed(1)}M{' '}
              <span style={{ fontSize: '0.75rem', color: 'var(--ghost)', fontWeight: 400 }}>IN ESCROW</span>
            </div>
          </div>

          <div className="card-industrial" style={{ padding: '16px', background: 'var(--void)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ghost)', marginBottom: '4px' }}>
              <FileCode size={16} color="#818cf8" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.1em' }}>
                ARMORY ASSETS & BBCODE
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--chalk)' }}>
              {totalAssets}{' '}
              <span style={{ fontSize: '0.75rem', color: 'var(--ghost)', fontWeight: 400 }}>PIECES VERIFIED</span>
            </div>
          </div>

          <div className="card-industrial" style={{ padding: '16px', background: 'var(--void)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ghost)', marginBottom: '4px' }}>
              <Flame size={16} color="#fbbf24" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.1em' }}>
                ACTIVE WAR BOUNTIES
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>
              {totalBounties}{' '}
              <span style={{ fontSize: '0.75rem', color: 'var(--ghost)', fontWeight: 400 }}>OPEN BRIEFS</span>
            </div>
          </div>
        </div>

        {/* Filter, Search & Controls Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: 'var(--sp-6)',
            padding: '12px 16px',
            background: 'var(--pit)',
            border: '1px solid var(--wire)',
            borderRadius: '2px',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
            <MagnifyingGlass
              size={14}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ghost)' }}
            />
            <input
              type="text"
              placeholder="SEARCH BY FACTION OR TAG..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--void)',
                border: '1px solid var(--wire)',
                padding: '8px 12px 8px 30px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--chalk)',
                borderRadius: '2px',
                outline: 'none',
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                background: filterType === 'all' ? 'var(--red)' : 'transparent',
                color: filterType === 'all' ? '#fff' : 'var(--ghost)',
                border: `1px solid ${filterType === 'all' ? 'var(--red)' : 'var(--wire)'}`,
                padding: '6px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                cursor: 'pointer',
                borderRadius: '2px',
              }}
            >
              ALL SYNDICATES
            </button>
            <button
              onClick={() => setFilterType('war')}
              style={{
                background: filterType === 'war' ? 'var(--red)' : 'transparent',
                color: filterType === 'war' ? '#fff' : 'var(--ghost)',
                border: `1px solid ${filterType === 'war' ? 'var(--red)' : 'var(--wire)'}`,
                padding: '6px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                cursor: 'pointer',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sword size={12} weight="bold" />
              RANKED WAR ACTIVE
            </button>
            <button
              onClick={() => setFilterType('bounties')}
              style={{
                background: filterType === 'bounties' ? 'var(--red)' : 'transparent',
                color: filterType === 'bounties' ? '#fff' : 'var(--ghost)',
                border: `1px solid ${filterType === 'bounties' ? 'var(--red)' : 'var(--wire)'}`,
                padding: '6px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                cursor: 'pointer',
                borderRadius: '2px',
              }}
            >
              OPEN BOUNTIES
            </button>
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
              SORT:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rank' | 'treasury' | 'assets')}
              style={{
                background: 'var(--void)',
                border: '1px solid var(--wire)',
                color: 'var(--chalk)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                padding: '6px 8px',
                borderRadius: '2px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="rank">TORN RANK (RESPECT)</option>
              <option value="treasury">ART TREASURY ($ HIGHEST)</option>
              <option value="assets">ARMORY ASSETS (MOST)</option>
            </select>
          </div>
        </div>

        {/* Factions Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredFactions.map((faction) => {
            return (
              <div
                key={faction.id}
                className="card-industrial"
                style={{
                  background: 'var(--void)',
                  border: '1px solid var(--wire)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
              >
                {/* Banner Header */}
                <div
                  style={{
                    height: '110px',
                    position: 'relative',
                    backgroundImage: `url(${faction.bannerUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(to bottom, rgba(7,8,10,0.3), var(--void))`,
                    }}
                  />

                  {/* Respect Rank Pill */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(7,8,10,0.85)',
                      border: `1px solid ${faction.accentColor}`,
                      padding: '3px 8px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      color: faction.accentColor,
                      letterSpacing: '0.08em',
                      borderRadius: '2px',
                    }}
                  >
                    RANK #{faction.rank}
                  </div>

                  {/* Active War Badge */}
                  {faction.warStatus && faction.warStatus.status === 'active' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(225,29,72,0.9)',
                        border: '1px solid #ff4d6d',
                        padding: '3px 8px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        color: '#fff',
                        letterSpacing: '0.08em',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 0 10px rgba(225,29,72,0.5)',
                      }}
                    >
                      <Sword size={12} weight="bold" />
                      WAR vs {faction.warStatus.opponentTag}
                    </div>
                  )}

                  {/* Crest Emblem Overlapping */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-24px',
                      left: '16px',
                      width: '56px',
                      height: '56px',
                      borderRadius: '4px',
                      border: `2px solid ${faction.accentColor}`,
                      boxShadow: `0 0 15px ${faction.accentColor}44`,
                      overflow: 'hidden',
                      background: 'var(--pit)',
                      zIndex: 2,
                    }}
                  >
                    <img
                      src={faction.crestUrl}
                      alt={faction.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '32px 16px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Faction Header info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          color: faction.accentColor,
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                        }}
                      >
                        [{faction.tag}] #{faction.tornFactionId}
                      </div>
                      <Link
                        to={`/factions/${faction.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <h2
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.25rem',
                            margin: '2px 0 0 0',
                            letterSpacing: '0.02em',
                            color: 'var(--chalk)',
                          }}
                        >
                          {faction.name}
                        </h2>
                      </Link>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--ghost)' }}>
                        RESPECT
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: 'var(--chalk)',
                        }}
                      >
                        {(faction.respect / 1_000_000).toFixed(2)}M
                      </div>
                    </div>
                  </div>

                  {/* Motto */}
                  <p
                    style={{
                      fontStyle: 'italic',
                      fontSize: '0.75rem',
                      color: 'var(--ghost)',
                      marginBottom: '12px',
                      lineHeight: 1.4,
                    }}
                  >
                    "{faction.motto}"
                  </p>

                  {/* Financial & Vault Matrix */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                      padding: '10px',
                      background: 'var(--pit)',
                      border: '1px solid var(--wire)',
                      borderRadius: '2px',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)' }}>
                        ART TREASURY
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: 'var(--term-green)',
                        }}
                      >
                        ${(faction.treasuryBalance / 1_000_000).toFixed(1)}M
                      </div>
                    </div>

                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)' }}>
                        ARMORY ASSETS
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: 'var(--chalk)',
                        }}
                      >
                        {faction.vaultAssetsCount} PIECES
                      </div>
                    </div>

                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)' }}>
                        WAR BOUNTIES
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: faction.activeBountiesCount > 0 ? '#fbbf24' : 'var(--ghost)',
                        }}
                      >
                        {faction.activeBountiesCount} ACTIVE
                      </div>
                    </div>
                  </div>

                  {/* Focus Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
                    {faction.focusTags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: 'var(--void)',
                          border: '1px solid var(--wire)',
                          fontSize: '0.625rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--ghost)',
                          padding: '2px 6px',
                          borderRadius: '2px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions Area */}
                  <div
                    style={{
                      marginTop: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--wire)',
                    }}
                  >
                    <Link
                      to={`/factions/${faction.id}`}
                      className="btn btn-industrial"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '0.6875rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textDecoration: 'none',
                      }}
                    >
                      <span>ENTER ARMORY</span>
                      <ArrowRight size={12} weight="bold" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setDonatingFaction(faction)}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${faction.accentColor}`,
                        color: faction.accentColor,
                        padding: '7px 10px',
                        borderRadius: '2px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                      title="Contribute Torn Cash to Art Treasury"
                    >
                      <PlusCircle size={14} weight="bold" />
                      <span>FUND</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Donation Modal */}
      {donatingFaction && (
        <DonateModal
          faction={donatingFaction}
          isOpen={true}
          onClose={() => setDonatingFaction(null)}
          onDonationComplete={() => loadData()}
        />
      )}
    </main>
  );
}
