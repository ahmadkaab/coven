import { useState, useEffect, useCallback } from 'react';
import type { Artist } from '../types';
import {
  type ArtistStudioConfig,
  type QueueSlot,
  getArtistStudioConfig,
  saveArtistStudioConfig,
} from '../services/studioService';

export function useArtistStudio(artistId: string | undefined, fallbackArtist?: Artist) {
  const [studio, setStudio] = useState<ArtistStudioConfig>(() => {
    return getArtistStudioConfig(artistId || 'coven-artist-01', fallbackArtist);
  });

  useEffect(() => {
    if (artistId) {
      setStudio(getArtistStudioConfig(artistId, fallbackArtist));
    }
  }, [artistId, fallbackArtist]);

  const updateStudio = useCallback((updates: Partial<ArtistStudioConfig>) => {
    setStudio((prev) => {
      const next: ArtistStudioConfig = { ...prev, ...updates };
      saveArtistStudioConfig(next);
      return next;
    });
  }, []);

  const updateSlot = useCallback((slotId: string, updates: Partial<QueueSlot>) => {
    setStudio((prev) => {
      const nextSlots = prev.queueSlots.map((slot) => {
        if (slot.id === slotId) {
          return { ...slot, ...updates };
        }
        return slot;
      });
      const next: ArtistStudioConfig = { ...prev, queueSlots: nextSlots };
      saveArtistStudioConfig(next);
      return next;
    });
  }, []);

  const openSlotCount = studio.queueSlots.filter((s) => s.status === 'open').length;

  return {
    studio,
    updateStudio,
    updateSlot,
    openSlotCount,
  };
}
