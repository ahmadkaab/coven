import { useAuthStore } from '../store/authStore';
import { verifyTornPayment, verifyTransaction } from '../services/authService';

/** Main auth hook — exposes all auth state and actions */
export function useAuth() {
  const {
    user, apiKey, userId, artistId, isArtist,
    loading, error, signIn, logout, setArtist,
  } = useAuthStore();

  /**
   * Verify a payment and mark the transaction verified in Supabase.
   * 1. Poll Torn API for the seller's transaction log
   * 2. If found, update the transaction record to 'verified'
   */
  const verifyPayment = async (opts: {
    transactionId: string;
    sellerApiKey: string;
    buyerTornId: number;
    amountTcash: number;
    windowHours?: number;
  }) => {
    const { transactionId, ...rest } = opts;
    const result = await verifyTornPayment(rest);
    if (result.verified && result.logId) {
      await verifyTransaction(transactionId, result.logId);
    }
    return result;
  };

  return {
    user,
    apiKey,
    userId,
    artistId,
    isArtist,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    logout,
    setArtist,
    verifyPayment,
  };
}
