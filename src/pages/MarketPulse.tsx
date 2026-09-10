import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  Broadcast, ChartLineUp, ShieldCheck, Flame, CurrencyCircleDollar, Lightning, Users
} from '@phosphor-icons/react';
import { TickerTape } from '../components/pulse/TickerTape';
import { LiveTradingFeed } from '../components/pulse/LiveTradingFeed';
import { ArtValuationCalculator } from '../components/pulse/ArtValuationCalculator';
import { useMarketIndices } from '../hooks/useMarketPulse';
import { formatTornCash } from '../utils/format';

export function MarketPulse() {
  const reduce = useReducedMotion();
  const { indices, overview } = useMarketIndices();

  return (
    <main className="page-content" style={{ paddingBottom: 'var(--sp-20)' }}>
      {/* Top Continuous Market Ticker Bar */}
      <TickerTape showLiveDot={true} />

      <div className="container" style={{ paddingTop: 'var(--sp-8)' }}>
        {/* Terminal Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 'var(--sp-8)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--sp-2)' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--term-green)',
              boxShadow: '0 0 10px var(--term-green)',
              display: 'inline-block',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: 'var(--term-green)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              [ REAL-TIME FINANCIAL INTELLIGENCE TERMINAL ]
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: 'var(--phosphor)',
            lineHeight: 0.95,
            margin: '0 0 var(--sp-3)',
          }}>
            TORN CITY ART PULSE
          </h1>

          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--ghost)',
            maxWidth: '680px',
            lineHeight: 1.6,
          }}>
            Real-time transaction telemetry, faction propaganda investments, Donator Pack parity indices, and algorithmic digital asset valuations across the Torn City creative economy.
          </p>
        </motion.div>

        {/* Top 4 Metrics Grid */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1px',
            background: 'var(--seam)',
            marginBottom: 'var(--sp-8)',
          }}
        >
          <div style={{ background: 'var(--plate)', padding: 'var(--sp-5)' }}>
            <div className="artwork-price-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={12} color="var(--red-hi)" weight="fill" /> 24H VOLUME
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--phosphor)', letterSpacing: '-0.03em', marginTop: '4px' }}>
              {formatTornCash(overview.total24hVolume)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--term-green)', marginTop: '2px' }}>
              ▲ +18.4% vs prev day
            </div>
          </div>

          <div style={{ background: 'var(--plate)', padding: 'var(--sp-5)' }}>
            <div className="artwork-price-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CurrencyCircleDollar size={12} color="var(--term-green)" weight="bold" /> DP EXCHANGE RATE
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--phosphor)', letterSpacing: '-0.03em', marginTop: '4px' }}>
              {formatTornCash(overview.donatorPackRate)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)', marginTop: '2px' }}>
              Baseline parity: 1 DP = $24.5M
            </div>
          </div>

          <div style={{ background: 'var(--plate)', padding: 'var(--sp-5)' }}>
            <div className="artwork-price-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lightning size={12} color="var(--amber)" weight="fill" /> MARKET SENTIMENT
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--term-green)', letterSpacing: '-0.03em', marginTop: '4px' }}>
              BULLISH {overview.sentimentScore}/100
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--ghost)', marginTop: '2px' }}>
              Extreme faction buy-side liquidity
            </div>
          </div>

          <div style={{ background: 'var(--plate)', padding: 'var(--sp-5)' }}>
            <div className="artwork-price-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={12} color="var(--ghost)" weight="bold" /> ONLINE STUDIOS
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--phosphor)', letterSpacing: '-0.03em', marginTop: '4px' }}>
              {overview.verifiedArtistsOnline} CREATORS
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--term-green)', marginTop: '2px' }}>
              ● 8 Commission queues open
            </div>
          </div>
        </motion.div>

        {/* Main Grid: 2-Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 420px',
          gap: 'var(--sp-6)',
          alignItems: 'start',
        }}>
          {/* LEFT COLUMN: Live Trading Feed + Art Valuation Calculator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
            {/* Live Trading Tape */}
            <LiveTradingFeed />

            {/* Interactive Valuation Calculator */}
            <ArtValuationCalculator />
          </div>

          {/* RIGHT COLUMN: Market Indices Detail + Faction Leaderboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
            {/* Market Indices Breakdown Card */}
            <div style={{ background: 'var(--plate)', border: '1px solid var(--seam)' }}>
              <div style={{
                padding: 'var(--sp-4) var(--sp-5)',
                borderBottom: '1px solid var(--seam)',
                background: 'var(--pit)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ChartLineUp size={14} color="var(--term-green)" weight="bold" />
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--phosphor)',
                  }}>
                    COMPOSITE ART PRICE INDICES
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--ghost)' }}>
                  UPDATED LIVE
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--seam)' }}>
                {indices.map((idx) => (
                  <div
                    key={idx.id}
                    style={{
                      background: 'var(--pit)',
                      padding: 'var(--sp-3) var(--sp-4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--phosphor)', fontWeight: 600 }}>
                        {idx.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'var(--ghost)', marginTop: '2px' }}>
                        CODE: {idx.code}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', color: 'var(--phosphor)' }}>
                        {formatTornCash(idx.currentValue)}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.5rem',
                        color: idx.isPositive ? 'var(--term-green)' : 'var(--red-hi)',
                        marginTop: '2px',
                      }}>
                        {idx.isPositive ? `▲ +${idx.change24h}%` : `▼ ${idx.change24h}%`} (24h)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Syndicate Notice Box */}
            <div style={{
              background: 'var(--pit)',
              border: '1px solid var(--seam)',
              borderLeft: '3px solid var(--red)',
              padding: 'var(--sp-4)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--phosphor)',
                fontWeight: 600,
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>
                FACTION BRANDING SERVICES NOTICE
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5625rem',
                color: 'var(--ghost)',
                lineHeight: 1.6,
                margin: 0,
              }}>
                War banners and rank recruitment graphics verified through Torn API payment logs receive priority rendering in the COVEN digital asset vault. Bulk orders qualify for escrow milestones.
              </p>
              <div style={{ marginTop: '12px' }}>
                <Link to="/commissions" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Commission Custom Syndicate Graphics →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
