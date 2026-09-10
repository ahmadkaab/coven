/* ================================================================
   COVEN — The Wire (Encrypted Dispatches & Direct Comms) Types
   ================================================================ */

export type DispatchAttachmentType = 'artwork' | 'commission' | 'escrow' | 'vault';

export interface DispatchAttachment {
  type: DispatchAttachmentType;
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  price_torn?: number;
  status?: string;
}

export interface DispatchMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
  status: 'sent' | 'delivered' | 'encrypted';
  attachment?: DispatchAttachment;
}

export type DispatchThreadStatus = 'online' | 'busy' | 'in_vault';
export type DispatchContextType = 'commission' | 'inquiry' | 'trade' | 'general';

export interface DispatchThread {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar: string;
  participant_role: 'artist' | 'collector';
  participant_tier?: 'rising' | 'trusted' | 'master' | 'legend';
  participant_torn_id?: string;
  participant_faction?: string;
  last_message: string;
  last_timestamp: string;
  unread_count: number;
  status: DispatchThreadStatus;
  context_type: DispatchContextType;
  context_id?: string;
  context_title?: string;
  is_pinned?: boolean;
}
