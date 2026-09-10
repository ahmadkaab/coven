import { Link } from 'react-router-dom';
import { useFactionLeaderboard } from '../../hooks/useMarketPulse';
import { formatTornCash } from '../../utils/format';
import { Trophy, ShieldStar } from '@phosphor-icons/react';

function getFactionRoute(tag: string): string {
  const t = tag.toLowerCase();
  if (t === 'mnch') return '/factions/monarch';
  if (t === 'ns') return '/factions/natural-selection';
  if (t === 'crg') return '/factions/crg';
  if (t === 'sub') return '/factions/subversive';
  if (t === 'dmh') return '/factions/dead-mans-hand';
  if (t === 'jtf') return '/factions/jtf-recon';
  return `/factions/${t}`;
}

export function FactionLeaderboard() {
  const { leaderboard } = useFactionLeaderboard();

  return (
    <div style={{ background: 'var(--plate)', border: '1px solid var(--seam)' }}>
      {/* Header */}
      <div style={{
        padding: 'var(--sp-4) var(--sp-5)',
        borderBottom: '1px solid var(--seam)',
        background: 'var(--pit)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={14} color="var(--amber)" weight="fill" />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--phosphor)',
          }}>
            FACTION ART PATRONAGE LEADERBOARD
          </span>
        </div>

        <Link
          to="/factions"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.5625rem',
            color: 'var(--red)',
            textDecoration: 'none',
            letterSpacing: '0.08em',
          }}
        >
          VIEW ALL FACTIONS →
        </Link>
      </div>

      {/* Table List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--seam)' }}>
        {leaderboard.map((f) => (
          <div
            key={f.factionTag}
            style={{
              background: 'var(--pit)',
              padding: 'var(--sp-3) var(--sp-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--sp-3)',
            }}
          >
            {/* Rank & Faction Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                color: f.rank === 1 ? 'var(--amber)' : f.rank === 2 ? 'var(--ghost)' : f.rank === 3 ? 'var(--red-hi)' : 'var(--shadow-type)',
                width: '20px',
                textAlign: 'center',
              }}>
                #{f.rank}
              </span>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Link
                    to={getFactionRoute(f.factionTag)}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.875rem',
                      color: 'var(--phosphor)',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="View Faction Armory & Vault"
                  >
                    {f.factionName}
                  </Link>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.5rem',
                    color: 'var(--ghost)',
                    background: 'var(--void)',
                    padding: '1px 5px',
                    border: '1px solid var(--seam)',
                  }}>
                    [{f.factionTag}]
                  </span>
                </div>

                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  color: 'var(--ghost)',
                  marginTop: '2px',
                }}>
                  Fav Studio: <strong style={{ color: 'var(--phosphor)' }}>{f.preferredArtist}</strong> • {f.piecesCommissioned} Pieces
                </div>
              </div>
            </div>

            {/* Volume & Market Share Bar */}
            <div style={{ textAlign: 'right', minWidth: '120px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--phosphor)',
                fontWeight: 600,
              }}>
                {formatTornCash(f.totalVolumeTorn)}
              </div>

              {/* Progress Mini Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'flex-end',
                marginTop: '4px',
              }}>
                <div style={{
                  width: '60px',
                  height: '4px',
                  background: 'var(--void)',
                  border: '1px solid var(--seam)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${f.marketSharePct * 2.5}%`,
                    background: f.rank === 1 ? 'var(--red)' : 'var(--term-green)',
                  }} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5rem',
                  color: 'var(--ghost)',
                }}>
                  {f.marketSharePct}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
