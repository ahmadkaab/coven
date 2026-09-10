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
  const threads = readThreads(userId);
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
  const msgs = readMessages(tId);
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
