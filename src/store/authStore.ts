import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchTornProfile, upsertUser, getArtistByTornId } from '../services/authService';
import type { TornUser } from '../types';

interface AuthState {
  /* State */
  user:        TornUser | null;
  apiKey:      string | null;
  userId:      string | null;
  artistId:    string | null;
  isArtist:    boolean;
  loading:     boolean;
  error:       string | null;

  /* Actions */
  signIn:             (apiKey: string, tornId?: string) => Promise<boolean>;
  logout:             () => void;
  setArtist:          (artistId: string) => void;   // called after registration

  /* Internal */
  setLoading:  (v: boolean) => void;
  setError:    (v: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:     null,
      apiKey:   null,
      userId:   null,
      artistId: null,
      isArtist: false,
      loading:  false,
      error:    null,

      setLoading: (loading)  => set({ loading }),
      setError:   (error)    => set({ error, loading: false }),

      signIn: async (apiKey: string) => {
        set({ loading: true, error: null });
        try {
          const trimmedKey = apiKey.trim();
          if (!trimmedKey) throw new Error('Please enter your Torn API key.');

          // 1. Query Torn API directly — automatically resolves player_id, name, rank, level, faction, etc.
          const profile = await fetchTornProfile(trimmedKey);

          // 2. Upsert into Supabase — get internal UUID
          const { id: userId } = await upsertUser(profile);

          // 3. Ahmad is the exclusive Sovereign Artist (ID: 4295891)
          const isAhmadUser = profile.player_id === 4295891 || profile.name?.toLowerCase() === 'ahmad_kaab';
          const artistId = isAhmadUser ? 'artist-ahmad-01' : null;

          set({
            user:     profile,
            apiKey:   trimmedKey,
            userId,
            artistId,
            isArtist: isAhmadUser,
            loading:  false,
            error:    null,
          });
          return true;
        } catch (err: any) {
          set({ loading: false, error: err.message ?? 'Login failed — could not authenticate API key' });
          return false;
        }
      },

      logout: () =>
        set({
          user: null, apiKey: null, userId: null,
          artistId: null, isArtist: false, error: null,
        }),

      setArtist: (artistId: string) =>
        set({ artistId, isArtist: true }),
    }),
    {
      name: 'coven-auth',
      partialize: (s) => ({
        user:     s.user,
        apiKey:   s.apiKey,
        userId:   s.userId,
        artistId: s.artistId,
        isArtist: s.isArtist,
      }),
    }
  )
);
