import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Artwork } from '../types';
import type { ExtendedTransaction } from '../services/transactionService';
import {
  type WatermarkStyle,
  WATERMARK_PRESETS,
  type ProvenanceCertificate,
  buildProvenanceCertificate,
  checkVaultAccess,
  getDemoVaultUnlocked,
  setDemoVaultUnlocked,
} from '../services/vaultService';

export function useVaultClearance(
  artwork: Artwork | null,
  userId: string | null,
  transactions: ExtendedTransaction[] = []
) {
  const [demoState, setDemoState] = useState<boolean>(() => {
    return artwork ? getDemoVaultUnlocked(artwork.id) : false;
  });

  useEffect(() => {
    if (artwork) {
      setDemoState(getDemoVaultUnlocked(artwork.id));
    }
  }, [artwork?.id]);

  const unlockDemo = useCallback(() => {
    if (!artwork) return;
    setDemoVaultUnlocked(artwork.id, true);
    setDemoState(true);
  }, [artwork]);

  const lockDemo = useCallback(() => {
    if (!artwork) return;
    setDemoVaultUnlocked(artwork.id, false);
    setDemoState(false);
  }, [artwork]);

  const toggleDemo = useCallback(() => {
    if (!artwork) return;
    const next = !getDemoVaultUnlocked(artwork.id);
    setDemoVaultUnlocked(artwork.id, next);
    setDemoState(next);
  }, [artwork]);

  const access = useMemo(() => {
    if (!artwork) return { hasAccess: false, reason: 'none' as const };
    return checkVaultAccess(artwork, userId, transactions);
  }, [artwork, userId, transactions, demoState]);

  return {
    hasAccess: access.hasAccess,
    reason: access.reason,
    isDemoUnlocked: demoState,
    unlockDemo,
    lockDemo,
    toggleDemo,
  };
}

export function useProvenance(
  artwork: Artwork | null,
  transaction?: ExtendedTransaction | null,
  userId?: string | null
): ProvenanceCertificate | null {
  return useMemo(() => {
    if (!artwork) return null;
    return buildProvenanceCertificate(artwork, transaction, userId);
  }, [artwork, transaction, userId]);
}

export function useWatermarkSettings(defaultPreset: WatermarkStyle = 'MATRIX_GRID') {
  const [style, setStyle] = useState<WatermarkStyle>(defaultPreset);
  const [enabled, setEnabled] = useState<boolean>(true);

  const activePreset = useMemo(() => {
    return WATERMARK_PRESETS.find(p => p.id === style) || WATERMARK_PRESETS[0];
  }, [style]);

  return {
    style,
    setStyle,
    enabled,
    setEnabled,
    activePreset,
    presets: WATERMARK_PRESETS,
  };
}
