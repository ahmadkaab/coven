import { useState } from 'react';
import { X, ArrowsLeftRight, ShieldCheck, CheckCircle, PlusCircle } from '@phosphor-icons/react';
import { createTradeOffer } from '../../services/tradeService';
import { useToast } from '../../context/ToastContext';
import { SEED_ARTWORKS } from '../../data/seed';
import type { TradeOffer, TradeAsset, TradeParty } from '../../types/trade';

interface NewTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTradeCreated?: (trade: TradeOffer) => void;
  initialOfferedArtworkId?: string;
}

const COLLECTOR_TARGETS = [
  { username: 'Viper_NS', id: 2048911, faction: 'NS', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { username: 'Nova_MNCH', id: 1984201, faction: 'MNCH', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { username: 'IronClad', id: 1849202, faction: 'CRG', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { username: 'Kage_Zero', id: 2991040, faction: 'SUB', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
  { username: 'Open Black Market', id: 0, faction: 'PUBLIC', avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150' },
];

export function NewTradeModal({
  isOpen,
  onClose,
  onTradeCreated,
  initialOfferedArtworkId,
}: NewTradeModalProps) {
  const { addToast } = useToast();

  const [selectedMyArtId, setSelectedMyArtId] = useState<string>(
    initialOfferedArtworkId || SEED_ARTWORKS[0]?.id || ''
  );
  const [myCash, setMyCash] = useState<number>(0);
  const [selectedTarget, setSelectedTarget] = useState(COLLECTOR_TARGETS[0]);
  const [targetArtTitle, setTargetArtTitle] = useState<string>('Shadow Protocol');
  const [targetCash, setTargetCash] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdTrade, setCreatedTrade] = useState<TradeOffer | null>(null);

  if (!isOpen) return null;

  const mySelectedArt = SEED_ARTWORKS.find((a) => a.id === selectedMyArtId) || SEED_ARTWORKS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const initiatorParty: TradeParty = {
      userId: 'user-demo',
      username: 'SINTEX',
      tornPlayerId: 2190421,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      factionTag: 'MNCH',
      isInitiator: true,
      hasLocked: true,
      hasAccepted: false,
    };

    const initiatorAssets: TradeAsset[] = mySelectedArt
      ? [
          {
            artworkId: mySelectedArt.id,
            title: mySelectedArt.title,
            imageUrl: mySelectedArt.image_url || '',
            artistName: mySelectedArt.artist?.username || 'Verified Artist',
            edition: 'MASTER ASSET #01/01',
            estimatedValue: mySelectedArt.price_torn || 150000000,
          },
        ]
      : [];

    const targetParty: TradeParty = {
      userId: `user-${selectedTarget.id}`,
      username: selectedTarget.username,
      tornPlayerId: selectedTarget.id,
      avatarUrl: selectedTarget.avatar,
      factionTag: selectedTarget.faction,
      isInitiator: false,
      hasLocked: false,
      hasAccepted: false,
    };

    const targetAssets: TradeAsset[] = targetArtTitle
      ? [
          {
            artworkId: `art-req-${Date.now()}`,
            title: targetArtTitle,
            imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
            artistName: 'ahmad_kaab',
            edition: 'REQUESTED PIECE',
            estimatedValue: 120000000,
          },
        ]
      : [];

    const tradeTitle =
      title.trim() ||
      `${mySelectedArt ? mySelectedArt.title : 'Cash Deal'} ↔ ${targetArtTitle || 'Open Offer'}`;

    setTimeout(() => {
      const trade = createTradeOffer(
        tradeTitle,
        memo || 'Direct P2P artwork swap proposal submitted to COVEN escrow.',
        initiatorParty,
        initiatorAssets,
        myCash,
        targetParty,
        targetAssets,
        targetCash,
        ['Black Market', 'P2P Escrow', selectedTarget.faction],
        true
      );

      setIsSubmitting(false);
      setCreatedTrade(trade);
      addToast(`Trade Offer #${trade.id.toUpperCase()} published to Escrow!`, 'success');

      if (onTradeCreated) onTradeCreated(trade);

      setTimeout(() => {
        setCreatedTrade(null);
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-4)',
      }}
      onClick={onClose}
    >
      <div
        className="card-industrial"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--void)',
          border: '1px solid var(--red)',
          boxShadow: '0 0 35px rgba(225,29,72,0.25)',
          position: 'relative',
          padding: 'var(--sp-6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--ghost)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--sp-5)' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '2px',
              background: 'rgba(225,29,72,0.15)',
              border: '1px solid var(--red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--red)',
            }}
          >
            <ArrowsLeftRight size={24} weight="bold" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--red)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              [ SYNDICATE BLACK MARKET ESCROW ]
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.375rem',
                letterSpacing: '0.03em',
                margin: 0,
                color: 'var(--chalk)',
              }}
            >
              PROPOSE P2P ARTWORK SWAP
            </h3>
          </div>
        </div>

        {createdTrade ? (
          <div
            style={{
              padding: 'var(--sp-8) var(--sp-4)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <CheckCircle size={48} weight="fill" color="var(--term-green)" />
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--term-green)',
                fontSize: '1rem',
                letterSpacing: '0.05em',
              }}
            >
              TRADE CONTRACT {createdTrade.escrowContractId} DEPLOYED!
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ghost)' }}>
              Assets and cash sweetner locked in dual escrow contract.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Grid for Side A vs Side B */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginBottom: 'var(--sp-5)',
              }}
            >
              {/* SIDE A: YOUR OFFER */}
              <div
                style={{
                  background: 'var(--pit)',
                  border: '1px solid var(--wire)',
                  padding: '14px',
                  borderRadius: '2px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--term-green)',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    marginBottom: '10px',
                  }}
                >
                  YOUR OFFER (SINTEX)
                </div>

                {/* My Artwork Select */}
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      color: 'var(--ghost)',
                      marginBottom: '6px',
                    }}
                  >
                    SELECT PIECE FROM TROPHY VAULT:
                  </label>
                  <select
                    value={selectedMyArtId}
                    onChange={(e) => setSelectedMyArtId(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--void)',
                      border: '1px solid var(--wire)',
                      color: 'var(--chalk)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      padding: '8px',
                      borderRadius: '2px',
                      outline: 'none',
                    }}
                  >
                    {SEED_ARTWORKS.slice(0, 4).map((art) => (
                      <option key={art.id} value={art.id}>
                        {art.title} (${(((art.price_torn ?? 0)) / 1_000_000).toFixed(1)}M)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cash Sweetener */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      color: 'var(--ghost)',
                      marginBottom: '6px',
                    }}
                  >
                    ADD CASH SWEETENER ($ TORN CASH):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '6px' }}>
                    {[0, 5_000_000, 10_000_000, 25_000_000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setMyCash(amt)}
                        style={{
                          background: myCash === amt ? 'var(--term-green)' : 'var(--void)',
                          color: myCash === amt ? '#000' : 'var(--phosphor)',
                          border: '1px solid var(--wire)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          padding: '6px 2px',
                          cursor: 'pointer',
                          borderRadius: '2px',
                        }}
                      >
                        {amt === 0 ? '$0' : `$${amt / 1_000_000}M`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SIDE B: COUNTERPARTY REQUEST */}
              <div
                style={{
                  background: 'var(--pit)',
                  border: '1px solid var(--wire)',
                  padding: '14px',
                  borderRadius: '2px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: '#818cf8',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    marginBottom: '10px',
                  }}
                >
                  TARGET COUNTERPARTY & REQUEST
                </div>

                {/* Target Collector Select */}
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      color: 'var(--ghost)',
                      marginBottom: '6px',
                    }}
                  >
                    PROPOSE DEAL TO:
                  </label>
                  <select
                    value={selectedTarget.username}
                    onChange={(e) => {
                      const found = COLLECTOR_TARGETS.find((c) => c.username === e.target.value);
                      if (found) setSelectedTarget(found);
                    }}
                    style={{
                      width: '100%',
                      background: 'var(--void)',
                      border: '1px solid var(--wire)',
                      color: 'var(--chalk)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      padding: '8px',
                      borderRadius: '2px',
                      outline: 'none',
                    }}
                  >
                    {COLLECTOR_TARGETS.map((col) => (
                      <option key={col.username} value={col.username}>
                        {col.username} [{col.faction}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Requested Artwork Title */}
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      color: 'var(--ghost)',
                      marginBottom: '6px',
                    }}
                  >
                    REQUESTED ARTWORK OR CONTRACT:
                  </label>
                  <input
                    type="text"
                    value={targetArtTitle}
                    onChange={(e) => setTargetArtTitle(e.target.value)}
                    placeholder="e.g. Shadow Protocol or Faction Banner"
                    style={{
                      width: '100%',
                      background: 'var(--void)',
                      border: '1px solid var(--wire)',
                      color: 'var(--chalk)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      padding: '8px',
                      borderRadius: '2px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Requested Cash Sweetener */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      color: 'var(--ghost)',
                      marginBottom: '6px',
                    }}
                  >
                    REQUESTED CASH SWEETENER ($ TORN CASH):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {[0, 10_000_000, 20_000_000, 50_000_000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTargetCash(amt)}
                        style={{
                          background: targetCash === amt ? '#818cf8' : 'var(--void)',
                          color: targetCash === amt ? '#fff' : 'var(--phosphor)',
                          border: '1px solid var(--wire)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          padding: '6px 2px',
                          cursor: 'pointer',
                          borderRadius: '2px',
                        }}
                      >
                        {amt === 0 ? '$0' : `$${amt / 1_000_000}M`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Memo */}
            <div style={{ marginBottom: 'var(--sp-5)' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--ghost)',
                  marginBottom: '6px',
                }}
              >
                DEAL MEMO / CONTRACT TERMS:
              </label>
              <input
                type="text"
                placeholder="e.g. Open to counter-offers with animated signatures."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--pit)',
                  border: '1px solid var(--wire)',
                  padding: '10px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  color: 'var(--chalk)',
                  borderRadius: '2px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Escrow Guarantee */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--ghost)',
                fontSize: '0.75rem',
                marginBottom: 'var(--sp-5)',
              }}
            >
              <ShieldCheck size={16} color="var(--term-green)" />
              <span>COVEN P2P Escrow Guarantee: Swaps are atomic and verified against Torn City API logs.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-industrial"
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--red)',
                borderColor: 'var(--red)',
                color: '#fff',
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isSubmitting ? (
                <span>DEPLOYING ESCROW CONTRACT...</span>
              ) : (
                <span>SUBMIT P2P TRADE OFFER TO BLACK MARKET</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
