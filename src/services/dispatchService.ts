/* ================================================================
   COVEN — The Wire (Encrypted Dispatches & Direct Comms) Service
   localStorage-backed P2P encrypted chat threads with lore simulator.
   ================================================================ */

import type { DispatchThread, DispatchMessage, DispatchAttachment, DispatchContextType } from '../types/dispatch';
import { dispatchNotification } from './notificationService';

const THREADS_KEY = (uid: string) => `coven_dispatch_threads_${uid}`;
const MSGS_KEY = (tid: string) => `coven_dispatch_msgs_${tid}`;

function msgId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function threadId(): string {
  return `wire_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/* ── SEED DATA GENERATORS ─────────────────────────────────── */
function getInitialSeedThreads(): DispatchThread[] {
  return [
    {
      id: 'wire_sintex_01',
      participant_id: 'artist-1',
      participant_name: 'SINTEX',
      participant_avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
      participant_role: 'artist',
      participant_tier: 'legend',
      participant_torn_id: '1940211',
      participant_faction: 'Monarch Syndicate',
      last_message: 'Can deliver within 48h once the 25M Torn Cash milestone is locked in escrow.',
      last_timestamp: new Date(Date.now() - 22 * 60_000).toISOString(),
      unread_count: 1,
      status: 'online',
      context_type: 'commission',
      context_id: 'c1',
      context_title: 'Faction War Banner & Honor Bar Set',
      is_pinned: true,
    },
    {
      id: 'wire_nyx_02',
      participant_id: 'artist-2',
      participant_name: 'Nyx',
      participant_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      participant_role: 'artist',
      participant_tier: 'master',
      participant_torn_id: '2049182',
      participant_faction: 'Natural Selection',
      last_message: 'All winning bidders get full vault access plus a complimentary 400x150 signature crop.',
      last_timestamp: new Date(Date.now() - 3 * 3600_000).toISOString(),
      unread_count: 0,
      status: 'busy',
      context_type: 'inquiry',
      context_id: 'a1',
      context_title: 'Neon Shinjuku 2099',
      is_pinned: false,
    },
    {
      id: 'wire_cyberkitsune_03',
      participant_id: 'artist-3',
      participant_name: 'CyberKitsune',
      participant_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      participant_role: 'artist',
      participant_tier: 'trusted',
      participant_torn_id: '2381900',
      participant_faction: 'JTF Recon',
      last_message: 'Appreciate the syndicate business. Ping me on the wire anytime you need new profile propaganda.',
      last_timestamp: new Date(Date.now() - 26 * 3600_000).toISOString(),
      unread_count: 0,
      status: 'in_vault',
      context_type: 'trade',
      context_id: 't-9844',
      context_title: 'Escrow Release #TX-9844',
      is_pinned: false,
    },
  ];
}

function getInitialSeedMessages(threadId: string): DispatchMessage[] {
  if (threadId === 'wire_sintex_01') {
    return [
      {
        id: 'msg_s1',
        thread_id: 'wire_sintex_01',
        sender_id: 'artist-1',
        sender_name: 'SINTEX',
        sender_avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
        content: 'Received your brief for the Syndicate War Banner. I have drafted the preliminary 3D chrome rendering. Do you want the skull motif with neon cyan or blood phosphor highlights?',
        timestamp: new Date(Date.now() - 45 * 60_000).toISOString(),
        read: true,
        status: 'encrypted',
      },
      {
        id: 'msg_s2',
        thread_id: 'wire_sintex_01',
        sender_id: 'current_user',
        sender_name: 'You',
        content: 'Blood phosphor highlights to match our faction hall theme. What is the turnaround for the animated GIF version?',
        timestamp: new Date(Date.now() - 35 * 60_000).toISOString(),
        read: true,
        status: 'encrypted',
      },
      {
        id: 'msg_s3',
        thread_id: 'wire_sintex_01',
        sender_id: 'artist-1',
        sender_name: 'SINTEX',
        sender_avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
        content: 'Can deliver within 48h once the 25M Torn Cash milestone is locked in escrow. BBCode template is included with auto-resizing canvas.',
        timestamp: new Date(Date.now() - 22 * 60_000).toISOString(),
        read: false,
        status: 'encrypted',
        attachment: {
          type: 'commission',
          id: 'c1',
          title: 'Syndicate War Banner Set',
          subtitle: 'Milestone 1/2 · 25,000,000 Torn Cash',
          price_torn: 25000000,
          status: 'Locked in Escrow',
        },
      },
    ];
  }

  if (threadId === 'wire_nyx_02') {
    return [
      {
        id: 'msg_n1',
        thread_id: 'wire_nyx_02',
        sender_id: 'current_user',
        sender_name: 'You',
        content: 'Hey Nyx, watching your auction for Neon Shinjuku 2099. Does the package include a custom 400x150 signature crop if I win?',
        timestamp: new Date(Date.now() - 4 * 3600_000).toISOString(),
        read: true,
        status: 'encrypted',
        attachment: {
          type: 'artwork',
          id: 'a1',
          title: 'Neon Shinjuku 2099',
          subtitle: 'Reserve Met · Current Bid: $1,250,000',
          image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
          price_torn: 1250000,
          status: 'Active Auction',
        },
      },
      {
        id: 'msg_n2',
        thread_id: 'wire_nyx_02',
        sender_id: 'artist-2',
        sender_name: 'Nyx',
        sender_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'All winning bidders get full vault access plus a complimentary 400x150 signature crop and transparent PNG asset. Good luck on the auction block!',
        timestamp: new Date(Date.now() - 3 * 3600_000).toISOString(),
        read: true,
        status: 'encrypted',
      },
    ];
  }

  if (threadId === 'wire_cyberkitsune_03') {
    return [
      {
        id: 'msg_c1',
        thread_id: 'wire_cyberkitsune_03',
        sender_id: 'artist-3',
        sender_name: 'CyberKitsune',
        sender_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Escrow funds verified. I have unlocked your high-res unwatermarked PSD and GIF deliverables in the vault.',
        timestamp: new Date(Date.now() - 27 * 3600_000).toISOString(),
        read: true,
        status: 'encrypted',
        attachment: {
          type: 'escrow',
          id: 't-9844',
          title: 'Escrow Release #TX-9844',
          subtitle: '$8,500,000 Torn Cash Transferred',
          price_torn: 8500000,
          status: 'Vault Cleared',
        },
      },
      {
        id: 'msg_c2',
        thread_id: 'wire_cyberkitsune_03',
        sender_id: 'current_user',
        sender_name: 'You',
        content: 'Downloaded the files. The glitch animations look incredible on the Torn forums. Left you a 5-star review!',
        timestamp: new Date(Date.now() - 26 * 3600_000).toISOString(),
        read: true,
        status: 'encrypted',
      },
      {
        id: 'msg_c3',
        thread_id: 'wire_cyberkitsune_03',
        sender_id: 'artist-3',
        sender_name: 'CyberKitsune',
        sender_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Appreciate the syndicate business. Ping me on the wire anytime you need new profile propaganda.',
        timestamp: new Date(Date.now() - 25 * 3600_000).toISOString(),
        read: true,
        status: 'encrypted',
      },
    ];
  }

  return [];
}

/* ── STORAGE HELPERS ───────────────────────────────────────── */
function readThreads(userId: string): DispatchThread[] {
  try {
    const raw = localStorage.getItem(THREADS_KEY(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeThreads(userId: string, threads: DispatchThread[]): void {
  localStorage.setItem(THREADS_KEY(userId), JSON.stringify(threads));
}

function readMessages(tId: string): DispatchMessage[] {
  try {
    const raw = localStorage.getItem(MSGS_KEY(tId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeMessages(tId: string, msgs: DispatchMessage[]): void {
  localStorage.setItem(MSGS_KEY(tId), JSON.stringify(msgs));
}

function notifyDispatchUpdate(): void {
  window.dispatchEvent(new CustomEvent('coven:dispatch'));
}

/* ── PUBLIC API ────────────────────────────────────────────── */

export function getThreads(userId: string): DispatchThread[] {
  let threads = readThreads(userId);
  if (threads.length === 0) {
    threads = getInitialSeedThreads();
    writeThreads(userId, threads);
    // write seed messages
    for (const t of threads) {
      writeMessages(t.id, getInitialSeedMessages(t.id));
    }
  }
  return threads.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_timestamp).getTime() - new Date(a.last_timestamp).getTime();
  });
}

export function getThread(userId: string, tId: string): DispatchThread | undefined {
  const threads = getThreads(userId);
  return threads.find(t => t.id === tId);
}

export function getMessages(tId: string): DispatchMessage[] {
  let msgs = readMessages(tId);
  if (msgs.length === 0) {
    msgs = getInitialSeedMessages(tId);
    if (msgs.length > 0) {
      writeMessages(tId, msgs);
    }
  }
  return msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function getUnreadDispatchCount(userId: string): number {
  const threads = getThreads(userId);
  return threads.reduce((acc, t) => acc + (t.unread_count || 0), 0);
}

export function markThreadRead(userId: string, tId: string): void {
  const threads = readThreads(userId);
  let changed = false;
  const updated = threads.map(t => {
    if (t.id === tId && t.unread_count > 0) {
      changed = true;
      return { ...t, unread_count: 0 };
    }
    return t;
  });
  if (changed) {
    writeThreads(userId, updated);
    notifyDispatchUpdate();
  }

  // Also mark messages as read
  const msgs = readMessages(tId);
  const updatedMsgs = msgs.map(m => ({ ...m, read: true }));
  writeMessages(tId, updatedMsgs);
}

export function sendMessage(
  userId: string,
  tId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string | undefined,
  content: string,
  attachment?: DispatchAttachment
): DispatchMessage {
  const newMsg: DispatchMessage = {
    id: msgId(),
    thread_id: tId,
    sender_id: senderId,
    sender_name: senderName,
    sender_avatar: senderAvatar,
    content: content.trim(),
    timestamp: new Date().toISOString(),
    read: true,
    status: 'encrypted',
    attachment,
  };

  const msgs = getMessages(tId);
  msgs.push(newMsg);
  writeMessages(tId, msgs);

  // Update thread's last message & timestamp
  const threads = getThreads(userId);
  const updatedThreads = threads.map(t => {
    if (t.id === tId) {
      return {
        ...t,
        last_message: content.trim() || (attachment ? `Attached: ${attachment.title}` : 'Sent an attachment'),
        last_timestamp: newMsg.timestamp,
      };
    }
    return t;
  });
  writeThreads(userId, updatedThreads);
  notifyDispatchUpdate();

  return newMsg;
}

export function createOrGetThread(
  userId: string,
  targetArtist: {
    id: string;
    username: string;
    avatar_url?: string;
    tier?: 'rising' | 'trusted' | 'master' | 'legend';
    torn_id?: string;
    faction?: string;
  },
  initialContext?: {
    type: DispatchContextType;
    id?: string;
    title?: string;
  },
  initialMessage?: string,
  attachment?: DispatchAttachment
): DispatchThread {
  const threads = getThreads(userId);
  const existing = threads.find(t => t.participant_id === targetArtist.id);

  if (existing) {
    if (initialContext) {
      existing.context_type = initialContext.type;
      existing.context_id = initialContext.id;
      existing.context_title = initialContext.title;
      writeThreads(userId, threads);
    }
    if (initialMessage) {
      sendMessage(userId, existing.id, userId, 'You', undefined, initialMessage, attachment);
    }
    return existing;
  }

  const newThread: DispatchThread = {
    id: threadId(),
    participant_id: targetArtist.id,
    participant_name: targetArtist.username,
    participant_avatar: targetArtist.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    participant_role: 'artist',
    participant_tier: targetArtist.tier || 'trusted',
    participant_torn_id: targetArtist.torn_id || '999999',
    participant_faction: targetArtist.faction || 'Independent GFX Syndicate',
    last_message: initialMessage || 'Direct encrypted dispatch channel opened.',
    last_timestamp: new Date().toISOString(),
    unread_count: 0,
    status: 'online',
    context_type: initialContext?.type || 'general',
    context_id: initialContext?.id,
    context_title: initialContext?.title,
    is_pinned: false,
  };

  threads.unshift(newThread);
  writeThreads(userId, threads);

  if (initialMessage) {
    const firstMsg: DispatchMessage = {
      id: msgId(),
      thread_id: newThread.id,
      sender_id: userId,
      sender_name: 'You',
      content: initialMessage,
      timestamp: new Date().toISOString(),
      read: true,
      status: 'encrypted',
      attachment,
    };
    writeMessages(newThread.id, [firstMsg]);
  }

  notifyDispatchUpdate();
  return newThread;
}

/* ── LORE INTELLIGENT SIMULATOR ───────────────────────────── */
export function simulateArtistReply(
  userId: string,
  tId: string,
  userMessage: string,
  onReply?: (reply: DispatchMessage) => void
): void {
  const thread = getThread(userId, tId);
  if (!thread) return;

  const artistName = thread.participant_name;
  const lower = userMessage.toLowerCase();

  let replyText = '';
  if (lower.includes('turnaround') || lower.includes('time') || lower.includes('when')) {
    replyText = `Standard turnaround is 24 to 48 hours once specifications are finalized. For rush delivery within 12h, add 5M Torn cash to escrow.`;
  } else if (lower.includes('escrow') || lower.includes('cash') || lower.includes('price') || lower.includes('cost')) {
    replyText = `Understood. Escrow is held securely by COVEN smart contract. Once you inspect the watermarked draft and approve, the release code is verified.`;
  } else if (lower.includes('animat') || lower.includes('gif') || lower.includes('motion')) {
    replyText = `Yes, all my animated assets are optimized for Torn's 2MB forum limit with 60fps frame interpolation. Includes looping glow and particle FX.`;
  } else if (lower.includes('signature') || lower.includes('banner') || lower.includes('size')) {
    replyText = `Can do standard 400x150 signatures, 650x250 faction thread headers, or 200x200 high-dpi avatars. Just specify your faction tag and desired text.`;
  } else if (lower.includes('color') || lower.includes('theme') || lower.includes('palette')) {
    replyText = `I can match any faction hex palette. Send me your faction link or HEX codes (e.g. #00ffff cyan or #ff3344 crimson) and I will calibrate the grades.`;
  } else if (lower.includes('review') || lower.includes('vouch') || lower.includes('rep')) {
    replyText = `Thanks for vouching on the COVEN ledger. Good rep in the art underground keeps the syndicate alive!`;
  } else {
    const genericReplies = [
      `Copy that. Encrypted transmission acknowledged. I am pulling up the canvas layer now.`,
      `Understood. Let me draft a quick preview in the studio and transmit the encrypted render link shortly.`,
      `Affirmative. Your requirements have been logged to my commission queue. Standing by for escrow signal.`,
      `Acknowledged. The Torn underground moves fast, but quality takes precision. Stand by on the wire.`,
    ];
    replyText = genericReplies[Math.floor(Math.random() * genericReplies.length)];
  }

  // Realistic typed response delay (1.2 - 2.0s)
  const delay = 1200 + Math.random() * 800;
  setTimeout(() => {
    const reply: DispatchMessage = {
      id: msgId(),
      thread_id: tId,
      sender_id: thread.participant_id,
      sender_name: artistName,
      sender_avatar: thread.participant_avatar,
      content: replyText,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'encrypted',
    };

    const msgs = readMessages(tId);
    msgs.push(reply);
    writeMessages(tId, msgs);

    const threads = readThreads(userId);
    const updatedThreads = threads.map(t => {
      if (t.id === tId) {
        return {
          ...t,
          last_message: replyText,
          last_timestamp: reply.timestamp,
          unread_count: (t.unread_count || 0) + 1,
        };
      }
      return t;
    });
    writeThreads(userId, updatedThreads);
    notifyDispatchUpdate();

    // Trigger system notification
    dispatchNotification(userId, {
      type: 'system',
      title: `Wire: ${artistName}`,
      message: `"${replyText.length > 60 ? replyText.slice(0, 57) + '...' : replyText}"`,
      link: `/dispatches?thread=${tId}`,
    });

    if (onReply) {
      onReply(reply);
    }
  }, delay);
}
