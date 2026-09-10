import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowsLeftRight,
  ShieldCheck,
  CheckCircle,
  CurrencyDollar,
  MagnifyingGlass,
  ArrowRight,
  ArrowLeft,
  PlusCircle,
  Clock,
  LockKey,
  XCircle,
  Sparkle,
  Eye,
  FileCode,
} from '@phosphor-icons/react';
import {
  getTrades,
  getTradeById,
  acceptTrade,
  declineTrade,
  counterTrade,
} from '../services/tradeService';
import { TradeCard } from '../components/trade/TradeCard';
import { NewTradeModal } from '../components/trade/NewTradeModal';
import { useToast } from '../context/ToastContext';
import { formatTornCash } from '../utils/format';
import type { TradeOffer } from '../types/trade';

export function TradeDesk() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [trades, setTrades] = useState<TradeOffer[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<TradeOffer | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'my' | 'cash' | 'settled'>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [counterCashInput, setCounterCashInput] = useState<string>('');
  const [isCountering, setIsCountering] = useState(false);

  const currentUser = 'SINTEX';

  const loadData = () => {
    const all = getTrades();
    setTrades(all);
    if (id) {
      const found = all.find((t) => t.id === id);
      if (found) setSelectedTrade(found);
    }
  };

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener('coven:trade_update', handler);
    return () => window.removeEventListener('coven:trade_update', handler);
  }, [id]);

  // Sync selectedTrade when trades update
  useEffect(() => {
    if (selectedTrade) {
      const updated = trades.find((t) => t.id === selectedTrade.id);
      if (updated) setSelectedTrade(updated);
    }
  }, [trades]);

  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      const q = search.toLowerCase();
      const matchesQuery =
        t.title.toLowerCase().includes(q) ||
        t.initiatorSide.party.username.toLowerCase().includes(q) ||
        t.targetSide.party.username.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));

      if (!matchesQuery) return false;

      if (filterType === 'my') {
        return (
          t.initiatorSide.party.username.toLowerCase() === currentUser.toLowerCase() ||
          t.targetSide.party.username.toLowerCase() === currentUser.toLowerCase()
        );
      }
      if (filterType === 'cash') {
        return t.initiatorSide.cashSweetener > 0 || t.targetSide.cashSweetener > 0;
      }
      if (filterType === 'settled') {
        return t.status === 'SETTLED';
      }
      return true;
    });
  }, [trades, search, filterType]);

  const handleSelectTrade = (trade: TradeOffer) => {
    setSelectedTrade(trade);
    navigate(`/trade/${trade.id}`);
  };

  const handleBackToDirectory = () => {
    setSelectedTrade(null);
    navigate('/trade');
  };

  const handleAccept = () => {
    if (!selectedTrade) return;
    const result = acceptTrade(selectedTrade.id, currentUser);
    if (result.success) {
      addToast(
        result.trade?.status === 'SETTLED'
          ? 'Dual signatures verified! Trade contract successfully settled!'
          : 'Signature recorded. Locked into Escrow pending counterparty.',
        'success'
      );
    }
  };

  const handleDecline = () => {
    if (!selectedTrade) return;
    declineTrade(selectedTrade.id, currentUser, 'Offer declined by collector.');
    addToast('Trade contract marked as declined.', 'info');
  };

  const handleCounterSubmit = () => {
    if (!selectedTrade) return;
    const cash = parseInt(counterCashInput.replace(/[^0-9]/g, ''), 10) || 0;
    counterTrade(selectedTrade.id, currentUser, selectedTrade.targetSide.offeredAssets, cash);
    setIsCountering(false);
    addToast(`Counter-proposal submitted with $${cash.toLocaleString()} cash sweetener!`, 'success');
  };

  return (
    <main className="page-content">
      <div className="container" style={{ paddingTop: 'var(--sp-6)', paddingBottom: 'var(--sp-16)' }}>
        {/* If in Terminal Detail Mode */}
        {selectedTrade ? (
          <div>
            {/* Back Link */}
            <button
              type="button"
              onClick={handleBackToDirectory}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ghost)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: 'var(--sp-4)',
                letterSpacing: '0.08em',
              }}
            >
              <ArrowLeft size={14} />
              BACK TO BLACK MARKET DIRECTORY
            </button>

            {/* Contract Header Banner */}
            <div
              className="card-industrial"
              style={{
                background: 'var(--void)',
                border: '1px solid var(--wire)',
                padding: '20px',
                marginBottom: 'var(--sp-6)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--red)',
                      letterSpacing: '0.12em',
                      marginBottom: '4px',
                    }}
                  >
                    [ SYNDICATE P2P ESCROW CONTRACT // {selectedTrade.escrowContractId} ]
                  </div>
                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                      margin: 0,
                      color: 'var(--chalk)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {selectedTrade.title}
                  </h1>
                </div>

                {/* Status Badge */}
                <div
                  style={{
                    background: selectedTrade.status === 'SETTLED' ? 'rgba(16,185,129,0.15)' : 'rgba(225,29,72,0.15)',
                    border: `1px solid ${selectedTrade.status === 'SETTLED' ? 'var(--term-green)' : 'var(--red)'}`,
                    color: selectedTrade.status === 'SETTLED' ? 'var(--term-green)' : 'var(--red)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    padding: '4px 12px',
                    borderRadius: '2px',
                  }}
                >
                  {selectedTrade.status === 'SETTLED' ? '✓ SETTLED & DELIVERED' : `ESCROW STATUS: ${selectedTrade.status}`}
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--ghost)', margin: 0, lineHeight: 1.5 }}>
                {selectedTrade.description}
              </p>
            </div>

            {/* Dual-Sided Trade Terminal Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '20px',
                marginBottom: 'var(--sp-6)',
              }}
            >
              {/* SIDE A: INITIATOR (OFFER) */}
              <div
                className="card-industrial"
                style={{
                  background: 'var(--void)',
                  border: '1px solid var(--term-green)',
                  boxShadow: '0 0 25px rgba(16,185,129,0.1)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Party Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--wire)',
                    marginBottom: '16px',
                  }}
                >
                  <img
                    src={selectedTrade.initiatorSide.party.avatarUrl}
                    alt={selectedTrade.initiatorSide.party.username}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '4px',
                      border: '1px solid var(--term-green)',
                      objectFit: 'cover',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--chalk)' }}>
                        {selectedTrade.initiatorSide.party.username}
                      </span>
                      {selectedTrade.initiatorSide.party.factionTag && (
                        <span
                          style={{
                            background: 'var(--pit)',
                            border: '1px solid var(--wire)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.625rem',
                            color: 'var(--ghost)',
                            padding: '1px 5px',
                          }}
                        >
                          [{selectedTrade.initiatorSide.party.factionTag}]
                        </span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--term-green)' }}>
                      INITIATING CONTRACT PARTY • {selectedTrade.initiatorSide.party.hasAccepted ? '✓ SIGNATURE VERIFIED' : 'PENDING LOCK'}
                    </div>
                  </div>
                </div>

                {/* Offered Assets */}
                <div style={{ marginBottom: '16px', flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--ghost)',
                      letterSpacing: '0.1em',
                      marginBottom: '8px',
                    }}
                  >
                    LOCKED ARTWORK ASSETS ({selectedTrade.initiatorSide.offeredAssets.length}):
                  </div>

                  {selectedTrade.initiatorSide.offeredAssets.map((art) => (
                    <div
                      key={art.artworkId}
                      style={{
                        background: 'var(--pit)',
                        border: '1px solid var(--wire)',
                        padding: '12px',
                        borderRadius: '2px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        style={{
                          width: '64px',
                          height: '64px',
                          objectFit: 'cover',
                          borderRadius: '2px',
                          border: '1px solid var(--wire)',
                        }}
                      />
                      <div>
                        <h4
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.9375rem',
                            margin: '0 0 4px 0',
                            color: 'var(--chalk)',
                          }}
                        >
                          {art.title}
                        </h4>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                          {art.edition} • By @{art.artistName}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--term-green)', fontWeight: 700 }}>
                          EST. VALUE: ${formatTornCash(art.estimatedValue)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedTrade.initiatorSide.offeredAssets.length === 0 && (
                    <div style={{ fontStyle: 'italic', color: 'var(--ghost)', fontSize: '0.8125rem' }}>
                      No physical artworks offered (Pure Cash Offer).
                    </div>
                  )}
                </div>

                {/* Cash Sweetener Box */}
                <div
                  style={{
                    background: 'var(--pit)',
                    border: '1px solid var(--wire)',
                    padding: '12px',
                    borderRadius: '2px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                    CASH SWEETENER PLEDGED:
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: selectedTrade.initiatorSide.cashSweetener > 0 ? 'var(--term-green)' : 'var(--ghost)',
                    }}
                  >
                    ${selectedTrade.initiatorSide.cashSweetener.toLocaleString()} TORN $
                  </span>
                </div>
              </div>

              {/* SIDE B: TARGET / COUNTERPARTY */}
              <div
                className="card-industrial"
                style={{
                  background: 'var(--void)',
                  border: '1px solid #818cf8',
                  boxShadow: '0 0 25px rgba(129,140,248,0.1)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Party Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--wire)',
                    marginBottom: '16px',
                  }}
                >
                  <img
                    src={selectedTrade.targetSide.party.avatarUrl}
                    alt={selectedTrade.targetSide.party.username}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '4px',
                      border: '1px solid #818cf8',
                      objectFit: 'cover',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--chalk)' }}>
                        {selectedTrade.targetSide.party.username}
                      </span>
                      {selectedTrade.targetSide.party.factionTag && (
                        <span
                          style={{
                            background: 'var(--pit)',
                            border: '1px solid var(--wire)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.625rem',
                            color: 'var(--ghost)',
                            padding: '1px 5px',
                          }}
                        >
                          [{selectedTrade.targetSide.party.factionTag}]
                        </span>
                      )}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#818cf8' }}>
                      COUNTERPARTY • {selectedTrade.targetSide.party.hasAccepted ? '✓ SIGNATURE VERIFIED' : 'PENDING SIGNATURE'}
                    </div>
                  </div>
                </div>

                {/* Requested Assets */}
                <div style={{ marginBottom: '16px', flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: 'var(--ghost)',
                      letterSpacing: '0.1em',
                      marginBottom: '8px',
                    }}
                  >
                    REQUESTED ARTWORK ASSETS ({selectedTrade.targetSide.offeredAssets.length}):
                  </div>

                  {selectedTrade.targetSide.offeredAssets.map((art) => (
                    <div
                      key={art.artworkId}
                      style={{
                        background: 'var(--pit)',
                        border: '1px solid var(--wire)',
                        padding: '12px',
                        borderRadius: '2px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        style={{
                          width: '64px',
                          height: '64px',
                          objectFit: 'cover',
                          borderRadius: '2px',
                          border: '1px solid var(--wire)',
                        }}
                      />
                      <div>
                        <h4
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.9375rem',
                            margin: '0 0 4px 0',
                            color: 'var(--chalk)',
                          }}
                        >
                          {art.title}
                        </h4>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                          {art.edition} • By @{art.artistName}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>
                          EST. VALUE: ${formatTornCash(art.estimatedValue)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedTrade.targetSide.offeredAssets.length === 0 && (
                    <div style={{ fontStyle: 'italic', color: 'var(--ghost)', fontSize: '0.8125rem' }}>
                      No artworks requested (Pure Cash Buyout).
                    </div>
                  )}
                </div>

                {/* Cash Sweetener Box */}
                <div
                  style={{
                    background: 'var(--pit)',
                    border: '1px solid var(--wire)',
                    padding: '12px',
                    borderRadius: '2px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                    REQUESTED CASH SWEETENER:
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: selectedTrade.targetSide.cashSweetener > 0 ? '#818cf8' : 'var(--ghost)',
                    }}
                  >
                    ${selectedTrade.targetSide.cashSweetener.toLocaleString()} TORN $
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons & Escrow Signature Bar */}
            {selectedTrade.status !== 'SETTLED' && selectedTrade.status !== 'DECLINED' && (
              <div
                className="card-industrial"
                style={{
                  background: 'var(--pit)',
                  border: '1px solid var(--wire)',
                  padding: '16px 20px',
                  marginBottom: 'var(--sp-6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <LockKey size={20} color="var(--term-green)" />
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--chalk)' }}>
                      CRYPTOGRAPHIC ATOMIC ESCROW SIGNATURE READY
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--ghost)' }}>
                      Signing executes irrevocable transfer of both artworks and cash sweeteners simultaneously.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="btn btn-industrial"
                    style={{
                      background: 'var(--term-green)',
                      borderColor: 'var(--term-green)',
                      color: '#000',
                      fontWeight: 700,
                      padding: '10px 20px',
                    }}
                  >
                    <CheckCircle size={16} weight="bold" />
                    <span>ACCEPT & SIGN ESCROW</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCountering(!isCountering)}
                    className="btn btn-industrial"
                    style={{
                      background: 'transparent',
                      border: '1px solid #fbbf24',
                      color: '#fbbf24',
                      padding: '10px 16px',
                    }}
                  >
                    <ArrowsLeftRight size={16} />
                    <span>COUNTER-OFFER</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDecline}
                    className="btn btn-industrial"
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--red)',
                      color: 'var(--red)',
                      padding: '10px 16px',
                    }}
                  >
                    <XCircle size={16} />
                    <span>DECLINE</span>
                  </button>
                </div>
              </div>
            )}

            {/* Counter Offer Input Box */}
            {isCountering && (
              <div
                className="card-industrial"
                style={{
                  background: 'var(--void)',
                  border: '1px solid #fbbf24',
                  padding: '16px',
                  marginBottom: 'var(--sp-6)',
                }}
              >
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: '#fbbf24', margin: '0 0 8px 0' }}>
                  PROPOSE COUNTER-SWEETENER ($ TORN CASH)
                </h4>
                <div style={{ display: 'flex', gap: '8px', maxWidth: '480px' }}>
                  <input
                    type="text"
                    placeholder="e.g. 35,000,000"
                    value={counterCashInput}
                    onChange={(e) => setCounterCashInput(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'var(--pit)',
                      border: '1px solid var(--wire)',
                      padding: '8px 12px',
                      color: 'var(--chalk)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      borderRadius: '2px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCounterSubmit}
                    className="btn btn-industrial"
                    style={{ background: '#fbbf24', color: '#000', fontWeight: 700 }}
                  >
                    TRANSMIT COUNTER
                  </button>
                </div>
              </div>
            )}

            {/* Contract Immutable Audit Log */}
            <div className="card-industrial" style={{ padding: '20px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--ghost)',
                  letterSpacing: '0.12em',
                  marginBottom: '12px',
                }}
              >
                [ CRYPTOGRAPHIC AUDIT LOG // COVEN ON-CHAIN PROTOCOL ]
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedTrade.logs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '8px 12px',
                      background: 'var(--pit)',
                      border: '1px solid var(--wire)',
                      borderRadius: '2px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span style={{ color: 'var(--ghost)', minWidth: '80px' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <strong style={{ color: 'var(--term-green)', minWidth: '120px' }}>{log.actorName}</strong>
                    <span style={{ color: 'var(--chalk)', flex: 1 }}>{log.details || log.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* BLACK MARKET DIRECTORY OVERVIEW */
          <div>
            {/* Telemetry Header */}
            <div style={{ marginBottom: 'var(--sp-6)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--red)',
                  letterSpacing: '0.15em',
                  marginBottom: '6px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--red)',
                    boxShadow: '0 0 8px var(--red)',
                  }}
                />
                [ SYNDICATE BLACK MARKET // P2P ARTWORK TRADING DESK ]
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                      letterSpacing: '0.03em',
                      margin: '0 0 8px 0',
                      color: 'var(--chalk)',
                    }}
                  >
                    P2P ARTWORK BLACK MARKET
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: 'var(--ghost)', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
                    Propose direct collector-to-collector artwork swaps, sweeten contracts with Torn Cash,
                    and settle private syndicate sales through verified atomic escrow.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(true)}
                  className="btn btn-industrial"
                  style={{
                    padding: '10px 18px',
                    background: 'var(--red)',
                    borderColor: 'var(--red)',
                    color: '#fff',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.75rem',
                  }}
                >
                  <PlusCircle size={16} weight="bold" />
                  <span>PROPOSE NEW SWAP</span>
                </button>
              </div>
            </div>

            {/* Market Pulse Ticker */}
            <div
              className="card-industrial"
              style={{
                background: 'var(--pit)',
                border: '1px solid var(--wire)',
                padding: '10px 16px',
                marginBottom: 'var(--sp-6)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                overflowX: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: 'var(--term-green)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  whiteSpace: 'nowrap',
                }}
              >
                <Sparkle size={14} />
                ESCROW ENGINE:
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ghost)', whiteSpace: 'nowrap' }}>
                Dual-sided P2P escrow active • Log #4810 payment verification enabled for cash sweeteners
              </div>
            </div>

            {/* Filter, Search Bar */}
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
              {/* Search */}
              <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '380px' }}>
                <MagnifyingGlass
                  size={14}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ghost)' }}
                />
                <input
                  type="text"
                  placeholder="SEARCH SWAPS BY ARTWORK OR COLLECTOR..."
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
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                  ALL DEALS ({trades.length})
                </button>
                <button
                  onClick={() => setFilterType('my')}
                  style={{
                    background: filterType === 'my' ? 'var(--red)' : 'transparent',
                    color: filterType === 'my' ? '#fff' : 'var(--ghost)',
                    border: `1px solid ${filterType === 'my' ? 'var(--red)' : 'var(--wire)'}`,
                    padding: '6px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    cursor: 'pointer',
                    borderRadius: '2px',
                  }}
                >
                  MY OFFERS
                </button>
                <button
                  onClick={() => setFilterType('cash')}
                  style={{
                    background: filterType === 'cash' ? 'var(--red)' : 'transparent',
                    color: filterType === 'cash' ? '#fff' : 'var(--ghost)',
                    border: `1px solid ${filterType === 'cash' ? 'var(--red)' : 'var(--wire)'}`,
                    padding: '6px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    cursor: 'pointer',
                    borderRadius: '2px',
                  }}
                >
                  CASH SWEETENED
                </button>
                <button
                  onClick={() => setFilterType('settled')}
                  style={{
                    background: filterType === 'settled' ? 'var(--red)' : 'transparent',
                    color: filterType === 'settled' ? '#fff' : 'var(--ghost)',
                    border: `1px solid ${filterType === 'settled' ? 'var(--red)' : 'var(--wire)'}`,
                    padding: '6px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    cursor: 'pointer',
                    borderRadius: '2px',
                  }}
                >
                  SETTLED CONTRACTS
                </button>
              </div>
            </div>

            {/* Trades Grid */}
            {filteredTrades.length === 0 ? (
              <div
                className="card-industrial"
                style={{
                  padding: 'var(--sp-12)',
                  textAlign: 'center',
                  background: 'var(--pit)',
                  border: '1px solid var(--wire)',
                }}
              >
                <ArrowsLeftRight size={36} color="var(--ghost)" style={{ marginBottom: '12px' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--chalk)', marginBottom: '6px' }}>
                  NO P2P TRADE OFFERS LISTED
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--ghost)', maxWidth: '440px', margin: '0 auto 16px', lineHeight: 1.5 }}>
                  There are currently no active public barter contracts. Propose a dual-escrow swap to barter authentic artwork and cash sweeteners with other Torn collectors.
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(true)}
                  className="btn btn-industrial"
                  style={{ background: 'var(--red)', color: '#fff', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <PlusCircle size={16} />
                  PROPOSE NEW TRADE
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '20px',
                }}
              >
                {filteredTrades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} onSelect={handleSelectTrade} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Trade Offer Modal */}
      <NewTradeModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onTradeCreated={() => loadData()}
      />
    </main>
  );
}
