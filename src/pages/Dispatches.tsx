/* ================================================================
   COVEN — The Wire (Encrypted Dispatches & Direct Comms)
   Cyber-noir P2P encrypted messaging terminal between buyers & artists.
   ================================================================ */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Chats,
  PaperPlaneTilt,
  LockKey,
  ShieldCheck,
  Check,
  CheckCircle,
  MagnifyingGlass,
  X,
  ArrowSquareOut,
  PushPin,
  Image as ImageIcon,
  FileText,
  CurrencyDollar,
  Circle,
  Sparkle,
  ArrowClockwise,
} from '@phosphor-icons/react';
import { useAuthStore } from '../store/authStore';
import {
  getThreads,
  getThread,
  getMessages,
  sendMessage,
  markThreadRead,
  createOrGetThread,
  simulateArtistReply,
} from '../services/dispatchService';
import { SEED_ARTISTS, SEED_ARTWORKS } from '../data/seed';
import { formatTornCash } from '../utils/format';
import type { DispatchThread, DispatchMessage, DispatchAttachment, DispatchContextType } from '../types/dispatch';

/* ── Status Indicator Color ────────────────────────────────── */
function getStatusColor(status: DispatchThread['status']): string {
  switch (status) {
    case 'online': return 'var(--term-green)';
    case 'busy': return 'var(--red-hi)';
    case 'in_vault': return '#818cf8';
    default: return 'var(--ghost)';
  }
}

/* ── Tier Badge Style ──────────────────────────────────────── */
function tierStyle(tier?: string) {
  switch (tier) {
    case 'legend': return { color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' };
    case 'master': return { color: 'var(--red)', border: '1px solid rgba(220,38,38,0.3)' };
    case 'trusted': return { color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' };
    default: return { color: 'var(--ghost)', border: '1px solid rgba(136,136,136,0.2)' };
  }
}

/* ── Relative Time Helper ──────────────────────────────────── */
function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function fullTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function Dispatches() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const userId = user ? String(user.player_id) : 'demo';
  const userName = user ? user.name : 'You';
  const userAvatar = user ? user.profile_image : '';

  // Data state
  const [threads, setThreads] = useState<DispatchThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DispatchMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'inquiry' | 'commission' | 'trade'>('all');

  // Composer state
  const [inputText, setInputText] = useState('');
  const [pendingAttachment, setPendingAttachment] = useState<DispatchAttachment | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [attachModalOpen, setAttachModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerInputRef = useRef<HTMLTextAreaElement>(null);

  /* Refresh thread list from service */
  const refreshThreads = useCallback(() => {
    const list = getThreads(userId);
    setThreads(list);
    return list;
  }, [userId]);

  /* Handle URL Params (e.g. ?thread=..., ?artistId=..., ?artworkId=...) */
  useEffect(() => {
    const threadParam = searchParams.get('thread');
    const artistIdParam = searchParams.get('artistId');
    const artworkIdParam = searchParams.get('artworkId');

    const currentList = refreshThreads();

    if (threadParam) {
      setActiveThreadId(threadParam);
      markThreadRead(userId, threadParam);
      return;
    }

    if (artistIdParam) {
      const artist = SEED_ARTISTS.find(a => a.id === artistIdParam);
      if (artist) {
        let initialContext: { type: DispatchContextType; id?: string; title?: string } | undefined;
        let initialAttachment: DispatchAttachment | undefined;
        let initialMessage = '';

        if (artworkIdParam) {
          const artwork = SEED_ARTWORKS.find(a => a.id === artworkIdParam);
          if (artwork) {
            initialContext = { type: 'inquiry', id: artwork.id, title: artwork.title };
            initialAttachment = {
              type: 'artwork',
              id: artwork.id,
              title: artwork.title,
              subtitle: artwork.listing_type === 'auction' ? `Current Bid: ${formatTornCash(artwork.current_bid ?? 0)}` : `Price: ${formatTornCash(artwork.price_torn ?? 0)}`,
              image_url: artwork.image_url,
              price_torn: artwork.listing_type === 'auction' ? artwork.current_bid : artwork.price_torn,
              status: artwork.listing_type.toUpperCase(),
            };
            initialMessage = `Hello ${artist.username}, inquiring regarding your piece "${artwork.title}".`;
          }
        }

        const t = createOrGetThread(
          userId,
          {
            id: artist.id,
            username: artist.username,
            avatar_url: artist.avatar_url,
            tier: artist.tier,
            torn_id: artist.torn_id,
            faction: 'Independent Syndicate',
          },
          initialContext,
          initialMessage,
          initialAttachment
        );

        setActiveThreadId(t.id);
        markThreadRead(userId, t.id);
        setSearchParams({ thread: t.id }, { replace: true });
        return;
      }
    }

    // Default: select first thread if none active
    if (currentList.length > 0 && !activeThreadId) {
      setActiveThreadId(currentList[0].id);
      markThreadRead(userId, currentList[0].id);
    }
  }, [searchParams, userId, refreshThreads]);

  /* Load messages for active thread */
  const refreshMessages = useCallback(() => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }
    const msgs = getMessages(activeThreadId);
    setMessages(msgs);
  }, [activeThreadId]);

  useEffect(() => {
    refreshMessages();
    if (activeThreadId) {
      markThreadRead(userId, activeThreadId);
    }
  }, [activeThreadId, userId, refreshMessages]);

  /* Scroll to bottom on new message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* Listen for real-time dispatch updates */
  useEffect(() => {
    const handler = () => {
      refreshThreads();
      refreshMessages();
    };
    window.addEventListener('coven:dispatch', handler);
    return () => window.removeEventListener('coven:dispatch', handler);
  }, [refreshThreads, refreshMessages]);

  /* Filter threads */
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      const matchSearch =
        t.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.last_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.context_title && t.context_title.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchFilter =
        filterTab === 'all' ||
        (filterTab === 'inquiry' && t.context_type === 'inquiry') ||
        (filterTab === 'commission' && t.context_type === 'commission') ||
        (filterTab === 'trade' && t.context_type === 'trade');

      return matchSearch && matchFilter;
    });
  }, [threads, searchQuery, filterTab]);

  const activeThread = useMemo(() => {
    return threads.find(t => t.id === activeThreadId);
  }, [threads, activeThreadId]);

  /* Quick reply action */
  const handleQuickReply = (text: string) => {
    if (!activeThreadId) return;
    sendMessage(userId, activeThreadId, userId, userName, userAvatar, text);
    refreshMessages();
    refreshThreads();

    setIsTyping(true);
    simulateArtistReply(userId, activeThreadId, text, () => {
      setIsTyping(false);
      refreshMessages();
      refreshThreads();
    });
  };

  /* Send message */
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !pendingAttachment) return;
    if (!activeThreadId) return;

    const content = inputText.trim();
    const att = pendingAttachment || undefined;

    sendMessage(userId, activeThreadId, userId, userName, userAvatar, content, att);
    setInputText('');
    setPendingAttachment(null);
    refreshMessages();
    refreshThreads();

    // Trigger simulated reply
    setIsTyping(true);
    simulateArtistReply(userId, activeThreadId, content, () => {
      setIsTyping(false);
      refreshMessages();
      refreshThreads();
    });

    composerInputRef.current?.focus();
  };

  /* Keyboard shortcut for sending (Enter without Shift) */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* Quick Artworks to attach */
  const availableArtworks = useMemo(() => {
    return SEED_ARTWORKS.slice(0, 6);
  }, []);

  return (
    <div className="wire-page">
      {/* ── TOP TELEMETRY PROTOCOL BAR ────────────────────────── */}
      <div className="wire-telemetry-bar">
        <div className="wire-telemetry-left">
          <span className="wire-telemetry-dot" />
          <span className="wire-telemetry-title">THE WIRE // SECURE DISPATCH TERMINAL</span>
          <span className="wire-telemetry-sep">|</span>
          <span className="wire-telemetry-node">NODE #07 [TORN UNDERGROUND]</span>
        </div>
        <div className="wire-telemetry-right">
          <span className="wire-telemetry-cipher">
            <LockKey size={12} weight="fill" /> 4096-BIT P2P AES CIPHER: ACTIVE
          </span>
          <span className="wire-telemetry-ping">LATENCY: 14MS</span>
        </div>
      </div>

      {/* ── MAIN SPLIT-PANE CONSOLE ───────────────────────────── */}
      <div className="wire-console">
        {/* ── LEFT PANE: THREAD DIRECTORY ─────────────────────── */}
        <aside className="wire-sidebar">
          {/* Header & Search */}
          <div className="wire-sidebar-header">
            <div className="wire-sidebar-top">
              <span className="wire-sidebar-heading">COMMUNICATION CHANNELS</span>
              <span className="wire-sidebar-count">{filteredThreads.length} ACTIVE</span>
            </div>

            <div className="wire-search-box">
              <MagnifyingGlass size={14} className="wire-search-icon" />
              <input
                type="text"
                placeholder="SEARCH ARTIST, THREAD, OR KEYWORD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="wire-search-input"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="wire-search-clear">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="wire-filter-tabs">
              {(['all', 'inquiry', 'commission', 'trade'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`wire-filter-btn${filterTab === tab ? ' active' : ''}`}
                >
                  {tab === 'all' ? 'ALL' : tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Thread List */}
          <div className="wire-thread-list">
            {filteredThreads.length === 0 ? (
              <div className="wire-empty-threads">
                <LockKey size={28} className="wire-empty-icon" />
                <p>NO DISPATCHES FOUND</p>
                <span>Adjust filters or initiate a transmission directly from an artist dossier.</span>
              </div>
            ) : (
              filteredThreads.map(t => {
                const isSelected = t.id === activeThreadId;
                const statusColor = getStatusColor(t.status);

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActiveThreadId(t.id);
                      markThreadRead(userId, t.id);
                      setSearchParams({ thread: t.id }, { replace: true });
                    }}
                    className={`wire-thread-item${isSelected ? ' selected' : ''}${t.unread_count > 0 ? ' unread' : ''}`}
                  >
                    {/* Avatar with Status Dot */}
                    <div className="wire-thread-avatar-wrap">
                      <img src={t.participant_avatar} alt={t.participant_name} className="wire-thread-avatar" />
                      <span className="wire-status-dot" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
                    </div>

                    {/* Thread Info */}
                    <div className="wire-thread-info">
                      <div className="wire-thread-meta-row">
                        <span className="wire-thread-name">
                          {t.participant_name}
                          {t.is_pinned && <PushPin size={10} weight="fill" className="wire-pin-icon" />}
                        </span>
                        <span className="wire-thread-time">{formatTime(t.last_timestamp)}</span>
                      </div>

                      <div className="wire-thread-sub-row">
                        {t.context_title ? (
                          <span className="wire-context-tag">
                            [{t.context_type.toUpperCase()}] {t.context_title}
                          </span>
                        ) : (
                          <span className="wire-context-tag" style={{ color: 'var(--ghost)' }}>
                            [{t.context_type.toUpperCase()}]
                          </span>
                        )}
                        {t.unread_count > 0 && (
                          <span className="wire-unread-pill">{t.unread_count}</span>
                        )}
                      </div>

                      <p className="wire-thread-snippet">{t.last_message}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── RIGHT PANE: ACTIVE CONVERSATION CONSOLE ─────────── */}
        <main className="wire-chat-area">
          {activeThread ? (
            <>
              {/* Room Topbar */}
              <div className="wire-room-header">
                <div className="wire-room-identity">
                  <div className="wire-room-avatar-wrap">
                    <img src={activeThread.participant_avatar} alt={activeThread.participant_name} className="wire-room-avatar" />
                    <span
                      className="wire-status-dot"
                      style={{
                        background: getStatusColor(activeThread.status),
                        boxShadow: `0 0 6px ${getStatusColor(activeThread.status)}`,
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="wire-room-name">{activeThread.participant_name}</span>
                      {activeThread.participant_tier && (
                        <span className="wire-room-tier" style={tierStyle(activeThread.participant_tier)}>
                          {activeThread.participant_tier.toUpperCase()}
                        </span>
                      )}
                      <span className="wire-room-status-label">
                        [{activeThread.status.replace('_', ' ').toUpperCase()}]
                      </span>
                    </div>

                    <div className="wire-room-meta">
                      {activeThread.participant_torn_id && (
                        <span>TORN ID: #{activeThread.participant_torn_id}</span>
                      )}
                      {activeThread.participant_faction && (
                        <>
                          <span className="wire-telemetry-sep">·</span>
                          <span>{activeThread.participant_faction}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="wire-room-actions">
                  <Link
                    to={`/artists/${activeThread.participant_id}`}
                    className="btn btn-sm btn-ghost"
                    style={{ fontSize: '0.6875rem', gap: '4px' }}
                    title="Open Artist Dossier"
                  >
                    Dossier <ArrowSquareOut size={12} />
                  </Link>

                  <Link
                    to={`/commissions?artist=${activeThread.participant_id}`}
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: '0.6875rem' }}
                  >
                    Commission
                  </Link>
                </div>
              </div>

              {/* Context Banner if thread has active subject */}
              {activeThread.context_title && (
                <div className="wire-context-banner">
                  <div className="wire-context-banner-left">
                    <span className="wire-context-chip">CHANNEL SUBJECT</span>
                    <span className="wire-context-subject">{activeThread.context_title}</span>
                  </div>
                  {activeThread.context_type === 'inquiry' && activeThread.context_id && (
                    <Link to={`/artwork/${activeThread.context_id}`} className="wire-context-link">
                      View Piece <ArrowSquareOut size={11} />
                    </Link>
                  )}
                  {activeThread.context_type === 'commission' && (
                    <Link to="/commissions" className="wire-context-link">
                      Board <ArrowSquareOut size={11} />
                    </Link>
                  )}
                </div>
              )}

              {/* Message Stream */}
              <div className="wire-messages-stream">
                {/* Security protocol notice */}
                <div className="wire-security-notice">
                  <ShieldCheck size={14} className="wire-sec-icon" />
                  <span>TRANSMISSION ENCRYPTED VIA COVEN UNDERGROUND RELAY · END-TO-END VERIFIED</span>
                </div>

                {messages.map((m) => {
                  const isMe = m.sender_id === userId || m.sender_id === 'current_user';

                  return (
                    <div key={m.id} className={`wire-msg-row${isMe ? ' me' : ' them'}`}>
                      {!isMe && (
                        <img
                          src={m.sender_avatar || activeThread.participant_avatar}
                          alt={m.sender_name}
                          className="wire-msg-avatar"
                        />
                      )}

                      <div className="wire-msg-container">
                        <div className="wire-msg-bubble">
                          {/* Text content */}
                          {m.content && <p className="wire-msg-text">{m.content}</p>}

                          {/* Rich Attachment Card */}
                          {m.attachment && (
                            <div className={`wire-attachment-card ${m.attachment.type}`}>
                              {m.attachment.image_url && (
                                <img
                                  src={m.attachment.image_url}
                                  alt={m.attachment.title}
                                  className="wire-att-thumb"
                                />
                              )}
                              <div className="wire-att-details">
                                <div className="wire-att-badge">
                                  {m.attachment.type.toUpperCase()}
                                  {m.attachment.status && ` · ${m.attachment.status}`}
                                </div>
                                <span className="wire-att-title">{m.attachment.title}</span>
                                {m.attachment.subtitle && (
                                  <span className="wire-att-sub">{m.attachment.subtitle}</span>
                                )}
                                {m.attachment.price_torn && (
                                  <span className="wire-att-price">
                                    {formatTornCash(m.attachment.price_torn)}
                                  </span>
                                )}
                              </div>
                              {m.attachment.type === 'artwork' && m.attachment.id && (
                                <Link
                                  to={`/artwork/${m.attachment.id}`}
                                  className="wire-att-action-btn"
                                  title="Inspect Artwork"
                                >
                                  <ArrowSquareOut size={14} />
                                </Link>
                              )}
                            </div>
                          )}

                          {/* Metadata row */}
                          <div className="wire-msg-meta">
                            <span className="wire-msg-time">{fullTime(m.timestamp)}</span>
                            {isMe && (
                              <span className="wire-msg-status" title="Cipher Confirmed">
                                <Check size={11} weight="bold" /> CIPHER
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="wire-msg-row them">
                    <img
                      src={activeThread.participant_avatar}
                      alt={activeThread.participant_name}
                      className="wire-msg-avatar"
                    />
                    <div className="wire-typing-bubble">
                      <span className="wire-typing-dot" />
                      <span className="wire-typing-dot" />
                      <span className="wire-typing-dot" />
                      <span className="wire-typing-label">
                        {activeThread.participant_name} is encrypting a transmission...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Bar */}
              <div className="wire-quick-replies">
                <span className="wire-quick-label">TACTICAL REPLIES:</span>
                <div className="wire-quick-chips">
                  {[
                    'What is your turnaround time?',
                    'Can you make an animated version?',
                    'Torn cash is locked in escrow.',
                    'Can you match our faction palette?',
                    'Can you do a 400x150 signature crop?',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleQuickReply(chip)}
                      className="wire-quick-chip"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Composer */}
              <div className="wire-composer-area">
                {/* Pending Attachment Preview */}
                {pendingAttachment && (
                  <div className="wire-pending-att">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={14} />
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>
                        Attached: {pendingAttachment.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPendingAttachment(null)}
                      className="wire-pending-att-remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="wire-composer-form">
                  <button
                    type="button"
                    onClick={() => setAttachModalOpen(true)}
                    className="wire-attach-btn"
                    title="Attach Artwork Reference"
                  >
                    <ImageIcon size={16} />
                  </button>

                  <textarea
                    ref={composerInputRef}
                    rows={1}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="TRANSMIT ENCRYPTED DISPATCH (ENTER TO TRANSMIT, SHIFT+ENTER FOR NEWLINE)..."
                    className="wire-composer-input"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() && !pendingAttachment}
                    className="wire-send-btn"
                    title="Transmit Dispatch"
                  >
                    <PaperPlaneTilt size={16} weight="fill" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty state when no thread selected */
            <div className="wire-no-thread">
              <div className="wire-radar-disc">
                <LockKey size={48} className="wire-radar-icon" />
              </div>
              <h2 className="wire-no-thread-title">THE WIRE // TERMINAL READY</h2>
              <p className="wire-no-thread-sub">
                Select an active communication channel from the directory on the left, or dispatch a direct transmission from an artist profile or artwork listing.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ── ATTACH REFERENCE MODAL ────────────────────────────── */}
      {attachModalOpen && (
        <div className="wire-modal-backdrop" onClick={() => setAttachModalOpen(false)}>
          <div className="wire-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="wire-modal-header">
              <span className="wire-modal-title">ATTACH ARTWORK REFERENCE</span>
              <button
                type="button"
                onClick={() => setAttachModalOpen(false)}
                className="wire-modal-close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="wire-modal-grid">
              {availableArtworks.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', gridColumn: '1 / -1', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ghost)' }}>
                  NO ARTWORKS CURRENTLY INDEXED TO ATTACH
                </div>
              ) : (
                availableArtworks.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => {
                      setPendingAttachment({
                        type: 'artwork',
                        id: art.id,
                        title: art.title,
                        subtitle: `${art.listing_type.toUpperCase()} · ${formatTornCash(art.listing_type === 'auction' ? art.current_bid ?? 0 : art.price_torn ?? 0)}`,
                        image_url: art.image_url,
                        price_torn: art.listing_type === 'auction' ? art.current_bid : art.price_torn,
                        status: art.listing_type,
                      });
                      setAttachModalOpen(false);
                    }}
                    className="wire-modal-item"
                  >
                    <img src={art.image_url} alt={art.title} className="wire-modal-thumb" />
                    <div className="wire-modal-item-info">
                      <span className="wire-modal-item-title">{art.title}</span>
                      <span className="wire-modal-item-price">
                        {formatTornCash(art.listing_type === 'auction' ? art.current_bid ?? 0 : art.price_torn ?? 0)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
